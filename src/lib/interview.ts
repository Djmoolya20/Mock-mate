import { getQuestions, PERSONA_MAP, sampleConfig, SAMPLE_ANSWERS } from "./data";
import type {
  AnswerEntry,
  BodyLanguageMetrics,
  DimensionScores,
  Evaluation,
  InterviewConfig,
  InterviewQuestion,
  InterviewSession,
  NextStep,
  PresenceNote,
  Report,
  ReportDimension,
} from "./types";

const DIMENSION_META: Record<
  keyof DimensionScores,
  { label: string; strength: string; improvement: string }
> = {
  relevance: {
    label: "Relevance",
    strength: "You answered the question that was actually asked and kept the role in view.",
    improvement:
      "Tie each answer back to the role a little earlier — the technical detail is there, but the point can arrive sooner.",
  },
  structure: {
    label: "Structure",
    strength: "Your answers travelled in a clear direction instead of circling the point.",
    improvement:
      "Give each story a visible shape: situation, decision, result. A shorter setup leaves more room for your impact.",
  },
  depth: {
    label: "Depth",
    strength: "You brought specific decisions and consequences, not just a description of the work.",
    improvement:
      "Add one concrete detail — a number, a trade-off, or what you rejected — so the interviewer can feel the depth.",
  },
  communication: {
    label: "Communication",
    strength: "You sounded considered and readable, with enough energy to carry the room.",
    improvement:
      "Trim the preamble. Lead with the headline, then use the rest of the answer to earn it.",
  },
};

const FILLER = /\b(um|uh|basically|actually|kind of|sort of|like)\b/gi;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function makeId(prefix = "int"): string {
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}

