"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw, Play, Pause, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

type Props = {
  onComplete: (audio: Blob) => void;
  disabled?: boolean;
};

type RecorderState = "idle" | "recording" | "paused" | "stopped";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const BARS = 28;

export function Recorder({ onComplete, disabled }: Props) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [bars, setBars] = useState<number[]>(() => Array(BARS).fill(0.12));
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalBlobRef = useRef<Blob | null>(null);

  const teardown = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  };

  useEffect(() => {
    return () => {
      teardown();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ambient idle waveform — gentle sine-modulated breathing across the bars.
  useEffect(() => {
    if (state !== "idle") return;
    const start = performance.now();
    const id = setInterval(() => {
      const t = performance.now() - start;
      setBars(() =>
        Array.from({ length: BARS }, (_, i) =>
          0.1 + 0.18 * (0.5 + 0.5 * Math.sin(t / 600 + i * 0.35))
        )
      );
    }, 80);
    return () => clearInterval(id);
  }, [state]);

  const startMeter = (stream: MediaStream) => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(data);
      let peak = 0;
      for (let i = 0; i < data.length; i++) {
        const v = Math.abs(data[i] - 128);
        if (v > peak) peak = v;
      }
      const next = Math.min(1, peak / 80);
      setLevel(next);
      setBars((prev) => {
        const out = prev.slice(1);
        out.push(Math.max(0.08, next * (0.6 + Math.random() * 0.55)));
        return out;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = async () => {
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    finalBlobRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        finalBlobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        teardown();
        setState("stopped");
      };
      recorder.start(250);
      recorderRef.current = recorder;
      startMeter(stream);
      setElapsed(0);
      setBars(Array(BARS).fill(0.12));
      tickRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
      setState("recording");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.name === "NotAllowedError"
            ? "Microphone access was denied. Allow it in your browser settings and try again."
            : err.message
          : "Could not start the microphone.";
      setError(message);
      teardown();
      setState("idle");
    }
  };

  const pause = () => {
    recorderRef.current?.pause();
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setState("paused");
  };

  const resume = () => {
    recorderRef.current?.resume();
    tickRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    setState("recording");
  };

  const stop = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    recorderRef.current?.stop();
  };

  const reset = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    finalBlobRef.current = null;
    setElapsed(0);
    setBars(Array(BARS).fill(0.12));
    setState("idle");
  };

  const submit = () => {
    if (finalBlobRef.current) onComplete(finalBlobRef.current);
  };

  const isLive = state === "recording" || state === "paused";

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 rounded-[20px] bg-card/80 p-5 ring-1 ring-border/70 backdrop-blur-sm sm:gap-4">
        {/* Big focal mic */}
        <div className="relative grid place-items-center">
          {state === "recording" && (
            <>
              <span className="absolute inset-0 -m-2 animate-pulse-ring rounded-full bg-[color:var(--sage)]/35" />
              <span className="absolute inset-0 -m-2 animate-pulse-ring rounded-full bg-[color:var(--sage)]/25 [animation-delay:700ms]" />
            </>
          )}
          <button
            type="button"
            onClick={
              state === "idle"
                ? start
                : state === "recording"
                ? pause
                : state === "paused"
                ? resume
                : reset
            }
            disabled={disabled}
            aria-label={
              state === "idle"
                ? "Start recording"
                : state === "recording"
                ? "Pause recording"
                : state === "paused"
                ? "Resume recording"
                : "Reset"
            }
            className={`relative grid size-20 place-items-center rounded-full transition-all duration-300 disabled:opacity-50 ${
              state === "recording"
                ? "bg-[color:var(--clay)] text-foreground shadow-[0_18px_40px_-18px_color-mix(in_oklch,var(--clay)_70%,transparent)]"
                : state === "paused"
                ? "bg-card text-foreground ring-2 ring-[color:var(--clay)]"
                : "bg-[color:var(--sage-deep)] text-[color:var(--primary-foreground)] shadow-[0_28px_60px_-22px_color-mix(in_oklch,var(--sage-deep)_85%,transparent)] hover:shadow-[0_34px_72px_-22px_color-mix(in_oklch,var(--sage-deep)_95%,transparent)]"
            }`}
            style={
              state === "recording"
                ? { transform: `scale(${1 + level * 0.06})` }
                : undefined
            }
          >
            {state === "idle" && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at center, color-mix(in oklch, white 24%, transparent) 0%, transparent 62%)",
                }}
                animate={{ opacity: [0, 0.55, 0] }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
              />
            )}
            {state === "recording" ? (
              <Pause className="size-7" strokeWidth={1.6} />
            ) : state === "paused" ? (
              <Play className="size-7" strokeWidth={1.6} />
            ) : state === "stopped" ? (
              <RotateCcw className="size-6" strokeWidth={1.6} />
            ) : (
              <motion.span
                className="relative grid place-items-center"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
              >
                <Mic className="size-7" strokeWidth={1.6} />
              </motion.span>
            )}
          </button>
        </div>

        {/* Status label */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="font-mono text-2xl tabular-nums tracking-tight text-foreground"
            aria-live="polite"
          >
            {formatTime(elapsed)}
          </div>
          <div className="flex h-[18px] items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {state === "recording" && (
              <>
                <span className="size-1.5 animate-pulse rounded-full bg-[color:var(--clay)]" />
                Recording
              </>
            )}
            {state === "paused" && (
              <>
                <span className="size-1.5 rounded-full bg-[color:var(--clay)]" />
                Paused
              </>
            )}
            {state === "idle" && (
              <>
                <span className="size-1.5 rounded-full bg-[color:var(--sage)]" />
                Ready when you are
              </>
            )}
            {state === "stopped" && (
              <>
                <span className="size-1.5 rounded-full bg-[color:var(--sage-deep)]" />
                Captured · review or send
              </>
            )}
          </div>
        </div>

        {/* Waveform */}
        <div className="flex h-7 w-full max-w-sm items-center justify-center gap-[3px]">
          {bars.map((b, i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-all duration-150 ${
                isLive
                  ? state === "paused"
                    ? "bg-[color:var(--clay)]/50"
                    : "bg-[color:var(--sage-deep)]"
                  : state === "stopped"
                  ? "bg-[color:var(--sage)]/60"
                  : "bg-[color:var(--sage)]/45"
              }`}
              style={{
                height: `${Math.max(8, b * 100)}%`,
                opacity: isLive ? 0.65 + b * 0.35 : 0.55 + b * 0.3,
              }}
            />
          ))}
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {state === "recording" && (
            <Button
              variant="outline"
              onClick={stop}
              className="gap-2 rounded-full px-5"
            >
              <Square className="size-3.5" />
              Stop
            </Button>
          )}

          {state === "paused" && (
            <Button
              variant="outline"
              onClick={stop}
              className="gap-2 rounded-full px-5"
            >
              <Square className="size-3.5" />
              Stop
            </Button>
          )}

          {state === "stopped" && (
            <>
              <Button
                variant="outline"
                onClick={reset}
                className="gap-2 rounded-full px-5"
              >
                <RotateCcw className="size-3.5" />
                Re-record
              </Button>
              <button
                type="button"
                onClick={submit}
                disabled={disabled}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-[color:var(--sage-deep)] px-5 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Generate summary
                <ArrowRight className="size-4" />
              </button>
            </>
          )}
        </div>

        {state === "stopped" && audioUrl && (
          <audio
            src={audioUrl}
            controls
            className="w-full max-w-md rounded-full"
          />
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
