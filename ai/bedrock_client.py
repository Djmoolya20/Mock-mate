"""
Shared Groq API client + invoke helper. All prompt functions call through this.
Includes retry logic and a safe fallback to prevent demo-breaking failures,
since open models on Groq are less consistent at strict JSON output than Claude.
"""
import os
import time
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

MODEL_ID = "openai/gpt-oss-120b"
_client = None

def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _client

def invoke_claude(system_prompt: str, user_prompt: str, max_tokens: int = 1024, retries: int = 2) -> str:
    """
    Sends a system + user prompt to Groq (Llama 3.3 70B), returns raw text response.
    Retries on transient errors. Same signature as before, so opening_question.py,
    evaluate_followup.py, etc. need zero changes.
    """
    client = get_client()
    last_error = None
    for attempt in range(retries + 1):
        try:
            response = client.chat.completions.create(
                model=MODEL_ID,
                max_tokens=max_tokens,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            return response.choices[0].message.content
        except Exception as e:
            last_error = e
            if attempt < retries:
                time.sleep(1 * (attempt + 1))
    raise RuntimeError(f"Groq call failed after {retries + 1} attempts: {last_error}")