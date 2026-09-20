"""
submit_answer.py — Lambda handler for POST /interview/answer

Request body:
    {
        "interviewId": "...",
        "questionNumber": 1,
        "answer": "..."
    }

Response:
    {
        "evaluation": {...},
        "nextQuestion": "..." | null,
        "isComplete": bool
    }
"""

import json

import db
import mock_ai as ai


def handler(event, context):
    try:
        body = json.loads(event.get("body") or "{}")

        interview_id = body["interviewId"]
        question_number = int(body["questionNumber"])
        answer = body["answer"]

        pk = f"INTERVIEW#{interview_id}"
        current_sk = f"Q#{question_number}"

        # ---------------------------------------------------------
        # 1. Get the current question
        # ---------------------------------------------------------

        current_q_item = db.get_item(pk, current_sk)

        if current_q_item is None:
            return _response(
                404,
                {"error": "Interview or question not found"},
            )

        # ---------------------------------------------------------
        # 2. Get interview metadata
        # ---------------------------------------------------------

        meta_item = db.get_item(pk, "META")

        persona_id = (
            meta_item.get(
                "personaId",
                "friendly-mentor",
            )
            if meta_item
            else "friendly-mentor"
        )

        difficulty = (
            meta_item.get(
                "difficulty",
                "",
            )
            if meta_item
            else ""
        )

        # ---------------------------------------------------------
        # 3. Get previous interview questions for AI context
        # ---------------------------------------------------------

        all_items = db.query_by_pk(pk)

        previous_questions = [
            item
            for item in all_items
            if item.get("SK", "").startswith("Q#")
            and item["SK"] != current_sk
            and item.get("answer") is not None
        ]

        # Sort by question number
        previous_questions.sort(
            key=lambda item: int(
                item["SK"].split("#")[1]
            )
        )

        # Build recent context
        recent_context = []

        for item in previous_questions:
            recent_context.append(
                {
                    "question": item.get("question"),
                    "answer": item.get("answer"),
                }
            )

        # Add the current exchange
        recent_context.append(
            {
                "question": current_q_item["question"],
                "answer": answer,
            }
        )

        # ---------------------------------------------------------
        # 4. Ask AI to evaluate answer and generate follow-up
        # ---------------------------------------------------------

        ai_result = ai.evaluate_and_followup(
            question=current_q_item["question"],
            answer=answer,
            difficulty=difficulty,
            recent_context=recent_context,
            persona_id=persona_id,
        )

        evaluation = ai_result["evaluation"]
        next_question = ai_result["nextQuestion"]
        is_complete = ai_result["isComplete"]

        # ---------------------------------------------------------
        # 5. Save answer + evaluation
        # ---------------------------------------------------------

        db.update_item(
            pk,
            current_sk,
            {
                "answer": answer,
                "evaluation": evaluation,
            },
        )

        # ---------------------------------------------------------
        # 6. Create next question OR finish interview
        # ---------------------------------------------------------

        if not is_complete and next_question:

            db.put_item(
                {
                    "PK": pk,
                    "SK": f"Q#{question_number + 1}",
                    "question": next_question,
                    "answer": None,
                    "evaluation": None,
                }
            )

        else:

            db.update_item(
                pk,
                "META",
                {
                    "status": "complete",
                },
            )

        # ---------------------------------------------------------
        # 7. Return result to frontend
        # ---------------------------------------------------------

        return _response(
            200,
            {
                "evaluation": evaluation,
                "nextQuestion": next_question,
                "isComplete": is_complete,
            },
        )

    except KeyError as e:

        return _response(
            400,
            {
                "error": f"Missing required field: {e}",
            },
        )

    except Exception as e:

        print(f"[submitAnswer] ERROR: {e}")

        return _response(
            500,
            {
                "error": "Internal server error",
            },
        )


def _response(
    status_code: int,
    body: dict,
) -> dict:

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body),
    }