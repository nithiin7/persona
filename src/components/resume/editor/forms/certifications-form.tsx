"use client";

import { Certification, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import React from "react";

interface CertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
  profile: Profile;
}

export function CertificationsForm({
  certifications,
  onChange,
  profile,
}: CertificationsFormProps) {
  const addCertification = () => {
    onChange([
      {
        name: "",
        provider: "",
        date: "",
        credential_id: "",
        credential_url: "",
      },
      ...certifications,
    ]);
  };

  const updateCertification = (
    index: number,
    field: keyof Certification,
    value: string
  ) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeCertification = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  const handleImportFromProfile = (importedCertifications: Certification[]) => {
    onChange([...importedCertifications, ...certifications]);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="@container">
        <div
          className={cn(
            "flex flex-col @[400px]:flex-row gap-2",
            "transition-all duration-300 ease-in-out"
          )}
        >
          <Button
            variant="outline"
            className={cn(
              "w-full @[400px]:w-1/2 bg-gradient-to-r from-purple-500/5 via-purple-500/10 to-purple-500/5 hover:from-purple-500/10 hover:via-purple-500/15 hover:to-purple-500/10 border-dashed border-purple-500/30 hover:border-purple-500/40 text-purple-700 hover:text-purple-800 transition-all duration-300 h-8 shadow-sm hover:shadow-md group"
            )}
            onClick={addCertification}
          >
            <Plus className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium">Add Certification</span>
          </Button>
          <div className="w-full @[400px]:w-1/2">
            <ImportFromProfileDialog
              profile={profile}
              type="certifications"
              onImport={(data) =>
                handleImportFromProfile(data as Certification[])
              }
              buttonClassName="h-8 mb-0"
            />
          </div>
        </div>
      </div>

      {certifications.map((cert, index) => (
        <Card
          key={index}
          className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-orange-500/5 backdrop-blur-md border border-amber-500/30 hover:border-amber-500/40 hover:shadow-lg transition-all duration-300 shadow-sm"
        >
          <CardContent className="p-3 sm:p-4 space-y-3">
            {/* Name and Delete Button Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="relative group flex-1">
                <Input
                  value={cert.name}
                  onChange={(e) =>
                    updateCertification(index, "name", e.target.value)
                  }
                  className="text-base bg-white/50 border-gray-200 rounded-md h-8
                    focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                    hover:border-amber-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400"
                  placeholder="Certification Name"
                />
                <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
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
                  focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                  hover:border-amber-500/30 hover:bg-white/60 transition-colors
                  placeholder:text-gray-400 text-sm"
                placeholder="Issuing Organization"
              />
              <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
                PROVIDER
              </div>
            </div>

            {/* Date and Credential ID Row */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="relative group flex-1">
                <Input
                  type="text"
                  value={cert.date || ""}
                  onChange={(e) =>
                    updateCertification(index, "date", e.target.value)
                  }
                  className="bg-white/50 border-gray-200 rounded-md h-8
                    focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                    hover:border-amber-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400 text-sm"
                  placeholder="e.g., 'June 2023' or '2023'"
                />
                <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
                  DATE (OPTIONAL)
                </div>
              </div>
              <div className="relative group flex-1">
                <Input
                  type="text"
                  value={cert.credential_id || ""}
                  onChange={(e) =>
                    updateCertification(index, "credential_id", e.target.value)
                  }
                  className="bg-white/50 border-gray-200 rounded-md h-8
                    focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                    hover:border-amber-500/30 hover:bg-white/60 transition-colors
                    placeholder:text-gray-400 text-sm"
                  placeholder="Credential ID"
                />
                <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
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
                  updateCertification(index, "credential_url", e.target.value)
                }
                className="bg-white/50 border-gray-200 rounded-md h-8
                  focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                  hover:border-amber-500/30 hover:bg-white/60 transition-colors
                  placeholder:text-gray-400 text-sm"
                placeholder="https://example.com/credentials/..."
              />
              <div className="absolute -top-2.5 left-2 px-1 bg-white/80 text-[9px] font-medium text-amber-700">
                CREDENTIAL URL (OPTIONAL)
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

