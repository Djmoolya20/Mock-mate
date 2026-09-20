"""
local_test.py — test the complete mock interview flow locally.

This test uses:
    - Real DynamoDB
    - Mock AI functions
    - No Lambda deployment
    - No API Gateway

Run from the lambda folder:

    python local_test.py
"""

import json

import get_report
import list_interviews
import start_interview
import submit_answer


def fake_event(body=None, query=None):
    """
    Create an event that looks similar to an API Gateway event.
    """

    return {
        "body": json.dumps(body) if body is not None else None,
        "queryStringParameters": query,
    }


def print_response(label, response):
    """
    Print a handler response in a readable way.
    """

    print(f"\n===== {label} =====")
    print("Status:", response.get("statusCode"))
    print("Body:", response.get("body"))

    return json.loads(response.get("body") or "{}")


def main():

    user_id = "test-user-1"

    # ---------------------------------------------------------
    # 1. Start interview
    # ---------------------------------------------------------

    start_response = start_interview.handler(
        fake_event(
            {
                "userId": user_id,
                "targetRole": "Backend Engineer",
                "difficulty": "medium",
                "interviewType": "text",
                "personaId": "strict-lead",
            }
        ),
        None,
    )

    start_data = print_response(
        "START INTERVIEW",
        start_response,
    )

    if start_response["statusCode"] != 200:
        print("\n❌ Start interview failed.")
        return

    interview_id = start_data["interviewId"]

    print("\nInterview ID:", interview_id)
    print("Opening question:", start_data["question"])

    # ---------------------------------------------------------
    # 2. Answer questions
    # ---------------------------------------------------------

    question_number = 1
    is_complete = False

    while not is_complete:

        answer_response = submit_answer.handler(
            fake_event(
                {
                    "interviewId": interview_id,
                    "questionNumber": question_number,
                    "answer": (
                        f"This is my test answer "
                        f"for question #{question_number}."
                    ),
                }
            ),
            None,
        )

        answer_data = print_response(
            f"ANSWER QUESTION {question_number}",
            answer_response,
        )

        if answer_response["statusCode"] != 200:
            print(
                f"\n❌ Answer submission failed "
                f"for question {question_number}."
            )
            return

        is_complete = answer_data["isComplete"]

        if answer_data.get("nextQuestion"):
            print(
                "Next question:",
                answer_data["nextQuestion"],
            )

        question_number += 1

    # ---------------------------------------------------------
    # 3. Generate final report
    # ---------------------------------------------------------

    body_language_metrics = {
        "eyeContactPercent": 58,
        "posture": {
            "slouchPercent": 22,
            "leanEvents": 4,
        },
        "gestures": {
            "fidgetCount": 9,
            "handsNearFaceCount": 2,
        },
    }

    report_response = get_report.handler(
        fake_event(
            {
                "interviewId": interview_id,
                "bodyLanguageMetrics": body_language_metrics,
            }
        ),
        None,
    )

    report_data = print_response(
        "FINAL REPORT",
        report_response,
    )

    if report_response["statusCode"] != 200:
        print("\n❌ Report generation failed.")
        return

    # ---------------------------------------------------------
    # 4. List interviews
    # ---------------------------------------------------------

    list_response = list_interviews.handler(
        fake_event(
            query={
                "userId": user_id,
            }
        ),
        None,
    )

    list_data = print_response(
        "INTERVIEW HISTORY",
        list_response,
    )

    if list_response["statusCode"] != 200:
        print("\n❌ Interview listing failed.")
        return

    # ---------------------------------------------------------
    # 5. Final result
    # ---------------------------------------------------------

    print("\n" + "=" * 50)
    print("✅ LOCAL BACKEND TEST COMPLETED SUCCESSFULLY")
    print("=" * 50)

    print("\nInterview ID:")
    print(interview_id)

    print("\nReport:")
    print(json.dumps(report_data, indent=2))

    print("\nNumber of interviews in history:")
    print(len(list_data))


if __name__ == "__main__":
    main()