"use client";

import { useEffect, useReducer, useRef } from "react";
import dynamic from "next/dynamic";
import {
  FileDown,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Check,
  Clock,
  CircleDot,
  Stethoscope,
  Waves,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Recorder } from "@/components/recorder";
import { VisitForm } from "@/components/visit-form";
import { SummaryReview } from "@/components/summary-review";
import { SoapDocument } from "@/components/pdf/soap-document";
import { HandoutDocument } from "@/components/pdf/handout-document";
import {
  emptySummary,
  type SummaryResponse,
  type VisitMetadata,
} from "@/lib/schema";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
);

type Stage = "idle" | "transcribing" | "summarizing" | "review" | "error";

type State = {
  stage: Stage;
  metadata: VisitMetadata;
  transcript: string;
  summary: SummaryResponse;
  error: string | null;
  audio: Blob | null;
};

type Action =
  | { type: "set_metadata"; metadata: VisitMetadata }
  | { type: "begin_transcribe"; audio: Blob }
  | { type: "begin_summarize"; transcript: string }
  | { type: "ready"; summary: SummaryResponse }
  | { type: "edit_summary"; summary: SummaryResponse }
  | { type: "fail"; message: string; stage: Stage }
  | { type: "reset" };

const todayIso = () => new Date().toISOString().slice(0, 10);

const initialState = (): State => ({
  stage: "idle",
  metadata: { patientName: "", visitDate: todayIso(), chiefComplaint: "" },
  transcript: "",
  summary: emptySummary(),
  error: null,
  audio: null,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set_metadata":
      return { ...state, metadata: action.metadata };
    case "begin_transcribe":
      return { ...state, stage: "transcribing", error: null, audio: action.audio };
    case "begin_summarize":
      return { ...state, stage: "summarizing", transcript: action.transcript };
    case "ready":
      return { ...state, stage: "review", summary: action.summary };
    case "edit_summary":
      return { ...state, summary: action.summary };
    case "fail":
      return { ...state, stage: action.stage, error: action.message };
    case "reset":
      return initialState();
    default:
      return state;
  }
}

const steps = [
  {
    key: "capture",
    title: "Capture",
    blurb: "Dictate after the visit. Three minutes is plenty.",
    icon: Waves,
  },
  {
    key: "transcribing",
    title: "Transcribe",
    blurb: "Whisper turns the dictation into a clean transcript.",
    icon: Sparkles,
  },
  {
    key: "summarizing",
    title: "Draft",
    blurb: "The model writes a SOAP note and a plain-English handout.",
    icon: PenLine,
  },
  {
    key: "review",
    title: "Review",
    blurb: "Read, edit, export. Nothing leaves until you say so.",
    icon: Check,
  },
] as const;

function activeStepIndex(stage: Stage): number {
  if (stage === "transcribing") return 1;
  if (stage === "summarizing") return 2;
  if (stage === "review") return 3;
  return 0;
}

