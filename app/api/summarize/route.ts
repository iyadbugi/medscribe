import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { SummaryResponseSchema, type VisitMetadata } from "@/lib/schema";
import { SUMMARY_SYSTEM_PROMPT, buildSummaryPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  transcript: string;
  metadata?: Partial<VisitMetadata>;
};

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json(
      { error: "AI_GATEWAY_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const transcript = body.transcript?.trim();
  if (!transcript) {
    return NextResponse.json(
      { error: "Missing 'transcript' in request body." },
      { status: 400 }
    );
  }

  try {
    const { object } = await generateObject({
      model: "anthropic/claude-sonnet-4.6",
      schema: SummaryResponseSchema,
      system: SUMMARY_SYSTEM_PROMPT,
      prompt: buildSummaryPrompt(transcript, body.metadata),
    });

    return NextResponse.json(object);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summarization failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
