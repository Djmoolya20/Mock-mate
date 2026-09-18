"""
Evaluates a candidate's answer and generates the next follow-up question.
"""
from utils import parse_json_safe

def evaluate_and_followup(question: str, answer: str, difficulty: str, recent_context: list) -> dict:
    # --- MOCK ---
    mock_response = '''
    {
      "evaluation": {"score": 7, "feedback": "Good structure, could use more technical depth."},
      "nextQuestion": "What would you do differently if you had more time?",
      "isComplete": false
    }
    '''
    return parse_json_safe(mock_response)
    # --- END MOCK ---