export function createSession(config: InterviewConfig): InterviewSession {
  return {
    id: makeId("int"),
    startedAt: new Date().toISOString(),
    config,
    questions: getQuestions(config),
    currentIndex: 0,
    answers: [],
  };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function evaluateAnswer(
  question: InterviewQuestion,
  answer: string,
): Evaluation {
  const clean = answer.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = clean.split(/[.!?]+/).filter((part) => part.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const hasMetric = /\b\d+(\.\d+)?%?\b/.test(clean);
  const hasTradeoff = /\b(trade-?off|because|instead|however|but|rather than|cost)\b/i.test(
    clean,
  );
  const hasStructure =
    /\b(first|then|next|finally|so|result|outcome|decided|learned)\b/i.test(clean);
  const fillerCount = (clean.match(FILLER) ?? []).length;
  const hasAction = /\b(i|we)\s+(built|led|ran|changed|designed|shipped|asked|decided|tested|moved|owned|created|learned|pushed)\b/i.test(
    clean,
  );
  const digest = hashString(`${question.id}:${clean}`) % 100;
  const jitter = (digest / 100 - 0.5) * 0.42;
  const lengthScore = clamp(wordCount / 105, 0, 1);

  const relevance = clamp(
    6.7 + lengthScore * 1.55 + (hasAction ? 0.5 : 0) + jitter,
    4.6,
    9.6,
  );
  const structure = clamp(
    6.65 +
      (hasStructure ? 0.9 : 0) +
      (hasTradeoff ? 0.5 : 0) +
      Math.min(sentenceCount, 6) * 0.2 +
      jitter,
    4.5,
    9.7,
  );
  const depth = clamp(
    6.6 +
      (hasMetric ? 0.95 : 0) +
      (hasTradeoff ? 0.6 : 0) +
      lengthScore * 1.5 +
      jitter,
    4.4,
    9.6,
  );
  const communication = clamp(
    7.55 +
      (sentenceCount >= 3 ? 0.55 : 0) -
      Math.min(fillerCount * 0.16, 0.75) -
      (wordCount > 230 ? 0.55 : 0) +
      (wordCount < 20 ? -0.7 : 0) +
      jitter,
    4.6,
    9.6,
  );

  const cap = wordCount < 18 ? 6.1 : wordCount < 35 ? 7.2 : 10;
  const dimensions: DimensionScores = {
    relevance: round1(Math.min(relevance, cap)),
    structure: round1(Math.min(structure, cap)),
    depth: round1(Math.min(depth, cap)),
    communication: round1(Math.min(communication, cap)),
  };
  const score = round1(
    (dimensions.relevance +
      dimensions.structure +
      dimensions.depth +
      dimensions.communication) /
      4,
  );

  const strongest = (Object.entries(dimensions) as [keyof DimensionScores, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
  const weakest = (Object.entries(dimensions) as [keyof DimensionScores, number][]).sort(
    (a, b) => a[1] - b[1],
  )[0][0];

  let headline = "A solid answer with room to sharpen the point.";
  if (score >= 8.4) headline = "Specific, confident, and easy to follow.";
  else if (score >= 7.3) headline = "A strong answer that lands the substance.";
  else if (score < 6) headline = "The instinct is there; the answer needs more evidence.";

  return {
    score,
    dimensions,
    headline,
    strength: DIMENSION_META[strongest].strength,
    improvement: DIMENSION_META[weakest].improvement,
  };
}

export async function submitAnswer(
  session: InterviewSession,
  answer: string,
): Promise<{
  session: InterviewSession;
  evaluation: Evaluation;
  isComplete: boolean;
}> {
  await sleep(1250);

  const question = session.questions[session.currentIndex];
  const entry: AnswerEntry = {
    question,
    answer: answer.trim(),
    evaluation: evaluateAnswer(question, answer),
  };
  const answers = [...session.answers, entry];
  const isComplete = answers.length >= session.questions.length;
  const nextSession: InterviewSession = {
    ...session,
    answers,
    currentIndex: isComplete ? session.currentIndex : session.currentIndex + 1,
  };

  return { session: nextSession, evaluation: entry.evaluation, isComplete };
}

export function generatePresenceMetrics(seed: string): BodyLanguageMetrics {
  const hash = hashString(seed);
  return {
    eyeContactPercent: 61 + (hash % 23),
    posture: {
      slouchPercent: 12 + (Math.floor(hash / 7) % 17),
      leanEvents: 1 + (Math.floor(hash / 13) % 4),
    },
    gestures: {
      fidgetCount: 6 + (Math.floor(hash / 17) % 11),
      handsNearFaceCount: Math.floor(hash / 23) % 5,
    },
  };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function buildReport(
  session: InterviewSession,
  bodyLanguage: BodyLanguageMetrics,
  options?: { createdAt?: string; durationSeconds?: number },
): Report {
  const answers = session.answers;
  const totals = answers.reduce<DimensionScores>(
    (accumulator, entry) => ({
      relevance: accumulator.relevance + entry.evaluation.dimensions.relevance,
      structure: accumulator.structure + entry.evaluation.dimensions.structure,
      depth: accumulator.depth + entry.evaluation.dimensions.depth,
      communication:
        accumulator.communication + entry.evaluation.dimensions.communication,
    }),
    { relevance: 0, structure: 0, depth: 0, communication: 0 },
  );

  const count = Math.max(1, answers.length);
  const contentDimensions: ReportDimension[] = (
    Object.keys(DIMENSION_META) as (keyof DimensionScores)[]
  ).map((key) => {
    const score = Math.round((totals[key] / count) * 10);
    return {
      key,
      label: DIMENSION_META[key].label,
      score,
      summary:
        score >= 82
          ? DIMENSION_META[key].strength
          : DIMENSION_META[key].improvement,
    };
  });

  const contentScore = Math.round(
    contentDimensions.reduce((sum, dimension) => sum + dimension.score, 0) /
      contentDimensions.length,
  );
  const presenceScore = calculatePresenceScore(bodyLanguage);
  const overallScore = Math.round(contentScore * 0.78 + presenceScore * 0.22);

  const sortedDimensions = [...contentDimensions].sort((a, b) => b.score - a.score);
  const strongest = sortedDimensions[0];
  const weakest = sortedDimensions[sortedDimensions.length - 1];
  const presenceNotes = buildPresenceNotes(bodyLanguage);
  const weakestPresence = [...presenceNotes].sort(
    (a, b) => statusWeight(a.status) - statusWeight(b.status),
  )[0];

  const strengths = [
    `${strongest.label}: ${strongest.summary}`,
    answers.length > 2
      ? `You held a consistent thread across ${answers.length} questions instead of resetting each time.`
      : "You gave the interviewer a clear starting point to follow.",
    bodyLanguage.eyeContactPercent >= 68
      ? "You stayed visually engaged for most of the conversation."
      : "You recovered quickly after the harder questions rather than rushing through them.",
  ];

  const improvements = [
    `${weakest.label}: ${DIMENSION_META[weakest.key].improvement}`,
    weakestPresence.note,
    "Practise a 90-second version of your strongest story so the opening detail does not crowd out the result.",
  ];

  const nextSteps: NextStep[] = [
    {
      title: "Rehearse the shape, not the script",
      detail:
        "Take your two weakest answers and rewrite each as four sentences: context, decision, action, result. Say them out loud once.",
    },
    {
      title: improveTitle(weakest.key),
      detail: improveDetail(weakest.key),
    },
    {
      title: presenceNextStepTitle(weakestPresence.key),
      detail: presenceNextStepDetail(weakestPresence.key),
    },
  ];

  const summary =
    contentScore >= 82
      ? "You have the substance. The next layer is making the room feel it: fewer caveats, more deliberate pauses, one clear thread."
      : contentScore >= 70
        ? "There is a credible candidate here. The work now is tightening the middle of your answers so the evidence arrives sooner."
        : "The raw material is there, but the answers are asking the interviewer to do too much interpretation. Structure is the fastest unlock.";

  return {
    id: session.id,
    createdAt: options?.createdAt ?? new Date().toISOString(),
    config: session.config,
    overallScore,
    contentScore,
    presenceScore,
    contentDimensions,
    strengths,
    improvements,
    bodyLanguage,
    presenceNotes,
    summary,
    nextSteps,
    answers,
    durationSeconds:
      options?.durationSeconds ??
      Math.max(60, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)),
  };
}

function calculatePresenceScore(metrics: BodyLanguageMetrics): number {
  const eye = metrics.eyeContactPercent;
  const posture = 100 - metrics.posture.slouchPercent;
  const gestureComfort = 100 - Math.min(45, metrics.gestures.fidgetCount * 2.2);
  const faceComfort = 100 - Math.min(35, metrics.gestures.handsNearFaceCount * 7);
  return Math.round(eye * 0.4 + posture * 0.28 + gestureComfort * 0.17 + faceComfort * 0.15);
}

function buildPresenceNotes(metrics: BodyLanguageMetrics): PresenceNote[] {
  const eye = metrics.eyeContactPercent;
  const posture = 100 - metrics.posture.slouchPercent;
  const fidget = metrics.gestures.fidgetCount;
  const hands = metrics.gestures.handsNearFaceCount;

  return [
    {
      key: "eyeContact",
      label: "Eye contact",
      value: `${eye}%`,
      note:
        eye >= 75
          ? "You held the camera well. That reads as confidence, especially when you pause."
          : eye >= 65
            ? "Mostly engaged. The drift happened when you were reaching for a detail, not when you were unsure."
            : "You looked away often while thinking. Try keeping your eyes level and letting the pause do the work.",
      status: eye >= 75 ? "strong" : eye >= 65 ? "steady" : "watch",
    },
    {
      key: "posture",
      label: "Upright posture",
      value: `${posture}%`,
      note:
        posture >= 84
          ? "Your shoulders stayed open and level through the harder questions."
          : "Your shoulders dropped as the answers got longer. A small reset between questions would help.",
      status: posture >= 84 ? "strong" : posture >= 72 ? "steady" : "watch",
    },
    {
      key: "gestures",
      label: "Fidget events",
      value: `${fidget}`,
      note:
        fidget <= 8
          ? "Your hands stayed settled enough to support the answer instead of competing with it."
          : fidget <= 13
            ? "A few settling movements. Not distracting, but they increased when the question got abstract."
            : "Frequent small movements pulled attention from your face. Try resting your hands out of frame between points.",
      status: fidget <= 8 ? "strong" : fidget <= 13 ? "steady" : "watch",
    },
    {
      key: "hands",
      label: "Hands near face",
      value: `${hands}×`,
      note:
        hands <= 2
          ? "Rare. You kept your face open, which made the answers easier to read."
          : "You reached for your face when thinking. That is a common tell; a deliberate pause reads stronger.",
      status: hands <= 2 ? "strong" : hands <= 4 ? "steady" : "watch",
    },
  ];
}

function statusWeight(status: PresenceNote["status"]): number {
  return status === "watch" ? 0 : status === "steady" ? 1 : 2;
}

function improveTitle(key: keyof DimensionScores): string {
  const titles: Record<keyof DimensionScores, string> = {
    relevance: "Answer the question in the first line",
    structure: "Build a four-beat answer",
    depth: "Add one proof point",
    communication: "Land the headline sooner",
  };
  return titles[key];
}

function improveDetail(key: keyof DimensionScores): string {
  const details: Record<keyof DimensionScores, string> = {
    relevance:
      "Before you speak, name the question back to yourself in six words. Then make your first sentence a direct answer, not a scene-setter.",
    structure:
      "Use context → decision → action → result. Keep the context under 20 seconds so the interviewer knows where the value is going.",
    depth:
      "For every claim, add a number, a trade-off, or something you rejected. Specific detail is what makes an answer feel lived-in.",
    communication:
      "Open with the conclusion, then support it. If you can cut the first two sentences without losing meaning, cut them.",
  };
  return details[key];
}

function presenceNextStepTitle(key: PresenceNote["key"]): string {
  const titles: Record<PresenceNote["key"], string> = {
    eyeContact: "Practise the thinking pause",
    posture: "Reset your frame between questions",
    gestures: "Give your hands a home",
    hands: "Keep the face open",
  };
  return titles[key];
}

function presenceNextStepDetail(key: PresenceNote["key"]): string {
  const details: Record<PresenceNote["key"], string> = {
    eyeContact:
      "When you need to think, look down and to the side for a beat, then return to the lens. Do not let the gaze drift while you are still speaking.",
    posture:
      "Put the laptop on a stack of books so the camera sits at eye level. Before each answer, drop your shoulders once and plant both feet.",
    gestures:
      "Rest your hands loosely on the desk between points. Use one deliberate gesture per idea rather than continuous movement.",
    hands:
      "Keep your hands below your chin unless you are gesturing. If you feel the urge to touch your face, take a short breath instead.",
  };
  return details[key];
}

export function createSampleReports(): Report[] {
  const sampleDays = [18, 3, 9];
  const sampleBoost = [0, 0.3, 0.2];

  return sampleDays.map((daysAgo, index) => {
    const config = sampleConfig(index);
    const base = createSession(config);
    const session: InterviewSession = {
      ...base,
      id: `sample_${index + 1}`,
      startedAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
    };
    const answers = session.questions.map((question) => {
      const answer = sampleAnswerFor(question);
      return {
        question,
        answer,
        evaluation: boostEvaluation(
          evaluateAnswer(question, answer),
          sampleBoost[index],
        ),
      };
    });
    const report = buildReport(
      { ...session, answers },
      {
        eyeContactPercent: index === 0 ? 74 : index === 1 ? 81 : 69,
        posture: {
          slouchPercent: index === 0 ? 24 : index === 1 ? 14 : 19,
          leanEvents: index === 0 ? 4 : index === 1 ? 2 : 3,
        },
        gestures: {
          fidgetCount: index === 0 ? 13 : index === 1 ? 7 : 10,
          handsNearFaceCount: index === 0 ? 3 : index === 1 ? 1 : 2,
        },
      },
      {
        createdAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
        durationSeconds: 640 + index * 95,
      },
    );
    return { ...report, sample: true };
  });
}

function boostEvaluation(evaluation: Evaluation, boost: number): Evaluation {
  const dimensions: DimensionScores = {
    relevance: round1(Math.min(9.8, evaluation.dimensions.relevance + boost)),
    structure: round1(Math.min(9.8, evaluation.dimensions.structure + boost)),
    depth: round1(Math.min(9.8, evaluation.dimensions.depth + boost)),
    communication: round1(
      Math.min(9.8, evaluation.dimensions.communication + boost),
    ),
  };
  const score = round1(
    (dimensions.relevance +
      dimensions.structure +
      dimensions.depth +
      dimensions.communication) /
      4,
  );
  return {
    ...evaluation,
    dimensions,
    score,
    headline:
      score >= 8.4
        ? "Specific, confident, and easy to follow."
        : score >= 7.3
          ? "A strong answer that lands the substance."
          : evaluation.headline,
  };
}

function sampleAnswerFor(question: InterviewQuestion): string {
  if (question.kind === "intro") return SAMPLE_ANSWERS[0];
  if (question.kind === "reflection") return SAMPLE_ANSWERS[4];

  const text = question.text.toLowerCase();

  if (question.kind === "behavioral") {
    if (
      text.includes("did not land") ||
      text.includes("underperformed") ||
      text.includes("didn't")
    ) {
      return SAMPLE_ANSWERS[2];
    }
    return SAMPLE_ANSWERS[2];
  }

  if (text.includes("drop-off") || text.includes("diagnose")) {
    return SAMPLE_ANSWERS[1];
  }
  if (text.includes("ready to ship")) {
    return SAMPLE_ANSWERS[6];
  }
  if (text.includes("product you use") || text.includes("design decision")) {
    return SAMPLE_ANSWERS[5];
  }
  if (text.includes("20% lift")) {
    return SAMPLE_ANSWERS[1];
  }
  return SAMPLE_ANSWERS[3];
}

export function personaFor(config: InterviewConfig) {
  return PERSONA_MAP[config.personaId];
}
