import os
import json
import time
from openai import OpenAI, RateLimitError


def _llm_call_with_retry(client, **kwargs):
    for attempt in range(3):
        try:
            return client.chat.completions.create(**kwargs)
        except RateLimitError:
            if attempt < 2:
                time.sleep(5)
            else:
                raise

def reporting_agent(state):
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL") or None,
    )

    prompt = f"""
You are a SOC report writer.

Write a professional incident report.

Decision:
{state.get("reasoning")}

IOC:
{state.get("iocs")}

Threat:
{state.get("threat")}

Memory:
{state.get("memory")}

Return JSON:

{{
  "final_report": "...",
  "summary": "...",
  "recommendation": "..."
}}
"""

    try:
        response = _llm_call_with_retry(
            client,
            model=os.getenv("LLM_MODEL", "gpt-4.1-mini"),
            temperature=0,
            messages=[
                {"role": "system", "content": "SOC reporting assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        content = response.choices[0].message.content.strip()
        content = content.replace("```json", "").replace("```", "").strip()
        result = json.loads(content)
    except Exception as e:
        result = {
            "final_report": f"Report generation failed: {e}",
            "summary": "Error during report generation.",
            "recommendation": "Manual review required."
        }

    return {
        **state,
        "report": result
    }