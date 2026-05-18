"use client";

import { Certification } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";

interface ProfileCertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
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
                <div className="flex items-end gap-2">
                  <FormField label="Certification Name" className="flex-1">
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(index, "name", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="AWS Certified Solutions Architect"
                    />
                  </FormField>
                  <DeleteButton onClick={() => removeCertification(index)} />
                </div>

                <FormField label="Provider">
                  <Input
                    value={cert.provider}
                    onChange={(e) =>
                      updateCertification(index, "provider", e.target.value)
                    }
                    className={FORM_INPUT_CLASS}
                    placeholder="Issuing Organization"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Date" hint="Optional">
                    <Input
                      value={cert.date}
                      onChange={(e) =>
                        updateCertification(index, "date", e.target.value)
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="June 2023"
                    />
                  </FormField>
                  <FormField label="Credential ID" hint="Optional">
                    <Input
                      value={cert.credential_id || ""}
                      onChange={(e) =>
                        updateCertification(
                          index,
                          "credential_id",
                          e.target.value || undefined
                        )
                      }
                      className={FORM_INPUT_CLASS}
                      placeholder="ABC-123456"
                    />
                  </FormField>
                </div>

                <FormField label="Credential URL" hint="Optional">
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
                    className={FORM_INPUT_CLASS}
                    placeholder="https://example.com/credentials/…"
                  />
                </FormField>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddItemButton onClick={addCertification} className="w-full">
        Add Certification
      </AddItemButton>
    </div>
  );
}
