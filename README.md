
# Poise — AI Career Interview Simulator

A persona-based AI interviewer with camera-based body-language coaching.

Built for the **First Commit Hackathon (Ship It track)**.

Poise is a career interview simulator. You pick a role, an interviewer, and a difficulty, answer five questions in a calm interview room, and get a report that reads your **content** (what you said) and your **presence** (how you showed up) as one story.

This repository contains the frontend text MVP. The application works end to end, while the AI backend, authentication, and storage are mocked locally so the product and design can be reviewed and demonstrated.

---

## Team

- **Aadit** — Backend & Cloud
- **Dheeraj** — AI / Interview Logic
- **Mayuresh** — Frontend

---

## Quick Start

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Scripts

```bash
npm run lint       # ESLint
npm run build      # Production build
npm start          # Run the production build
```

To run the Playwright screenshot and interview flow test:

```bash
node scripts/shots.mjs
```

This requires a running development server and Microsoft Edge.

The script drives Edge through setup → interview → report → history, writes screenshots to `shots/`, and prints any console errors.

---

## Features

- **Persona-based AI Interviews:** Choose an interviewer personality and interview difficulty.
- **Role-specific Questions:** Get five interview questions based on your selected role and interview type.
- **Interactive Interview Room:** Answer questions in a dedicated interview environment with a local camera preview.
- **Content Evaluation:** Analyze answer quality, specificity, structure, and relevance.
- **Body Language Analysis:** Track eye contact, posture, and hand gestures using MediaPipe.
- **Interview Reports:** Get an overall readiness score with strengths, improvements, and actionable next steps.
- **Interview History:** Review previous sessions, readiness trends, and performance averages.

---

## Application Routes

| Route | Description |
|---|---|
| `/` | Marketing landing page with sample report links |
| `/sign-in` | Mock sign-in / sign-up |
| `/setup` | Role, difficulty, interview type, interviewer, resume, and job description configuration |
| `/interview` | Interview room with questions, answer box, and local camera preview |
| `/report/[id]` | Content and presence report with question-by-question transcript |
| `/history` | Readiness trends, averages, and session archive |

---

## Current Implementation

The current MVP uses local implementations and mock data for certain backend-dependent features.

### 1. Authentication

The `/sign-in` page accepts any non-empty email and password. Sign-up mode also accepts a name.

After authentication, a demo user is stored locally and redirected to `/setup`.

There is currently no session token, Amazon Cognito integration, or production-grade route protection.

**Planned integration:** Replace the local `saveUser()` implementation with AWS Amplify Authentication and Amazon Cognito.

### 2. Interview Question Generation

The `getQuestions()` function in `src/lib/data.ts` generates five questions based on:

- Selected role
- Interview type
- Interviewer persona

It uses local templates with `{role}` and `{topic}` substitution, along with a small role-specific question bank.

Answers are not currently sent to an external service.

### 3. Answer Evaluation

The `evaluateAnswer()` function in `src/lib/interview.ts` evaluates answers using heuristic scoring.

The evaluation considers:

- Answer length and specificity
- Numerical details and named outcomes
- Keyword overlap with the question
- Structural markers such as "first", "then", "because", and "result"
- Difficulty-based scoring adjustments

It returns the same `Evaluation` structure expected from the future AI backend, allowing the UI to remain unchanged when real model integration is added.

Strong and specific answers typically score around 80–85 in content evaluation.

### 4. Presence Metrics

The `generatePresenceMetrics(seed)` function generates deterministic, session-specific mock metrics.

```ts
{
  eyeContactPercent: number,
  posture: {
    slouchPercent: number,
    leanEvents: number
  },
  gestures: {
    fidgetCount: number,
    handsNearFaceCount: number
  }
}
```

These keys are the agreed data contract for the MediaPipe integration and must remain consistent.

The camera preview in `src/components/camera-preview.tsx` uses a real `getUserMedia` stream with permission, denied, and error states.

Nothing is recorded or uploaded.

**Current implementation:** MediaPipe presence tracking runs entirely in the browser. See `presence.ts` and `use-presence.ts` for the implementation.

When the camera is unavailable, the application falls back to mock metrics.

### 5. Report Generation

The `buildReport()` function combines content and presence metrics into an overall readiness score.

The current weighting is:

