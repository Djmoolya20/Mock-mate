"""
Turns raw body-language metrics (from Mayuresh's MediaPipe tracking) into
2-4 specific, constructive coaching tips for the final report.
"""
import os
from utils import parse_json_safe
from bedrock_client import invoke_claude

USE_MOCK = os.getenv("USE_MOCK", "true").lower() == "true"

def generate_presence_feedback(body_language_metrics: dict) -> dict:
    """
    body_language_metrics shape (from the frontend, per the API contract):
    {
        "eyeContactPercent": 62,
        "posture": {"slouchPercent": 18, "leanEvents": 3},
        "gestures": {"fidgetCount": 12, "handsNearFaceCount": 4}
    }
    Returns: {"presenceFeedback": ["tip 1", "tip 2", ...]}
    """
    if USE_MOCK:
        mock_response = '''
        {
          "presenceFeedback": [
            "You maintained eye contact for roughly 6 out of 10 minutes — try anchoring your gaze on the camera lens itself rather than the screen when answering.",
            "Some slouching was detected during longer answers — sitting slightly forward can help maintain energy through your response.",
            "A few instances of hands near your face were picked up — this can read as a nervous tell to interviewers; try resting your hands on the desk instead."
          ]
        }
        '''
        return parse_json_safe(mock_response)

    system_prompt = (
        "You are a presence and body-language coach reviewing metrics from a mock interview. "
        "Turn the given numeric metrics into 2-4 specific, constructive, actionable tips. "
        "Avoid generic advice like 'be more confident' — reference the actual numbers given "
        "and suggest a concrete adjustment for each. Keep a supportive, coaching tone, not critical. "
        "Respond with ONLY valid JSON in this exact shape: "
        '{"presenceFeedback": ["tip 1", "tip 2", ...]}'
    )
    user_prompt = f"bodyLanguageMetrics: {body_language_metrics}"
    raw = invoke_claude(system_prompt, user_prompt)
    return parse_json_safe(raw)