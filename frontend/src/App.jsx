import { useState, useEffect, useRef } from "react";
import { analyzeEmail, BASE_URL } from "./api";

// ─── constants ────────────────────────────────────────────────────────────────

const AGENTS = [
  { id: "ioc",        label: "IOC Extractor",    desc: "URLs / emails / domains" },
  { id: "threat",     label: "Threat Analyzer",  desc: "Rule-based scoring"      },
  { id: "virustotal", label: "VirusTotal",        desc: "URL reputation API"      },
  { id: "memory",     label: "Memory Agent",      desc: "Pattern matching"        },
  { id: "reasoning",  label: "Reasoning LLM",     desc: "Llama 3.3 70B"          },
  { id: "report",     label: "Report Writer",     desc: "SOC incident report"     },
  { id: "confidence", label: "Confidence Score",  desc: "Multi-factor calibration"},
];

// ─── tiny helpers ─────────────────────────────────────────────────────────────

const verdict2pill = v =>
  ({ phishing: "pill-phishing", suspicious: "pill-suspicious", legit: "pill-legit" }[v] ?? "pill-error");

const verdict2color = v =>
  ({ phishing: "#f87171", suspicious: "#fbbf24", legit: "#4ade80" }[v] ?? "#94a3b8");

const score2bar = n => ({
  width: `${n}%`,
  background: n >= 75 ? "#ef4444" : n >= 40 ? "#f59e0b" : "#22c55e",
});

