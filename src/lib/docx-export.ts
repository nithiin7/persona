import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Tab,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import { Resume } from "@/lib/types";

function parseMarkdown(text: string): TextRun[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return new TextRun({ text: part.slice(2, -2), bold: true });
    }
    return new TextRun({ text: part });
  });
}

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22 })],
    border: {
      bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
    spacing: { before: 240, after: 120 },
  });
}

function rightAlignedRow(
  leftChildren: TextRun[],
  rightText: string | undefined
): Paragraph {
  const children: (TextRun | Tab)[] = [...leftChildren];
  if (rightText) {
    children.push(new TextRun({ children: [new Tab()] }));
    children.push(new TextRun({ text: rightText }));
  }
  return new Paragraph({
    children,
    tabStops: rightText
      ? [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }]
      : [],
    spacing: { after: 60 },
  });
}

const DEFAULT_SECTION_ORDER = [
  "work_experience",
  "education",
  "skills",
  "projects",
  "certifications",
];

export async function generateResumeDocx(resume: Resume): Promise<Blob> {
  const children: Paragraph[] = [];

  // Header — name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${resume.first_name} ${resume.last_name}`,
          bold: true,
          size: 32,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    })
  );

  // Contact line
  const contactParts: string[] = [resume.email];
  if (resume.phone_number) contactParts.push(resume.phone_number);
  if (resume.location) contactParts.push(resume.location);
  if (resume.linkedin_url) contactParts.push(resume.linkedin_url);
  if (resume.github_url) contactParts.push(resume.github_url);
  if (resume.website) contactParts.push(resume.website);

  children.push(
    new Paragraph({
      children: [new TextRun({ text: contactParts.join(" | "), size: 18 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    })
  );

  // Professional summary is always first if present
  if (resume.professional_summary) {
    children.push(sectionHeading("Professional Summary"));
    children.push(
      new Paragraph({
        children: parseMarkdown(resume.professional_summary),
        spacing: { after: 60 },
      })
    );
  }

  // Render sections in configured order, respecting visibility
  const sectionOrder = resume.section_order ?? DEFAULT_SECTION_ORDER;
  const sectionConfigs = resume.section_configs ?? {};

  for (const section of sectionOrder) {
    if (sectionConfigs[section]?.visible === false) continue;

    if (section === "work_experience" && resume.work_experience.length > 0) {
      children.push(sectionHeading("Work Experience"));
      for (const exp of resume.work_experience) {
        children.push(
          rightAlignedRow(
            [new TextRun({ text: exp.position, bold: true })],
            exp.date
          )
        );
        const companyParts = [exp.company];
        if (exp.location) companyParts.push(exp.location);
        children.push(
          new Paragraph({
            children: [new TextRun({ text: companyParts.join(" • "), italics: true })],
            spacing: { after: 60 },
          })
        );
        for (const desc of exp.description) {
          children.push(
            new Paragraph({
              children: parseMarkdown(desc),
              bullet: { level: 0 },
              spacing: { after: 40 },
            })
          );
        }
        if (exp.technologies && exp.technologies.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: "Technologies: ", bold: true }),
                new TextRun({ text: exp.technologies.join(", ") }),
              ],
              spacing: { after: 80 },
            })
          );
        }
      }
    }

    if (section === "education" && resume.education.length > 0) {
      children.push(sectionHeading("Education"));
      for (const edu of resume.education) {
        children.push(
          rightAlignedRow(
            [new TextRun({ text: `${edu.degree} in ${edu.field}`, bold: true })],
            edu.date
          )
        );
        const schoolParts = [edu.school];
        if (edu.location) schoolParts.push(edu.location);
        if (edu.gpa) schoolParts.push(`GPA: ${edu.gpa}`);
        children.push(
          new Paragraph({
            children: [new TextRun({ text: schoolParts.join(" • "), italics: true })],
            spacing: { after: 60 },
          })
        );
        for (const achievement of edu.achievements ?? []) {
          children.push(
            new Paragraph({
              children: parseMarkdown(achievement),
              bullet: { level: 0 },
              spacing: { after: 40 },
            })
          );
        }
      }
    }

    if (section === "skills" && resume.skills.length > 0) {
      children.push(sectionHeading("Skills"));
      for (const skillGroup of resume.skills) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${skillGroup.category}: `, bold: true }),
              new TextRun({ text: skillGroup.items.join(", ") }),
            ],
            spacing: { after: 60 },
          })
        );
      }
    }

    if (section === "projects" && resume.projects.length > 0) {
      children.push(sectionHeading("Projects"));
      for (const project of resume.projects) {
        const projectLeft: TextRun[] = [
          new TextRun({ text: project.name, bold: true }),
        ];
        if (project.technologies && project.technologies.length > 0) {
          projectLeft.push(
            new TextRun({ text: ` • ${project.technologies.join(", ")}` })
          );
        }
        children.push(rightAlignedRow(projectLeft, project.date));

        const links: string[] = [];
        if (project.url) links.push(project.url);
        if (project.github_url) links.push(project.github_url);
        if (links.length > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: links.join(" • "), italics: true })],
              spacing: { after: 60 },
            })
          );
        }
        for (const desc of project.description ?? []) {
          children.push(
            new Paragraph({
              children: parseMarkdown(desc),
              bullet: { level: 0 },
              spacing: { after: 40 },
            })
          );
        }
      }
    }

    if (section === "certifications" && resume.certifications && resume.certifications.length > 0) {
      children.push(sectionHeading("Certifications"));
      for (const cert of resume.certifications) {
        children.push(
          rightAlignedRow(
            [
              new TextRun({ text: cert.name, bold: true }),
              new TextRun({ text: ` • ${cert.provider}` }),
            ],
            cert.date
          )
        );
        const credParts: string[] = [];
        if (cert.credential_id) credParts.push(`ID: ${cert.credential_id}`);
        if (cert.credential_url) credParts.push(cert.credential_url);
        if (credParts.length > 0) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: credParts.join(" • "), italics: true })],
              spacing: { after: 60 },
            })
          );
        }
      }
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Packer.toBlob(doc);
}
