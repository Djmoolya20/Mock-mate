import type {
  DifficultyOption,
  InterviewConfig,
  InterviewQuestion,
  InterviewType,
  InterviewTypeOption,
  Persona,
  QuestionKind,
} from "./types";

export const PERSONAS: Persona[] = [
  {
    id: "maya",
    name: "Maya",
    title: "Friendly mentor",
    short: "Warm, candid, and encouraging",
    description:
      "Builds you up while gently pushing for the detail. Best for finding the shape of your story.",
    traits: ["Warm", "Curious", "Supportive"],
    voice: "A calm, upbeat coach who lets you finish your thought.",
    accent: "lime",
    accentHex: "#D8FF57",
    surfaceHex: "#EBF3C9",
  },
  {
    id: "atlas",
    name: "Atlas",
    title: "Strict technical lead",
    short: "Precise, skeptical, and fast",
    description:
      "Cuts through vague answers and follows up on the how. Best for pressure-testing your depth.",
    traits: ["Direct", "Analytical", "Demanding"],
    voice: "A low, measured voice that asks the follow-up you were hoping to avoid.",
    accent: "coral",
    accentHex: "#FF7A59",
    surfaceHex: "#FFE1D7",
  },
  {
    id: "noor",
    name: "Noor",
    title: "Calm HR panelist",
    short: "Composed, perceptive, and people-first",
    description:
      "Reads between the lines and notices how you handle the human side. Best for behavioral rounds.",
    traits: ["Calm", "Empathetic", "Perceptive"],
    voice: "A steady, thoughtful voice that gives silence room to work.",
    accent: "lilac",
    accentHex: "#C9C2FF",
    surfaceHex: "#E9E5FF",
  },
];

export const DEFAULT_PERSONA: Persona = PERSONAS[0];

export const PERSONA_MAP = Object.fromEntries(
  PERSONAS.map((persona) => [persona.id, persona]),
) as Record<Persona["id"], Persona>;

export const ROLE_SUGGESTIONS = [
  "Product Designer",
  "Frontend Engineer",
  "Data Analyst",
  "Product Manager",
  "Marketing Manager",
];

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: "gentle",
    label: "Warm-up",
    description: "More room to think. Follow-ups stay supportive.",
  },
  {
    id: "realistic",
    label: "Realistic",
    description: "A standard first-round pace with one layer of follow-up.",
  },
  {
    id: "pressure",
    label: "Pressure test",
    description: "Sharper follow-ups, tighter structure, less warm-up.",
  },
];

export const INTERVIEW_TYPE_OPTIONS: InterviewTypeOption[] = [
  {
    id: "mixed",
    label: "Mixed round",
    description: "Background, craft, and collaboration.",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    description: "Stories, judgment, and self-awareness.",
  },
  {
    id: "technical",
    label: "Craft deep-dive",
    description: "Role-specific problems and decisions.",
  },
];

interface RoleBank {
  technical: string[];
  behavioral: string[];
}

const GENERIC_BANK: RoleBank = {
  technical: [
    "Tell me about the most complex problem you've owned in this kind of role. What made it hard, and what did you actually do?",
    "How do you decide what to prioritise when several important things are competing for your attention?",
    "What does excellent work look like in this role, beyond shipping something on time?",
  ],
  behavioral: [
    "Tell me about a time you had to work with someone whose approach was very different from yours.",
    "Describe a moment when you received feedback that changed how you work.",
    "Tell me about a time you had to make a call without all the information you wanted.",
  ],
};

