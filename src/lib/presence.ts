import type {
  FaceLandmarker,
  HandLandmarker,
  NormalizedLandmark,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import type { BodyLanguageMetrics } from "./types";

/**
 * In-browser presence tracking.
 *
 * Video never leaves the machine: MediaPipe runs on the raw camera frames and
 * only the aggregated counts below are handed to the report.
 *
 * Geometry notes (normalized image coordinates):
 * - Facing camera: the nose sits near the midpoint of the eye line and the
 *   nose-to-eye vertical is a normal fraction of eye-to-chin height. Both
 *   ratios are invariant to face size and distance, unlike raw pixel offsets.
 * - Posture: a baseline is captured over the first few seconds, then slouch is
 *   measured as the nose-to-shoulder distance shrinking against that baseline.
 * - Hands: a "near face" event is one wrist entering the face zone, debounced;
 *   a fidget burst is one fast wrist displacement, debounced.
 */

const SAMPLE_INTERVAL_MS = 500;
const BASELINE_MS = 5000;
const MIN_FACE_SAMPLES = 8;
const LEAN_HOLD_MS = 2000;
const FACE_EVENT_COOLDOWN_MS = 1500;
const FIDGET_COOLDOWN_MS = 1200;

const ASSET_BASE = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/mediapipe`;

const MODELS = {
  face: `${ASSET_BASE}/models/face_landmarker.task`,
  pose: `${ASSET_BASE}/models/pose_landmarker_lite.task`,
  hand: `${ASSET_BASE}/models/hand_landmarker.task`,
};

// Face landmark indices (MediaPipe face mesh).
const FACE = {
  noseTip: 1,
  chin: 152,
  eyeOuterLeft: 33,
  eyeOuterRight: 263,
};

// Pose landmark indices.
const POSE = { nose: 0, shoulderLeft: 11, shoulderRight: 12 };

const YAW_RATIO_LIMIT = 0.2;
const PITCH_RATIO_MIN = 0.24;
const PITCH_RATIO_MAX = 0.62;
const SLOUCH_SHRINK = 0.86;
const LEAN_FRACTION = 0.3;
const HAND_FACE_FRACTION = 0.85;
const FIDGET_FRACTION = 0.32;

export interface PresenceLive {
  /** Total 500ms ticks that produced any usable signal. */
  samples: number;
  faceSamples: number;
  faceLostSamples: number;
  /** Share of sampled frames where the face was oriented at the camera. */
  facingPercent: number | null;
  slouchPercent: number | null;
  leanEvents: number;
  fidgetCount: number;
  handsNearFaceCount: number;
  baselineReady: boolean;
}

export interface PresenceSnapshot {
  metrics: BodyLanguageMetrics;
  samples: number;
  faceSamples: number;
  faceLostSamples: number;
}

interface Point {
  x: number;
  y: number;
}

interface HandState {
  near: boolean;
  lastFaceEventAt: number;
}

interface PostureBaseline {
  noseGap: number;
  midX: number;
  width: number;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Math.round(value);
}

function visible(landmark: NormalizedLandmark | undefined): boolean {
  if (!landmark) return false;
  return landmark.visibility === undefined || landmark.visibility > 0.5;
}

/**
 * Estimates head orientation from face landmarks.
 *
 * `yaw` is the nose offset from the eye midpoint in units of eye distance.
 * `pitch` is where the nose tip falls between the eye line and the chin.
 */
export function estimateHeadPose(face: NormalizedLandmark[]): {
  facing: boolean;
  yaw: number;
  pitch: number;
} {
  const nose = face[FACE.noseTip];
  const chin = face[FACE.chin];
  const eyeLeft = face[FACE.eyeOuterLeft];
  const eyeRight = face[FACE.eyeOuterRight];

  if (!nose || !chin || !eyeLeft || !eyeRight) {
    return { facing: false, yaw: 1, pitch: 1 };
  }

  const eyeMid = {
    x: (eyeLeft.x + eyeRight.x) / 2,
    y: (eyeLeft.y + eyeRight.y) / 2,
  };
  const eyeDistance = Math.max(distance(eyeLeft, eyeRight), 0.0001);
  const eyeToChin = Math.max(chin.y - eyeMid.y, 0.0001);

  const yaw = Math.abs(nose.x - eyeMid.x) / eyeDistance;
  const pitch = (nose.y - eyeMid.y) / eyeToChin;

  const facing =
    yaw <= YAW_RATIO_LIMIT && pitch >= PITCH_RATIO_MIN && pitch <= PITCH_RATIO_MAX;

  return { facing, yaw, pitch };
}

export class PresenceTracker {
  private readonly video: HTMLVideoElement;
  private readonly onUpdate: (live: PresenceLive) => void;

  private face: FaceLandmarker | null = null;
  private pose: PoseLandmarker | null = null;
  private hand: HandLandmarker | null = null;

  private interval: number | null = null;
  private lastTimestamp = 0;
  private startedAt = 0;

  private samples = 0;
  private faceSamples = 0;
  private facingSamples = 0;
  private faceLostSamples = 0;

  private baseline: PostureBaseline | null = null;
  private baselineSamples: { noseGap: number; midX: number; width: number }[] = [];

  private postureSamples = 0;
  private slouchSamples = 0;
  private leanEvents = 0;
  private leaningSince: number | null = null;
  private leanCounted = false;

  private fidgetCount = 0;
  private handsNearFaceCount = 0;
  private lastFidgetAt = 0;
  private readonly handStates: HandState[] = [
    { near: false, lastFaceEventAt: 0 },
    { near: false, lastFaceEventAt: 0 },
  ];
  private lastWrists: (Point | null)[] = [null, null];
  private lastShoulderWidth = 0.2;

  constructor(video: HTMLVideoElement, onUpdate: (live: PresenceLive) => void) {
    this.video = video;
    this.onUpdate = onUpdate;
  }

  async init(): Promise<void> {
    const { FaceLandmarker, FilesetResolver, HandLandmarker, PoseLandmarker } =
      await import("@mediapipe/tasks-vision");

    const fileset = await FilesetResolver.forVisionTasks(`${ASSET_BASE}/wasm`);

    const runOnGpu = async <T>(create: (delegate: "GPU" | "CPU") => Promise<T>) => {
      try {
        return await create("GPU");
      } catch {
        return await create("CPU");
      }
    };

    try {
      this.face = await runOnGpu((delegate) =>
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODELS.face, delegate },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        }),
      );
      this.pose = await runOnGpu((delegate) =>
        PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODELS.pose, delegate },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }),
      );
      this.hand = await runOnGpu((delegate) =>
        HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODELS.hand, delegate },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }),
      );
    } catch (error) {
      this.close();
      throw error;
    }

    this.startedAt = performance.now();
    this.lastTimestamp = 0;
    this.interval = window.setInterval(() => this.tick(), SAMPLE_INTERVAL_MS);
  }

  private tick(): void {
    const video = this.video;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return;

    const now = performance.now();
    const timestamp = Math.max(now, this.lastTimestamp + 1);
    this.lastTimestamp = timestamp;
    this.samples += 1;

    const face = this.detectFace(video, timestamp);
    this.trackFace(face, now);
    const pose = this.detectPose(video, timestamp);
    this.trackPosture(pose, now);
    this.trackHands(this.detectHands(video, timestamp), face, now);

    this.emit();
  }

  private detectFace(
    video: HTMLVideoElement,
    timestamp: number,
  ): NormalizedLandmark[] | null {
    if (!this.face) return null;
    try {
      const result = this.face.detectForVideo(video, timestamp);
      return result.faceLandmarks[0] ?? null;
    } catch {
      return null;
    }
  }

  private detectPose(
    video: HTMLVideoElement,
    timestamp: number,
  ): NormalizedLandmark[] | null {
    if (!this.pose) return null;
    try {
      const result = this.pose.detectForVideo(video, timestamp);
      return result.landmarks[0] ?? null;
    } catch {
      return null;
    }
  }

  private detectHands(
    video: HTMLVideoElement,
    timestamp: number,
  ): NormalizedLandmark[][] {
    if (!this.hand) return [];
    try {
      return this.hand.detectForVideo(video, timestamp).landmarks ?? [];
    } catch {
      return [];
    }
  }

  private trackFace(face: NormalizedLandmark[] | null, now: number): void {
    if (!face) {
      this.faceLostSamples += 1;
      return;
    }

    this.faceSamples += 1;
    const pose = estimateHeadPose(face);
    if (!pose.facing) return;

    // Ignore the first beat while the person settles into the chair.
    if (now - this.startedAt < 800) return;
    this.facingSamples += 1;
  }

  private trackPosture(pose: NormalizedLandmark[] | null, now: number): void {
    if (!pose) return;

    const left = pose[POSE.shoulderLeft];
    const right = pose[POSE.shoulderRight];
    const nose = pose[POSE.nose];
    if (!visible(left) || !visible(right) || !visible(nose)) return;

    const width = Math.abs(left.x - right.x);
    if (width < 0.06) return;

    const midX = (left.x + right.x) / 2;
    const midY = (left.y + right.y) / 2;
    const noseGap = midY - nose.y;
    if (noseGap <= 0.01) return;

    this.lastShoulderWidth = width;

    if (now - this.startedAt < BASELINE_MS || !this.baseline) {
      this.baselineSamples.push({ noseGap, midX, width });
      if (now - this.startedAt >= BASELINE_MS && this.baselineSamples.length >= 4) {
        const count = this.baselineSamples.length;
        this.baseline = {
          noseGap:
            this.baselineSamples.reduce((sum, item) => sum + item.noseGap, 0) / count,
          midX: this.baselineSamples.reduce((sum, item) => sum + item.midX, 0) / count,
          width: this.baselineSamples.reduce((sum, item) => sum + item.width, 0) / count,
        };
      }
      return;
    }

    this.postureSamples += 1;
    if (noseGap < this.baseline.noseGap * SLOUCH_SHRINK) {
      this.slouchSamples += 1;
    }

    const leanOffset = Math.abs(midX - this.baseline.midX);
    const leanThreshold = Math.max(0.03, this.baseline.width * LEAN_FRACTION);

    if (leanOffset <= leanThreshold) {
      this.leaningSince = null;
      this.leanCounted = false;
      return;
    }

    if (this.leaningSince === null) {
      this.leaningSince = now;
    } else if (!this.leanCounted && now - this.leaningSince >= LEAN_HOLD_MS) {
      this.leanEvents += 1;
      this.leanCounted = true;
    }
  }

  private trackHands(
    hands: NormalizedLandmark[][],
    face: NormalizedLandmark[] | null,
    now: number,
  ): void {
    const faceWidth = face
      ? Math.max(
          distance(face[FACE.eyeOuterLeft], face[FACE.eyeOuterRight]) * 2.4,
          0.04,
        )
      : 0;
    const faceNose = face?.[FACE.noseTip];

    hands.slice(0, 2).forEach((hand, index) => {
      const wrist = hand[0];
      if (!wrist) return;
      const state = this.handStates[index];

      if (faceNose && faceWidth > 0) {
        const near = distance(wrist, faceNose) < faceWidth * HAND_FACE_FRACTION;
        if (near && !state.near && now - state.lastFaceEventAt > FACE_EVENT_COOLDOWN_MS) {
          this.handsNearFaceCount += 1;
          state.lastFaceEventAt = now;
        }
        state.near = near;
      } else {
        state.near = false;
      }

      const previous = this.lastWrists[index];
      if (previous) {
        const movement = distance(wrist, previous);
        if (
          movement > this.lastShoulderWidth * FIDGET_FRACTION &&
          now - this.lastFidgetAt > FIDGET_COOLDOWN_MS
        ) {
          this.fidgetCount += 1;
          this.lastFidgetAt = now;
        }
      }

      this.lastWrists[index] = { x: wrist.x, y: wrist.y };
    });

    for (let index = hands.length; index < 2; index += 1) {
      this.lastWrists[index] = null;
      this.handStates[index].near = false;
    }
  }

  private live(): PresenceLive {
    return {
      samples: this.samples,
      faceSamples: this.faceSamples,
      faceLostSamples: this.faceLostSamples,
      facingPercent:
        this.faceSamples > 0
          ? clamp(round((this.facingSamples / this.faceSamples) * 100), 0, 100)
          : null,
      slouchPercent:
        this.postureSamples > 0
          ? clamp(round((this.slouchSamples / this.postureSamples) * 100), 0, 100)
          : null,
      leanEvents: this.leanEvents,
      fidgetCount: this.fidgetCount,
      handsNearFaceCount: this.handsNearFaceCount,
      baselineReady: this.baseline !== null,
    };
  }

  private emit(): void {
    this.onUpdate(this.live());
  }

  snapshot(): PresenceSnapshot | null {
    if (this.faceSamples < MIN_FACE_SAMPLES) return null;

    const eyeContactPercent = clamp(
      round((this.facingSamples / this.faceSamples) * 100),
      0,
      100,
    );
    const slouchPercent =
      this.postureSamples > 0
        ? clamp(round((this.slouchSamples / this.postureSamples) * 100), 0, 100)
        : 0;

    return {
      metrics: {
        eyeContactPercent,
        posture: {
          slouchPercent,
          leanEvents: this.leanEvents,
        },
        gestures: {
          fidgetCount: this.fidgetCount,
          handsNearFaceCount: this.handsNearFaceCount,
        },
      },
      samples: this.samples,
      faceSamples: this.faceSamples,
      faceLostSamples: this.faceLostSamples,
    };
  }

  close(): void {
    if (this.interval !== null) {
      window.clearInterval(this.interval);
      this.interval = null;
    }
    this.face?.close();
    this.pose?.close();
    this.hand?.close();
    this.face = null;
    this.pose = null;
    this.hand = null;
  }
}
