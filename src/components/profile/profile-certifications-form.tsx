"use client";

import { Certification } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProfileCertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

const inputClass =
  "h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function ProfileCertificationsForm({
  certifications,
  onChange,
}: ProfileCertificationsFormProps) {
  const addCertification = () => {
    onChange([
      ...certifications,
      {
        name: "",
        provider: "",
        date: "",
        credential_id: "",
        credential_url: "",
      },
    ]);
  };

  const updateCertification = (
    index: number,
    field: keyof Certification,
    value: Certification[typeof field]
  ) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeCertification = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Accordion
        type="multiple"
        className="space-y-2"
        defaultValue={certifications.map((_, i) => `cert-${i}`)}
      >
        {certifications.map((cert, index) => (
          <AccordionItem
            key={index}
            value={`cert-${index}`}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-150"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {cert.name || "New Certification"}
                  {cert.provider && (
                    <span className="font-normal text-gray-500 ml-1.5 text-xs">
                      by {cert.provider}
                    </span>
                  )}
                </span>
                {cert.date && (
                  <span className="text-xs text-gray-400 shrink-0 mr-2">
                    {cert.date}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-3 space-y-4 border-t border-gray-100">
                {/* Name + delete */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field label="Certification Name">
                      <Input
                        value={cert.name}
                        onChange={(e) =>
                          updateCertification(index, "name", e.target.value)
                        }
                        className={inputClass}
                        placeholder="AWS Certified Solutions Architect"
                      />
                    </Field>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                    className="h-8 w-8 shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Field label="Provider">
                  <Input
                    value={cert.provider}
                    onChange={(e) =>
                      updateCertification(index, "provider", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Issuing Organization"
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Date" hint="Optional">
                    <Input
                      value={cert.date}
                      onChange={(e) =>
                        updateCertification(index, "date", e.target.value)
                      }
                      className={inputClass}
                      placeholder="June 2023"
                    />
                  </Field>
                  <Field label="Credential ID" hint="Optional">
                    <Input
                      value={cert.credential_id || ""}
                      onChange={(e) =>
                        updateCertification(
                          index,
                          "credential_id",
                          e.target.value || undefined
                        )
                      }
                      className={inputClass}
                      placeholder="ABC-123456"
                    />
                  </Field>
                </div>

                <Field label="Credential URL" hint="Optional">
                  <Input
                    type="url"
                    value={cert.credential_url || ""}
                    onChange={(e) =>
                      updateCertification(
                        index,
                        "credential_url",
                        e.target.value || undefined
                      )
                    }
                    className={inputClass}
                    placeholder="https://example.com/credentials/…"
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        variant="outline"
        onClick={addCertification}
        className="w-full h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Certification
      </Button>
    </div>
  );
}
