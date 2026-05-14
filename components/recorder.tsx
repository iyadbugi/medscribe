"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw, Play, Pause } from "lucide-react";
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

export function Recorder({ onComplete, disabled }: Props) {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
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
      setLevel(Math.min(1, peak / 80));
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
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
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
      tickRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
      setState("recording");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.name === "NotAllowedError"
            ? "Microphone access was denied. Please allow it in your browser settings and try again."
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
    setState("idle");
  };

  const submit = () => {
    if (finalBlobRef.current) onComplete(finalBlobRef.current);
  };

  return (
    <div className="flex flex-col items-stretch gap-4">
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6">
        <div className="font-mono text-3xl tabular-nums" aria-live="polite">
          {formatTime(elapsed)}
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-red-500 transition-[width] duration-100"
            style={{
              width:
                state === "recording"
                  ? `${Math.round(level * 100)}%`
                  : state === "paused"
                  ? "10%"
                  : "0%",
              opacity: state === "recording" ? 1 : state === "paused" ? 0.5 : 0,
            }}
            aria-hidden
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {state === "idle" && (
            <Button
              size="lg"
              onClick={start}
              disabled={disabled}
              className="gap-2"
            >
              <Mic className="size-4" />
              Start recording
            </Button>
          )}

          {state === "recording" && (
            <>
              <Button variant="outline" onClick={pause} className="gap-2">
                <Pause className="size-4" />
                Pause
              </Button>
              <Button variant="destructive" onClick={stop} className="gap-2">
                <Square className="size-4" />
                Stop
              </Button>
            </>
          )}

          {state === "paused" && (
            <>
              <Button onClick={resume} className="gap-2">
                <Play className="size-4" />
                Resume
              </Button>
              <Button variant="destructive" onClick={stop} className="gap-2">
                <Square className="size-4" />
                Stop
              </Button>
            </>
          )}

          {state === "stopped" && (
            <>
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="size-4" />
                Re-record
              </Button>
              <Button onClick={submit} disabled={disabled} className="gap-2">
                Generate summary
              </Button>
            </>
          )}
        </div>

        {state === "stopped" && audioUrl && (
          <audio src={audioUrl} controls className="w-full pt-2" />
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
