import os
import json
import time
from openai import OpenAI, RateLimitError
from config import LLM_TEMPERATURE


def _llm_call_with_retry(client, **kwargs):
    for attempt in range(3):
        try:
            return client.chat.completions.create(**kwargs)
        except RateLimitError:
            if attempt < 2:
                time.sleep(5)
            else:
                raise


def reasoning_agent(state):
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL") or None,
    )

    email = state.get("email", "")
    iocs = state.get("iocs", {})
    threat = state.get("threat", {})
    memory = state.get("memory", {})
    virustotal = state.get("virustotal", [])

    # 🚨 IMPORTANT: avoid any JSON braces that Python tries to format
    prompt = f"""
You are a SENIOR SOC ANALYST.

Classify the email into ONLY ONE label:
- legit
- suspicious
- phishing

====================
EMAIL
====================
{email}

====================
IOC SIGNALS
====================
{iocs}

====================
THREAT SIGNALS
====================
{threat}

====================
MEMORY SIGNALS
====================
{memory}

====================
VIRUSTOTAL
====================
{virustotal}

====================
RULES
====================

1. phishing:
- credential requests
- password reset emails
- payroll / bank update scams
- invoice scams
- Microsoft/Google impersonation
- fake login pages
- any external domain asking for action

2. suspicious:
- external links without clear intent
- Google Forms / data collection
- unclear attachments
- weak impersonation

3. legit:
- internal messages
- no links
- no action requests

4. If unsure → choose higher risk

====================
RETURN FORMAT (STRICT JSON ONLY)
====================
Return ONLY valid JSON like this:

{{
  "verdict": "legit",
  "score": 0,
  "signals": [],
  "soc_report": [],
  "confidence": 0
}}
"""

    try:
        response = _llm_call_with_retry(
            client,
            model=os.getenv("LLM_MODEL", "gpt-4.1-mini"),
            temperature=LLM_TEMPERATURE,
            messages=[
                {"role": "system", "content": "You are a senior SOC analyst."},
                {"role": "user", "content": prompt}
            ]
        )

        content = response.choices[0].message.content.strip()
        content = content.replace("```json", "").replace("```", "").strip()

        result = json.loads(content)

    except Exception as _e:
        print(f"REASONING AGENT ERROR: {type(_e).__name__}: {_e}")
        result = {
            "verdict": "suspicious",
            "score": 50,
            "signals": ["parse_error"],
            "soc_report": ["LLM failed to respond correctly"],
            "confidence": 50
        }

    # normalize verdict
    verdict = result.get("verdict", "suspicious")
    if verdict not in ["legit", "suspicious", "phishing"]:
        verdict = "suspicious"

    # normalize score to be consistent with verdict
    score = result.get("score", 50)
    if verdict == "phishing":
        score = max(score, 75)
    elif verdict == "suspicious":
        score = max(30, min(score, 74))
    else:  # legit
        score = min(score, 29)

    result["verdict"] = verdict
    result["score"] = score

    return {
        **state,
        "reasoning": result,
        "verdict": verdict,
        "risk_score": score
    }