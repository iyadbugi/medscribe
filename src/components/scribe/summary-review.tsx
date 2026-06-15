"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileText, Stethoscope } from "lucide-react";
import type { Medication, SummaryResponse } from "@/lib/schema";

type Props = {
  value: SummaryResponse;
  onChange: (next: SummaryResponse) => void;
};

const inputClass =
  "rounded-xl border-border/70 bg-background/60 focus-visible:border-[color:var(--sage-deep)] focus-visible:ring-[color:var(--sage-deep)]/15";

const textareaClass = `${inputClass} min-h-[88px] text-[15px] leading-relaxed px-3.5 py-3 md:text-sm`;

function Field({
  label,
  hint,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </Label>
        {hint && (
          <span className="text-[11px] text-muted-foreground/70">{hint}</span>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={textareaClass}
      />
    </div>
  );
}

export function SummaryReview({ value, onChange }: Props) {
  const setSoap = (key: keyof SummaryResponse["soap"], v: string) =>
    onChange({ ...value, soap: { ...value.soap, [key]: v } });

  const setHandout = <K extends keyof SummaryResponse["handout"]>(
    key: K,
    v: SummaryResponse["handout"][K]
  ) => onChange({ ...value, handout: { ...value.handout, [key]: v } });

  const setMed = (i: number, key: keyof Medication, v: string) => {
    const next = value.handout.medications.map((m, idx) =>
      idx === i ? { ...m, [key]: v } : m
    );
    setHandout("medications", next);
  };

  const addMed = () =>
    setHandout("medications", [
      ...value.handout.medications,
      { name: "", dosage: "", instructions: "" },
    ]);

  const removeMed = (i: number) =>
    setHandout(
      "medications",
      value.handout.medications.filter((_, idx) => idx !== i)
    );

  return (
    <Tabs defaultValue="handout" className="w-full">
      <TabsList className="h-11 gap-1 rounded-full bg-secondary/70 p-1">
        <TabsTrigger
          value="handout"
          className="h-9 gap-2 rounded-full px-4 text-sm data-active:bg-card data-active:shadow-sm"
        >
          <FileText className="size-3.5" />
          Patient handout
        </TabsTrigger>
        <TabsTrigger
          value="soap"
          className="h-9 gap-2 rounded-full px-4 text-sm data-active:bg-card data-active:shadow-sm"
        >
          <Stethoscope className="size-3.5" />
          Clinical (SOAP)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="handout" className="space-y-5 pt-5">
        <Field
          label="Greeting"
          hint="Used at the top of the handout"
          value={value.handout.greeting}
          onChange={(v) => setHandout("greeting", v)}
          rows={2}
        />
        <Field
          label="What we discussed"
          value={value.handout.whatWeDiscussed}
          onChange={(v) => setHandout("whatWeDiscussed", v)}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Diagnosis"
            value={value.handout.diagnosis}
            onChange={(v) => setHandout("diagnosis", v)}
          />
          <Field
            label="Treatment plan"
            value={value.handout.treatmentPlan}
            onChange={(v) => setHandout("treatmentPlan", v)}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Medications
              </Label>
              <p className="mt-0.5 text-[12px] text-muted-foreground/80">
                Name, dose, and how to take it.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addMed}
              className="gap-1.5 rounded-full"
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>

          {value.handout.medications.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/70 bg-card/40 px-3 py-5 text-center text-sm text-muted-foreground">
              No medications listed.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {value.handout.medications.map((m, i) => (
                <div
                  key={i}
                  className="grid gap-2 rounded-xl border border-border/60 bg-card p-3 sm:grid-cols-[1fr_1fr_2fr_auto]"
                >
                  <Input
                    placeholder="Name"
                    value={m.name}
                    onChange={(e) => setMed(i, "name", e.target.value)}
                    className={`h-9 ${inputClass}`}
                  />
                  <Input
                    placeholder="Dosage"
                    value={m.dosage}
                    onChange={(e) => setMed(i, "dosage", e.target.value)}
                    className={`h-9 ${inputClass}`}
                  />
                  <Input
                    placeholder="Instructions"
                    value={m.instructions}
                    onChange={(e) => setMed(i, "instructions", e.target.value)}
                    className={`h-9 ${inputClass}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMed(i)}
                    aria-label="Remove medication"
                    className="rounded-full"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Field
          label="Follow-up"
          value={value.handout.followUp}
          onChange={(v) => setHandout("followUp", v)}
        />
        <Field
          label="Red flags"
          hint="When to seek urgent care"
          value={value.handout.redFlags}
          onChange={(v) => setHandout("redFlags", v)}
        />
        <Field
          label="Questions for next time"
          value={value.handout.questionsForNextTime}
          onChange={(v) => setHandout("questionsForNextTime", v)}
        />
      </TabsContent>

      <TabsContent value="soap" className="space-y-5 pt-5">
        <Field
          label="Subjective"
          value={value.soap.subjective}
          onChange={(v) => setSoap("subjective", v)}
          rows={4}
        />
        <Field
          label="Objective"
          value={value.soap.objective}
          onChange={(v) => setSoap("objective", v)}
          rows={4}
        />
        <Field
          label="Assessment"
          value={value.soap.assessment}
          onChange={(v) => setSoap("assessment", v)}
          rows={4}
        />
        <Field
          label="Plan"
          value={value.soap.plan}
          onChange={(v) => setSoap("plan", v)}
          rows={4}
        />
      </TabsContent>
    </Tabs>
  );
}
