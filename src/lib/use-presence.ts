"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BodyLanguageMetrics } from "./types";
import type { PresenceLive, PresenceTracker } from "./presence";

export type CameraState =
  | "idle"
  | "requesting"
  | "active"
  | "denied"
  | "unsupported"
  | "error";

export type TrackerState = "idle" | "loading" | "tracking" | "unavailable";

export interface PresenceController {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  trackerState: TrackerState;
  live: PresenceLive | null;
  start: () => Promise<void>;
  stop: () => void;
  snapshot: () => BodyLanguageMetrics | null;
}

/**
 * Owns the local camera stream and the MediaPipe tracker.
 *
 * The tracker is imported lazily so the MediaPipe bundle and models are only
 * fetched once the student turns the camera on.
 */
export function usePresence(): PresenceController {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<PresenceTracker | null>(null);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [trackerState, setTrackerState] = useState<TrackerState>("idle");
  const [live, setLive] = useState<PresenceLive | null>(null);

  const start = useCallback(async () => {
    if (startingRef.current || streamRef.current) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      return;
    }

    startingRef.current = true;
    setCameraState("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        // Do not await: some browsers keep play() pending until the element is
        // visible. Autoplay on the element handles the rest.
        void video.play().catch(() => undefined);
      }
      setCameraState("active");

      setTrackerState("loading");
      const { PresenceTracker } = await import("./presence");
      if (!mountedRef.current || !videoRef.current || !streamRef.current) return;

      const tracker = new PresenceTracker(videoRef.current, setLive);
      try {
        await tracker.init();
        if (!mountedRef.current || !streamRef.current) {
          tracker.close();
          return;
        }
        trackerRef.current = tracker;
        setTrackerState("tracking");
      } catch {
        tracker.close();
        setTrackerState("unavailable");
      }
    } catch (error) {
      const denied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "PermissionDeniedError");
      setCameraState(denied ? "denied" : "error");
    } finally {
      startingRef.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    trackerRef.current?.close();
    trackerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("idle");
    setTrackerState("idle");
    setLive(null);
  }, []);

  const snapshot = useCallback(
    () => trackerRef.current?.snapshot()?.metrics ?? null,
    [],
  );

  // If the student has already granted camera access, start the preview and
  // tracking without making them click again.
  useEffect(() => {
    let cancelled = false;
    const permissions = navigator.permissions;
    if (!permissions?.query) return;

    permissions
      .query({ name: "camera" as PermissionName })
      .then((status) => {
        if (!cancelled && status.state === "granted") void start();
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [start]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      trackerRef.current?.close();
      trackerRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  return { videoRef, cameraState, trackerState, live, start, stop, snapshot };
}