export default function HomePage() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stageSectionRef = useRef<HTMLElement | null>(null);
  const prevStageRef = useRef(state.stage);

  useEffect(() => {
    const prev = prevStageRef.current;
    prevStageRef.current = state.stage;
    if (prev === state.stage) return;
    if (state.stage === "idle") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = stageSectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [state.stage]);

  const runPipeline = async (audio: Blob, metadata: VisitMetadata) => {
    dispatch({ type: "begin_transcribe", audio });
    try {
      const fd = new FormData();
      const ext = audio.type.includes("webm") ? "webm" : "ogg";
      fd.append("audio", audio, `dictation.${ext}`);
      const tRes = await fetch("/api/transcribe", { method: "POST", body: fd });
      const tJson = await tRes.json();
      if (!tRes.ok) {
        dispatch({
          type: "fail",
          stage: "error",
          message: tJson.error || "Transcription failed.",
        });
        return;
      }
      const transcript: string = tJson.transcript;
      dispatch({ type: "begin_summarize", transcript });

      const sRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, metadata }),
      });
      const sJson = await sRes.json();
      if (!sRes.ok) {
        dispatch({
          type: "fail",
          stage: "error",
          message: sJson.error || "Summarization failed.",
        });
        return;
      }
      dispatch({ type: "ready", summary: sJson as SummaryResponse });
    } catch (err) {
      dispatch({
        type: "fail",
        stage: "error",
        message: err instanceof Error ? err.message : "Unexpected error.",
      });
    }
  };

  const retry = async () => {
    if (state.audio) await runPipeline(state.audio, state.metadata);
  };

  const inputsDisabled =
    state.stage === "transcribing" || state.stage === "summarizing";

  const fileSlug = state.metadata.patientName
    ? `-${state.metadata.patientName.replace(/\s+/g, "-").toLowerCase()}`
    : "";

  const stageIndex = activeStepIndex(state.stage);

  return (
    <main className="relative flex w-full flex-1 flex-col">
      {/* HERO */}
      {(state.stage === "idle" || state.stage === "error") && (
        <section className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--sage-deep)_22%,transparent)] bg-[color-mix(in_oklch,var(--mint)_45%,var(--background))] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]">
                <Stethoscope className="size-3.5" strokeWidth={1.7} />
                For clinicians, after the visit
              </span>
              <h1 className="mt-5 font-display text-balance text-[2.6rem] leading-[1.02] text-foreground sm:text-[4rem] md:text-[4.8rem]">
                Walk out with the{" "}
                <span className="font-display-italic text-[color:var(--sage-deep)]">
                  note
                </span>{" "}
                already{" "}
                <span className="font-display-italic text-[color:var(--sage-deep)]">
                  written.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Dictate a short post-visit summary. MedScribe returns an
                editable SOAP note and a plain-English handout, both
                downloadable as PDF in under a minute.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#start"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--sage-deep)] px-6 text-sm font-medium text-[color:var(--primary-foreground)] shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--sage-deep)_60%,transparent)] hover:shadow-[0_12px_32px_-12px_color-mix(in_oklch,var(--sage-deep)_70%,transparent)] transition-all"
                >
                  Start a visit
                  <ArrowRight className="size-4" strokeWidth={1.8} />
                </a>
                <a
                  href="#how"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground/80 hover:bg-secondary transition-colors"
                >
                  How it works
                </a>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border/60 pt-6">
                {[
                  { k: "~40s", v: "average draft time" },
                  { k: "2 docs", v: "SOAP + handout" },
                  { k: "0", v: "files written to disk" },
                ].map((s) => (
                  <div key={s.v}>
                    <dt className="font-display text-2xl tracking-tight text-foreground">
                      {s.k}
                    </dt>
                    <dd className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {s.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Hero side card — vertical pipeline preview */}
            <aside className="animate-rise relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[color-mix(in_oklch,var(--mint)_75%,var(--card))] to-[color-mix(in_oklch,var(--cream)_65%,var(--card))] p-7 ring-1 ring-[color-mix(in_oklch,var(--sage-deep)_18%,transparent)] [animation-delay:120ms]">
              <div className="absolute -right-12 -top-12 size-48 rounded-full bg-[color-mix(in_oklch,var(--sage)_30%,transparent)] blur-3xl" />
              <div className="absolute -bottom-16 -left-10 size-40 rounded-full bg-[color-mix(in_oklch,var(--clay)_22%,transparent)] blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]/80">
                    Workflow
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-card/70 px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-border/70">
                    <Clock className="size-3" />
                    avg &lt;1 min
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl leading-tight text-foreground">
                  From{" "}
                  <span className="font-display-italic text-[color:var(--sage-deep)]">
                    spoken word
                  </span>{" "}
                  to signed note.
                </h3>

                <ol className="relative mt-6 space-y-4 pl-7 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-[color-mix(in_oklch,var(--sage-deep)_30%,transparent)]">
                  {steps.map((s, i) => (
                    <li key={s.key} className="relative">
                      <span className="absolute -left-7 top-1 grid size-[22px] place-items-center rounded-full bg-[color:var(--sage-deep)] text-[color:var(--primary-foreground)] ring-[3px] ring-[color-mix(in_oklch,var(--mint)_80%,transparent)]">
                        <s.icon className="size-3" strokeWidth={2} />
                      </span>
                      <div className="flex items-baseline justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {i + 1}. {s.title}
                        </p>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          step
                        </span>
                      </div>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                        {s.blurb}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* ACTIVE STAGE — STEP RAIL + FOCAL CARD */}
      <section
        id="start"
        ref={stageSectionRef}
        className={`mx-auto w-full max-w-6xl scroll-mt-24 px-5 sm:px-8 ${
          state.stage === "idle" || state.stage === "error"
            ? "pt-20"
            : "pt-12 sm:pt-16"
        }`}
      >
        {/* Stage rail (horizontal) */}
        <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
          {steps.map((s, i) => {
            const isActive = i === stageIndex;
            const isDone = i < stageIndex;
            return (
              <span key={s.key} className="flex items-center gap-2">
                <span
                  className={`grid size-5 place-items-center rounded-full text-[10px] font-medium ${
                    isDone
                      ? "bg-[color:var(--sage-deep)] text-[color:var(--primary-foreground)]"
                      : isActive
                      ? "bg-[color:var(--clay)] text-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="size-3" strokeWidth={2.4} /> : i + 1}
                </span>
                <span
                  className={`uppercase tracking-[0.14em] ${
                    isActive
                      ? "text-foreground"
                      : isDone
                      ? "text-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
                {i < steps.length - 1 && (
                  <span className="mx-1 h-px w-6 bg-border sm:w-10" />
                )}
              </span>
            );
          })}
        </div>

        {/* IDLE / ERROR — VISIT FORM + RECORDER */}
        {(state.stage === "idle" || state.stage === "error") && (
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <section className="relative overflow-hidden rounded-[24px] bg-card p-6 ring-1 ring-border/70 sm:p-7">
              <div className="absolute right-4 top-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                01 · Visit details
              </div>
              <h2 className="mt-2 font-display text-2xl leading-tight">
                Who and{" "}
                <span className="font-display-italic text-[color:var(--sage-deep)]">
                  when.
                </span>
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Optional. The model uses these to address the patient by name.
              </p>
              <div className="mt-6">
                <VisitForm
                  value={state.metadata}
                  onChange={(metadata) => dispatch({ type: "set_metadata", metadata })}
                  disabled={inputsDisabled}
                />
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[color-mix(in_oklch,var(--mint)_55%,var(--card))] to-[color-mix(in_oklch,var(--cream)_55%,var(--card))] p-6 ring-1 ring-[color-mix(in_oklch,var(--sage-deep)_15%,transparent)] sm:p-7">
              <div className="absolute right-4 top-4 text-[10px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]/80">
                02 · Dictation
              </div>
              <h2 className="mt-2 font-display text-2xl leading-tight">
                Speak the visit.{" "}
                <span className="font-display-italic text-[color:var(--sage-deep)]">
                  Loosely.
                </span>
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Subjective findings, exam, assessment, plan. Don&rsquo;t worry
                about structure — the model will sort it.
              </p>
              <div className="mt-6">
                <Recorder
                  onComplete={(audio) => runPipeline(audio, state.metadata)}
                  disabled={inputsDisabled}
                />
              </div>
              {state.stage === "error" && state.error && (
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/8 p-4 text-sm">
                  <p className="text-destructive">{state.error}</p>
                  {state.audio && (
                    <div>
                      <Button variant="outline" size="sm" onClick={retry}>
                        Retry without re-recording
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {/* PROCESSING — VERTICAL TIMELINE */}
        {(state.stage === "transcribing" || state.stage === "summarizing") && (
          <div className="grid gap-6 lg:grid-cols-[0.6fr_1.4fr]">
            <aside className="relative hidden overflow-hidden rounded-[24px] bg-gradient-to-br from-[color-mix(in_oklch,var(--mint)_60%,var(--card))] to-[color-mix(in_oklch,var(--cream)_60%,var(--card))] p-7 ring-1 ring-[color-mix(in_oklch,var(--sage-deep)_15%,transparent)] lg:block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]/80">
                In progress
              </span>
              <h2 className="mt-2 font-display text-3xl leading-tight">
                Just a{" "}
                <span className="font-display-italic text-[color:var(--sage-deep)]">
                  moment.
                </span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The audio is being processed locally and sent only to the model
                provider. Nothing is written to disk on our side.
              </p>
              <div className="mt-10 flex items-center gap-3">
                <div className="relative grid size-12 place-items-center">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[color:var(--sage)]/30" />
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-[color:var(--sage)]/20 [animation-delay:600ms]" />
                  <span className="relative size-3 rounded-full bg-[color:var(--sage-deep)]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  live
                </span>
              </div>
            </aside>

            <section className="relative overflow-hidden rounded-[24px] bg-card p-7 ring-1 ring-border/70 sm:p-9">
              <ol className="relative space-y-7 pl-10 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-px before:bg-[color-mix(in_oklch,var(--sage-deep)_22%,transparent)]">
                {steps.map((s, i) => {
                  const isDone = i < stageIndex;
                  const isActive = i === stageIndex;
                  return (
                    <li key={s.key} className="relative">
                      <span
                        className={`absolute -left-10 top-0 grid size-[30px] place-items-center rounded-full ring-[4px] ${
                          isDone
                            ? "bg-[color:var(--sage-deep)] text-[color:var(--primary-foreground)] ring-[color-mix(in_oklch,var(--mint)_80%,transparent)]"
                            : isActive
                            ? "bg-[color:var(--clay)] text-foreground ring-[color-mix(in_oklch,var(--clay)_30%,transparent)]"
                            : "bg-secondary text-muted-foreground ring-[color:var(--background)]"
                        }`}
                      >
                        {isDone ? (
                          <Check className="size-4" strokeWidth={2.4} />
                        ) : isActive ? (
                          <CircleDot className="size-3.5 animate-pulse" />
                        ) : (
                          <span className="text-[11px] font-medium">{i + 1}</span>
                        )}
                      </span>
                      <div className="flex items-baseline justify-between gap-3">
                        <h3
                          className={`font-display text-xl ${
                            isActive
                              ? "text-[color:var(--sage-deep)]"
                              : isDone
                              ? "text-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {s.title}
                        </h3>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--clay)]/20 px-2.5 py-0.5 text-[11px] font-medium text-[color:var(--clay)]">
                            <Clock className="size-3" /> working…
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]/80">
                            done
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {s.blurb}
                      </p>
                      {isActive && i === 1 && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
                          <Waves className="size-3.5 animate-pulse text-[color:var(--sage-deep)]" />
                          Transcribing dictation
                        </div>
                      )}
                      {isActive && i === 2 && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
                          <Sparkles className="size-3.5 animate-pulse text-[color:var(--sage-deep)]" />
                          Drafting SOAP note + patient handout
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
        )}

        {/* REVIEW */}
        {state.stage === "review" && (
          <div className="grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
            <section className="relative overflow-hidden rounded-[24px] bg-card p-6 ring-1 ring-border/70 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    04 · Review &amp; edit
                  </span>
                  <h2 className="mt-2 font-display text-3xl leading-tight">
                    Your draft, in{" "}
                    <span className="font-display-italic text-[color:var(--sage-deep)]">
                      your hands.
                    </span>
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    The AI draft is editable. Changes appear in the downloaded
                    PDFs. Nothing is sent or saved until you export.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => dispatch({ type: "reset" })}
                  className="gap-2"
                >
                  <RefreshCw className="size-4" />
                  Start new visit
                </Button>
              </div>

              <div className="mt-6">
                <SummaryReview
                  value={state.summary}
                  onChange={(summary) => dispatch({ type: "edit_summary", summary })}
                />
              </div>
            </section>

            <aside className="relative flex flex-col gap-4 overflow-hidden rounded-[24px] bg-gradient-to-br from-[color-mix(in_oklch,var(--mint)_60%,var(--card))] to-[color-mix(in_oklch,var(--cream)_60%,var(--card))] p-6 ring-1 ring-[color-mix(in_oklch,var(--sage-deep)_15%,transparent)] sm:p-7">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]/80">
                Export
              </span>
              <h3 className="font-display text-2xl leading-tight">
                Two PDFs,{" "}
                <span className="font-display-italic text-[color:var(--sage-deep)]">
                  one signature.
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Hand the patient handout to your patient. Drop the SOAP note in
                their chart.
              </p>

              <div className="mt-2 flex flex-col gap-2.5">
                <PDFDownloadLink
                  document={
                    <HandoutDocument
                      handout={state.summary.handout}
                      metadata={state.metadata}
                    />
                  }
                  fileName={`patient-handout${fileSlug}.pdf`}
                >
                  {({ loading }) => (
                    <button
                      disabled={loading}
                      className="group flex w-full items-center justify-between rounded-2xl bg-[color:var(--sage-deep)] px-5 py-4 text-left text-[color:var(--primary-foreground)] transition-all hover:opacity-95 disabled:opacity-60"
                    >
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">
                          For the patient
                        </div>
                        <div className="mt-0.5 font-display text-lg leading-tight">
                          {loading ? "Preparing…" : "Patient handout"}
                        </div>
                      </div>
                      <FileDown className="size-5 transition-transform group-hover:translate-y-0.5" />
                    </button>
                  )}
                </PDFDownloadLink>

                <PDFDownloadLink
                  document={
                    <SoapDocument
                      soap={state.summary.soap}
                      metadata={state.metadata}
                    />
                  }
                  fileName={`soap-note${fileSlug}.pdf`}
                >
                  {({ loading }) => (
                    <button
                      disabled={loading}
                      className="group flex w-full items-center justify-between rounded-2xl border border-[color:var(--sage-deep)]/35 bg-card/70 px-5 py-4 text-left text-foreground transition-all hover:bg-card disabled:opacity-60"
                    >
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          For the chart
                        </div>
                        <div className="mt-0.5 font-display text-lg leading-tight">
                          {loading ? "Preparing…" : "Clinical SOAP note"}
                        </div>
                      </div>
                      <FileDown className="size-5 text-[color:var(--sage-deep)] transition-transform group-hover:translate-y-0.5" />
                    </button>
                  )}
                </PDFDownloadLink>
              </div>

              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                PDFs are generated in your browser. Audio is discarded after the
                draft is built.
              </p>
            </aside>
          </div>
        )}
      </section>

      {/* HOW IT WORKS — only on idle */}
      {(state.stage === "idle" || state.stage === "error") && (
        <section
          id="how"
          className="mx-auto mt-24 w-full max-w-6xl px-5 sm:px-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]/80">
                How it works
              </span>
              <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                Four steps,{" "}
                <span className="font-display-italic text-[color:var(--sage-deep)]">
                  finished
                </span>{" "}
                before your coffee gets cold.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              MedScribe is built for the moment right after a patient leaves the
              room — when memory is sharpest and time is shortest.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <article
                key={s.key}
                className="group relative overflow-hidden rounded-[22px] bg-card p-6 ring-1 ring-border/70 transition-all hover:-translate-y-0.5 hover:ring-[color:var(--sage-deep)]/30"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    0{i + 1}
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-[color-mix(in_oklch,var(--mint)_60%,transparent)] text-[color:var(--sage-deep)]">
                    <s.icon className="size-4" strokeWidth={1.8} />
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl">
                  {s.title}
                  <span className="font-display-italic text-[color:var(--sage-deep)]">
                    .
                  </span>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.blurb}
                </p>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 -right-12 size-32 rounded-full bg-[color:var(--mint)]/50 blur-2xl transition-opacity group-hover:opacity-100 opacity-60"
                />
              </article>
            ))}
          </div>

          {/* Reassurance band */}
          <div className="mt-14 grid gap-0 overflow-hidden rounded-[28px] bg-[color:var(--sage-deep)] text-[color:var(--primary-foreground)] sm:grid-cols-3">
            <div className="border-b border-white/10 p-8 sm:border-b-0 sm:border-r">
              <div className="text-[11px] uppercase tracking-[0.18em] opacity-60">
                Local capture
              </div>
              <h4 className="mt-3 font-display text-2xl leading-tight">
                Audio never lands{" "}
                <span className="font-display-italic">on our servers.</span>
              </h4>
              <p className="mt-3 text-sm opacity-80">
                The browser streams the recording directly to the transcription
                provider; we don&rsquo;t persist it.
              </p>
            </div>
            <div className="border-b border-white/10 p-8 sm:border-b-0 sm:border-r">
              <div className="text-[11px] uppercase tracking-[0.18em] opacity-60">
                Editable everywhere
              </div>
              <h4 className="mt-3 font-display text-2xl leading-tight">
                Every field is{" "}
                <span className="font-display-italic">a draft.</span>
              </h4>
              <p className="mt-3 text-sm opacity-80">
                Tweak medications, follow-up, red flags. The PDFs render exactly
                what you see on the screen.
              </p>
            </div>
            <div className="p-8">
              <div className="text-[11px] uppercase tracking-[0.18em] opacity-60">
                Built for clinicians
              </div>
              <h4 className="mt-3 font-display text-2xl leading-tight">
                Two documents,{" "}
                <span className="font-display-italic">two audiences.</span>
              </h4>
              <p className="mt-3 text-sm opacity-80">
                The SOAP note speaks chart. The handout speaks plain English to
                the patient who just walked out.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