- Content: 78%
- Presence: 22%

It generates:

- Overall readiness score
- Dimension summaries
- Strengths
- Areas for improvement
- Presence observations
- Three recommended next steps
- Question-by-question transcript

Sample reports are generated through `createSampleReports()` so the landing page, `/history`, and `/report/sample_2` have sample content on first visit.

### 6. Persistence

Application data is currently stored in the browser.

| Key | Storage | Contents |
|---|---|---|
| `poise.user.v1` | localStorage | User name and email |
| `poise.history.v1` | localStorage | Report history |
| `poise.last-config.v1` | localStorage | Last setup form values |
| `poise.draft.v1` | sessionStorage | In-progress interview session |

The interview draft intentionally uses `sessionStorage` so an unfinished interview does not survive a new browser tab.

Storage reads go through `useSyncExternalStore` hooks in `src/lib/use-storage.ts` and a custom `poise:storage-change` event.

To reset the demo, clear the browser's site data or run:

```js
localStorage.clear()
sessionStorage.clear()
```

Deleting `poise.history.v1` causes sample reports to be generated again on the next read.

---

## MediaPipe Presence Tracking

Poise uses MediaPipe to analyze body-language signals directly in the browser.

Video frames remain on the client device and are not uploaded to a backend.

### Models and WASM Setup

Download the following model files into:

```text
public/mediapipe/models/
```

Required models:

- `face_landmarker.task` — Face landmarks and orientation
- `pose_landmarker_lite.task` — Pose and posture
- `hand_landmarker.task` — Hand landmarks

Copy all `.wasm` files from:

```text
node_modules/@mediapipe/tasks-vision/wasm/
```

Into:

```text
public/mediapipe/wasm/
```

Self-hosting the WASM files prevents the demo from depending on an external CDN.

### Tracking Pipeline

**1. Eye Contact**

Uses MediaPipe Face Landmarker.

The implementation estimates head orientation using facial landmarks, including nose position relative to the eye line and nose-to-chin ratio.

A sample is counted as facing the camera when:

- Yaw is within approximately ±20°.
- Pitch is within the configured range.

The resulting metric is:

```text
eyeContactPercent = facingSamples / validSamples * 100
```

**2. Posture**

Uses MediaPipe Pose Landmarker.

The first approximately five seconds establish a baseline using nose-to-shoulder distance and shoulder midpoint position.

After calibration:

- Slouching is estimated from changes in the nose-to-shoulder gap.
- Leaning is detected through sustained shoulder midpoint movement.

Outputs:

- `slouchPercent`
- `leanEvents`

**3. Hand Gestures**

Uses MediaPipe Hand Landmarker with support for two hands.

The system tracks:

- Hands near face
- Fidgeting activity

The resulting metrics are:

- `fidgetCount`
- `handsNearFaceCount`

### Output Contract

The following output structure must remain unchanged:

```json
{
  "eyeContactPercent": 62,
  "posture": {
    "slouchPercent": 18,
    "leanEvents": 3
  },
  "gestures": {
    "fidgetCount": 12,
    "handsNearFaceCount": 4
  }
}
```

The `presence.ts` module returns these exact keys.

When the camera is unavailable or a model fails to load, the application falls back to `generatePresenceMetrics(seed)`.

This ensures that `buildReport()` and the report UI always receive a consistent data structure.

### The `use-presence` Hook

The application exposes a React hook for managing camera access and presence tracking.

```tsx
import { usePresence } from "@/lib/use-presence";

export default function InterviewRoom() {
  const {
    videoRef,
    cameraState,
    trackerState,
    live,
    start,
    stop,
    snapshot
  } = usePresence();

  // start() requests camera access and initializes MediaPipe.
  // stop() releases camera tracks and stops the tracker.
  // snapshot() returns BodyLanguageMetrics or null.
}
```

Implementation details:

- MediaPipe is loaded lazily when the user enables the camera.
- Camera access uses `getUserMedia`.
- Camera permission denial does not interrupt the interview.
- The tracker samples every 500 ms.
- Samples are skipped when the video is not ready.
- Camera tracks and model resources are released during cleanup.

### Wiring into the Interview Room

When an interview ends, the application obtains the latest presence metrics and generates the report.

