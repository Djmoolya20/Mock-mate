export type PersonaId = "maya" | "atlas" | "noor";

export type Difficulty = "gentle" | "realistic" | "pressure";

export type InterviewType = "mixed" | "behavioral" | "technical";

export type QuestionKind = "intro" | "technical" | "behavioral" | "reflection";

export type AccentName = "lime" | "coral" | "lilac";

export type ScoreBand = "strong" | "steady" | "watch";

export interface Persona {
  id: PersonaId;
  name: string;
  title: string;
  short: string;
  description: string;
  traits: string[];
  voice: string;
  accent: AccentName;
  accentHex: string;
  surfaceHex: string;
}

export interface InterviewConfig {
  targetRole: string;
  difficulty: Difficulty;
  interviewType: InterviewType;
  personaId: PersonaId;
  resumeFileName?: string;
  resumeS3Key?: string;
  jdText: string;
}

export interface InterviewQuestion {
  id: string;
  number: number;
  text: string;
  kind: QuestionKind;
  hint: string;
}

export interface DimensionScores {
  relevance: number;
  structure: number;
  depth: number;
  communication: number;
}

export interface Evaluation {
  score: number;
  dimensions: DimensionScores;
  headline: string;
  strength: string;
  improvement: string;
}

export interface AnswerEntry {
  question: InterviewQuestion;
  answer: string;
  evaluation: Evaluation;
}

export interface BodyLanguageMetrics {
  eyeContactPercent: number;
  posture: {
    slouchPercent: number;
    leanEvents: number;
  };
  gestures: {
    fidgetCount: number;
    handsNearFaceCount: number;
  };
}

export interface ReportDimension {
  key: keyof DimensionScores;
  label: string;
  score: number;
  summary: string;
}

export interface PresenceNote {
  key: "eyeContact" | "posture" | "gestures" | "hands";
  label: string;
  value: string;
  note: string;
  status: "strong" | "steady" | "watch";
}

export interface NextStep {
  title: string;
  detail: string;
}

export interface Report {
  id: string;
  createdAt: string;
  config: InterviewConfig;
  overallScore: number;
  contentScore: number;
  presenceScore: number;
  contentDimensions: ReportDimension[];
  strengths: string[];
  improvements: string[];
  bodyLanguage: BodyLanguageMetrics;
  presenceNotes: PresenceNote[];
  summary: string;
  nextSteps: NextStep[];
  answers: AnswerEntry[];
  durationSeconds: number;
  sample?: boolean;
}

export interface InterviewSession {
  id: string;
  startedAt: string;
  config: InterviewConfig;
  questions: InterviewQuestion[];
  currentIndex: number;
  answers: AnswerEntry[];
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface DifficultyOption {
  id: Difficulty;
  label: string;
  description: string;
}

export interface InterviewTypeOption {
  id: InterviewType;
  label: string;
  description: string;
}
