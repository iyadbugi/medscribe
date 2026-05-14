"use client";

import { useReducer } from "react";
import dynamic from "next/dynamic";
import { Stethoscope, Loader2, FileDown, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function HomePage() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Stethoscope className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Visit Summarizer</h1>
          <p className="text-sm text-muted-foreground">
            Dictate after the visit. Walk out with a SOAP note and a patient handout.
          </p>
        </div>
      </header>

      {state.stage !== "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Visit details</CardTitle>
            <CardDescription>
              Optional, but the model uses them to address the patient by name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VisitForm
              value={state.metadata}
              onChange={(metadata) => dispatch({ type: "set_metadata", metadata })}
              disabled={inputsDisabled}
            />
          </CardContent>
        </Card>
      )}

      {(state.stage === "idle" || state.stage === "error") && (
        <Card>
          <CardHeader>
            <CardTitle>Dictation</CardTitle>
            <CardDescription>
              Press record and speak a summary of the visit: subjective findings,
              exam, assessment, and plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Recorder
              onComplete={(audio) => runPipeline(audio, state.metadata)}
              disabled={inputsDisabled}
            />
            {state.stage === "error" && state.error && (
              <div className="mt-4 flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
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
          </CardContent>
        </Card>
      )}

      {(state.stage === "transcribing" || state.stage === "summarizing") && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {state.stage === "transcribing"
                ? "Transcribing dictation…"
                : "Drafting SOAP note and patient handout…"}
            </p>
          </CardContent>
        </Card>
      )}

      {state.stage === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review and edit</CardTitle>
            <CardDescription>
              The AI draft is editable. Changes appear in the downloaded PDFs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SummaryReview
              value={state.summary}
              onChange={(summary) => dispatch({ type: "edit_summary", summary })}
            />

            <div className="flex flex-wrap items-center gap-2 border-t pt-4">
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
                  <Button disabled={loading} className="gap-2">
                    <FileDown className="size-4" />
                    {loading ? "Preparing…" : "Download patient handout"}
                  </Button>
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
                  <Button variant="outline" disabled={loading} className="gap-2">
                    <FileDown className="size-4" />
                    {loading ? "Preparing…" : "Download SOAP note"}
                  </Button>
                )}
              </PDFDownloadLink>

              <Button
                variant="ghost"
                onClick={() => dispatch({ type: "reset" })}
                className="ml-auto gap-2"
              >
                <RefreshCw className="size-4" />
                Start new visit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <footer className="pt-2 text-center text-xs text-muted-foreground">
        Prototype — do not use with real patient data.
      </footer>
    </main>
  );
}
