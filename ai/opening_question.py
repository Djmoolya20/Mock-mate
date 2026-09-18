"""
Generates the opening interview question based on role, difficulty, and resume/JD context.
Mocked for now — swap MOCK block for real Bedrock call once AWS access is confirmed.
"""
from utils import parse_json_safe

def get_opening_question(target_role: str, difficulty: str, resume_text: str, jd_text: str) -> dict:
    # --- MOCK: remove once Bedrock is wired in ---
    mock_response = '{"question": "Tell me about a time you debugged a tricky production issue."}'
    return parse_json_safe(mock_response)
    # --- END MOCK ---