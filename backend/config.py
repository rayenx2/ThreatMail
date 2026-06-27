import os
from dotenv import load_dotenv

# load .env file
load_dotenv()

# API KEYS
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
VT_API_KEY = os.getenv("VT_API_KEY")

# LLM SETTINGS (FIXES YOUR CRASH)
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))