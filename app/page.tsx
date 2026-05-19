"use client";

import { useEffect, useReducer, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
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
  ShieldCheck,
  MicVocal,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Recorder } from "@/components/recorder";
import { VisitForm } from "@/components/visit-form";
import { SummaryReview } from "@/components/summary-review";
import { SoapDocument } from "@/components/pdf/soap-document";
import { HandoutDocument } from "@/components/pdf/handout-document";
import { PrivacyFeatures } from "@/components/privacy-features";
import { HowItWorks } from "@/components/how-it-works";
import { ClosingCta } from "@/components/closing-cta";
import Grainient from "@/components/Grainient";
import { BlurText } from "@/components/motion/blur-text";
import { Section, Container } from "@/components/section";
import {
  emptySummary,
  type SummaryResponse,
  type VisitMetadata,
} from "@/lib/schema";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
);

const ExplainerPlayer = dynamic(
  () => import("@/components/explainer-player").then((m) => m.ExplainerPlayer),
  { ssr: false, loading: () => <div className="aspect-[3/2] w-full rounded-[28px] bg-[color:var(--secondary)]" /> }
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

const marqueeItems = [
  { icon: ShieldCheck, label: "Audio stays in your browser" },
  { icon: MicVocal, label: "One pass dictation" },
  { icon: FileText, label: "SOAP + patient handout in one go" },
  { icon: Stethoscope, label: "Edit before export" },
  { icon: ShieldCheck, label: "No PHI written to disk" },
  { icon: MicVocal, label: "Works after the visit, not during" },
];

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
  const stageSectionRef = useRef<HTMLDivElement | null>(null);
  const prevStageRef = useRef(state.stage);
  const lenis = useLenis();

  useEffect(() => {
    const prev = prevStageRef.current;
    prevStageRef.current = state.stage;
    if (prev === state.stage) return;
    if (state.stage === "idle") {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = stageSectionRef.current;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -80 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state.stage, lenis]);

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
        <section className="relative flex w-full min-h-[100svh] flex-col overflow-hidden bg-[linear-gradient(135deg,#a8c0de_0%,#cadcf5_50%,#e4ecf7_100%)]">
          <div className="pointer-events-none absolute inset-0 z-0">
            <Grainient
              color1="#a8c0de"
              color2="#cadcf5"
              color3="#e4ecf7"
              timeSpeed={0.25}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5}
              warpSpeed={2}
              warpAmplitude={50}
              blendAngle={0}
              blendSoftness={0.05}
              rotationAmount={500}
              noiseScale={2}
              grainAmount={0.1}
              grainScale={2}
              grainAnimated={false}
              contrast={1.5}
              gamma={1}
              saturation={1}
              centerX={0}
              centerY={0}
              zoom={0.9}
            />
          </div>
          <div className="relative z-10 flex flex-1 flex-col justify-center pt-20 pb-0 sm:pt-24 sm:pb-24">
          <div className="mx-auto grid w-full max-w-[1400px] gap-y-2 px-5 sm:gap-y-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-x-12 lg:gap-y-0 lg:[grid-template-areas:'upper_anim'_'lower_anim']">
            {/* Headline + lede */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-10% 0px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0 text-center lg:text-left lg:[grid-area:upper] lg:self-end"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_oklch,var(--clay)_38%,transparent)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--sage-deep)] sm:px-3 sm:py-1.5 sm:text-[11px]">
                <Stethoscope className="size-3.5" strokeWidth={1.8} />
                For clinicians · after the visit
              </span>
              <h1 className="mt-4 font-display text-balance text-[2.4rem] leading-[1.04] tracking-[-0.04em] text-foreground sm:mt-6 sm:text-[3.1rem] sm:leading-[1] md:text-[3.6rem] lg:text-[3.6rem] xl:text-[4.2rem]">
                Walk out with the note{" "}
                <span className="font-display-italic text-[color:var(--sage-deep)]">
                  already written.
                </span>
              </h1>
              <p className="mt-3 mx-auto max-w-xl text-sm leading-snug text-muted-foreground sm:hidden">
                Dictate a short summary. MedScribe returns an editable SOAP
                note
                <br />
                and a patient handout — in under a minute.
              </p>
              <p className="mt-3 hidden max-w-xl text-pretty text-sm leading-snug text-muted-foreground sm:mt-6 sm:block sm:text-lg sm:leading-relaxed lg:mx-0">
                Dictate a short post-visit summary. MedScribe returns an
                editable SOAP note and a plain-English handout, both
                downloadable as PDF in under a minute.
              </p>
            </motion.div>

            {/* Animation — between text and CTA on mobile, right column on desktop */}
            <motion.a
              href="#start"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-10% 0px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
              className="relative -mt-4 mx-auto block aspect-[5/4] w-full min-w-0 max-w-[360px] overflow-hidden sm:-mt-0 sm:max-w-[420px] md:max-w-[480px] lg:max-w-[560px] lg:-translate-y-2 lg:[grid-area:anim] xl:max-w-[620px]"
              aria-label="Watch the explainer and start the demo"
            >
              <ExplainerPlayer />
            </motion.a>

            {/* CTA + stats */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-10% 0px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
              className="min-w-0 text-center lg:text-left lg:[grid-area:lower] lg:self-start lg:pt-8"
            >
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5 sm:justify-center lg:justify-start">
                <a
                  href="#start"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--sage-deep)] px-7 text-base font-medium text-[color:var(--primary-foreground)] shadow-[0_12px_30px_-14px_color-mix(in_oklch,var(--sage-deep)_60%,transparent)] hover:shadow-[0_16px_40px_-14px_color-mix(in_oklch,var(--sage-deep)_70%,transparent)] transition-all sm:h-14 sm:px-8"
                >
                  Start the demo
                  <ArrowRight className="size-4" strokeWidth={1.8} />
                </a>
                <a
                  href="#how"
                  className="self-center text-sm font-medium text-foreground/70 underline decoration-[color-mix(in_oklch,var(--sage-deep)_30%,transparent)] decoration-2 underline-offset-[6px] hover:text-foreground hover:decoration-[color:var(--sage-deep)] transition-colors sm:self-auto"
                >
                  How it works
                </a>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-6 border-t border-border/60 pt-3 sm:mt-10 sm:gap-8 sm:pt-6">
                {[
                  { k: "~40s", v: "avg draft time" },
                  { k: "2 docs", v: "SOAP + handout" },
                ].map((s) => (
                  <div key={s.v}>
                    <dt className="font-display text-2xl tracking-[-0.03em] text-foreground sm:text-3xl">
                      {s.k}
                    </dt>
                    <dd className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
                      {s.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </div>
          </div>
          <div className="relative z-10 overflow-hidden border-y border-[color-mix(in_oklch,var(--sage-deep)_10%,transparent)] bg-white">
            <div className="animate-marquee flex w-max gap-10 py-2.5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]/70">
              {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((it, i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                  <it.icon className="size-3.5 opacity-70" strokeWidth={1.6} />
                  <span className="font-medium">{it.label}</span>
                  <span className="opacity-40">·</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ACTIVE STAGE — STEP RAIL + FOCAL CARD (full-bleed treated band) */}
      <Section id="start" className="relative isolate bg-card pt-24 md:pt-24 lg:pt-28">
        <Container ref={stageSectionRef}>
          <BlurText
            as="h2"
            delay={0.04}
            className="mb-5 max-w-3xl font-display text-3xl leading-[1.02] tracking-[-0.03em] text-foreground sm:text-4xl md:text-5xl"
          >
            Speak it once.{" "}
            <span className="font-display-italic text-[color:var(--sage-deep)]">Done.</span>
          </BlurText>
        {/* Stage rail (horizontal) */}
        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
          {steps.map((s, i) => {
            const isActive = i === stageIndex;
            const isDone = i < stageIndex;
            return (
              <span key={s.key} className="flex items-center gap-2">
                <span className="relative grid place-items-center">
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-0 -m-1 animate-pulse-ring rounded-full bg-[color:var(--clay)]/30"
                    />
                  )}
                  <span
                    className={`relative grid size-5 place-items-center rounded-full text-[10px] font-medium transition-colors duration-300 ${
                      isDone
                        ? "bg-[color:var(--sage-deep)] text-[color:var(--primary-foreground)]"
                        : isActive
                        ? "bg-[color:var(--clay)] text-[color:var(--primary-foreground)]"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {isDone ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="flex"
                        >
                          <Check className="size-3" strokeWidth={2.4} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="num"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {i + 1}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </span>
                <span
                  className={`uppercase tracking-[0.14em] transition-colors duration-300 ${
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
                  <span className="relative mx-1 h-px w-6 overflow-hidden bg-border sm:w-10">
                    <motion.span
                      aria-hidden
                      className="absolute inset-y-0 left-0 bg-[color:var(--sage-deep)]"
                      initial={false}
                      animate={{ width: i < stageIndex ? "100%" : "0%" }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* IDLE / ERROR — VISIT FORM + RECORDER */}
        {(state.stage === "idle" || state.stage === "error") && (
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-10% 0px", once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="relative overflow-hidden rounded-[24px] bg-card p-5 ring-1 ring-border/70 shadow-[0_30px_60px_-40px_color-mix(in_oklch,var(--sage-deep)_45%,transparent)] sm:p-6"
            >
              <div className="absolute right-4 top-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                01 · Visit details
              </div>
              <BlurText
                as="h2"
                delay={0.05}
                className="mt-1 font-display text-xl leading-tight tracking-[-0.03em] sm:text-2xl"
              >
                Who and <span className="text-[color:var(--sage-deep)]">when.</span>
              </BlurText>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional. The model uses these to address the patient by name.
              </p>
              <div className="mt-4">
                <VisitForm
                  value={state.metadata}
                  onChange={(metadata) => dispatch({ type: "set_metadata", metadata })}
                  disabled={inputsDisabled}
                />
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-10% 0px", once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="relative flex flex-col overflow-hidden rounded-[24px] bg-gradient-to-br from-[color-mix(in_oklch,var(--mint)_55%,var(--card))] via-[color-mix(in_oklch,var(--mint)_20%,var(--card))] to-[color:var(--card)] p-5 ring-1 ring-[color-mix(in_oklch,var(--sage-deep)_15%,transparent)] shadow-[0_40px_80px_-40px_color-mix(in_oklch,var(--sage-deep)_55%,transparent)] sm:p-6"
            >
              <div className="absolute right-4 top-4 text-[10px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]/80">
                02 · Dictation
              </div>
              <BlurText
                as="h2"
                delay={0.15}
                className="mt-1 font-display text-xl leading-tight tracking-[-0.03em] sm:text-2xl"
              >
                Speak the visit. <span className="text-[color:var(--sage-deep)]">Loosely.</span>
              </BlurText>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Subjective findings, exam, assessment, plan. Don&rsquo;t worry
                about structure — the model will sort it.
              </p>
              <div className="mt-4 flex flex-1 flex-col">
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
            </motion.section>
          </div>
        )}

        {/* PROCESSING — VERTICAL TIMELINE */}
        {(state.stage === "transcribing" || state.stage === "summarizing") && (
          <div className="grid gap-6 lg:grid-cols-[0.6fr_1.4fr]">
            <aside className="relative hidden overflow-hidden rounded-[24px] bg-gradient-to-br from-[color-mix(in_oklch,var(--mint)_55%,var(--card))] to-[color:var(--card)] p-7 ring-1 ring-[color-mix(in_oklch,var(--sage-deep)_15%,transparent)] lg:block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]/80">
                In progress
              </span>
              <h2 className="mt-2 font-display text-3xl leading-tight tracking-[-0.03em]">
                Just a <span className="text-[color:var(--sage-deep)]">moment.</span>
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
                            ? "bg-[color:var(--clay)] text-[color:var(--primary-foreground)] ring-[color-mix(in_oklch,var(--clay)_30%,transparent)]"
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
                  <h2 className="mt-2 font-display text-3xl leading-tight tracking-[-0.03em]">
                    Your draft, in <span className="text-[color:var(--sage-deep)]">your hands.</span>
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

            <aside className="relative flex flex-col gap-4 overflow-hidden rounded-[24px] bg-gradient-to-br from-[color-mix(in_oklch,var(--mint)_55%,var(--card))] to-[color:var(--card)] p-6 ring-1 ring-[color-mix(in_oklch,var(--sage-deep)_15%,transparent)] sm:p-7">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--sage-deep)]/80">
                Export
              </span>
              <h3 className="font-display text-2xl leading-tight tracking-[-0.03em]">
                Two PDFs, <span className="text-[color:var(--sage-deep)]">one signature.</span>
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
        </Container>
      </Section>

      {/* HOW IT WORKS — only on idle */}
      {(state.stage === "idle" || state.stage === "error") && <HowItWorks />}

      {/* PRIVACY — UAE health data law posture (features-style grid) */}
      {(state.stage === "idle" || state.stage === "error") && (
        <PrivacyFeatures />
      )}

      {/* Full-bleed steel-blue band — closing CTA */}
      {(state.stage === "idle" || state.stage === "error") && <ClosingCta />}
    </main>
  );
}
