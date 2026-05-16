"use client";

import { Profile, Resume } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  User,
  UserCircle2,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeContext } from "../resume-editor-context";
import { memo, useCallback } from "react";

interface BasicInfoFormProps {
  profile: Profile;
}

function areBasicInfoPropsEqual(
  prevProps: BasicInfoFormProps,
  nextProps: BasicInfoFormProps
) {
  return prevProps.profile.id === nextProps.profile.id;
}

const inputClass =
  "h-8 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

const BasicInfoField = memo(function BasicInfoField({
  field,
  value,
  label,
  icon: Icon,
  placeholder,
  type = "text",
}: {
  field: keyof Resume;
  value: string;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  type?: string;
}) {
  const { dispatch } = useResumeContext();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: "UPDATE_FIELD", field, value: e.target.value });
    },
    [dispatch, field]
  );

  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <Icon className="h-3 w-3 text-gray-400" />
        {label}
      </label>
      <Input
        type={type}
        value={value || ""}
        onChange={handleChange}
        className={inputClass}
        placeholder={placeholder}
      />
    </div>
  );
});

export const BasicInfoForm = memo(function BasicInfoFormComponent({
  profile,
}: BasicInfoFormProps) {
  const { state, dispatch } = useResumeContext();
  const { resume } = state;

  const updateField = (field: keyof typeof resume, value: string) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const handleFillFromProfile = () => {
    if (!profile) return;
    const fields: (keyof Profile)[] = [
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "location",
      "website",
      "linkedin_url",
      "github_url",
    ];
    fields.forEach((field) => {
      if (profile[field]) updateField(field, profile[field] as string);
    });
  };

  return (
    <div className="space-y-4 pt-2">
      {profile && (
        <Button
          onClick={handleFillFromProfile}
          size="sm"
          className="w-full h-8 bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-150 text-xs"
        >
          <UserCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Fill from Profile
        </Button>
      )}

      <div className="space-y-3">
        {/* Name */}
        <div className="grid grid-cols-2 gap-2">
          <BasicInfoField
            field="first_name"
            value={resume.first_name}
            label="First Name"
            icon={User}
            placeholder="First"
          />
          <BasicInfoField
            field="last_name"
            value={resume.last_name}
            label="Last Name"
            icon={User}
            placeholder="Last"
          />
        </div>

        <BasicInfoField
          field="email"
          value={resume.email}
          label="Email"
          icon={Mail}
          placeholder="email@example.com"
          type="email"
        />
        <BasicInfoField
          field="phone_number"
          value={resume.phone_number || ""}
          label="Phone"
          icon={Phone}
          placeholder="+1 (555) 000-0000"
          type="tel"
        />
        <BasicInfoField
          field="location"
          value={resume.location || ""}
          label="Location"
          icon={MapPin}
          placeholder="City, State, Country"
        />

        {/* Summary */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Summary</label>
          <Textarea
            value={resume.professional_summary || ""}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_FIELD",
                field: "professional_summary",
                value: e.target.value,
              })
            }
            className="text-sm border-gray-200 bg-white placeholder:text-gray-400 min-h-[80px] focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            placeholder="Brief professional summary…"
          />
        </div>

        {/* Links */}
        <BasicInfoField
          field="website"
          value={resume.website || ""}
          label="Website"
          icon={Globe}
          placeholder="https://your-website.com"
          type="url"
        />
        <BasicInfoField
          field="linkedin_url"
          value={resume.linkedin_url || ""}
          label="LinkedIn"
          icon={Linkedin}
          placeholder="https://linkedin.com/in/username"
          type="url"
        />
        <BasicInfoField
          field="github_url"
          value={resume.github_url || ""}
          label="GitHub"
          icon={Github}
          placeholder="https://github.com/username"
          type="url"
        />
      </div>
    </div>
  );
}, areBasicInfoPropsEqual);
