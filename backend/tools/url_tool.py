import requests

def url_reputation_check(url: str):
    """
    MCP-style tool:
    External capability wrapper for URL intelligence
    """

    try:
        resp = requests.get(url, timeout=3)

        return {
            "url": url,
            "status_code": resp.status_code,
            "reachable": True if resp.status_code < 400 else False
        }

    except Exception:
        return {
            "url": url,
            "status_code": None,
            "reachable": False
        }