```tsx
const measured = presence.snapshot();

setPresenceMeasured(measured !== null);

presence.stop();

const metrics =
  measured ?? generatePresenceMetrics(result.session.id);

const report = buildReport(
  result.session,
  metrics,
  { durationSeconds }
);
```

If presence data was successfully measured, the actual metrics are used.

Otherwise, the deterministic mock fallback ensures that the report can still be generated.

### Testing Without a Physical Camera

Playwright can be used with Chromium's fake media-device options:

```bash
--use-fake-ui-for-media-stream
--use-fake-device-for-media-stream
--use-file-for-fake-video-capture=<path-to-y4m>
```

The smoke test:

```bash
node scripts/presence-smoke.mjs
```

Checks that the tracker loads, starts sampling, and renders a report even when no face is detected.

### Known Limitations

- The tracker requires a minimum number of valid face samples before calibration.
- Small faces and extreme head movements may produce noisy estimates.
- Hand tracking depends on visible hands and unobstructed wrists.
- Models are self-hosted and approximately 20–30 MB in total.
- Initial model loading may take longer on slower connections.

---

## Wiring the Real API

The current mock implementation has a deliberately narrow integration boundary.

The following functions can be replaced when the backend is ready.

| Current Function | Planned Integration | Dependency |
|---|---|---|
| `createSession(config)` | `POST /interview/start` | Aadit's API |
| `submitAnswer(session, answer)` | `POST /interview/answer` | Aadit + Dheeraj |
| `generatePresenceMetrics(seed)` | MediaPipe aggregation in the browser | Client-side |
| `buildReport(session, metrics)` | `POST /interview/report` | Aadit + Dheeraj |
| `getHistory()` / `saveReport()` | `GET /interviews?userId=` | Aadit |
| `saveUser()` | Cognito authentication | Aadit |

### Shared Data Contracts

The following file defines the application's main data structures:

```text
src/lib/types.ts
```

It contains:

- `InterviewConfig`
- `InterviewSession`
- `InterviewQuestion`
- `Evaluation`
- `Report`
- `BodyLanguageMetrics`

The primary integration files are:

```text
src/lib/interview.ts
src/lib/store.ts
```

These files contain the main logic that will need to connect to the real backend.

---

## Design System

Poise uses a warm, minimal visual identity designed to make the interview experience feel calm and focused.

### Visual Language

- Warm paper background
- Near-black typography
- Lime, coral, and lilac accents
- Instrument Serif for display typography
- Manrope for body text

### Styling

Design tokens, animations, and utilities are maintained in:

```text
src/app/globals.css
```

The project uses Tailwind CSS v4 with the `@theme` configuration.

Shared UI primitives are located in:

```text
src/components/ui/
```

The application shell is maintained in:

```text
src/components/app-shell.tsx
```

The report follows a structured reading experience:

1. Overall verdict
2. Content versus presence
3. Strengths and improvements
4. Detailed presence analysis
5. Recommended next rehearsal
6. Interview transcript

---

## Not Built Yet

The following features are planned for future development:

- AWS Cognito authentication through Amplify
- LLM-powered question generation
- AI-based answer evaluation
- Resume upload and storage through Amazon S3
- Backend persistence and multi-user interview history
- Production deployment configuration and CI/CD

---

## Development Notes

### Next.js 16

- `useParams()` on the report route is wrapped in `Suspense`.
- `react-hooks/set-state-in-effect` is enabled.
- Storage hooks should be used instead of setting state directly inside effects.
- The project uses Turbopack.
- Tailwind CSS v4 is used with `@tailwindcss/turbopack`.
- No separate `tailwind.config` file is required.

### Dependencies

| Package | Version / Purpose |
|---|---|
| `next` | 16.4.3 |
| `react` | 19.3.0 |
| `react-dom` | 19.3.0 |
| `tailwindcss` | 4 |
| `lucide-react` | 1.66.0 |
| `@mediapipe/tasks-vision` | 1.2.0 |

---

## Acknowledgments

- **Design:** Warm paper, ink, lime, coral, and lilac visual system.
- **Typography:** Instrument Serif and Manrope.
- **Computer Vision:** MediaPipe Face, Pose, and Hand Landmarker APIs by Google.
- **Framework:** Next.js, React, and Tailwind CSS.

---

**Poise — Practice with purpose. Interview with confidence.**
