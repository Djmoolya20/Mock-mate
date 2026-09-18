"""
Generates the final interview report from all Q&A + evaluations.
"""
from utils import parse_json_safe

def generate_report(qa_history: list) -> dict:
    # --- MOCK ---
    mock_response = '''
    {
      "scores": {"technical": 7, "communication": 8, "relevance": 6},
      "strengths": ["Clear communication", "Good structure"],
      "weaknesses": ["Needs more technical depth"],
      "recommendations": ["Practice more system design questions"]
    }
    '''
    return parse_json_safe(mock_response)
    # --- END MOCK ---