const ROLE_BANKS: Record<string, RoleBank> = {
  "product designer": {
    technical: [
      "Take a product you use every day. Walk me through one design decision you would change, and why.",
      "A core flow loses 40% of people between sign-up and first value. How would you diagnose what is going wrong?",
      "How do you decide when a design is ready to ship rather than ready to keep polishing?",
    ],
    behavioral: [
      "Tell me about a time you had to defend a design decision you believed in.",
      "Describe a project that did not land the way you expected. What did you change afterwards?",
    ],
  },
  "frontend engineer": {
    technical: [
      "A page feels fast on your laptop but slow for users in another region. How would you diagnose it?",
      "Walk me through how you would design a reusable component API that other teams can trust.",
      "How do you balance accessibility, performance, and delivery speed when they pull against each other?",
    ],
    behavioral: [
      "Tell me about a time you disagreed with a technical decision. How did you handle it?",
      "Describe a production bug you owned. What did the recovery teach you?",
    ],
  },
  "data analyst": {
    technical: [
      "A dashboard shows a 20% lift in conversion. How would you validate it before presenting the result?",
      "How would you define the north-star metric for a two-sided marketplace?",
      "How would you communicate an ambiguous finding to a room of non-technical stakeholders?",
    ],
    behavioral: [
      "Tell me about a time you had to challenge a metric or a claim someone senior believed in.",
      "Describe an analysis that changed a decision. What made it land?",
    ],
  },
  "product manager": {
    technical: [
      "You have three loud customer requests and one strategic bet. How do you decide what to build next?",
      "How would you measure whether a feature succeeded six months after launch?",
      "Walk me through how you would scope an MVP when the deadline is already tight.",
    ],
    behavioral: [
      "Tell me about a time you said no to an important stakeholder.",
      "Describe a launch that did not go to plan. What did you do in the first hour?",
    ],
  },
  "marketing manager": {
    technical: [
      "How would you launch a new product to a skeptical audience on a small budget?",
      "Which three metrics would you use to judge a campaign, and why those three?",
      "Walk me through how you would position a feature against a better-funded competitor.",
    ],
    behavioral: [
      "Tell me about a campaign that underperformed. How did you respond?",
      "Describe a time you had to align a team around a new message.",
    ],
  },
};

const INTROS: Record<Persona["id"], (role: string) => string> = {
  maya: (role) =>
    `Let's start somewhere easy. Give me the two-minute version of your story — and what made you curious about ${role.toLowerCase()} work?`,
  atlas: (role) =>
    `Skip the résumé recital. In two minutes, tell me what you actually do as a ${role.toLowerCase()}, and where you are strongest.`,
  noor: (role) =>
    `I'd like to start with you as a person. Walk me through your path to ${role.toLowerCase()} — and what you're hoping for in your next move.`,
};

const REFLECTIONS: Record<Persona["id"], string> = {
  maya:
    "If a hiring manager remembered only one thing about you from this conversation, what would you want it to be — and why?",
  atlas:
    "One last one. What is the weakest part of your answer today, and what would you do differently next time?",
  noor:
    "Before we finish, what is something you care about in your work that we haven't asked about yet?",
};

const HINTS: Record<QuestionKind, string> = {
  intro: "Use a simple arc: where you started, what you do now, why this role.",
  technical:
    "Show your thinking. Name the trade-off, the decision you made, and how you would know it worked.",
  behavioral:
    "Pick one real moment. Set the scene briefly, then spend most of the answer on what you did.",
  reflection:
    "Be specific and human. Avoid a list of adjectives; give the interviewer one memorable thread.",
};

function bankForRole(role: string): RoleBank {
  const normalized = role.trim().toLowerCase();
  return ROLE_BANKS[normalized] ?? GENERIC_BANK;
}

function question(
  number: number,
  text: string,
  kind: QuestionKind,
): InterviewQuestion {
  return {
    id: `q${number}`,
    number,
    text,
    kind,
    hint: HINTS[kind],
  };
}

export function getQuestions(config: InterviewConfig): InterviewQuestion[] {
  const bank = bankForRole(config.targetRole);
  const technical = [...bank.technical];
  const behavioral = [...bank.behavioral];

  while (technical.length < 3) {
    const next = GENERIC_BANK.technical[technical.length % GENERIC_BANK.technical.length];
    technical.push(next);
  }

  while (behavioral.length < 3) {
    const next =
      GENERIC_BANK.behavioral[behavioral.length % GENERIC_BANK.behavioral.length];
    behavioral.push(next);
  }

  const role = config.targetRole.trim() || "this role";
  const intro = question(1, INTROS[config.personaId](role), "intro");
  const reflection = question(5, REFLECTIONS[config.personaId], "reflection");

  let middle: InterviewQuestion[];

  if (config.interviewType === "technical") {
    middle = [
      question(2, technical[0], "technical"),
      question(3, technical[1], "technical"),
      question(4, technical[2], "technical"),
    ];
  } else if (config.interviewType === "behavioral") {
    middle = [
      question(2, behavioral[0], "behavioral"),
      question(3, behavioral[1], "behavioral"),
      question(4, behavioral[2], "behavioral"),
    ];
  } else {
    middle = [
      question(2, technical[0], "technical"),
      question(3, behavioral[0], "behavioral"),
      question(4, technical[1], "technical"),
    ];
  }

  return [intro, ...middle, reflection];
}

