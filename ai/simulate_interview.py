# NOTE: This makes real API calls when USE_MOCK=false. Run deliberately, not in CI/automated testing.
"""
Simulates a full interview loop end-to-end using the mocked functions.
Not a unit test — a sanity check that the whole pipeline chains together correctly.
"""
from opening_question import get_opening_question
from evaluate_followup import evaluate_and_followup
from report import generate_report
from presence_feedback import generate_presence_feedback

def run_simulation():
    persona_id = "strict-lead"
    target_role = "Backend Developer"
    difficulty = "medium"
    resume_text = "Built a FastAPI microservice handling 10k req/min; led migration from monolith to microservices."
    jd_text = "Looking for backend engineer with strong API design and microservices experience."

    qa_history = []

    # 1. Opening question
    result = get_opening_question(target_role, difficulty, resume_text, jd_text, persona_id)
    current_question = result["question"]
    print(f"Q1: {current_question}")

    # 2. Simulate 3 rounds of answer -> evaluate -> follow-up
    for i in range(3):
        fake_answer = f"This is a sample answer to question {i + 1}."
        eval_result = evaluate_and_followup(
            question=current_question,
            answer=fake_answer,
            difficulty=difficulty,
            recent_context=qa_history,
            persona_id=persona_id
        )
        qa_history.append({
            "question": current_question,
            "answer": fake_answer,
            "evaluation": eval_result["evaluation"]
        })
        print(f"  Evaluation: {eval_result['evaluation']}")
        current_question = eval_result["nextQuestion"]
        print(f"Q{i + 2}: {current_question}")
        if eval_result["isComplete"]:
            break

    # 3. Final report
    report = generate_report(qa_history)
    print(f"\nFinal Report: {report}")

    # 4. Presence feedback
    mock_metrics = {
        "eyeContactPercent": 58,
        "posture": {"slouchPercent": 22, "leanEvents": 2},
        "gestures": {"fidgetCount": 9, "handsNearFaceCount": 3}
    }
    presence = generate_presence_feedback(mock_metrics)
    print(f"\nPresence Feedback: {presence}")

    # 5. Combined report (what actually goes to the frontend)
    combined_report = {**report, **presence}
    print(f"\n=== COMBINED FINAL REPORT ===\n{combined_report}")

if __name__ == "__main__":
    run_simulation()