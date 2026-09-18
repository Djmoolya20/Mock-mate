import json
import re

def parse_json_safe(raw_text: str) -> dict:
    match = re.search(r'\{.*\}', raw_text, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in model output: {raw_text[:200]}")
    try:
        return json.loads(match.group())
    except json.JSONDecodeError as e:
        raise ValueError(f"Malformed JSON from model: {e}\nRaw: {raw_text[:200]}")