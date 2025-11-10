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
import React from "react";

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
    <div className="space-y-3">
      <Accordion
        type="multiple"
        className="space-y-3"
        defaultValue={certifications.map((_, index) => `cert-${index}`)}
      >
        {certifications.map((cert, index) => (
          <AccordionItem
            key={index}
            value={`cert-${index}`}
            className="bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-blue-500/5 backdrop-blur-md border border-indigo-500/30 hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300 shadow-sm rounded-md overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex items-center justify-between gap-3 flex-1">
                <div className="flex-1 text-left text-sm font-medium text-indigo-900">
                  {cert.name || "New Certification"}
                  {cert.provider && (
                    <span className="text-gray-500 text-xs ml-2">
                      by {cert.provider}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {cert.date && <span>{cert.date}</span>}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-4 pb-4 pt-2 space-y-4">
                {/* Certification Name and Delete Button Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative group flex-1">
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(index, "name", e.target.value)
                      }
                      className="text-base bg-white/50 border-gray-200 rounded-md h-8
                        focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                        hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                        placeholder:text-gray-400"
                      placeholder="Certification Name"
                    />
                    <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-indigo-700">
                      CERTIFICATION NAME
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-300 h-8 w-8"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Provider */}
                <div className="relative group">
                  <Input
                    value={cert.provider}
                    onChange={(e) =>
                      updateCertification(index, "provider", e.target.value)
                    }
                    className="bg-white/50 border-gray-200 rounded-md h-8
                      focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                      hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400 text-sm"
                    placeholder="Issuing Organization"
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-indigo-700">
                    PROVIDER
                  </div>
                </div>

                {/* Date and Credential ID Row */}
                <div className="flex flex-col md:flex-row md:items-start gap-3">
                  <div className="relative group flex-1">
                    <Input
                      type="text"
                      value={cert.date}
                      onChange={(e) =>
                        updateCertification(index, "date", e.target.value)
                      }
                      className="bg-white/50 border-gray-200 rounded-md h-8
                        focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                        hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                        placeholder:text-gray-400 text-sm"
                      placeholder="e.g., 'June 2023' or '2023'"
                    />
                    <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-indigo-700">
                      DATE (OPTIONAL)
                    </div>
                  </div>
                  <div className="relative group flex-1">
                    <Input
                      type="text"
                      value={cert.credential_id || ""}
                      onChange={(e) =>
                        updateCertification(
                          index,
                          "credential_id",
                          e.target.value || undefined
                        )
                      }
                      className="bg-white/50 border-gray-200 rounded-md h-8
                        focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                        hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                        placeholder:text-gray-400 text-sm"
                      placeholder="Credential ID"
                    />
                    <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-indigo-700">
                      CREDENTIAL ID (OPTIONAL)
                    </div>
                  </div>
                </div>

                {/* Credential URL */}
                <div className="relative group">
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
                    className="bg-white/50 border-gray-200 rounded-md h-8
                      focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                      hover:border-indigo-500/30 hover:bg-white/60 transition-colors
                      placeholder:text-gray-400 text-sm"
                    placeholder="https://example.com/credentials/..."
                  />
                  <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-indigo-700">
                    CREDENTIAL URL (OPTIONAL)
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        variant="outline"
        onClick={addCertification}
        className="w-full bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-blue-500/5 hover:from-indigo-500/10 hover:via-indigo-500/15 hover:to-blue-500/10 border-dashed border-indigo-500/30 hover:border-indigo-500/40 text-indigo-700 hover:text-indigo-800 transition-all duration-300 h-8 text-sm"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Certification
      </Button>
    </div>
  );
}

