# Agentic SOC Phishing Detection System  
## Multi-Agent Email Threat Analyzer

---

## Overview

The Agentic SOC Phishing Detection System is an AI-powered Security Operations Center (SOC) simulation that detects phishing emails using a multi-agent architecture, external threat intelligence tools, and an LLM-based reasoning engine.

The system is designed to replicate real-world SOC workflows by decomposing email analysis into structured investigative steps and producing explainable security decisions.

---

## System Objective

The system aims to:

- Detect phishing and malicious emails using structured multi-agent reasoning
- Simulate SOC analyst workflows using LangGraph orchestration
- Extract and analyze security indicators (IOCs) from raw email data
- Use external threat intelligence (VirusTotal API) for validation
- Maintain memory of known attack patterns
- Use an LLM-based reasoning engine for final classification
- Provide explainable SOC-style reports

---

## Agentic Definition

This system is agentic because it delegates decision-making to an LLM-based reasoning agent that synthesizes outputs from multiple specialized agents and external tools to produce final security classifications.

The system does not rely on static rules; instead, it uses structured multi-step reasoning over tool outputs and contextual signals.

---

## System Architecture

The system is built using a modular multi-agent pipeline orchestrated by LangGraph.

### Execution Flow

ioc → threat → virustotal → memory → reasoning → report

---

## Agent Components

### 1. IOC Extraction Agent
Extracts Indicators of Compromise (IOCs) from raw email content.

- URLs
- Email addresses
- Domains
- Suspicious patterns

---

### 2. Threat Analysis Agent
Analyzes extracted IOCs for phishing indicators.

Detects:

- Impersonation attempts
- Urgency manipulation
- Social engineering patterns
- External email domain usage
- Data harvesting behavior

---

### 3. VirusTotal Intelligence Agent
Performs real-time URL reputation analysis using the VirusTotal API.

Provides:

- Malicious score
- Suspicious score
- Harmless score
- Undetected classification

This external intelligence is used as part of the reasoning context.

---

### 4. Memory Agent
Stores and retrieves historical attack patterns.

Capabilities:

- Detect repeated phishing structures
- Track known malicious domains
- Improve contextual detection accuracy

---

### 5. LLM-Based Reasoning Agent (Core Engine)

The reasoning agent uses GPT-4.1-mini as the primary decision-making component.

It analyzes:

- IOC signals
- Threat analysis results
- VirusTotal intelligence
- Memory-based patterns

It outputs:

- Final classification: (legit / suspicious / phishing)
- Risk score (0–100)
- Structured SOC explanation
- Confidence score

This replaces rule-based classification with contextual reasoning.

---

### 6. Reporting Layer
Generates final SOC-style output including:

- Verdict
- Risk score
- Detected signals
- SOC explanation report

---

## Risk Scoring Model

- 0–30 → Legitimate  
- 31–60 → Suspicious  
- 61–100 → Phishing  

For evaluation consistency:

> Both “suspicious” and “phishing” are mapped to the malicious class, reflecting SOC triage practices where both require investigation and escalation.

---

## LangGraph Workflow

The system is implemented using LangGraph for structured orchestration of agents.

```python
workflow = StateGraph(AgentState)

workflow.add_node("ioc", extract_iocs)
workflow.add_node("threat", threat_analysis)
workflow.add_node("virustotal", virustotal_agent)
workflow.add_node("memory", memory_agent)
workflow.add_node("reasoning", reasoning_agent)
workflow.add_node("report", reporting_agent)

workflow.set_entry_point("ioc")

workflow.add_edge("ioc", "threat")
workflow.add_edge("threat", "virustotal")
workflow.add_edge("virustotal", "memory")
workflow.add_edge("memory", "reasoning")
workflow.add_edge("reasoning", "report")

app = workflow.compile()
```
---
## Evaluation Framework

The system is evaluated using a labeled dataset of 40 emails.

### Metrics
- Accuracy  
- Precision  
- Recall  
- F1 Score  
- Confusion Matrix  

### Evaluation Method
- Fully automated evaluation via `evaluate.py`  
- Real runtime inference (no hardcoded outputs)  
- SOC-style classification benchmarking  

### Dataset

The dataset includes:

- Phishing emails (credential theft, impersonation, HR scams)  
- Legitimate academic and administrative emails  
- Edge-case emails (Google Forms, attachments, ambiguous messages)  

---

## External Integrations

- VirusTotal API (real-time URL analysis)  
- OpenAI GPT-4.1-mini (LLM reasoning engine)  

---

## Key Features

- Multi-agent SOC simulation  
- LLM-driven reasoning engine  
- External threat intelligence integration  
- Memory-based pattern recognition  
- Explainable AI outputs  
- Evaluation-driven architecture  

---

## Limitations

- Sequential pipeline execution (non-parallel agents)  
- LLM reasoning depends on prompt quality and input context  
- Limited adversarial robustness testing against advanced phishing variants  

---

## Future Improvements

- Autonomous tool selection by LLM  
- Real-time streaming SOC alerts  
- Integration with OpenCTI / AbuseIPDB  
- Multi-model ensemble detection  
- Parallel agent execution for performance optimization  

---

## Tech Stack

- Python  
- FastAPI  
- LangGraph  
- OpenAI GPT-4.1-mini  
- VirusTotal API  
- React  
- TailwindCSS  

---

## Conclusion

This system demonstrates how agentic AI can be applied to cybersecurity by combining multi-agent decomposition, external threat intelligence, and LLM-based reasoning to simulate real SOC analyst decision-making processes with explainable outputs.