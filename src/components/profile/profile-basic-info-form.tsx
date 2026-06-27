"use client";

import { Profile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Camera,
  Loader2,
  X,
} from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface ProfileBasicInfoFormProps {
  profile: Profile;
  onChange: (field: keyof Profile, value: string | null) => void;
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

function ProfileAvatarUpload({
  avatarUrl,
  userId,
  onChange,
}: {
  avatarUrl?: string | null;
  userId: string;
  onChange: (url: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      // silently fail — user can retry
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative group">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors duration-150 focus:outline-none"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="h-full w-full flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors duration-150">
              {uploading ? (
                <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-gray-300" />
              )}
            </span>
          )}
          {uploading && avatarUrl && (
            <span className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            </span>
          )}
        </button>

        {avatarUrl && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 text-gray-500 flex items-center justify-center transition-colors duration-150"
            aria-label="Remove photo"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <span className="text-[11px] text-gray-400">
        {avatarUrl ? "Click to change photo" : "Add profile photo"}
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}

export function ProfileBasicInfoForm({
  profile,
  onChange,
}: ProfileBasicInfoFormProps) {
  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="flex justify-center pt-2">
        <ProfileAvatarUpload
          avatarUrl={profile.avatar_url}
          userId={profile.user_id}
          onChange={(url) => onChange("avatar_url", url)}
        />
      </div>

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
            <PhoneInput
              value={profile.phone_number || ""}
              onChange={(val) => onChange("phone_number", val)}
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
