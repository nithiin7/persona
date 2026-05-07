"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DocumentSettings, Resume, ResumeTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, LayoutTemplate, GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SavedStylesDialog } from "./saved-styles-dialog";
import { TemplateSelector } from "./template-selector";
import { cn } from "@/lib/utils";

// Section key → display label (must match database section_order keys)
const SECTION_LABELS: Record<string, string> = {
  professional_summary: "Professional Summary",
  work_experience: "Experience",
  skills: "Skills",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
};

const DEFAULT_SECTION_ORDER = [
  "professional_summary",
  "work_experience",
  "skills",
  "projects",
  "education",
  "certifications",
];

const ACCENT_COLORS = [
  { color: "#1f2937", label: "Charcoal" },
  { color: "#1e3a8a", label: "Navy" },
  { color: "#2563eb", label: "Blue" },
  { color: "#6366f1", label: "Indigo" },
  { color: "#7c3aed", label: "Purple" },
  { color: "#0d9488", label: "Teal" },
  { color: "#10b981", label: "Emerald" },
  { color: "#d97706", label: "Amber" },
  { color: "#b45309", label: "Gold" },
  { color: "#e11d48", label: "Rose" },
  { color: "#db2777", label: "Pink" },
  { color: "#dc2626", label: "Red" },
];

interface DocumentSettingsFormProps {
  resume?: Resume;
  documentSettings: DocumentSettings;
  onChange: (
    field: "document_settings" | "template" | "section_order" | "section_configs",
    value: DocumentSettings | ResumeTemplate | string[] | Record<string, { visible: boolean }>
  ) => void;
  onTemplateChange?: (template: ResumeTemplate) => void;
}

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

