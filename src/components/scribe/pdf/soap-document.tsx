import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { SoapNote, VisitMetadata } from "@/lib/schema";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#111",
    lineHeight: 1.5,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 10,
    color: "#555",
    marginBottom: 18,
  },
  metaItem: { marginRight: 12 },
  rule: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginBottom: 4,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#222",
  },
  body: { marginBottom: 8 },
  empty: { color: "#888", fontStyle: "italic" },
});

export function SoapDocument({
  soap,
  metadata,
}: {
  soap: SoapNote;
  metadata: VisitMetadata;
}) {
  const Section = ({ title, text }: { title: string; text: string }) => (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {text.trim() ? (
        <Text style={styles.body}>{text}</Text>
      ) : (
        <Text style={[styles.body, styles.empty]}>—</Text>
      )}
    </View>
  );

  return (
    <Document title={`SOAP note - ${metadata.patientName || "Visit"}`}>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Clinical visit note (SOAP)</Text>
        <View style={styles.metaRow}>
          {metadata.patientName ? (
            <Text style={styles.metaItem}>Patient: {metadata.patientName}</Text>
          ) : null}
          {metadata.visitDate ? (
            <Text style={styles.metaItem}>Date: {metadata.visitDate}</Text>
          ) : null}
          {metadata.chiefComplaint ? (
            <Text style={styles.metaItem}>
              Chief complaint: {metadata.chiefComplaint}
            </Text>
          ) : null}
        </View>
        <View style={styles.rule} />

        <Section title="Subjective" text={soap.subjective} />
        <Section title="Objective" text={soap.objective} />
        <Section title="Assessment" text={soap.assessment} />
        <Section title="Plan" text={soap.plan} />
      </Page>
    </Document>
  );
}
