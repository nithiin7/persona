"use client";

import { Resume } from "@/lib/types";
import {
  Page as PDFPage,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import { memo, useMemo } from "react";

// Classic template: Traditional, professional layout
function createClassicStyles(settings: Resume["document_settings"]) {
  return StyleSheet.create({
    page: {
      padding: settings?.document_margin_vertical || 36,
      paddingHorizontal: settings?.document_margin_horizontal || 36,
      fontSize: settings?.document_font_size || 10,
      lineHeight: settings?.document_line_height || 1.5,
      fontFamily: "Helvetica",
    },
    header: {
      marginBottom: settings?.header_name_bottom_spacing || 24,
      borderBottomWidth: 2,
      borderBottomColor: "#1f2937",
      paddingBottom: 8,
    },
    name: {
      fontSize: settings?.header_name_size || 24,
      fontFamily: "Helvetica-Bold",
      marginBottom: 4,
    },
    contactInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      fontSize: 9,
      color: "#4b5563",
      marginTop: 4,
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      color: "#1f2937",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      paddingBottom: 2,
    },
    bulletSeparator: {
      marginHorizontal: 4,
    },
    link: {
      color: "#2563eb",
      textDecoration: "none",
    },
  });
}

interface ClassicTemplateProps {
  resume: Resume;
  children: React.ReactNode;
}

export const ClassicTemplate = memo(function ClassicTemplate({
  resume,
  children,
}: ClassicTemplateProps) {
  const styles = useMemo(
    () => createClassicStyles(resume.document_settings),
    [resume.document_settings]
  );

  return (
    <PDFPage size="LETTER" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {resume.first_name} {resume.last_name}
        </Text>
        <View style={styles.contactInfo}>
          {resume.location && (
            <>
              <Text>{resume.location}</Text>
              <Text style={styles.bulletSeparator}>•</Text>
            </>
          )}
          {resume.email && (
            <>
              <Link src={`mailto:${resume.email}`} style={styles.link}>
                {resume.email}
              </Link>
              <Text style={styles.bulletSeparator}>•</Text>
            </>
          )}
          {resume.phone_number && <Text>{resume.phone_number}</Text>}
        </View>
      </View>

      {/* Content sections passed as children */}
      {children}
    </PDFPage>
  );
});

