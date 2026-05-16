"use client";

import { Certification, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
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

  const inputClass =
    "h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <div className="space-y-2">
      <div className="@container">
        <div className="flex flex-col @[400px]:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 h-9 min-w-[120px] border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
            onClick={addCertification}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
            Add Certification
          </Button>
          <div className="flex-1 min-w-[120px]">
            <ImportFromProfileDialog
              profile={profile}
              type="certifications"
              onImport={(data) =>
                handleImportFromProfile(data as Certification[])
              }
              buttonClassName="h-9 w-full mb-0 text-sm border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
            />
          </div>
        </div>
      </div>

      {certifications.map((cert, index) => (
        <Card
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <CardContent className="p-3 space-y-3">
            {/* Name + delete */}
            <div className="flex items-end gap-2">
              <div className="space-y-1 flex-1">
                <label className="text-xs font-medium text-gray-500">
                  Certification Name
                </label>
                <Input
                  value={cert.name}
                  onChange={(e) =>
                    updateCertification(index, "name", e.target.value)
                  }
                  className={inputClass + " font-medium"}
                  placeholder="AWS Solutions Architect"
                />
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                Provider
              </label>
              <Input
                value={cert.provider}
                onChange={(e) =>
                  updateCertification(index, "provider", e.target.value)
                }
                className={inputClass}
                placeholder="Issuing Organization"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Date <span className="text-gray-400">(opt)</span>
                </label>
                <Input
                  value={cert.date || ""}
                  onChange={(e) =>
                    updateCertification(index, "date", e.target.value)
                  }
                  className={inputClass}
                  placeholder="June 2023"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">
                  Credential ID <span className="text-gray-400">(opt)</span>
                </label>
                <Input
                  value={cert.credential_id || ""}
                  onChange={(e) =>
                    updateCertification(index, "credential_id", e.target.value)
                  }
                  className={inputClass}
                  placeholder="ABC-123456"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                Credential URL <span className="text-gray-400">(opt)</span>
              </label>
              <Input
                type="url"
                value={cert.credential_url || ""}
                onChange={(e) =>
                  updateCertification(index, "credential_url", e.target.value)
                }
                className={inputClass}
                placeholder="https://example.com/credentials/…"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