function NumberInput({ value, onChange, min, max, step }: NumberInputProps) {
  const increment = () => onChange(Number(Math.min(max, value + step).toFixed(2)));
  const decrement = () => onChange(Number(Math.max(min, value - step).toFixed(2)));

  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs text-muted-foreground/60 w-8">
        {Number(value.toFixed(2))}
      </span>
      <div className="flex flex-col">
        <Button type="button" variant="ghost" size="icon" className="h-4 w-4 hover:bg-slate-100" onClick={increment}>
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-4 w-4 hover:bg-slate-100" onClick={decrement}>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function DocumentSettingsForm({
  resume,
  documentSettings,
  onChange,
  onTemplateChange,
}: DocumentSettingsFormProps) {
  const defaultSettings: DocumentSettings = {
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
  };

  if (!documentSettings) {
    onChange("document_settings", defaultSettings);
    return null;
  }

  const handleSettingsChange = (newSettings: DocumentSettings) =>
    onChange("document_settings", newSettings);

  // Section management helpers
  const sectionOrder: string[] = resume?.section_order?.length
    ? resume.section_order
    : DEFAULT_SECTION_ORDER;

  const sectionConfigs: Record<string, { visible: boolean }> =
    (resume?.section_configs as Record<string, { visible: boolean }>) ?? {};

  const isSectionVisible = (key: string) =>
    sectionConfigs[key]?.visible !== false;

  const handleVisibilityChange = (key: string, visible: boolean) => {
    onChange("section_configs", {
      ...sectionConfigs,
      [key]: { ...sectionConfigs[key], visible },
    });
  };

  const handleMoveSection = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= sectionOrder.length) return;
    const newOrder = [...sectionOrder];
    [newOrder[index], newOrder[next]] = [newOrder[next], newOrder[index]];
    onChange("section_order", newOrder);
  };

  const SectionSettings = ({
    title,
    section,
  }: {
    title: string;
    section: "skills" | "experience" | "projects" | "education" | "certifications";
  }) => (
    <div className="space-y-4 bg-slate-50/50 rounded-lg border border-slate-200/50">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-muted-foreground">
            Space Above {title} Section
          </Label>
          <div className="flex items-center">
            <NumberInput
              value={documentSettings?.[`${section}_margin_top`] ?? 2}
              min={0} max={48} step={1}
              onChange={(value) => handleSettingsChange({ ...documentSettings, [`${section}_margin_top`]: value })}
            />
            <span className="text-xs text-muted-foreground/60 ml-1">pt</span>
          </div>
        </div>
        <Slider
          value={[Number(documentSettings?.[`${section}_margin_top`] ?? 2)]}
          min={0} max={48} step={1}
          onValueChange={([value]) => handleSettingsChange({ ...documentSettings, [`${section}_margin_top`]: value })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-muted-foreground">
            Space Below {title} Section
          </Label>
          <div className="flex items-center">
            <NumberInput
              value={documentSettings?.[`${section}_margin_bottom`] ?? 2}
              min={0} max={48} step={1}
              onChange={(value) => handleSettingsChange({ ...documentSettings, [`${section}_margin_bottom`]: value })}
            />
            <span className="text-xs text-muted-foreground/60 ml-1">pt</span>
          </div>
        </div>
        <Slider
          value={[Number(documentSettings?.[`${section}_margin_bottom`] ?? 2)]}
          min={0} max={48} step={1}
          onValueChange={([value]) => handleSettingsChange({ ...documentSettings, [`${section}_margin_bottom`]: value })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-muted-foreground">Horizontal Margins</Label>
          <div className="flex items-center">
            <NumberInput
              value={documentSettings?.[`${section}_margin_horizontal`] ?? 0}
              min={0} max={72} step={2}
              onChange={(value) => handleSettingsChange({ ...documentSettings, [`${section}_margin_horizontal`]: value })}
            />
            <span className="text-xs text-muted-foreground/60 ml-1">pt</span>
          </div>
        </div>
        <Slider
          value={[Number(documentSettings?.[`${section}_margin_horizontal`] ?? 0)]}
          min={0} max={72} step={2}
          onValueChange={([value]) => handleSettingsChange({ ...documentSettings, [`${section}_margin_horizontal`]: value })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-muted-foreground">Space Between Items</Label>
          <div className="flex items-center">
            <NumberInput
              value={documentSettings?.[`${section}_item_spacing`] ?? 4}
              min={0} max={16} step={0.5}
              onChange={(value) => handleSettingsChange({ ...documentSettings, [`${section}_item_spacing`]: value })}
            />
            <span className="text-xs text-muted-foreground/60 ml-1">pt</span>
          </div>
        </div>
        <Slider
          value={[Number(documentSettings?.[`${section}_item_spacing`] ?? 4)]}
          min={0} max={16} step={0.5}
          onValueChange={([value]) => handleSettingsChange({ ...documentSettings, [`${section}_item_spacing`]: value })}
        />
      </div>
    </div>
  );

  return (
    <div>
      <Card>
        {/* Top actions + presets */}
        <CardHeader className="flex flex-col space-y-4">
          <div className="grid grid-cols-2 gap-2 w-full">
            <SavedStylesDialog
              currentSettings={documentSettings || defaultSettings}
              onApplyStyle={(settings) => handleSettingsChange(settings)}
            />
            {onTemplateChange && resume && (
              <TemplateSelector
                currentTemplate={resume.template || "classic"}
                onTemplateChange={onTemplateChange}
              />
            )}
          </div>

          {/* Layout presets */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Default */}
            <Button
              variant="outline" size="sm"
              onClick={() => handleSettingsChange({ ...defaultSettings })}
              className="relative h-60 group p-0 overflow-hidden border-slate-200 hover:border-teal-600/40 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full w-full flex flex-col items-center">
                <div className="w-full p-2 text-xs font-medium text-teal-600 border-b border-slate-200 bg-slate-50/80">
                  <LayoutTemplate className="w-3 h-3 inline-block mr-1" />Default Layout
                </div>
                <div className="flex-1 w-full p-2 flex flex-col justify-between">
                  <div>
                    <div className="w-3/4 h-2 bg-slate-300 rounded mb-6" />
                    <div className="flex space-x-2 mb-4">
                      <div className="w-1/3 h-1 bg-slate-300 rounded" />
                      <div className="w-1/3 h-1 bg-slate-300 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[0,1,2].map(i => (
                      <div key={i} className="space-y-2">
                        <div className="w-1/3 h-1.5 bg-slate-300 rounded" />
                        <div className="space-y-1.5">
                          <div className="w-full h-1 bg-slate-300 rounded" />
                          <div className="w-11/12 h-1 bg-slate-300 rounded" />
                          <div className="w-10/12 h-1 bg-slate-300 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Button>

            {/* Compact */}
            <Button
              variant="outline" size="sm"
              onClick={() => handleSettingsChange({
                ...documentSettings,
                header_name_size: 24, document_font_size: 10, document_line_height: 1.2,
                document_margin_vertical: 20, document_margin_horizontal: 28,
                header_name_bottom_spacing: 16,
                skills_margin_top: 0, skills_margin_bottom: 2, skills_item_spacing: 0, skills_margin_horizontal: 0,
                experience_margin_top: 2, experience_margin_bottom: 0, experience_item_spacing: 1, experience_margin_horizontal: 0,
                projects_margin_top: 0, projects_margin_bottom: 0, projects_item_spacing: 0, projects_margin_horizontal: 0,
                education_margin_top: 0, education_margin_bottom: 0, education_item_spacing: 0, education_margin_horizontal: 0,
                certifications_margin_top: 0, certifications_margin_bottom: 0, certifications_item_spacing: 0, certifications_margin_horizontal: 0,
              })}
              className="relative h-60 group p-0 overflow-hidden border-slate-200 hover:border-pink-600/40 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full w-full flex flex-col items-center">
                <div className="w-full p-2 text-xs font-medium text-pink-600 border-b border-slate-200 bg-slate-50/80">
                  <LayoutTemplate className="w-3 h-3 inline-block mr-1" />Compact Layout
                </div>
                <div className="flex-1 w-full p-2 flex flex-col justify-start space-y-2">
                  <div>
                    <div className="w-2/3 h-2 bg-slate-300 rounded mb-3" />
                    <div className="flex space-x-1.5 mb-2">
                      <div className="w-1/4 h-1 bg-slate-300 rounded" />
                      <div className="w-1/4 h-1 bg-slate-300 rounded" />
                      <div className="w-1/4 h-1 bg-slate-300 rounded" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="space-y-1">
                        <div className="w-1/4 h-1.5 bg-slate-300 rounded" />
                        <div className="space-y-1">
                          <div className="w-full h-1 bg-slate-300 rounded" />
                          <div className="w-11/12 h-1 bg-slate-300 rounded" />
                          <div className="w-10/12 h-1 bg-slate-300 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Button>

            {/* Spacious */}
            <Button
              variant="outline" size="sm"
              onClick={() => handleSettingsChange({
                ...documentSettings,
                header_name_size: 28, document_font_size: 10.5, document_line_height: 1.6,
                document_margin_vertical: 48, document_margin_horizontal: 42,
                header_name_bottom_spacing: 32,
                skills_margin_top: 6, skills_margin_bottom: 6, skills_item_spacing: 4, skills_margin_horizontal: 0,
                experience_margin_top: 6, experience_margin_bottom: 6, experience_item_spacing: 6, experience_margin_horizontal: 0,
                projects_margin_top: 6, projects_margin_bottom: 6, projects_item_spacing: 6, projects_margin_horizontal: 0,
                education_margin_top: 6, education_margin_bottom: 6, education_item_spacing: 6, education_margin_horizontal: 0,
                certifications_margin_top: 6, certifications_margin_bottom: 6, certifications_item_spacing: 6, certifications_margin_horizontal: 0,
              })}
              className="relative h-60 group p-0 overflow-hidden border-slate-200 hover:border-blue-600/40 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full w-full flex flex-col items-center">
                <div className="w-full p-2 text-xs font-medium text-blue-600 border-b border-slate-200 bg-slate-50/80">
                  <LayoutTemplate className="w-3 h-3 inline-block mr-1" />Spacious Layout
                </div>
                <div className="flex-1 w-full p-2 flex flex-col justify-start">
                  <div className="mb-4">
                    <div className="w-4/5 h-2.5 bg-slate-300 rounded mb-8" />
                    <div className="flex space-x-3 mb-6">
                      <div className="w-1/3 h-1.5 bg-slate-300 rounded" />
                      <div className="w-1/3 h-1.5 bg-slate-300 rounded" />
                    </div>
                  </div>
                  <div className="space-y-5">
                    {[0,1].map(i => (
                      <div key={i} className="space-y-3">
                        <div className="w-2/5 h-2 bg-slate-300 rounded" />
                        <div className="space-y-2 pl-2">
                          <div className="w-full h-1 bg-slate-300 rounded" />
                          <div className="w-11/12 h-1 bg-slate-300 rounded" />
                          <div className="w-10/12 h-1 bg-slate-300 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Button>

            {/* Executive */}
            <Button
              variant="outline" size="sm"
              onClick={() => handleSettingsChange({
                ...documentSettings,
                header_name_size: 26, document_font_size: 10.5, document_line_height: 1.55,
                document_margin_vertical: 40, document_margin_horizontal: 38,
                header_name_bottom_spacing: 28,
                skills_margin_top: 5, skills_margin_bottom: 5, skills_item_spacing: 3.5, skills_margin_horizontal: 4,
                experience_margin_top: 5, experience_margin_bottom: 5, experience_item_spacing: 5, experience_margin_horizontal: 4,
                projects_margin_top: 5, projects_margin_bottom: 5, projects_item_spacing: 5, projects_margin_horizontal: 4,
                education_margin_top: 5, education_margin_bottom: 5, education_item_spacing: 5, education_margin_horizontal: 4,
                certifications_margin_top: 5, certifications_margin_bottom: 5, certifications_item_spacing: 3.5, certifications_margin_horizontal: 4,
              })}
              className="relative h-60 group p-0 overflow-hidden border-slate-200 hover:border-amber-600/40 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full w-full flex flex-col items-center">
                <div className="w-full p-2 text-xs font-medium text-amber-600 border-b border-slate-200 bg-slate-50/80">
                  <LayoutTemplate className="w-3 h-3 inline-block mr-1" />Executive Layout
                </div>
                <div className="flex-1 w-full p-2 flex flex-col justify-start">
                  <div className="mb-4">
                    <div className="w-4/5 h-2 bg-slate-300 rounded mb-7" />
                    <div className="flex space-x-2.5 mb-5">
                      <div className="w-1/3 h-1 bg-slate-300 rounded" />
                      <div className="w-1/3 h-1 bg-slate-300 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[0,1,2].map(i => (
                      <div key={i} className="space-y-2.5 pl-1">
                        <div className="w-2/5 h-1.5 bg-slate-300 rounded" />
                        <div className="space-y-1.5">
                          <div className="w-full h-1 bg-slate-300 rounded" />
                          <div className="w-11/12 h-1 bg-slate-300 rounded" />
                          <div className="w-10/12 h-1 bg-slate-300 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">

          {/* ── Accent Color ─────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">
                Accent Color
              </Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Auto — uses template default */}
              <button
                title="Template default"
                onClick={() => handleSettingsChange({ ...documentSettings, accent_color: undefined })}
                className={cn(
                  "h-7 px-2 rounded-full text-xs border-2 transition-all",
                  !documentSettings.accent_color
                    ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                    : "border-slate-200 text-slate-500 hover:border-slate-400"
                )}
              >
                Auto
              </button>
              {ACCENT_COLORS.map(({ color, label }) => (
                <button
                  key={color}
                  title={label}
                  onClick={() => handleSettingsChange({ ...documentSettings, accent_color: color })}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                    documentSettings.accent_color === color
                      ? "border-slate-800 scale-110 shadow-md"
                      : "border-white shadow-sm"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* ── Font Family ──────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">
                Font
              </Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSettingsChange({ ...documentSettings, font_family: "helvetica" })}
                className={cn(
                  "py-2.5 px-4 rounded-lg border-2 text-sm transition-all",
                  !documentSettings.font_family || documentSettings.font_family === "helvetica"
                    ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                <span className="font-sans">Sans-Serif</span>
                <span className="block text-xs text-muted-foreground mt-0.5">Helvetica</span>
              </button>
              <button
                onClick={() => handleSettingsChange({ ...documentSettings, font_family: "times-roman" })}
                className={cn(
                  "py-2.5 px-4 rounded-lg border-2 text-sm transition-all",
                  documentSettings.font_family === "times-roman"
                    ? "border-teal-500 bg-teal-50 text-teal-700 font-medium"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                <span style={{ fontFamily: "Georgia, serif" }}>Serif</span>
                <span className="block text-xs text-muted-foreground mt-0.5">Times Roman</span>
              </button>
            </div>
          </div>

          {/* ── Section Order & Visibility ───────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent whitespace-nowrap">
                Sections
              </Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>
            <div className="space-y-1.5">
              {sectionOrder.map((key, index) => {
                const label = SECTION_LABELS[key] ?? key;
                const visible = isSectionVisible(key);
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg border transition-colors",
                      visible
                        ? "bg-white border-slate-200"
                        : "bg-slate-50 border-slate-200/50 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={visible}
                        onCheckedChange={(checked) => handleVisibilityChange(key, checked)}
                        className="scale-75"
                      />
                      <Button
                        type="button" variant="ghost" size="icon" className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => handleMoveSection(index, -1)}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button" variant="ghost" size="icon" className="h-6 w-6"
                        disabled={index === sectionOrder.length - 1}
                        onClick={() => handleMoveSection(index, 1)}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Document Spacing ─────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Document
              </Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>

            <div className="space-y-4 bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Font Size</Label>
                  <div className="flex items-center">
                    <NumberInput value={documentSettings?.document_font_size ?? 10} min={8} max={12} step={0.5}
                      onChange={(value) => handleSettingsChange({ ...documentSettings, document_font_size: value })} />
                    <span className="text-xs text-muted-foreground/60 ml-1">pt</span>
                  </div>
                </div>
                <Slider value={[documentSettings?.document_font_size ?? 10]} min={8} max={12} step={0.5}
                  onValueChange={([value]) => handleSettingsChange({ ...documentSettings, document_font_size: value })} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Line Height</Label>
                  <div className="flex items-center">
                    <NumberInput value={documentSettings?.document_line_height ?? 1.5} min={1} max={2} step={0.1}
                      onChange={(value) => handleSettingsChange({ ...documentSettings, document_line_height: value })} />
                    <span className="text-xs text-muted-foreground/60 ml-1">x</span>
                  </div>
                </div>
                <Slider value={[documentSettings?.document_line_height ?? 1.5]} min={1} max={2} step={0.1}
                  onValueChange={([value]) => handleSettingsChange({ ...documentSettings, document_line_height: value })} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Vertical Margins</Label>
                  <div className="flex items-center">
                    <NumberInput value={documentSettings?.document_margin_vertical ?? 36} min={18} max={108} step={2}
                      onChange={(value) => handleSettingsChange({ ...documentSettings, document_margin_vertical: value })} />
                    <span className="text-xs text-muted-foreground/60 ml-1">pt</span>
                  </div>
                </div>
                <Slider value={[documentSettings?.document_margin_vertical ?? 36]} min={18} max={108} step={2}
                  onValueChange={([value]) => handleSettingsChange({ ...documentSettings, document_margin_vertical: value })} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Horizontal Margins</Label>
                  <div className="flex items-center">
                    <NumberInput value={documentSettings?.document_margin_horizontal ?? 36} min={18} max={108} step={2}
                      onChange={(value) => handleSettingsChange({ ...documentSettings, document_margin_horizontal: value })} />
                    <span className="text-xs text-muted-foreground/60 ml-1">pt</span>
                  </div>
                </div>
                <Slider value={[documentSettings?.document_margin_horizontal ?? 36]} min={18} max={108} step={2}
                  onValueChange={([value]) => handleSettingsChange({ ...documentSettings, document_margin_horizontal: value })} />
              </div>
            </div>
          </div>

          {/* ── Header ───────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center">
              <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Header
              </Label>
              <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
            </div>
            <div className="space-y-4 bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Name Size</Label>
                  <div className="flex items-center">
                    <NumberInput value={documentSettings?.header_name_size ?? 24} min={0} max={40} step={1}
                      onChange={(value) => handleSettingsChange({ ...documentSettings, header_name_size: value })} />
                    <span className="text-xs text-muted-foreground/60 ml-1">pt</span>
                  </div>
                </div>
                <Slider value={[documentSettings?.header_name_size ?? 24]} min={0} max={40} step={1}
                  onValueChange={([value]) => handleSettingsChange({ ...documentSettings, header_name_size: value })} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Space Below Name</Label>
                  <div className="flex items-center">
                    <NumberInput value={documentSettings?.header_name_bottom_spacing ?? 24} min={0} max={50} step={1}
                      onChange={(value) => handleSettingsChange({ ...documentSettings, header_name_bottom_spacing: value })} />
                    <span className="text-xs text-muted-foreground/60 ml-1">pt</span>
                  </div>
                </div>
                <Slider value={[documentSettings?.header_name_bottom_spacing ?? 24]} min={0} max={50} step={1}
                  onValueChange={([value]) => handleSettingsChange({ ...documentSettings, header_name_bottom_spacing: value })} />
              </div>
            </div>
          </div>

          {/* ── Per-section spacing ──────────────────────────── */}
          {(["skills", "experience", "projects", "education", "certifications"] as const).map((section) => (
            <div key={section} className="space-y-4 bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
              <div className="flex items-center">
                <Label className="text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent capitalize">
                  {section === "experience" ? "Experience" : section.charAt(0).toUpperCase() + section.slice(1)}
                </Label>
                <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-teal-200/20 via-cyan-200/20 to-transparent" />
              </div>
              <SectionSettings
                title={section === "experience" ? "Experience" : section.charAt(0).toUpperCase() + section.slice(1)}
                section={section}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
