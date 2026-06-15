import { z } from "zod";

export const SoapNoteSchema = z.object({
  subjective: z
    .string()
    .describe(
      "The patient's reported history, symptoms, and concerns in their own words. Include onset, quality, duration, severity, and relevant context. Empty string if the dictation contained no subjective information."
    ),
  objective: z
    .string()
    .describe(
      "Measurable findings from the physical exam, vitals, and any in-visit tests. Empty string if the dictation contained no objective findings."
    ),
  assessment: z
    .string()
    .describe(
      "The clinician's diagnostic impression and differential. Empty string if not addressed in the dictation."
    ),
  plan: z
    .string()
    .describe(
      "Treatment plan: medications, procedures, referrals, patient education, and follow-up. Empty string if not addressed."
    ),
});

export const MedicationSchema = z.object({
  name: z.string().describe("Plain medication name (no brand-vs-generic confusion)."),
  dosage: z.string().describe('e.g. "500 mg, 1 tablet". Empty string if unspecified.'),
  instructions: z
    .string()
    .describe(
      'Plain-language instructions, e.g. "Take with food twice a day for 7 days". Empty if unspecified.'
    ),
});

export const PatientHandoutSchema = z.object({
  greeting: z
    .string()
    .describe(
      'A brief friendly opening line addressed to the patient, e.g. "Hi Jane, here is a summary of your visit today.". One sentence.'
    ),
  whatWeDiscussed: z
    .string()
    .describe(
      "A plain-language paragraph describing the visit: why the patient came in and what was covered. ~6th-grade reading level. 2-4 sentences."
    ),
  diagnosis: z
    .string()
    .describe(
      "Plain-language explanation of the diagnosis or working impression. Avoid jargon; if a medical term is needed, define it. Empty string if no diagnosis was made."
    ),
  treatmentPlan: z
    .string()
    .describe(
      "Plain-language summary of the treatment plan beyond medications: lifestyle, procedures, referrals, tests. Empty string if not applicable."
    ),
  medications: z
    .array(MedicationSchema)
    .describe(
      "List of medications prescribed or recommended. Empty array if no medications were discussed."
    ),
  followUp: z
    .string()
    .describe(
      'When and how to follow up, e.g. "Come back in 2 weeks if not improving." Empty string if no follow-up was specified.'
    ),
  redFlags: z
    .string()
    .describe(
      "Warning signs that should prompt the patient to seek urgent care. 1-3 sentences. Empty string only if the dictation explicitly addressed none."
    ),
  questionsForNextTime: z
    .string()
    .describe(
      "1-3 suggested questions the patient might want to ask at follow-up. Empty string if not applicable."
    ),
});

export const SummaryResponseSchema = z.object({
  soap: SoapNoteSchema,
  handout: PatientHandoutSchema,
});

export type SoapNote = z.infer<typeof SoapNoteSchema>;
export type Medication = z.infer<typeof MedicationSchema>;
export type PatientHandout = z.infer<typeof PatientHandoutSchema>;
export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;

export type VisitMetadata = {
  patientName: string;
  visitDate: string;
  chiefComplaint: string;
};

export const emptySummary = (): SummaryResponse => ({
  soap: { subjective: "", objective: "", assessment: "", plan: "" },
  handout: {
    greeting: "",
    whatWeDiscussed: "",
    diagnosis: "",
    treatmentPlan: "",
    medications: [],
    followUp: "",
    redFlags: "",
    questionsForNextTime: "",
  },
});
