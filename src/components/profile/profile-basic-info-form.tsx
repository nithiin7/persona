"use client";

import { Profile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface ProfileBasicInfoFormProps {
  profile: Profile;
  onChange: (field: keyof Profile, value: string) => void;
}

function FieldGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "h-9 border-gray-200 bg-white placeholder:text-gray-400 text-sm text-gray-900 focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

export function ProfileBasicInfoForm({
  profile,
  onChange,
}: ProfileBasicInfoFormProps) {
  return (
    <div className="space-y-8">
      {/* Personal Details */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
          Personal Details
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldGroup label="First Name">
            <Input
              value={profile.first_name || ""}
              onChange={(e) => onChange("first_name", e.target.value)}
              className={inputClass}
              placeholder="First Name"
            />
          </FieldGroup>
          <FieldGroup label="Last Name">
            <Input
              value={profile.last_name || ""}
              onChange={(e) => onChange("last_name", e.target.value)}
              className={inputClass}
              placeholder="Last Name"
            />
          </FieldGroup>
          <FieldGroup label="Email" icon={Mail}>
            <Input
              type="email"
              value={profile.email || ""}
              onChange={(e) => onChange("email", e.target.value)}
              className={inputClass}
              placeholder="email@example.com"
            />
          </FieldGroup>
          <FieldGroup label="Phone" icon={Phone}>
            <Input
              type="tel"
              value={profile.phone_number || ""}
              onChange={(e) => onChange("phone_number", e.target.value)}
              className={inputClass}
              placeholder="+1 (555) 000-0000"
            />
          </FieldGroup>
          <FieldGroup label="Location" icon={MapPin}>
            <Input
              value={profile.location || ""}
              onChange={(e) => onChange("location", e.target.value)}
              className={inputClass}
              placeholder="City, State, Country"
            />
          </FieldGroup>
        </div>
      </div>

      {/* Online Presence */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
          Online Presence
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldGroup label="Website" icon={Globe}>
            <Input
              type="url"
              value={profile.website || ""}
              onChange={(e) => onChange("website", e.target.value)}
              className={inputClass}
              placeholder="https://your-website.com"
            />
          </FieldGroup>
          <FieldGroup label="LinkedIn" icon={Linkedin}>
            <Input
              type="url"
              value={profile.linkedin_url || ""}
              onChange={(e) => onChange("linkedin_url", e.target.value)}
              className={inputClass}
              placeholder="https://linkedin.com/in/username"
            />
          </FieldGroup>
          <FieldGroup label="GitHub" icon={Github}>
            <Input
              type="url"
              value={profile.github_url || ""}
              onChange={(e) => onChange("github_url", e.target.value)}
              className={inputClass}
              placeholder="https://github.com/username"
            />
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}
