"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Loader2,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CameraState =
  | "idle"
  | "requesting"
  | "active"
  | "denied"
  | "unsupported"
  | "error";

export function CameraPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("idle");

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState("idle");
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }

    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 960 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setState("active");
    } catch (error) {
      const denied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "PermissionDeniedError");
      setState(denied ? "denied" : "error");
    }
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-line bg-cream/65">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-ink/45" />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink/60">
            Presence check
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.05] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-ink/40">
          <ShieldCheck size={9} />
          Local only
        </span>
      </div>

      <div className="relative mx-4 aspect-[4/3] overflow-hidden rounded-2xl bg-[#1B1D23]">
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          aria-label="Local camera preview"
          className={cn(
            "h-full w-full -scale-x-100 object-cover transition-opacity duration-300",
            state === "active" ? "opacity-100" : "opacity-0",
          )}
        />

        {state === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <div className="dot-grid-light absolute inset-0 opacity-30" />
            <div className="relative grid size-12 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-lime">
              <ScanFace size={23} strokeWidth={1.5} />
            </div>
            <p className="relative mt-3 text-[12px] font-semibold text-white/80">
              Your camera is off
            </p>
            <p className="relative mt-1 max-w-[190px] text-[9.5px] leading-4 text-white/35">
              Preview the room and rehearse your presence. Nothing is uploaded.
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="focus-ring-light relative mt-4 inline-flex h-8 items-center gap-1.5 rounded-full bg-lime px-3.5 text-[10px] font-bold text-ink transition-transform hover:-translate-y-0.5"
            >
              <Video size={12} />
              Enable camera
            </button>
          </div>
        )}

        {state === "requesting" && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <Loader2 size={22} className="mx-auto animate-spin text-lime" />
              <p className="mt-3 text-[10px] text-white/40">
                Waiting for permission...
              </p>
            </div>
          </div>
        )}

        {(state === "denied" || state === "unsupported" || state === "error") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
            <div className="grid size-11 place-items-center rounded-full border border-coral/30 bg-coral/10 text-coral">
              <CameraOff size={20} strokeWidth={1.5} />
            </div>
            <p className="mt-3 text-[11px] font-semibold text-white/80">
              {state === "denied"
                ? "Camera access is blocked"
                : state === "unsupported"
                  ? "Camera unavailable"
                  : "Camera could not start"}
            </p>
            <p className="mt-1 max-w-[200px] text-[9px] leading-4 text-white/35">
              {state === "denied"
                ? "Allow camera access in your browser settings, then try again."
                : "You can still finish the interview. Camera is always optional."}
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="focus-ring-light mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[9px] font-semibold text-white/60 hover:bg-white/[0.06] hover:text-white"
            >
              <RefreshCw size={10} />
              Try again
            </button>
          </div>
        )}

        {state === "active" && (
          <>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-3 top-3 h-4 w-4 border-l border-t border-lime/60" />
              <div className="absolute right-3 top-3 h-4 w-4 border-r border-t border-lime/60" />
              <div className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-lime/60" />
              <div className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-lime/60" />
              <div className="animate-scan absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />
            </div>
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/65 px-2 py-1 backdrop-blur-sm">
              <span className="animate-pulse-dot size-1.5 rounded-full bg-coral" />
              <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/70">
                Live · local
              </span>
            </div>
            <button
              type="button"
              onClick={stopCamera}
              aria-label="Turn off camera"
              className="focus-ring-light absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-ink/65 text-white/70 backdrop-blur-sm transition-colors hover:bg-ink hover:text-white"
            >
              <X size={13} />
            </button>
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
              <span className="rounded-full bg-ink/65 px-2 py-1 text-[8px] font-medium text-white/55 backdrop-blur-sm">
                Preview only
              </span>
              <span className="flex items-end gap-[2px]" aria-hidden="true">
                {[5, 9, 6, 12, 8].map((height, index) => (
                  <span
                    key={index}
                    className="w-[2px] rounded-full bg-lime/70"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </span>
            </div>
          </>
        )}
      </div>

      <p className="px-4 pb-4 pt-3 text-[9px] leading-4 text-muted">
        In this text MVP the preview is a camera check; MediaPipe presence
        scoring is the next milestone. Your feed never leaves the browser.
      </p>
    </div>
  );
}