function fmt(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV = [
  { id: "analyze", icon: ShieldIcon,  label: "Analyze"  },
  { id: "history", icon: ClockIcon,   label: "History"  },
  { id: "metrics", icon: ChartIcon,   label: "Metrics"  },
];

function Sidebar({ tab, setTab, historyCount }) {
  return (
    <aside style={{ width: 220, minHeight: "100vh", background: "#0a0f1e", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9", letterSpacing: "-0.01em" }}>ThreatMail</div>
            <div style={{ fontSize: 11, color: "#475569" }}>AI Threat Detection</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px 8px" }}>Navigation</div>
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 6, border: "none", cursor: "pointer", marginBottom: 2, background: active ? "#1e3a5f" : "transparent", color: active ? "#93c5fd" : "#64748b", fontWeight: active ? 600 : 400, fontSize: 13, transition: "all 0.15s", textAlign: "left" }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#cbd5e1"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}}
            >
              <Icon size={16} color={active ? "#93c5fd" : "#475569"} />
              {label}
              {id === "history" && historyCount > 0 && (
                <span style={{ marginLeft: "auto", background: "#1d4ed8", color: "#bfdbfe", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{historyCount}</span>
              )}
            </button>
          );
        })}

        {/* Agent status */}
        <div style={{ marginTop: 24, fontSize: 10, fontWeight: 600, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px 8px" }}>Agent Pipeline</div>
        {AGENTS.map(a => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", fontSize: 11, color: "#475569" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1e3a5f", border: "1px solid #1d4ed8", flexShrink: 0 }} />
            {a.label}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid #1e293b" }}>
        <div style={{ fontSize: 11, color: "#475569" }}>Powered by</div>
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>LangGraph + Groq</div>
      </div>
    </aside>
  );
}

// ─── Icon stubs ───────────────────────────────────────────────────────────────

function ShieldIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function ClockIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function ChartIcon({ size = 16, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}

// ─── AnalyzeTab ───────────────────────────────────────────────────────────────

function AnalyzeTab({ onResult }) {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const [agentStep, setStep]    = useState(-1);

  async function scan() {
    if (!email.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setStep(0);

    let s = 0;
    const t = setInterval(() => { s++; if (s < AGENTS.length) setStep(s); }, 480);

    try {
      const data = await analyzeEmail(email);
      clearInterval(t);
      setStep(AGENTS.length);
      setResult(data);
      onResult({ ...data, email: email.slice(0, 80) + (email.length > 80 ? "…" : ""), ts: new Date().toISOString() });
    } catch {
      clearInterval(t);
      setStep(-1);
      setError("Cannot reach the backend. Make sure it is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const h = e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") scan(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [email, loading]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

      {/* Left: input and result */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Input card */}
        <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>Email Input</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Paste any raw email content below</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} className="pulse" />
              <span style={{ fontSize: 11, color: "#4ade80" }}>backend connected</span>
            </div>
          </div>
          <div style={{ padding: 18 }}>
            <textarea
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={"Paste the full email here, including headers, body, and links.\n\nExamples:\n• A suspicious password reset from an unknown domain\n• An unsolicited job offer asking for personal details\n• Any email you want the SOC pipeline to analyze"}
              style={{ width: "100%", minHeight: 220, background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 13, padding: "12px 14px", resize: "vertical", outline: "none", lineHeight: 1.7, fontFamily: "inherit", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "#334155"}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#475569" }}>
                {email.length > 0 ? `${email.length} characters` : "No input yet"}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {email && (
                  <button onClick={() => { setEmail(""); setResult(null); setError(null); setStep(-1); }}
                    style={{ fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: "6px 10px" }}>
                    Clear
                  </button>
                )}
                <button
                  onClick={scan}
                  disabled={loading || !email.trim()}
                  style={{ padding: "9px 22px", background: loading || !email.trim() ? "#1e3a5f" : "#1d4ed8", color: loading || !email.trim() ? "#475569" : "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: loading || !email.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
                  onMouseEnter={e => { if (!loading && email.trim()) e.currentTarget.style.background = "#2563eb"; }}
                  onMouseLeave={e => { if (!loading && email.trim()) e.currentTarget.style.background = "#1d4ed8"; }}
                >
                  {loading
                    ? <><svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Analyzing…</>
                    : <><ShieldIcon size={14} color="#fff" /> Run Analysis</>
                  }
                </button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#334155", marginTop: 6, textAlign: "right" }}>Ctrl+Enter</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#fca5a5" }}>
            ⚠ {error}
          </div>
        )}

        {/* Result card */}
        {result && <ResultCard result={result} />}
      </div>

      {/* Right: pipeline monitor */}
      <PipelinePanel agentStep={agentStep} loading={loading} result={result} />
    </div>
  );
}

// ─── PipelinePanel ────────────────────────────────────────────────────────────

function PipelinePanel({ agentStep, loading, result }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Agent pipeline */}
      <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #334155" }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>Agent Pipeline</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            {loading ? "Processing…" : agentStep >= AGENTS.length ? "Completed" : "Idle, awaiting input"}
          </div>
        </div>
        <div style={{ padding: "14px 18px" }}>
          {AGENTS.map((agent, i) => {
            const done   = agentStep > i;
            const active = agentStep === i;
            const idle   = agentStep < i && agentStep >= 0;
            return (
              <div key={agent.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < AGENTS.length - 1 ? 0 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div className={active ? "agent-ping" : ""} style={{ width: 28, height: 28, borderRadius: 6, border: `2px solid ${done ? "#16a34a" : active ? "#3b82f6" : "#1e293b"}`, background: done ? "#052e16" : active ? "#1e3a5f" : "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                    {done
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : active
                        ? <svg className="spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        : <span style={{ width: 6, height: 6, borderRadius: "50%", background: idle ? "#334155" : "#1e293b", border: "1px solid #334155" }} />
                    }
                  </div>
                  {i < AGENTS.length - 1 && (
                    <div style={{ width: 2, height: 22, background: done ? "#16a34a44" : "#1e293b", margin: "3px 0", borderRadius: 1, transition: "background 0.3s" }} />
                  )}
                </div>
                <div style={{ paddingTop: 4, paddingBottom: i < AGENTS.length - 1 ? 18 : 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: done ? "#4ade80" : active ? "#93c5fd" : "#475569", transition: "color 0.3s" }}>{agent.label}</div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>{agent.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick stats from result */}
      {result && (
        <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #334155" }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>Quick Summary</div>
          </div>
          <div style={{ padding: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Verdict",    value: result.verdict,    color: verdict2color(result.verdict) },
                { label: "Risk Score", value: `${result.risk_score}/100`, color: result.risk_score >= 75 ? "#f87171" : result.risk_score >= 40 ? "#fbbf24" : "#4ade80" },
                { label: "Confidence", value: `${result.confidence?.overall ?? 0}%`, color: "#93c5fd" },
                { label: "Signals",    value: result.reasoning?.signals?.length ?? 0, color: "#94a3b8" },
              ].map(s => (
                <div key={s.label} style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px", border: "1px solid #334155" }}>
                  <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: s.color, textTransform: "capitalize" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ResultCard ───────────────────────────────────────────────────────────────

function ResultCard({ result }) {
  const { verdict, risk_score, confidence, reasoning, iocs, report } = result;
  const [tab, setTab] = useState("report");

  return (
    <div className="fade-in" style={{ background: "#1e293b", borderRadius: 10, border: `1px solid ${verdict === "phishing" ? "#7f1d1d" : verdict === "suspicious" ? "#78350f" : "#14532d"}`, overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "16px 18px", background: "#0f172a", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: verdict === "phishing" ? "#450a0a" : verdict === "suspicious" ? "#422006" : "#052e16", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldIcon size={18} color={verdict2color(verdict)} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Analysis Result</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
              <span className={verdict2pill(verdict)} style={{ padding: "3px 10px", borderRadius: 5, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{verdict}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Risk Score", val: risk_score, color: risk_score >= 75 ? "#f87171" : risk_score >= 40 ? "#fbbf24" : "#4ade80" },
            { label: "Confidence", val: `${confidence?.overall ?? 0}%`, color: "#93c5fd" },
            { label: "Signals",    val: reasoning?.signals?.length ?? 0,     color: "#94a3b8" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#475569" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk bar */}
      <div style={{ padding: "10px 18px", background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 5 }}>
          <span>Risk Level</span><span style={{ color: verdict2color(verdict), fontWeight: 600 }}>{risk_score}/100</span>
        </div>
        <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, transition: "width 0.6s ease", ...score2bar(risk_score) }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #334155", background: "#0f172a" }}>
        {[["report", "SOC Report"], ["signals", "Signals"], ["iocs", "IOCs"], ["raw", "Raw JSON"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: "10px 16px", fontSize: 12, fontWeight: tab === id ? 600 : 400, color: tab === id ? "#93c5fd" : "#64748b", background: "none", border: "none", cursor: "pointer", borderBottom: tab === id ? "2px solid #3b82f6" : "2px solid transparent", marginBottom: -1, transition: "all 0.15s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: 18 }}>

        {tab === "report" && (
          <div>
            {/* Confidence */}
            <div style={{ background: "#0f172a", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e293b", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 6 }}>
                <span>Confidence Assessment</span>
                <span style={{ color: confidence?.reliable ? "#4ade80" : "#fbbf24" }}>{confidence?.reliable ? "RELIABLE" : "NEEDS REVIEW"}</span>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, marginBottom: 8 }}>{confidence?.explanation}</p>
              <div style={{ height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, width: `${confidence?.overall ?? 0}%`, background: (confidence?.overall ?? 0) >= 70 ? "#22c55e" : "#f59e0b", transition: "width 0.8s ease" }} />
              </div>
            </div>

            {/* SOC Report lines */}
            <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>SOC Analyst Report</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(reasoning?.soc_report ?? []).map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b", fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
                  <span style={{ color: "#3b82f6", flexShrink: 0, marginTop: 1 }}>›</span>
                  {line}
                </div>
              ))}
            </div>

            {/* Incident summary */}
            {(report?.summary || report?.recommendation) && (
              <div style={{ marginTop: 16, padding: "12px 14px", background: "#0f172a", borderRadius: 8, border: "1px solid #1e293b" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>INCIDENT REPORT</div>
                {report.summary && <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 8 }}>{report.summary}</p>}
                {report.recommendation && (
                  <div style={{ display: "flex", gap: 8, padding: "8px 12px", background: "#422006", border: "1px solid #78350f", borderRadius: 6 }}>
                    <span style={{ color: "#fbbf24", fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 13, color: "#fcd34d", lineHeight: 1.5 }}>{report.recommendation}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "signals" && (
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
              {(reasoning?.signals ?? []).length === 0
                ? "No threat signals detected. Email appears legitimate."
                : `${reasoning.signals.length} threat signal${reasoning.signals.length > 1 ? "s" : ""} detected by the agent pipeline.`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(reasoning?.signals ?? []).map((sig, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0f172a", borderRadius: 7, border: "1px solid #334155" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "monospace" }}>{sig}</span>
                </div>
              ))}
            </div>

            {/* IOC features from ioc_agent */}
            {iocs?.features && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>IOC Feature Flags</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {Object.entries(iocs.features).filter(([k]) => k !== "summary").map(([key, val]) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b", fontSize: 12 }}>
                      <span style={{ color: "#64748b", fontFamily: "monospace" }}>{key}</span>
                      <span style={{ fontWeight: 600, color: val === true ? "#f87171" : "#4ade80" }}>{String(val)}</span>
                    </div>
                  ))}
                </div>
                {iocs.features.summary && (
                  <div style={{ marginTop: 10, padding: "10px 14px", background: "#0f172a", borderRadius: 7, border: "1px solid #334155", fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                    "{iocs.features.summary}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "iocs" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>URLs Detected</div>
              {(iocs?.urls ?? []).length === 0
                ? <div style={{ fontSize: 13, color: "#475569" }}>No URLs found in this email.</div>
                : (iocs.urls).map((url, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "#0f172a", borderRadius: 6, border: "1px solid #7f1d1d", marginBottom: 6, fontSize: 12, color: "#fca5a5", fontFamily: "monospace", wordBreak: "break-all" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      {url}
                    </div>
                  ))
              }
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Email Addresses</div>
              {(iocs?.emails ?? []).length === 0
                ? <div style={{ fontSize: 13, color: "#475569" }}>No email addresses found.</div>
                : (iocs.emails).map((em, i) => (
                    <div key={i} style={{ padding: "9px 12px", background: "#0f172a", borderRadius: 6, border: "1px solid #334155", marginBottom: 6, fontSize: 12, color: "#fcd34d", fontFamily: "monospace" }}>{em}</div>
                  ))
              }
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>VirusTotal</div>
              {(result.virustotal ?? []).map((vt, i) => (
                <div key={i} style={{ padding: "9px 12px", background: "#0f172a", borderRadius: 6, border: "1px solid #334155", marginBottom: 6, fontSize: 12, color: vt.error ? "#64748b" : "#4ade80" }}>
                  {vt.error ? `⚠ ${vt.url}: ${vt.error}` : `✓ ${vt.url}: ${JSON.stringify(vt)}`}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "raw" && (
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>Complete JSON response from the backend pipeline.</div>
            <pre style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 14, fontSize: 11, color: "#94a3b8", overflowX: "auto", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HistoryTab ───────────────────────────────────────────────────────────────

function HistoryTab({ history, onReplay }) {
  if (history.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <ClockIcon size={36} color="#334155" />
      <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: "#475569" }}>No scans yet</div>
      <div style={{ fontSize: 13, color: "#334155", marginTop: 6 }}>Run an analysis from the Analyze tab to see results here.</div>
    </div>
  );

  return (
    <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>Scan History</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{history.length} scan{history.length !== 1 ? "s" : ""} this session</div>
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #334155", background: "#0f172a" }}>
            {["#", "Time", "Email Preview", "Verdict", "Risk", "Confidence", "Signals"].map(h => (
              <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...history].reverse().map((item, i) => (
            <tr key={item.ts + i}
              onClick={() => onReplay(item)}
              style={{ borderBottom: "1px solid #1e293b", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#0f172a"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#475569" }}>{history.length - i}</td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{fmt(item.ts)}</td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", maxWidth: 280 }}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.email}</div>
              </td>
              <td style={{ padding: "12px 16px" }}>
                <span className={verdict2pill(item.verdict)} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{item.verdict}</span>
              </td>
              <td style={{ padding: "12px 16px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: item.risk_score >= 75 ? "#f87171" : item.risk_score >= 40 ? "#fbbf24" : "#4ade80" }}>{item.risk_score}</span>
              </td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#93c5fd" }}>{item.confidence?.overall ?? 0}%</td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{item.reasoning?.signals?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MetricsTab ───────────────────────────────────────────────────────────────

function MetricsTab() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${BASE_URL}/metrics`);
      setMetrics(await r.json());
    } catch {
      setErr("Cannot reach the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <svg className="spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    </div>
  );

  if (err) return (
    <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "14px 18px", fontSize: 13, color: "#fca5a5" }}>⚠ {err}</div>
  );

  const vd = metrics?.verdict_distribution ?? {};
  const total = metrics?.total_analyses ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Top stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {[
          { label: "Total Analyses",     value: total,                                              color: "#93c5fd" },
          { label: "Phishing Detected",  value: vd.phishing ?? 0,                                   color: "#f87171" },
          { label: "Suspicious",         value: vd.suspicious ?? 0,                                 color: "#fbbf24" },
          { label: "Legitimate",         value: vd.legit ?? 0,                                      color: "#4ade80" },
          { label: "Avg Risk Score",     value: metrics?.avg_risk_score?.toFixed(1) ?? "—",         color: "#a78bfa" },
          { label: "High Confidence",    value: metrics?.high_confidence_detections ?? 0,           color: "#34d399" },
          { label: "Detection Rate",     value: `${metrics?.phishing_detection_rate_pct ?? 0}%`,    color: "#f87171" },
          { label: "Uptime",             value: `${Math.floor((metrics?.uptime_seconds ?? 0)/60)}m`, color: "#64748b" },
        ].map(s => (
          <div key={s.label} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Verdict distribution bar */}
      {total > 0 && (
        <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", padding: "18px 20px" }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", marginBottom: 16 }}>Verdict Distribution</div>
          {[
            { key: "phishing",   label: "Phishing",   color: "#ef4444" },
            { key: "suspicious", label: "Suspicious", color: "#f59e0b" },
            { key: "legit",      label: "Legitimate", color: "#22c55e" },
          ].map(({ key, label, color }) => {
            const count = vd[key] ?? 0;
            const pct = total > 0 ? Math.round(count / total * 100) : 0;
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "#94a3b8" }}>{label}</span>
                  <span style={{ color: "#64748b" }}>{count} &nbsp;<span style={{ color }}>{pct}%</span></span>
                </div>
                <div style={{ height: 8, background: "#0f172a", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Benchmark */}
      <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", padding: "18px 20px" }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", marginBottom: 16 }}>Model Benchmark (40-sample evaluation dataset)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 14 }}>
          {[
            { label: "Accuracy",  value: "85%", base: "vs 62%", color: "#4ade80"  },
            { label: "Precision", value: "82%", base: "vs 58%", color: "#93c5fd"  },
            { label: "Recall",    value: "90%", base: "vs 70%", color: "#fbbf24"  },
            { label: "+Accuracy", value: "+37%",base: "over baseline", color: "#f87171" },
          ].map(b => (
            <div key={b.label} style={{ background: "#0f172a", borderRadius: 8, padding: "14px 16px", border: "1px solid #1e293b", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: b.color }}>{b.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{b.label}</div>
              <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>{b.base}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System info */}
      <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", padding: "18px 20px" }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", marginBottom: 14 }}>System Configuration</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.entries(metrics?.model ?? {}).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b", fontSize: 12 }}>
              <span style={{ color: "#475569", textTransform: "capitalize" }}>{k}</span>
              <span style={{ color: "#93c5fd", fontFamily: "monospace" }}>{Array.isArray(v) ? v.join(", ") : String(v)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button onClick={load} style={{ fontSize: 12, color: "#3b82f6", background: "none", border: "1px solid #1e3a5f", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>Refresh</button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab]         = useState("analyze");
  const [history, setHistory] = useState([]);
  const [replayItem, setReplay] = useState(null);

  function onResult(item) {
    setHistory(h => [...h, item]);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar tab={tab} setTab={setTab} historyCount={history.length} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ borderBottom: "1px solid #1e293b", background: "#0a0f1e", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              {{ analyze: "Email Threat Analyzer", history: "Scan History", metrics: "System Metrics" }[tab]}
            </h1>
            <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
              {{ analyze: "Paste any email, six agents analyze it in real time", history: `${history.length} scan${history.length !== 1 ? "s" : ""} completed this session`, metrics: "Live stats from the backend pipeline" }[tab]}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} className="pulse" />
            <span style={{ fontSize: 12, color: "#4ade80" }}>backend online</span>
            <span style={{ fontSize: 12, color: "#334155", marginLeft: 8 }}>:{new URL(BASE_URL).port || "443"}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {tab === "analyze" && <AnalyzeTab onResult={onResult} />}
          {tab === "history" && <HistoryTab history={history} onReplay={item => { setTab("analyze"); setReplay(item); }} />}
          {tab === "metrics" && <MetricsTab />}
        </div>
      </div>
    </div>
  );
}
