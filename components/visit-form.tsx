"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VisitMetadata } from "@/lib/schema";

type Props = {
  value: VisitMetadata;
  onChange: (next: VisitMetadata) => void;
  disabled?: boolean;
};

export function VisitForm({ value, onChange, disabled }: Props) {
  const set = <K extends keyof VisitMetadata>(key: K, v: VisitMetadata[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="patient-name">Patient name</Label>
        <Input
          id="patient-name"
          placeholder="e.g. Jane Doe"
          value={value.patientName}
          onChange={(e) => set("patientName", e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="visit-date">Visit date</Label>
        <Input
          id="visit-date"
          type="date"
          value={value.visitDate}
          onChange={(e) => set("visitDate", e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="chief-complaint">Chief complaint (optional)</Label>
        <Input
          id="chief-complaint"
          placeholder='e.g. "Sore throat for 3 days"'
          value={value.chiefComplaint}
          onChange={(e) => set("chiefComplaint", e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
