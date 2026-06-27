from tools.url_tool import url_reputation_check

class ToolRegistry:
    """
    Simple MCP-style tool registry.
    This simulates model-context-protocol tool routing.
    """

    def __init__(self):
        self.tools = {
            "url_reputation_check": url_reputation_check
        }

    def run(self, tool_name: str, input_data):
        if tool_name not in self.tools:
            raise ValueError(f"Tool {tool_name} not found")

        return self.tools[tool_name](input_data)