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

const QUICK_COMPLAINTS = [
  "Sore throat for 3 days",
  "Annual checkup",
  "Follow-up · hypertension",
  "Lower back pain",
  "Med review",
  "Persistent cough",
];

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
        <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
          {QUICK_COMPLAINTS.map((label) => {
            const isActive = value.chiefComplaint === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => set("chiefComplaint", label)}
                disabled={disabled}
                className={`group inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium transition-all disabled:opacity-50 ${
                  isActive
                    ? "border-[color:var(--sage-deep)] bg-[color:var(--sage-deep)] text-[color:var(--primary-foreground)]"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:border-[color:var(--sage-deep)]/40 hover:bg-[color-mix(in_oklch,var(--mint)_45%,var(--background))] hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
