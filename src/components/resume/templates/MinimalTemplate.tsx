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

// Minimal template: Ultra-clean, minimalist design
function createMinimalStyles(settings: Resume["document_settings"]) {
  return StyleSheet.create({
    page: {
      padding: settings?.document_margin_vertical || 40,
      paddingHorizontal: settings?.document_margin_horizontal || 40,
      fontSize: settings?.document_font_size || 10,
      lineHeight: settings?.document_line_height || 1.6,
      fontFamily: "Helvetica",
    },
    header: {
      marginBottom: settings?.header_name_bottom_spacing || 32,
      alignItems: "center",
    },
    name: {
      fontSize: settings?.header_name_size || 26,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    contactInfo: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      fontSize: 9,
      color: "#6b7280",
      gap: 12,
    },
    section: {
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: "#374151",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    bulletSeparator: {
      marginHorizontal: 8,
      color: "#d1d5db",
    },
    link: {
      color: "#111827",
      textDecoration: "none",
    },
  });
}

interface MinimalTemplateProps {
  resume: Resume;
  children: React.ReactNode;
}

export const MinimalTemplate = memo(function MinimalTemplate({
  resume,
  children,
}: MinimalTemplateProps) {
  const styles = useMemo(
    () => createMinimalStyles(resume.document_settings),
    [resume.document_settings]
  );

  return (
    <PDFPage size="LETTER" style={styles.page}>
      {/* Centered header */}
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
              <Text style={styles.bulletSeparator}>|</Text>
              <Text>{resume.phone_number}</Text>
            </>
          )}
          {resume.location && (
            <>
              <Text style={styles.bulletSeparator}>|</Text>
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

