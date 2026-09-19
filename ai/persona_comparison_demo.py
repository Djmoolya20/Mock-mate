from opening_question import get_opening_question
from evaluate_followup import evaluate_and_followup

resume_text = "3 years FastAPI, led migration from monolith to microservices handling 10k req/min."
jd_text = "Backend engineer with strong API design and microservices experience."
strong_answer = (
    "We used async FastAPI endpoints with dependency injection for DB session scoping, "
    "and an event-driven pattern with RabbitMQ to decouple the order service from inventory. "
    "I load-tested with Locust at 10k RPS, tracked p99 latency and CPU via Prometheus/Grafana, "
    "and we cut p99 latency from 800ms to 120ms after adding connection pooling and Redis caching."
)

for persona_id in ["friendly-mentor", "strict-lead", "calm-hr"]:
    print(f"\n{'=' * 20} {persona_id} {'=' * 20}")
    result = get_opening_question("Backend Developer", "medium", resume_text, jd_text, persona_id)
    question = result["question"]
    print(f"Q: {question}\n")

    eval_result = evaluate_and_followup(question, strong_answer, "medium", [], persona_id)
    print(f"Evaluation: {eval_result['evaluation']}\n")
    print(f"Next Q: {eval_result['nextQuestion']}")
    