"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { Medication, SummaryResponse } from "@/lib/schema";

type Props = {
  value: SummaryResponse;
  onChange: (next: SummaryResponse) => void;
};

function Field({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
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
      <TabsList>
        <TabsTrigger value="handout">Patient handout</TabsTrigger>
        <TabsTrigger value="soap">Clinical (SOAP)</TabsTrigger>
      </TabsList>

      <TabsContent value="handout" className="space-y-4 pt-4">
        <Field
          label="Greeting"
          value={value.handout.greeting}
          onChange={(v) => setHandout("greeting", v)}
          rows={2}
        />
        <Field
          label="What we discussed"
          value={value.handout.whatWeDiscussed}
          onChange={(v) => setHandout("whatWeDiscussed", v)}
        />
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Medications</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addMed}
              className="gap-1.5"
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>

          {value.handout.medications.length === 0 ? (
            <p className="rounded-md border border-dashed bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
              No medications listed.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {value.handout.medications.map((m, i) => (
                <div
                  key={i}
                  className="grid gap-2 rounded-md border bg-card p-3 sm:grid-cols-[1fr_1fr_2fr_auto]"
                >
                  <Input
                    placeholder="Name"
                    value={m.name}
                    onChange={(e) => setMed(i, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Dosage"
                    value={m.dosage}
                    onChange={(e) => setMed(i, "dosage", e.target.value)}
                  />
                  <Input
                    placeholder="Instructions"
                    value={m.instructions}
                    onChange={(e) => setMed(i, "instructions", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMed(i)}
                    aria-label="Remove medication"
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
          label="Red flags (when to seek urgent care)"
          value={value.handout.redFlags}
          onChange={(v) => setHandout("redFlags", v)}
        />
        <Field
          label="Questions for next time"
          value={value.handout.questionsForNextTime}
          onChange={(v) => setHandout("questionsForNextTime", v)}
        />
      </TabsContent>

      <TabsContent value="soap" className="space-y-4 pt-4">
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
