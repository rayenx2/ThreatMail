# AI Phishing Detection System — Evaluation Report

---

## 1. Purpose

This document presents the evaluation of an Agentic SOC Phishing Detection System designed to classify emails into legitimate, suspicious, or phishing categories using a multi-agent architecture.

The evaluation focuses on measuring classification performance, system robustness, and the contribution of external intelligence sources and LLM-based reasoning.

---

## 2. System Under Evaluation

The system consists of a multi-stage SOC-inspired pipeline implemented using LangGraph. It integrates:

- IOC extraction module
- Threat analysis module
- VirusTotal API-based URL intelligence
- Memory-based pattern recognition
- LLM-based reasoning engine (GPT-4.1-mini)
- Final reporting layer

The system produces structured classification outputs with explanations and risk scores.

---

## 3. Dataset Specification

The evaluation dataset consists of **40 labeled email samples**.

### Class Distribution:

- Phishing emails: Credential theft, impersonation, fraud attempts
- Legitimate emails: Academic, administrative, and informational messages
- Edge-case emails: Ambiguous or partially suspicious messages (e.g., forms, external links)

Dataset source:
`backend/soc_dataset.py`

---

## 4. Evaluation Procedure

Each email in the dataset is processed through the full SOC pipeline.

No preprocessing or manual intervention is applied during inference.

The system produces a final classification label per email.

---

## 5. Classification Labels

For evaluation purposes, outputs are mapped as follows:

- Legitimate → Benign class
- Suspicious → Malicious class
- Phishing → Malicious class

Binary evaluation is performed:

- 0 → Legitimate
- 1 → Malicious (Suspicious + Phishing)

---

## 6. Metrics

The following metrics are computed:

- Accuracy
- Precision (macro-averaged)
- Recall (macro-averaged)
- F1 Score (macro-averaged)
- Confusion Matrix

All metrics are derived from real runtime execution using `evaluate.py`.

---

## 7. System Behavior Characteristics

The system demonstrates the following properties:

- LLM-driven reasoning for final classification decisions
- Real-time enrichment using VirusTotal API
- Memory-based reinforcement of known attack patterns
- Multi-agent decomposition of SOC workflow
- Explainable decision outputs per email

---

## 8. Results

The system evaluation on 40 emails produced the following outcome:

- Accuracy: **87.5%**

Additional metrics (precision, recall, F1-score) are computed during runtime evaluation and vary depending on classification thresholds and dataset distribution.

---

## 9. Observations

- Most phishing emails are correctly identified using URL and impersonation signals.
- Legitimate emails are consistently classified with high confidence.
- Misclassifications primarily occur in edge-case emails containing external links or forms.
- Memory and VirusTotal signals significantly improve detection reliability.
- LLM reasoning improves interpretability of final decisions.

---

## 10. Limitations

- Sequential processing limits scalability under high throughput conditions.
- LLM outputs are sensitive to prompt structure and input signal completeness.
- External dependency on VirusTotal API introduces latency and rate limits.
- Edge-case classification remains challenging for ambiguous emails.

---

## 11. Conclusion

The system demonstrates effective performance in simulating SOC-style phishing detection using a multi-agent architecture.

The integration of LLM reasoning, external threat intelligence, and memory-based analysis contributes to improved detection capability and explainability.

Final measured accuracy on the evaluation dataset is **87.5%**.