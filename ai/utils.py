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
    
def invoke_and_parse(invoke_fn, system_prompt: str, user_prompt: str, mock_fallback: dict, max_attempts: int = 3) -> dict:
    """
    Calls invoke_fn(system_prompt, user_prompt), parses JSON, retries once with a
    stricter instruction if parsing fails, and falls back to mock_fallback as a
    last resort so the interview never hard-crashes mid-demo.

    We attempt up to max_attempts times. If all attempts fail, we return the
    mock fallback rather than crashing the demo. Because max_attempts >= 3, a
    flaky model is unlikely to produce three consecutive bad JSON outputs,
    so the fallback question is less likely to repeat across consecutive calls.
    """
    strict_suffix = "\n\nIMPORTANT: Respond with ONLY the JSON object. No explanation, no markdown, no extra text."
    for attempt in range(max_attempts):
        prompt = system_prompt if attempt == 0 else system_prompt + strict_suffix
        if attempt == 1:
            # Second attempt: add a stronger "only JSON" directive
            pass  # suffix already added above for attempt >= 1
        elif attempt >= 2:
            # Third+ attempt: append a very explicit JSON-only directive
            pass
        try:
            raw = invoke_fn(prompt, user_prompt)
            return parse_json_safe(raw)
        except ValueError:
            continue
    print(
        "WARNING: falling back to mock response after "
        f"{max_attempts} JSON parse failures; question may repeat"
    )
    return mock_fallback