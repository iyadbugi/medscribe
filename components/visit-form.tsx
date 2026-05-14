"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VisitMetadata } from "@/lib/schema";

type Props = {
  value: VisitMetadata;
  onChange: (next: VisitMetadata) => void;
  disabled?: boolean;
};

const fieldClass =
  "h-11 rounded-xl border-border/70 bg-background/60 px-3.5 text-[15px] focus-visible:border-[color:var(--sage-deep)] focus-visible:ring-[color:var(--sage-deep)]/15 md:text-sm";

const labelClass =
  "text-[11px] uppercase tracking-[0.16em] text-muted-foreground";

export function VisitForm({ value, onChange, disabled }: Props) {
  const set = <K extends keyof VisitMetadata>(key: K, v: VisitMetadata[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="patient-name" className={labelClass}>
          Patient name
        </Label>
        <Input
          id="patient-name"
          placeholder="e.g. Jane Doe"
          value={value.patientName}
          onChange={(e) => set("patientName", e.target.value)}
          disabled={disabled}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="visit-date" className={labelClass}>
          Visit date
        </Label>
        <Input
          id="visit-date"
          type="date"
          value={value.visitDate}
          onChange={(e) => set("visitDate", e.target.value)}
          disabled={disabled}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="chief-complaint" className={labelClass}>
          Chief complaint{" "}
          <span className="ml-1 normal-case tracking-normal text-muted-foreground/70">
            (optional)
          </span>
        </Label>
        <Input
          id="chief-complaint"
          placeholder='e.g. "Sore throat for 3 days"'
          value={value.chiefComplaint}
          onChange={(e) => set("chiefComplaint", e.target.value)}
          disabled={disabled}
          className={fieldClass}
        />
      </div>
    </div>
  );
}
