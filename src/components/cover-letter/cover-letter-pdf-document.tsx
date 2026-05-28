"use client";

import {
  Document as PDFDocument,
  Page as PDFPage,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { memo } from "react";
import type { ReactNode } from "react";

const styles = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 72,
    paddingLeft: 72,
    paddingRight: 72,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
    color: "#111827",
  },
  paragraph: {
    marginBottom: 10,
  },
  spacer: {
    marginBottom: 6,
  },
  h1: {
    fontSize: 18,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    marginBottom: 14,
  },
  h2: {
    fontSize: 14,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    marginBottom: 10,
  },
  list: {
    marginBottom: 10,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
    marginLeft: 12,
  },
  listBullet: {
    width: 16,
  },
  listContent: {
    flex: 1,
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
});

type TextAlign = "left" | "center" | "right";

function getTextAlign(el: Element): TextAlign {
  const style = el.getAttribute("style") || "";
  const match = style.match(/text-align:\s*(left|center|right)/);
  return (match?.[1] as TextAlign) || "left";
}

function renderInline(node: ChildNode, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (!text) return null;
    return <Text key={key}>{text}</Text>;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const children = Array.from(el.childNodes).map((child, i) =>
    renderInline(child, i)
  );

  switch (tag) {
    case "strong":
    case "b":
      return (
        <Text key={key} style={{ fontFamily: "Helvetica", fontWeight: "bold" }}>
          {children}
        </Text>
      );
    case "em":
    case "i":
      return (
        <Text key={key} style={{ fontStyle: "italic" }}>
          {children}
        </Text>
      );
    case "u":
      return (
        <Text key={key} style={{ textDecoration: "underline" }}>
          {children}
        </Text>
      );
    case "s":
    case "del":
      return (
        <Text key={key} style={{ textDecoration: "line-through" }}>
          {children}
        </Text>
      );
    case "a": {
      const href = el.getAttribute("href") || "";
      const src = href.startsWith("http") ? href : `https://${href}`;
      return (
        <Link key={key} src={src}>
          <Text style={styles.link}>{children}</Text>
        </Link>
      );
    }
    case "br":
      return <Text key={key}>{"\n"}</Text>;
    default:
      return <Text key={key}>{children}</Text>;
  }
}

function renderBlock(el: Element, key: number): ReactNode {
  const tag = el.tagName.toLowerCase();
  const textAlign = getTextAlign(el);

  switch (tag) {
    case "p": {
      const textContent = el.textContent?.trim();
      if (!textContent) {
        return <View key={key} style={styles.spacer} />;
      }
      const children = Array.from(el.childNodes).map((child, i) =>
        renderInline(child, i)
      );
      return (
        <View key={key} style={styles.paragraph}>
          <Text style={{ textAlign }}>{children}</Text>
        </View>
      );
    }
    case "h1": {
      const children = Array.from(el.childNodes).map((child, i) =>
        renderInline(child, i)
      );
      return (
        <View key={key} style={styles.paragraph}>
          <Text style={{ ...styles.h1, textAlign }}>{children}</Text>
        </View>
      );
    }
    case "h2": {
      const children = Array.from(el.childNodes).map((child, i) =>
        renderInline(child, i)
      );
      return (
        <View key={key} style={styles.paragraph}>
          <Text style={{ ...styles.h2, textAlign }}>{children}</Text>
        </View>
      );
    }
    case "ul":
    case "ol": {
      const items = Array.from(el.children).map((li, i) => {
        const bullet = tag === "ol" ? `${i + 1}.` : "•";
        const liChildren = Array.from(li.childNodes).map((child, j) =>
          renderInline(child, j)
        );
        return (
          <View key={i} style={styles.listItem}>
            <Text style={styles.listBullet}>{bullet}</Text>
            <View style={styles.listContent}>
              <Text>{liChildren}</Text>
            </View>
          </View>
        );
      });
      return (
        <View key={key} style={styles.list}>
          {items}
        </View>
      );
    }
    default:
      return null;
  }
}

function parseHtmlContent(html: string): ReactNode[] {
  if (typeof window === "undefined" || !html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return Array.from(doc.body.children)
    .map((el, i) => renderBlock(el, i))
    .filter(Boolean);
}

interface CoverLetterPDFDocumentProps {
  content: string;
}

export const CoverLetterPDFDocument = memo(function CoverLetterPDFDocument({
  content,
}: CoverLetterPDFDocumentProps) {
  const nodes = parseHtmlContent(content);

  return (
    <PDFDocument>
      <PDFPage size="LETTER" style={styles.page}>
        {nodes}
      </PDFPage>
    </PDFDocument>
  );
});
