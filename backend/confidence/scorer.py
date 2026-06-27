"""
ThreatMail — Multi-Factor Confidence Scorer
================================================
Computes a calibrated confidence score (0–100) for each threat detection
by combining evidence from all agents in the pipeline.

Factors considered:
  1. Signal count — more corroborating signals raise confidence
  2. LLM reasoning confidence — self-reported by the LLM in its JSON output
  3. VirusTotal validation — third-party corroboration
  4. Memory pattern agreement — known attack pattern match
  5. Score consistency — checks LLM score vs rule-based score for agreement

Author: Rayen Lassoued
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass
class ConfidenceResult:
    """
    Structured output from the confidence scorer.

    Attributes:
        overall_confidence: 0–100 calibrated confidence the verdict is correct
        verdict: phishing / suspicious / legit
        factors: breakdown of each contributing factor
        explanation: human-readable confidence rationale
        reliable: True when confidence >= 70 — safe to act on without manual review
    """
    overall_confidence: int
    verdict: str
    factors: Dict[str, int] = field(default_factory=dict)
    explanation: str = ""
    reliable: bool = False


def _clamp(value: int, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, value))


def compute_confidence_score(state: Dict[str, Any]) -> ConfidenceResult:
    """
    Compute multi-factor confidence from the full agent state.

    Args:
        state: The LangGraph AgentState dict after all agents have run.

    Returns:
        ConfidenceResult with overall_confidence (0–100) and factor breakdown.
    """
    factors: Dict[str, int] = {}

    verdict = state.get("verdict", "suspicious")
    threat = state.get("threat", {})
    memory = state.get("memory", {})
    reasoning = state.get("reasoning", {})
    virustotal = state.get("virustotal", [])
    iocs = state.get("iocs", {})

    # ------------------------------------------------------------------
    # Factor 1: Signal count (max 25 pts)
    # More independent signals → higher confidence the verdict is correct
    # ------------------------------------------------------------------
    signals = threat.get("signals", [])
    signal_count = len(signals)
    factor_signals = _clamp(signal_count * 7, 0, 25)
    factors["signal_count"] = factor_signals

    # ------------------------------------------------------------------
    # Factor 2: LLM self-reported confidence (max 30 pts)
    # The reasoning agent returns a "confidence" field (0–100).
    # We scale it to contribute up to 30 pts.
    # ------------------------------------------------------------------
    llm_conf = reasoning.get("confidence", 50)
    factor_llm = _clamp(int(llm_conf * 0.30), 0, 30)
    factors["llm_confidence"] = factor_llm

    # ------------------------------------------------------------------
    # Factor 3: VirusTotal corroboration (max 20 pts)
    # Any URL flagged as malicious by VT strongly increases confidence
    # for phishing/suspicious verdicts.
    # ------------------------------------------------------------------
    vt_malicious = sum(r.get("malicious", 0) for r in virustotal if isinstance(r, dict))
    vt_suspicious = sum(r.get("suspicious", 0) for r in virustotal if isinstance(r, dict))
    vt_score = min(vt_malicious * 5 + vt_suspicious * 2, 20)
    # If verdict is legit but VT found malicious — reduce confidence
    if verdict == "legit" and vt_malicious > 0:
        vt_score = -15
    factors["virustotal_corroboration"] = _clamp(vt_score, -20, 20)

    # ------------------------------------------------------------------
    # Factor 4: Memory pattern agreement (max 15 pts)
    # Known attack pattern matches from the memory agent
    # ------------------------------------------------------------------
    pattern_hits = memory.get("pattern_hits", [])
    mem_score = _clamp(len(pattern_hits) * 5, 0, 15)
    factors["memory_pattern_match"] = mem_score

    # ------------------------------------------------------------------
    # Factor 5: Score consistency (max 10 pts)
    # When the rule-based threat score and LLM score agree, confidence rises.
    # ------------------------------------------------------------------
    rule_score = threat.get("base_score", 0)
    llm_score = reasoning.get("score", 50)
    score_diff = abs(rule_score - llm_score)
    if score_diff <= 10:
        factor_consistency = 10
    elif score_diff <= 25:
        factor_consistency = 5
    else:
        factor_consistency = 0
    factors["score_consistency"] = factor_consistency

    # ------------------------------------------------------------------
    # Aggregate
    # ------------------------------------------------------------------
    raw = sum(factors.values())
    overall = _clamp(raw, 0, 100)

    # ------------------------------------------------------------------
    # Human-readable explanation
    # ------------------------------------------------------------------
    parts = []
    if factor_signals >= 14:
        parts.append(f"{signal_count} independent threat signals detected")
    if factor_llm >= 20:
        parts.append(f"LLM reported high internal confidence ({llm_conf}%)")
    if factors["virustotal_corroboration"] > 0:
        parts.append(f"VirusTotal confirmed {vt_malicious} malicious URL(s)")
    if mem_score > 0:
        parts.append(f"{len(pattern_hits)} known attack pattern(s) matched in memory")
    if factor_consistency == 10:
        parts.append("rule-based and LLM scores are consistent")

    if not parts:
        parts.append("limited corroborating evidence — manual review recommended")

    explanation = (
        f"Verdict '{verdict}' with {overall}% confidence. "
        + "; ".join(parts).capitalize() + "."
    )

    return ConfidenceResult(
        overall_confidence=overall,
        verdict=verdict,
        factors=factors,
        explanation=explanation,
        reliable=overall >= 70,
    )
