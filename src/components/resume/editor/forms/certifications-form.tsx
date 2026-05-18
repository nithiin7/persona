"use client";

import { Certification, Profile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { FormField, FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { DeleteButton } from "@/components/ui/delete-button";
import { AddItemButton } from "@/components/ui/add-item-button";
import { cn } from "@/lib/utils";

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
    <div className="space-y-2">
      <div className="@container">
        <div className="flex flex-col @[400px]:flex-row gap-2">
          <AddItemButton
            onClick={addCertification}
            className="flex-1 min-w-[120px]"
          >
            Add Certification
          </AddItemButton>
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
            <div className="flex items-end gap-2">
              <FormField label="Certification Name" className="flex-1">
                <Input
                  value={cert.name}
                  onChange={(e) =>
                    updateCertification(index, "name", e.target.value)
                  }
                  className={cn(FORM_INPUT_CLASS, "font-medium")}
                  placeholder="AWS Solutions Architect"
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

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Date" hint="opt">
                <Input
                  value={cert.date || ""}
                  onChange={(e) =>
                    updateCertification(index, "date", e.target.value)
                  }
                  className={FORM_INPUT_CLASS}
                  placeholder="June 2023"
                />
              </FormField>
              <FormField label="Credential ID" hint="opt">
                <Input
                  value={cert.credential_id || ""}
                  onChange={(e) =>
                    updateCertification(index, "credential_id", e.target.value)
                  }
                  className={FORM_INPUT_CLASS}
                  placeholder="ABC-123456"
                />
              </FormField>
            </div>

            <FormField label="Credential URL" hint="opt">
              <Input
                type="url"
                value={cert.credential_url || ""}
                onChange={(e) =>
                  updateCertification(index, "credential_url", e.target.value)
                }
                className={FORM_INPUT_CLASS}
                placeholder="https://example.com/credentials/…"
              />
            </FormField>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
