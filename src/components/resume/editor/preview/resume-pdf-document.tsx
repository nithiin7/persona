"use client";

import { Resume } from "@/lib/types";
import {
  Document as PDFDocument,
  Page as PDFPage,
  Text,
  View,
  StyleSheet,
  Link,
  Image as PDFImage,
} from "@react-pdf/renderer";
import { memo, useMemo, useCallback } from "react";
import type { ReactNode } from "react";

// Base styles that don't depend on resume settings
const baseStyles = {
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
  bulletSeparator: {
    color: "#4b5563",
    marginHorizontal: 2,
  },
  bulletDot: {
    width: 8,
    marginRight: 4,
  },
} as const;

// Create a cache outside of components to persist between renders
const textProcessingCache = new Map<string, ReactNode[]>();

// Memoized text processing function — accepts fontFamily so bold spans use the right font
function useTextProcessor(fontFamily: string = "Helvetica") {
  const processText = useCallback(
    (text: string, ignoreMarkdown = false) => {
      // Check cache first
      const cacheKey = `${text}-${ignoreMarkdown}-${fontFamily}`;
      if (textProcessingCache.has(cacheKey)) {
        return textProcessingCache.get(cacheKey);
      }

      // If ignoring markdown, extract content between asterisks or return plain text
      if (ignoreMarkdown) {
        const content = text.match(/\*\*(.*?)\*\*/)?.[1] || text;
        const processed = [<Text key={0}>{content}</Text>];
        textProcessingCache.set(cacheKey, processed);
        return processed;
      }

      // Process text if not in cache
      const parts = text.split(/(\*\*.*?\*\*)/g);
      const processed = parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={{ fontFamily, fontWeight: "bold" }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      });

      // Store in cache
      textProcessingCache.set(cacheKey, processed);
      return processed;
    },
    [fontFamily]
  );

  return processText;
}

// Memoized section components
const HeaderSection = memo(function HeaderSection({
  resume,
  styles,
}: {
  resume: Resume;
  styles: ReturnType<typeof createResumeStyles>;
}) {
  const textContent = (
    <>
      <Text style={styles.name}>
        {resume.first_name} {resume.last_name}
      </Text>
      <View style={styles.contactInfo}>
        {resume.location && (
          <>
            <Text>{resume.location}</Text>
            {(resume.email ||
              resume.phone_number ||
              resume.website ||
              resume.linkedin_url ||
              resume.github_url) && (
              <Text style={styles.bulletSeparator}>•</Text>
            )}
          </>
        )}
        {resume.email && (
          <>
            <Link src={`mailto:${resume.email}`}>
              <Text style={styles.link}>{resume.email}</Text>
            </Link>
            {(resume.phone_number ||
              resume.website ||
              resume.linkedin_url ||
              resume.github_url) && (
              <Text style={styles.bulletSeparator}>•</Text>
            )}
          </>
        )}
        {resume.phone_number && (
          <>
            <Text>{resume.phone_number}</Text>
            {(resume.website || resume.linkedin_url || resume.github_url) && (
              <Text style={styles.bulletSeparator}>•</Text>
            )}
          </>
        )}
        {resume.website && (
          <>
            <Link
              src={
                resume.website.startsWith("http")
                  ? resume.website
                  : `https://${resume.website}`
              }
            >
              <Text style={styles.link}>{resume.website}</Text>
            </Link>
            {(resume.linkedin_url || resume.github_url) && (
              <Text style={styles.bulletSeparator}>•</Text>
            )}
          </>
        )}
        {resume.linkedin_url && (
          <>
            <Link
              src={
                resume.linkedin_url.startsWith("http")
                  ? resume.linkedin_url
                  : `https://${resume.linkedin_url}`
              }
            >
              <Text style={styles.link}>{resume.linkedin_url}</Text>
            </Link>
            {resume.github_url && <Text style={styles.bulletSeparator}>•</Text>}
          </>
        )}
        {resume.github_url && (
          <Link
            src={
              resume.github_url.startsWith("http")
                ? resume.github_url
                : `https://${resume.github_url}`
            }
          >
            <Text style={styles.link}>{resume.github_url}</Text>
          </Link>
        )}
      </View>
    </>
  );

  return (
    <View style={styles.header}>
      {resume.avatar_url ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>{textContent}</View>
          <PDFImage
            src={resume.avatar_url}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              marginLeft: 12,
              flexShrink: 0,
            }}
          />
        </View>
      ) : (
        textContent
      )}
    </View>
  );
});

const ProfessionalSummarySection = memo(function ProfessionalSummarySection({
  summary,
  styles,
  visible = true,
  fontFamily = "Helvetica",
}: {
  summary: string | null | undefined;
  styles: ReturnType<typeof createResumeStyles>;
  visible?: boolean;
  fontFamily?: string;
}) {
  const processText = useTextProcessor(fontFamily);

  if (!summary || !visible) return null;

  const processedText = processText(summary);

  return (
    <View style={styles.professionalSummarySection}>
      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <View style={styles.professionalSummaryContent}>
        <View style={styles.professionalSummaryText}>{processedText}</View>
      </View>
    </View>
  );
});

