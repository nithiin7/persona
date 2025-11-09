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

// Modern template: Clean, with accent colors and modern spacing
function createModernStyles(settings: Resume["document_settings"]) {
  return StyleSheet.create({
    page: {
      padding: settings?.document_margin_vertical || 32,
      paddingHorizontal: settings?.document_margin_horizontal || 40,
      fontSize: settings?.document_font_size || 10,
      lineHeight: settings?.document_line_height || 1.6,
      fontFamily: "Helvetica",
      backgroundColor: "#ffffff",
    },
    header: {
      marginBottom: settings?.header_name_bottom_spacing || 28,
      backgroundColor: "#f9fafb",
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: "#6366f1",
    },
    name: {
      fontSize: settings?.header_name_size || 28,
      fontFamily: "Helvetica-Bold",
      color: "#1f2937",
      marginBottom: 6,
    },
    contactInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      fontSize: 9,
      color: "#6b7280",
      gap: 8,
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Helvetica-Bold",
      color: "#6366f1",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    bulletSeparator: {
      marginHorizontal: 6,
      color: "#6366f1",
    },
    link: {
      color: "#6366f1",
      textDecoration: "none",
    },
  });
}

interface ModernTemplateProps {
  resume: Resume;
  children: React.ReactNode;
}

export const ModernTemplate = memo(function ModernTemplate({
  resume,
  children,
}: ModernTemplateProps) {
  const styles = useMemo(
    () => createModernStyles(resume.document_settings),
    [resume.document_settings]
  );

  return (
    <PDFPage size="LETTER" style={styles.page}>
      {/* Header with background */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {resume.first_name} {resume.last_name}
        </Text>
        <View style={styles.contactInfo}>
          {resume.email && (
            <Link src={`mailto:${resume.email}`} style={styles.link}>
              {resume.email}
            </Link>
          )}
          {resume.phone_number && (
            <>
              <Text style={styles.bulletSeparator}>•</Text>
              <Text>{resume.phone_number}</Text>
            </>
          )}
          {resume.location && (
            <>
              <Text style={styles.bulletSeparator}>•</Text>
              <Text>{resume.location}</Text>
            </>
          )}
        </View>
      </View>

      {/* Content sections */}
      {children}
    </PDFPage>
  );
});

