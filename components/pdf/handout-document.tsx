import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PatientHandout, VisitMetadata } from "@/lib/schema";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 12,
    color: "#111",
    lineHeight: 1.55,
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#666",
    marginBottom: 18,
  },
  greeting: {
    fontSize: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    marginTop: 12,
    marginBottom: 4,
    color: "#0f172a",
  },
  body: { marginBottom: 6 },
  medItem: {
    marginBottom: 6,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#cbd5e1",
  },
  medName: { fontFamily: "Helvetica-Bold" },
  redFlagBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 4,
    backgroundColor: "#fef2f2",
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
  },
  redFlagTitle: {
    fontFamily: "Helvetica-Bold",
    color: "#991b1b",
    marginBottom: 4,
    fontSize: 12,
  },
  redFlagBody: { color: "#7f1d1d" },
  footer: {
    marginTop: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    fontSize: 9,
    color: "#888",
  },
});

export function HandoutDocument({
  handout,
  metadata,
}: {
  handout: PatientHandout;
  metadata: VisitMetadata;
}) {
  const heading = metadata.patientName
    ? `Visit summary for ${metadata.patientName}`
    : "Your visit summary";

  return (
    <Document title={heading}>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{heading}</Text>
        {metadata.visitDate ? (
          <Text style={styles.subtitle}>Visit date: {metadata.visitDate}</Text>
        ) : null}

        {handout.greeting ? (
          <Text style={styles.greeting}>{handout.greeting}</Text>
        ) : null}

        {handout.whatWeDiscussed ? (
          <>
            <Text style={styles.sectionTitle}>What we discussed</Text>
            <Text style={styles.body}>{handout.whatWeDiscussed}</Text>
          </>
        ) : null}

        {handout.diagnosis ? (
          <>
            <Text style={styles.sectionTitle}>Your diagnosis</Text>
            <Text style={styles.body}>{handout.diagnosis}</Text>
          </>
        ) : null}

        {handout.treatmentPlan ? (
          <>
            <Text style={styles.sectionTitle}>Treatment plan</Text>
            <Text style={styles.body}>{handout.treatmentPlan}</Text>
          </>
        ) : null}

        {handout.medications.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Medications</Text>
            {handout.medications.map((m, i) => (
              <View key={i} style={styles.medItem}>
                <Text>
                  <Text style={styles.medName}>{m.name || "(medication)"}</Text>
                  {m.dosage ? <Text> — {m.dosage}</Text> : null}
                </Text>
                {m.instructions ? <Text>{m.instructions}</Text> : null}
              </View>
            ))}
          </>
        ) : null}

        {handout.followUp ? (
          <>
            <Text style={styles.sectionTitle}>Follow-up</Text>
            <Text style={styles.body}>{handout.followUp}</Text>
          </>
        ) : null}

        {handout.redFlags ? (
          <View style={styles.redFlagBox}>
            <Text style={styles.redFlagTitle}>When to seek urgent care</Text>
            <Text style={styles.redFlagBody}>{handout.redFlags}</Text>
          </View>
        ) : null}

        {handout.questionsForNextTime ? (
          <>
            <Text style={styles.sectionTitle}>Questions for next time</Text>
            <Text style={styles.body}>{handout.questionsForNextTime}</Text>
          </>
        ) : null}

        <Text style={styles.footer}>
          This summary is intended as a helpful reference for your visit. It does not
          replace professional medical advice. If you have any concerns, please contact
          your clinic.
        </Text>
      </Page>
    </Document>
  );
}