const SkillsSection = memo(function SkillsSection({
  skills,
  styles,
  visible = true,
}: {
  skills: Resume["skills"];
  styles: ReturnType<typeof createResumeStyles>;
  visible?: boolean;
}) {
  if (!skills?.length || !visible) return null;

  return (
    <View style={styles.skillsSection}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.skillsGrid}>
        {skills.map((skillCategory, index) => (
          <View key={index} style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>
              {skillCategory.category}:
            </Text>
            <Text style={styles.skillItem}>
              {skillCategory.items.join(", ")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

type ExperienceGroup = {
  company: string;
  items: Resume["work_experience"];
};

function groupConsecutiveExperiencesByCompany(
  experiences: Resume["work_experience"]
): ExperienceGroup[] {
  const groups: ExperienceGroup[] = [];

  experiences.forEach((experience) => {
    const companyKey = experience.company.trim().toLowerCase();
    const lastGroup = groups[groups.length - 1];
    const lastGroupKey = lastGroup?.company.trim().toLowerCase();

    if (lastGroup && lastGroupKey === companyKey) {
      lastGroup.items.push(experience);
      return;
    }

    groups.push({
      company: experience.company,
      items: [experience],
    });
  });

  return groups;
}

const ExperienceSection = memo(function ExperienceSection({
  experiences,
  styles,
  visible = true,
  fontFamily = "Helvetica",
}: {
  experiences: Resume["work_experience"];
  styles: ReturnType<typeof createResumeStyles>;
  visible?: boolean;
  fontFamily?: string;
}) {
  const processText = useTextProcessor(fontFamily);
  if (!experiences?.length || !visible) return null;
  const groupedExperiences = groupConsecutiveExperiencesByCompany(experiences);

  return (
    <View style={styles.experienceSection}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {groupedExperiences.map((group, groupIndex) => (
        <View key={groupIndex} style={styles.experienceItem}>
          <Text style={styles.companyName}>
            {processText(group.company, true)}
          </Text>
          {group.items.map((experience, roleIndex) => (
            <View
              key={`${groupIndex}-${roleIndex}`}
              style={roleIndex > 0 ? styles.experienceRoleItem : undefined}
            >
              <View style={styles.experienceHeader}>
                <View style={styles.companyLocationRow}>
                  <Text style={styles.jobTitle}>
                    {processText(experience.position, true)}
                  </Text>
                  {experience.location && (
                    <>
                      <Text style={styles.bulletSeparator}>•</Text>
                      <Text style={styles.locationText}>
                        {experience.location}
                      </Text>
                    </>
                  )}
                </View>
                <Text style={styles.dateRange}>{experience.date}</Text>
              </View>
              {experience.description.map((bullet, bulletIndex) => (
                <View key={bulletIndex} style={styles.bulletPoint}>
                  <Text style={styles.bulletDot}>•</Text>
                  <View style={styles.bulletText}>
                    <Text style={styles.bulletTextContent}>
                      {processText(bullet)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const ProjectsSection = memo(function ProjectsSection({
  projects,
  styles,
  visible = true,
  fontFamily = "Helvetica",
}: {
  projects: Resume["projects"];
  styles: ReturnType<typeof createResumeStyles>;
  visible?: boolean;
  fontFamily?: string;
}) {
  const processText = useTextProcessor(fontFamily);
  if (!projects?.length || !visible) return null;

  return (
    <View style={styles.projectsSection}>
      <Text style={styles.sectionTitle}>Projects</Text>
      {projects.map((project, index) => (
        <View key={index} style={styles.projectItem}>
          <View style={styles.projectHeader}>
            <View style={styles.projectHeaderTop}>
              <Text style={styles.projectTitle}>
                {processText(project.name, true)}
              </Text>
              <View style={styles.projectHeaderRight}>
                {project.date && (
                  <Text style={styles.dateRange}>{project.date}</Text>
                )}
                {(project.url || project.github_url) && (
                  <Text style={styles.projectLinks}>
                    {project.url && (
                      <Link
                        src={
                          project.url.startsWith("http")
                            ? project.url
                            : `https://${project.url}`
                        }
                      >
                        <Text style={styles.link}>{project.url}</Text>
                      </Link>
                    )}
                    {project.url && project.github_url && " | "}
                    {project.github_url && (
                      <Link
                        src={
                          project.github_url.startsWith("http")
                            ? project.github_url
                            : `https://${project.github_url}`
                        }
                      >
                        <Text style={styles.link}>{project.github_url}</Text>
                      </Link>
                    )}
                  </Text>
                )}
              </View>
            </View>
            {project.technologies && (
              <Text style={styles.projectTechnologies}>
                {project.technologies
                  .map((tech) => tech.replace(/\*\*/g, ""))
                  .join(", ")}
              </Text>
            )}
          </View>

          {project.description.map((bullet, bulletIndex) => (
            <View key={bulletIndex} style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <View style={styles.bulletText}>
                <Text style={styles.bulletTextContent}>
                  {processText(bullet)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const EducationSection = memo(function EducationSection({
  education,
  styles,
  visible = true,
  fontFamily = "Helvetica",
}: {
  education: Resume["education"];
  styles: ReturnType<typeof createResumeStyles>;
  visible?: boolean;
  fontFamily?: string;
}) {
  const processText = useTextProcessor(fontFamily);
  if (!education?.length || !visible) return null;

  return (
    <View style={styles.educationSection}>
      <Text style={styles.sectionTitle}>Education</Text>
      {education.map((edu, index) => (
        <View key={index} style={styles.educationItem}>
          <View style={styles.educationHeader}>
            <View style={styles.educationInfo}>
              <Text style={styles.schoolName}>
                {processText(edu.school, true)}
              </Text>
              <View style={styles.degreeRow}>
                <Text style={styles.degree}>
                  {processText(
                    edu.field ? `${edu.degree}, ${edu.field}` : edu.degree,
                    true
                  )}
                </Text>
                {edu.gpa && <Text style={styles.gpa}>{`GPA: ${edu.gpa}`}</Text>}
              </View>
            </View>
            <Text style={styles.dateRange}>{edu.date}</Text>
          </View>
          {edu.achievements &&
            edu.achievements.map((achievement, bulletIndex) => (
              <View key={bulletIndex} style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <View style={styles.bulletText}>
                  {processText(achievement)}
                </View>
              </View>
            ))}
        </View>
      ))}
    </View>
  );
});

const CertificationsSection = memo(function CertificationsSection({
  certifications,
  styles,
  visible = true,
  fontFamily = "Helvetica",
}: {
  certifications: Resume["certifications"];
  styles: ReturnType<typeof createResumeStyles>;
  visible?: boolean;
  fontFamily?: string;
}) {
  const processText = useTextProcessor(fontFamily);
  if (!certifications?.length || !visible) return null;

  return (
    <View style={styles.certificationsSection}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {certifications.map((cert, index) => (
        <View key={index} style={styles.certificationItem}>
          <View style={styles.certificationHeader}>
            <View style={styles.certificationInfo}>
              <Text style={styles.certificationName}>
                {processText(cert.name, true)}
              </Text>
              <Text style={styles.certificationProvider}>
                {processText(cert.provider, true)}
              </Text>
            </View>
            {cert.date && <Text style={styles.dateRange}>{cert.date}</Text>}
          </View>
          {cert.credential_id && (
            <Text style={styles.credentialId}>
              Credential ID: {cert.credential_id}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
});

const PublicationsSection = memo(function PublicationsSection({
  publications,
  styles,
  visible = true,
  fontFamily = "Helvetica",
}: {
  publications: Resume["publications"];
  styles: ReturnType<typeof createResumeStyles>;
  visible?: boolean;
  fontFamily?: string;
}) {
  const processText = useTextProcessor(fontFamily);
  if (!publications?.length || !visible) return null;

  return (
    <View style={styles.publicationsSection}>
      <Text style={styles.sectionTitle}>Publications</Text>
      {publications.map((pub, index) => (
        <View key={index} style={styles.publicationItem}>
          <View style={styles.publicationHeader}>
            <View style={styles.publicationInfo}>
              <Text style={styles.publicationTitle}>
                {processText(pub.title, true)}
              </Text>
              {pub.authors && (
                <Text style={styles.publicationAuthors}>
                  {processText(pub.authors, true)}
                </Text>
              )}
              {pub.venue && (
                <Text style={styles.publicationVenue}>
                  {processText(pub.venue, true)}
                </Text>
              )}
            </View>
            {pub.date && <Text style={styles.dateRange}>{pub.date}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
});

const VolunteerSection = memo(function VolunteerSection({
  volunteer,
  styles,
  visible = true,
  fontFamily = "Helvetica",
}: {
  volunteer: Resume["volunteer"];
  styles: ReturnType<typeof createResumeStyles>;
  visible?: boolean;
  fontFamily?: string;
}) {
  const processText = useTextProcessor(fontFamily);
  if (!volunteer?.length || !visible) return null;

  return (
    <View style={styles.volunteerSection}>
      <Text style={styles.sectionTitle}>Volunteer</Text>
      {volunteer.map((entry, index) => (
        <View key={index} style={styles.volunteerItem}>
          <View style={styles.volunteerHeader}>
            <View style={styles.volunteerInfo}>
              <Text style={styles.volunteerOrg}>
                {processText(entry.organization, true)}
              </Text>
              <View style={styles.volunteerRoleRow}>
                <Text style={styles.volunteerRole}>
                  {processText(entry.role, true)}
                </Text>
                {entry.location && (
                  <Text style={styles.locationText}>
                    {" · "}
                    {entry.location}
                  </Text>
                )}
              </View>
            </View>
            {entry.date && <Text style={styles.dateRange}>{entry.date}</Text>}
          </View>
          {entry.description?.map((line, i) => (
            <View key={i} style={styles.bulletPoint}>
              <Text>{"•  "}</Text>
              <View style={styles.bulletText}>
                <Text style={styles.bulletTextContent}>
                  {processText(line, false)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const LanguagesSection = memo(function LanguagesSection({
  languages,
  styles,
  visible = true,
  fontFamily = "Helvetica",
}: {
  languages: Resume["languages"];
  styles: ReturnType<typeof createResumeStyles>;
  visible?: boolean;
  fontFamily?: string;
}) {
  const processText = useTextProcessor(fontFamily);
  if (!languages?.length || !visible) return null;

  return (
    <View style={styles.languagesSection}>
      <Text style={styles.sectionTitle}>Languages</Text>
      <View style={styles.languagesGrid}>
        {languages.map((lang, index) => (
          <View key={index} style={styles.languageItem}>
            <Text style={styles.languageName}>
              {processText(lang.language, true)}
            </Text>
            {lang.proficiency && (
              <Text style={styles.languageProficiency}>
                {": "}
                {lang.proficiency}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
});

const AwardsSection = memo(function AwardsSection({
  awards,
  styles,
  visible = true,
  fontFamily = "Helvetica",
}: {
  awards: Resume["awards"];
  styles: ReturnType<typeof createResumeStyles>;
  visible?: boolean;
  fontFamily?: string;
}) {
  const processText = useTextProcessor(fontFamily);
  if (!awards?.length || !visible) return null;

  return (
    <View style={styles.awardsSection}>
      <Text style={styles.sectionTitle}>Awards</Text>
      {awards.map((award, index) => (
        <View key={index} style={styles.awardItem}>
          <View style={styles.awardHeader}>
            <View style={styles.awardInfo}>
              <Text style={styles.awardTitle}>
                {processText(award.title, true)}
              </Text>
              {award.issuer && (
                <Text style={styles.awardIssuer}>
                  {processText(award.issuer, true)}
                </Text>
              )}
            </View>
            {award.date && <Text style={styles.dateRange}>{award.date}</Text>}
          </View>
          {award.description && (
            <Text style={styles.awardDescription}>
              {processText(award.description, false)}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
});

// Style factory function
function createResumeStyles(
  settings: Resume["document_settings"] = {
    document_font_size: 10,
    document_line_height: 1.5,
    document_margin_vertical: 36,
    document_margin_horizontal: 36,
    header_name_size: 24,
    header_name_bottom_spacing: 24,
    skills_margin_top: 2,
    skills_margin_bottom: 2,
    skills_margin_horizontal: 0,
    skills_item_spacing: 2,
    experience_margin_top: 2,
    experience_margin_bottom: 2,
    experience_margin_horizontal: 0,
    experience_item_spacing: 4,
    projects_margin_top: 2,
    projects_margin_bottom: 2,
    projects_margin_horizontal: 0,
    projects_item_spacing: 4,
    education_margin_top: 2,
    education_margin_bottom: 2,
    education_margin_horizontal: 0,
    education_item_spacing: 4,
    certifications_margin_top: 2,
    certifications_margin_bottom: 2,
    certifications_margin_horizontal: 0,
    certifications_item_spacing: 4,
    publications_margin_top: 2,
    publications_margin_bottom: 2,
    publications_margin_horizontal: 0,
    publications_item_spacing: 4,
    volunteer_margin_top: 2,
    volunteer_margin_bottom: 2,
    volunteer_margin_horizontal: 0,
    volunteer_item_spacing: 4,
    languages_margin_top: 2,
    languages_margin_bottom: 2,
    languages_margin_horizontal: 0,
    languages_item_spacing: 2,
    awards_margin_top: 2,
    awards_margin_bottom: 2,
    awards_margin_horizontal: 0,
    awards_item_spacing: 4,
  },
  fontFamily: string = "Helvetica"
) {
  const {
    document_font_size = 10,
    document_line_height = 1.5,
    document_margin_vertical = 36,
    document_margin_horizontal = 36,
    header_name_size = 24,
    header_name_bottom_spacing = 24,
    skills_margin_top = 2,
    skills_margin_bottom = 2,
    skills_margin_horizontal = 0,
    skills_item_spacing = 2,
    experience_margin_top = 2,
    experience_margin_bottom = 2,
    experience_margin_horizontal = 0,
    experience_item_spacing = 4,
    projects_margin_top = 2,
    projects_margin_bottom = 2,
    projects_margin_horizontal = 0,
    projects_item_spacing = 4,
    education_margin_top = 2,
    education_margin_bottom = 2,
    education_margin_horizontal = 0,
    education_item_spacing = 4,
    certifications_margin_top = 2,
    certifications_margin_bottom = 2,
    certifications_margin_horizontal = 0,
    certifications_item_spacing = 4,
    publications_margin_top = 2,
    publications_margin_bottom = 2,
    publications_margin_horizontal = 0,
    publications_item_spacing = 4,
    volunteer_margin_top = 2,
    volunteer_margin_bottom = 2,
    volunteer_margin_horizontal = 0,
    volunteer_item_spacing = 4,
    languages_margin_top = 2,
    languages_margin_bottom = 2,
    languages_margin_horizontal = 0,
    languages_item_spacing = 2,
    awards_margin_top = 2,
    awards_margin_bottom = 2,
    awards_margin_horizontal = 0,
    awards_item_spacing = 4,
  } = settings;

  return StyleSheet.create({
    ...baseStyles,
    // Base page configuration
    page: {
      paddingTop: document_margin_vertical,
      paddingBottom: document_margin_vertical + 28,
      paddingLeft: document_margin_horizontal,
      paddingRight: document_margin_horizontal,
      fontFamily: fontFamily,
      color: "#111827",
      fontSize: document_font_size,
      lineHeight: document_line_height,
      position: "relative",
      // backgroundColor: '#32a852',  // Bright green color that should be very visible for testing
    },
    header: {
      alignItems: "center",
    },
    name: {
      fontSize: header_name_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      marginBottom: header_name_bottom_spacing,
      color: "#111827",
      textAlign: "center",
    },
    contactInfo: {
      fontSize: document_font_size,
      color: "#374151",
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 4,
    },
    sectionTitle: {
      fontSize: document_font_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      marginBottom: 4,
      color: "#111827",
      textTransform: "uppercase",
      borderBottom: "0.5pt solid #e5e7eb",
      paddingBottom: 0,
    },
    // Professional Summary section
    professionalSummarySection: {
      marginTop: 2,
      marginBottom: 2,
      marginLeft: 0,
      marginRight: 0,
    },
    professionalSummaryContent: {
      marginTop: 4,
    },
    professionalSummaryText: {
      fontSize: document_font_size,
      color: "#374151",
      lineHeight: document_line_height,
    },
    // Skills section
    skillsSection: {
      marginTop: skills_margin_top,
      marginBottom: skills_margin_bottom,
      marginLeft: skills_margin_horizontal,
      marginRight: skills_margin_horizontal,
    },
    skillsGrid: {
      flexDirection: "column",
      gap: skills_item_spacing,
    },
    skillCategory: {
      marginBottom: skills_item_spacing,
      flexDirection: "row",
      flexWrap: "wrap",
      width: "100%",
    },
    skillCategoryTitle: {
      fontSize: document_font_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      color: "#111827",
      marginRight: 4,
      width: "auto",
    },
    skillItem: {
      fontSize: document_font_size,
      color: "#374151",
      flexGrow: 1,
      flexBasis: 0,
      flexWrap: "wrap",
    },
    // Experience section
    experienceSection: {
      marginTop: experience_margin_top,
      marginBottom: experience_margin_bottom,
      marginLeft: experience_margin_horizontal,
      marginRight: experience_margin_horizontal,
    },
    experienceItem: {
      marginBottom: experience_item_spacing,
    },
    experienceRoleItem: {
      marginTop: 2,
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    companyName: {
      fontSize: document_font_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      color: "#111827",
    },
    jobTitle: {
      fontSize: document_font_size,
      color: "#111827",
    },
    companyLocationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    locationText: {
      fontSize: document_font_size,
      color: "#374151",
    },
    dateRange: {
      fontSize: document_font_size,
      color: "#111827",
      textAlign: "right",
    },
    bulletPoint: {
      fontSize: document_font_size,
      marginBottom: experience_item_spacing,
      color: "#111827",
      marginLeft: 8,
      paddingLeft: 8,
      flexDirection: "row",
    },
    bulletText: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      display: "flex",
    },
    bulletTextContent: {
      flex: 1,
    },
    // Projects section
    projectsSection: {
      marginTop: projects_margin_top,
      marginBottom: projects_margin_bottom,
      marginLeft: projects_margin_horizontal,
      marginRight: projects_margin_horizontal,
    },
    projectItem: {
      marginBottom: projects_item_spacing,
    },
    projectHeader: {
      flexDirection: "column",
      marginBottom: 4,
    },
    projectHeaderTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    projectHeaderRight: {
      flexDirection: "row",
      gap: 8,
    },
    projectTitle: {
      fontSize: document_font_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      color: "#111827",
    },
    projectTechnologies: {
      fontSize: document_font_size,
      color: "#374151",
      fontFamily: fontFamily,
      fontWeight: "bold",
      marginBottom: 0,
    },
    projectDescription: {
      fontSize: document_font_size,
      color: "#111827",
    },
    projectLinks: {
      fontSize: document_font_size,
      color: "#374151",
      textAlign: "right",
    },
    // Education section
    educationSection: {
      marginTop: education_margin_top,
      marginBottom: education_margin_bottom,
      marginLeft: education_margin_horizontal,
      marginRight: education_margin_horizontal,
    },
    educationItem: {
      marginBottom: education_item_spacing,
    },
    educationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    educationInfo: {
      flex: 1,
    },
    schoolName: {
      fontSize: document_font_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      color: "#111827",
    },
    degreeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 2,
      flexWrap: "wrap",
    },
    degree: {
      fontSize: document_font_size,
      color: "#111827",
    },
    gpa: {
      fontSize: document_font_size,
      color: "#374151",
      fontFamily: fontFamily,
    },
    // Certifications section
    certificationsSection: {
      marginTop: certifications_margin_top,
      marginBottom: certifications_margin_bottom,
      marginLeft: certifications_margin_horizontal,
      marginRight: certifications_margin_horizontal,
    },
    certificationItem: {
      marginBottom: certifications_item_spacing,
    },
    certificationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    certificationInfo: {
      flex: 1,
    },
    certificationName: {
      fontSize: document_font_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      color: "#111827",
    },
    certificationProvider: {
      fontSize: document_font_size,
      color: "#111827",
    },
    credentialId: {
      fontSize: document_font_size - 1,
      color: "#6b7280",
      marginTop: 1,
    },
    // Publications section
    publicationsSection: {
      marginTop: publications_margin_top,
      marginBottom: publications_margin_bottom,
      marginLeft: publications_margin_horizontal,
      marginRight: publications_margin_horizontal,
    },
    publicationItem: {
      marginBottom: publications_item_spacing,
    },
    publicationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    publicationInfo: {
      flex: 1,
    },
    publicationTitle: {
      fontSize: document_font_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      color: "#111827",
    },
    publicationAuthors: {
      fontSize: document_font_size - 1,
      color: "#374151",
      marginTop: 1,
    },
    publicationVenue: {
      fontSize: document_font_size - 1,
      color: "#6b7280",
      marginTop: 1,
    },
    // Volunteer section
    volunteerSection: {
      marginTop: volunteer_margin_top,
      marginBottom: volunteer_margin_bottom,
      marginLeft: volunteer_margin_horizontal,
      marginRight: volunteer_margin_horizontal,
    },
    volunteerItem: {
      marginBottom: volunteer_item_spacing,
    },
    volunteerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    volunteerInfo: {
      flex: 1,
    },
    volunteerOrg: {
      fontSize: document_font_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      color: "#111827",
    },
    volunteerRoleRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: 2,
    },
    volunteerRole: {
      fontSize: document_font_size,
      color: "#111827",
    },
    // Languages section
    languagesSection: {
      marginTop: languages_margin_top,
      marginBottom: languages_margin_bottom,
      marginLeft: languages_margin_horizontal,
      marginRight: languages_margin_horizontal,
    },
    languagesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: languages_item_spacing,
      marginTop: 2,
    },
    languageItem: {
      flexDirection: "row",
      marginRight: 12,
    },
    languageName: {
      fontSize: document_font_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      color: "#111827",
    },
    languageProficiency: {
      fontSize: document_font_size,
      color: "#374151",
    },
    // Awards section
    awardsSection: {
      marginTop: awards_margin_top,
      marginBottom: awards_margin_bottom,
      marginLeft: awards_margin_horizontal,
      marginRight: awards_margin_horizontal,
    },
    awardItem: {
      marginBottom: awards_item_spacing,
    },
    awardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    awardInfo: {
      flex: 1,
    },
    awardTitle: {
      fontSize: document_font_size,
      fontFamily: fontFamily,
      fontWeight: "bold",
      color: "#111827",
    },
    awardIssuer: {
      fontSize: document_font_size,
      color: "#111827",
      marginTop: 1,
    },
    awardDescription: {
      fontSize: document_font_size - 1,
      color: "#374151",
      marginTop: 2,
    },
  });
}

// Template-specific style overrides — only visual properties (colors, borders, backgrounds,
// alignment). Font sizes are intentionally omitted so document_settings always win.
function getTemplateStyles(template: string, accentColor?: string) {
  let styles: Record<string, Record<string, unknown>>;

  switch (template) {
    case "modern":
      styles = {
        page: { backgroundColor: "#ffffff" },
        header: {
          backgroundColor: "#f0f9ff",
          padding: 20,
          borderLeftWidth: 6,
          borderLeftColor: "#6366f1",
          marginBottom: 28,
          borderRadius: 4,
        },
        name: { color: "#1e3a8a", fontWeight: "bold" },
        contactInfo: { color: "#64748b" },
        sectionTitle: {
          color: "#6366f1",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          letterSpacing: 1.5,
          borderBottomWidth: 0,
          marginBottom: 10,
          marginTop: 6,
        },
        link: { color: "#6366f1", textDecoration: "none" },
        bulletSeparator: { color: "#6366f1" },
      };
      break;

    case "minimal":
      styles = {
        page: { backgroundColor: "#ffffff" },
        header: {
          alignItems: "center" as const,
          marginBottom: 36,
          borderBottomWidth: 0,
          paddingBottom: 16,
        },
        name: {
          letterSpacing: -0.5,
          color: "#0f172a",
          textAlign: "center" as const,
        },
        contactInfo: {
          justifyContent: "center" as const,
          color: "#64748b",
        },
        sectionTitle: {
          color: "#334155",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          letterSpacing: 3,
          borderBottomWidth: 0,
          marginBottom: 10,
          marginTop: 8,
        },
        bulletSeparator: { color: "#cbd5e1", marginHorizontal: 8 },
        link: { color: "#0f172a", textDecoration: "none" },
      };
      break;

    case "professional":
      styles = {
        page: { backgroundColor: "#fafafa" },
        header: {
          backgroundColor: "#dbeafe",
          padding: 16,
          borderBottomWidth: 4,
          borderBottomColor: "#1e40af",
          marginBottom: 24,
        },
        name: { color: "#1e3a8a", fontWeight: "bold" },
        contactInfo: { color: "#475569" },
        sectionTitle: {
          color: "#1e40af",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          letterSpacing: 1,
          borderBottomWidth: 3,
          borderBottomColor: "#60a5fa",
          paddingBottom: 4,
          marginBottom: 10,
          marginTop: 6,
        },
        link: { color: "#2563eb", textDecoration: "none" },
        bulletSeparator: { color: "#2563eb" },
      };
      break;

    case "creative":
      styles = {
        page: { backgroundColor: "#fffbf5" },
        header: {
          backgroundColor: "#fef2f2",
          padding: 20,
          borderTopWidth: 6,
          borderTopColor: "#e11d48",
          borderBottomWidth: 6,
          borderBottomColor: "#e11d48",
          marginBottom: 24,
        },
        name: { color: "#9f1239", fontWeight: "bold" },
        contactInfo: { color: "#881337" },
        sectionTitle: {
          color: "#e11d48",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          letterSpacing: 1.5,
          borderBottomWidth: 3,
          borderBottomColor: "#fda4af",
          paddingBottom: 4,
          marginBottom: 10,
          marginTop: 6,
        },
        link: { color: "#e11d48", textDecoration: "none" },
        bulletSeparator: { color: "#e11d48" },
      };
      break;

    case "executive":
      // Left-aligned for a polished executive feel
      styles = {
        page: { backgroundColor: "#fffbeb" },
        header: {
          alignItems: "flex-start" as const,
          backgroundColor: "#fef3c7",
          padding: 18,
          borderLeftWidth: 5,
          borderLeftColor: "#d97706",
          marginBottom: 26,
          borderRadius: 2,
        },
        name: {
          color: "#92400e",
          fontWeight: "bold",
          textAlign: "left" as const,
        },
        contactInfo: {
          color: "#78350f",
          justifyContent: "flex-start" as const,
        },
        sectionTitle: {
          color: "#d97706",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          letterSpacing: 1.2,
          borderBottomWidth: 2,
          borderBottomColor: "#fbbf24",
          paddingBottom: 3,
          marginBottom: 10,
          marginTop: 6,
        },
        link: { color: "#d97706", textDecoration: "none" },
        bulletSeparator: { color: "#d97706" },
      };
      break;

    case "tech":
      styles = {
        page: { backgroundColor: "#ffffff" },
        header: {
          backgroundColor: "#d1fae5",
          padding: 20,
          borderWidth: 2,
          borderColor: "#10b981",
          marginBottom: 24,
          borderRadius: 6,
        },
        name: { color: "#065f46", fontWeight: "bold" },
        contactInfo: { color: "#047857" },
        sectionTitle: {
          color: "#10b981",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          letterSpacing: 1.5,
          borderBottomWidth: 2,
          borderBottomColor: "#6ee7b7",
          paddingBottom: 4,
          marginBottom: 10,
          marginTop: 6,
        },
        link: { color: "#059669", textDecoration: "none" },
        bulletSeparator: { color: "#10b981" },
      };
      break;

    case "academic":
      styles = {
        page: { backgroundColor: "#faf5ff" },
        header: {
          backgroundColor: "#f3e8ff",
          padding: 18,
          borderBottomWidth: 4,
          borderBottomColor: "#7c3aed",
          marginBottom: 28,
        },
        name: { color: "#5b21b6", fontWeight: "bold" },
        contactInfo: { color: "#6b21a8" },
        sectionTitle: {
          color: "#7c3aed",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          letterSpacing: 1.8,
          borderBottomWidth: 2.5,
          borderBottomColor: "#a78bfa",
          paddingBottom: 4,
          marginBottom: 10,
          marginTop: 6,
        },
        link: { color: "#7c3aed", textDecoration: "none" },
        bulletSeparator: { color: "#7c3aed" },
      };
      break;

    case "bold":
      // Dark navy header, left-aligned — visually distinct from all other templates
      styles = {
        page: { backgroundColor: "#ffffff" },
        header: {
          alignItems: "flex-start" as const,
          backgroundColor: "#0f172a",
          padding: 22,
          marginBottom: 26,
        },
        name: {
          color: "#f8fafc",
          fontWeight: "bold",
          textAlign: "left" as const,
        },
        contactInfo: {
          color: "#94a3b8",
          justifyContent: "flex-start" as const,
        },
        sectionTitle: {
          color: "#0f172a",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          letterSpacing: 2,
          borderBottomWidth: 3,
          borderBottomColor: "#0f172a",
          paddingBottom: 4,
          marginBottom: 10,
          marginTop: 8,
        },
        link: { color: "#1e40af", textDecoration: "none" },
        bulletSeparator: { color: "#0f172a" },
      };
      break;

    case "elegant":
      // Warm gold/champagne — distinct from creative (pink) and bold (navy)
      styles = {
        page: { backgroundColor: "#fffdf7" },
        header: {
          backgroundColor: "#fef9e7",
          padding: 20,
          borderBottomWidth: 2,
          borderBottomColor: "#b45309",
          marginBottom: 28,
        },
        name: { color: "#78350f", fontWeight: "bold", letterSpacing: 0.5 },
        contactInfo: { color: "#92400e" },
        sectionTitle: {
          color: "#b45309",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          letterSpacing: 1.5,
          borderBottomWidth: 1,
          borderBottomColor: "#fde68a",
          paddingBottom: 4,
          marginBottom: 10,
          marginTop: 6,
        },
        link: { color: "#b45309", textDecoration: "none" },
        bulletSeparator: { color: "#b45309" },
      };
      break;

    case "classic":
    default:
      styles = {
        page: { backgroundColor: "#ffffff" },
        header: {
          borderBottomWidth: 2.5,
          borderBottomColor: "#1f2937",
          paddingBottom: 10,
          marginBottom: 20,
        },
        name: { color: "#111827", fontWeight: "bold" },
        contactInfo: { color: "#4b5563" },
        sectionTitle: {
          color: "#1f2937",
          fontWeight: "bold",
          textTransform: "uppercase" as const,
          letterSpacing: 0.8,
          borderBottomWidth: 1.5,
          borderBottomColor: "#d1d5db",
          paddingBottom: 3,
          marginBottom: 8,
          marginTop: 4,
        },
        link: { color: "#374151", textDecoration: "none" },
        bulletSeparator: { color: "#6b7280" },
      };
  }

  // Apply custom accent color over template defaults (affects accent elements)
  if (accentColor) {
    if (styles.sectionTitle)
      styles.sectionTitle = { ...styles.sectionTitle, color: accentColor };
    if (styles.link)
      styles.link = { color: accentColor, textDecoration: "none" };
    if (styles.bulletSeparator)
      styles.bulletSeparator = {
        ...styles.bulletSeparator,
        color: accentColor,
      };
  }

  return styles;
}

interface ResumePDFDocumentProps {
  resume: Resume;
  variant?: "base" | "tailored";
}

// Key names must match the database default for section_order
const DEFAULT_SECTION_ORDER = [
  "professional_summary",
  "skills",
  "work_experience",
  "projects",
  "education",
  "certifications",
  "publications",
  "volunteer",
  "languages",
  "awards",
];

export const ResumePDFDocument = memo(
  function ResumePDFDocument({ resume }: ResumePDFDocumentProps) {
    const template = resume.template || "classic";
    const fontFamily =
      resume.document_settings?.font_family === "times-roman"
        ? "Times-Roman"
        : "Helvetica";
    const accentColor = resume.document_settings?.accent_color;

    // Base styles from document_settings win over template for sizes
    const styles = useMemo(() => {
      const base = createResumeStyles(resume.document_settings, fontFamily);
      const overrides = getTemplateStyles(template, accentColor);

      const mergeMap = { ...base } as unknown as Record<
        string,
        Record<string, unknown>
      >;
      Object.keys(overrides).forEach((key) => {
        mergeMap[key] = mergeMap[key]
          ? { ...mergeMap[key], ...overrides[key] }
          : overrides[key];
      });
      const merged = mergeMap as unknown as ReturnType<
        typeof createResumeStyles
      >;

      // Re-apply document_settings sizes that templates must not override
      if (resume.document_settings?.header_name_size != null) {
        merged.name = {
          ...merged.name,
          fontSize: resume.document_settings.header_name_size,
        };
      }

      return merged;
    }, [resume.document_settings, template, fontFamily, accentColor]);

    // Section visibility: only hide if explicitly set to false in section_configs
    const sectionConfigs = resume.section_configs ?? {};
    const isVisible = (key: string) => sectionConfigs[key]?.visible !== false;

    // Use saved order or fall back to default
    const order = resume.section_order?.length
      ? resume.section_order
      : DEFAULT_SECTION_ORDER;

    const renderSection = (key: string) => {
      switch (key) {
        case "professional_summary":
          return (
            <ProfessionalSummarySection
              key="professional_summary"
              summary={resume.professional_summary}
              styles={styles}
              visible={isVisible("professional_summary")}
              fontFamily={fontFamily}
            />
          );
        case "skills":
          return (
            <SkillsSection
              key="skills"
              skills={resume.skills}
              styles={styles}
              visible={isVisible("skills")}
            />
          );
        case "work_experience":
          return (
            <ExperienceSection
              key="work_experience"
              experiences={resume.work_experience}
              styles={styles}
              visible={isVisible("work_experience")}
              fontFamily={fontFamily}
            />
          );
        case "projects":
          return (
            <ProjectsSection
              key="projects"
              projects={resume.projects}
              styles={styles}
              visible={isVisible("projects")}
              fontFamily={fontFamily}
            />
          );
        case "education":
          return (
            <EducationSection
              key="education"
              education={resume.education}
              styles={styles}
              visible={isVisible("education")}
              fontFamily={fontFamily}
            />
          );
        case "certifications":
          return (
            <CertificationsSection
              key="certifications"
              certifications={resume.certifications}
              styles={styles}
              visible={isVisible("certifications")}
              fontFamily={fontFamily}
            />
          );
        case "publications":
          return (
            <PublicationsSection
              key="publications"
              publications={resume.publications}
              styles={styles}
              visible={isVisible("publications")}
              fontFamily={fontFamily}
            />
          );
        case "volunteer":
          return (
            <VolunteerSection
              key="volunteer"
              volunteer={resume.volunteer}
              styles={styles}
              visible={isVisible("volunteer")}
              fontFamily={fontFamily}
            />
          );
        case "languages":
          return (
            <LanguagesSection
              key="languages"
              languages={resume.languages}
              styles={styles}
              visible={isVisible("languages")}
              fontFamily={fontFamily}
            />
          );
        case "awards":
          return (
            <AwardsSection
              key="awards"
              awards={resume.awards}
              styles={styles}
              visible={isVisible("awards")}
              fontFamily={fontFamily}
            />
          );
        default:
          return null;
      }
    };

    return (
      <PDFDocument>
        <PDFPage size="LETTER" style={styles.page}>
          <HeaderSection resume={resume} styles={styles} />
          {order.map(renderSection)}
        </PDFPage>
      </PDFDocument>
    );
  },
  (prevProps, nextProps) =>
    prevProps.resume === nextProps.resume &&
    prevProps.variant === nextProps.variant
);
