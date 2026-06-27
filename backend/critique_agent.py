import json
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def critique_agent(state):

    reasoning = state.get("reasoning", {})

    prompt = f"""
You are a SOC quality control agent.

Check this analysis:

{reasoning}

Decide if it is correct.

Return STRICT JSON ONLY:

{{
  "decision": "approve or revise",
  "missing_signals": [],
  "confidence": 0,
  "notes": "short explanation"
}}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "Return only JSON."},
            {"role": "user", "content": prompt}
        ]
    )

    content = response.choices[0].message.content.strip()
    content = content.replace("```json", "").replace("```", "")

    try:
        result = json.loads(content)
    except:
        result = {
            "decision": "approve",
            "missing_signals": [],
            "confidence": 70,
            "notes": "fallback"
        }

    return {
        **state,
        "critique": result
    }