export const DEFAULT_CONFIG: InterviewConfig = {
  targetRole: "Product Designer",
  difficulty: "realistic",
  interviewType: "mixed",
  personaId: "maya",
  jdText: "",
};

export function getDifficulty(id: InterviewConfig["difficulty"]): DifficultyOption {
  return DIFFICULTY_OPTIONS.find((option) => option.id === id) ?? DIFFICULTY_OPTIONS[1];
}

export function getInterviewType(id: InterviewType): InterviewTypeOption {
  return INTERVIEW_TYPE_OPTIONS.find((option) => option.id === id) ?? INTERVIEW_TYPE_OPTIONS[0];
}

export const SAMPLE_JD =
  "We are hiring a product-minded designer to shape our early-stage interview platform. You will own end-to-end flows, work closely with engineering, and turn ambiguous problems into simple, beautiful experiences. Comfort with rapid prototyping and user research is a plus.";

export const SAMPLE_ANSWERS = [
  "I started in graphic design, then moved into product design because I wanted to understand why a screen should exist, not only how it looks. At my last company I owned the onboarding flow for a B2B tool. I ran six customer calls, cut the setup steps from nine to four, and activation moved from 41% to 58% in one quarter. I am drawn to this role because it sits close to both the craft and the business problem.",
  "I would first check whether the drop-off is concentrated in one step or spread evenly. I would look at session replays and funnel data, then talk to five or six people who abandoned. My hypothesis would be either unclear value or too much effort before the first win. I would prototype a shorter path, test it with a small cohort, and use activation and time-to-value as the decision metrics.",
  "I once disagreed with an engineer who wanted to ship a technically elegant component that made the first-run experience harder to understand. I asked us to test both versions with five users rather than debate in the abstract. The simpler version won on comprehension, and we documented the trade-off so we could revisit it later.",
  "I would make the trade-off explicit. For this flow, the cost of a slow first render was higher than the cost of a little extra client state, so I would keep the critical path light and defer the secondary panel. I would set a performance budget, measure real-user data, and revisit once the usage pattern was clearer.",
  "I want them to remember that I make the complex feel calm. I ask good questions, I bring engineering into the room early, and I care about the person on the other side of the screen. That is the thread through the work I am proudest of.",
  "I would change the upgrade moment in a tool I use every day. Right now it explains the plan before it shows the value, so people hit a wall of comparison instead of a reason to move. I would let them feel the paid feature in context, then explain the plan once they have a reason to care. I would measure upgrade starts and seven-day retention, not just clicks on the pricing page.",
  "I use a three-part bar: can a new user complete the core job without help, do we know how we will measure whether it worked, and is there a clear owner for the first two weeks of feedback? If those are true, I would rather ship and learn than keep polishing. If one is missing, that is the next conversation, not a reason to delay everything.",
];

export function sampleConfig(index: number): InterviewConfig {
  const roles = ["Product Designer", "Product Designer", "Data Analyst"];
  const personas: Persona["id"][] = ["maya", "atlas", "noor"];
  const types: InterviewType[] = ["mixed", "technical", "behavioral"];
  return {
    targetRole: roles[index % roles.length],
    difficulty: index === 2 ? "pressure" : "realistic",
    interviewType: types[index % types.length],
    personaId: personas[index % personas.length],
    resumeFileName: "mayuresh-resume.pdf",
    resumeS3Key: "uploads/mayuresh-resume.pdf",
    jdText: SAMPLE_JD,
  };
}
