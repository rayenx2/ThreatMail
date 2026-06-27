import base64
import requests

from config import VT_API_KEY


def virustotal_tool(url: str):

    if not VT_API_KEY:
        return {
            "url": url,
            "error": "Missing VT_API_KEY"
        }

    try:

        headers = {
            "x-apikey": VT_API_KEY
        }

        url_id = base64.urlsafe_b64encode(
            url.encode()
        ).decode().strip("=")

        response = requests.get(
            f"https://www.virustotal.com/api/v3/urls/{url_id}",
            headers=headers,
            timeout=15
        )

        if response.status_code != 200:
            return {
                "url": url,
                "error": response.text
            }

        data = response.json()

        stats = (
            data.get("data", {})
            .get("attributes", {})
            .get("last_analysis_stats", {})
        )

        return {
            "url": url,
            "malicious": stats.get("malicious", 0),
            "suspicious": stats.get("suspicious", 0),
            "harmless": stats.get("harmless", 0),
            "undetected": stats.get("undetected", 0),
            "source": "virustotal_api"
        }

    except Exception as e:
        return {
            "url": url,
            "error": str(e)
        }


def virustotal_agent(state):

    urls = state.get("iocs", {}).get("urls", [])

    results = []

    for url in urls:
        results.append(
            virustotal_tool(url)
        )

    return {
        **state,
        "virustotal": results
    }