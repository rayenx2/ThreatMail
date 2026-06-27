import re
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


def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY missing")
    base_url = os.getenv("OPENAI_BASE_URL") or None
    return OpenAI(api_key=api_key, base_url=base_url)


def safe_json_parse(content):
    """
    Robust JSON parser for LLM output
    """
    try:
        return json.loads(content)
    except:
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except:
                pass

    return {}


def extract_iocs(state):

    client = get_openai_client()

    text = state["email"]

    urls = re.findall(r"https?://\S+", text)
    emails = re.findall(r"[\w\.-]+@[\w\.-]+", text)

    prompt = f"""
You are a SOC IOC extraction engine.

Return ONLY valid JSON.

Email:
{text}

Extract:
- job_scam (true/false)
- credential_request (true/false)
- impersonation (true/false)
- data_harvesting (true/false)
- urgency_language (true/false)
- summary (string)
"""

    try:
        response = _llm_call_with_retry(
            client,
            model=os.getenv("LLM_MODEL", "gpt-4.1-mini"),
            temperature=LLM_TEMPERATURE,
            messages=[
                {"role": "system", "content": "Return only JSON."},
                {"role": "user", "content": prompt}
            ]
        )

        content = response.choices[0].message.content

        llm_data = safe_json_parse(content)

    except Exception as e:
        print("IOC ERROR:", e)

        llm_data = {
            "job_scam": False,
            "credential_request": False,
            "impersonation": False,
            "data_harvesting": False,
            "urgency_language": False,
            "summary": "error"
        }

    return {
        **state,
        "iocs": {
            "urls": urls,
            "emails": emails,
            "features": llm_data
        }
    }