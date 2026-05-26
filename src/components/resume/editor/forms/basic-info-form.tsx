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
  Camera,
  Loader2,
  X,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { FORM_INPUT_CLASS } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useResumeContext } from "../resume-editor-context";
import { memo, useCallback, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { generateProfessionalSummary } from "@/utils/actions/resumes/ai";

interface BasicInfoFormProps {
  profile: Profile;
}

function areBasicInfoPropsEqual(
  prevProps: BasicInfoFormProps,
  nextProps: BasicInfoFormProps
) {
  return prevProps.profile.id === nextProps.profile.id;
}

const inputClass = FORM_INPUT_CLASS;

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

function AvatarUpload({
  avatarUrl,
  userId,
}: {
  avatarUrl?: string | null;
  userId: string;
}) {
  const { dispatch } = useResumeContext();
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
      dispatch({
        type: "UPDATE_FIELD",
        field: "avatar_url",
        value: data.publicUrl,
      });
    } catch {
      // silently fail — user can retry
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "UPDATE_FIELD", field: "avatar_url", value: null });
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative group">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-400 transition-colors duration-150 focus:outline-none"
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
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-gray-300" />
              )}
            </span>
          )}
          {uploading && avatarUrl && (
            <span className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            </span>
          )}
        </button>

        {avatarUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 text-gray-500 flex items-center justify-center transition-colors duration-150"
            aria-label="Remove photo"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>

      <span className="text-[10px] text-gray-400">
        {avatarUrl ? "Click to change" : "Add photo"}
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

export const BasicInfoForm = memo(function BasicInfoFormComponent({
  profile,
}: BasicInfoFormProps) {
  const { state, dispatch } = useResumeContext();
  const { resume } = state;
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const updateField = (field: keyof typeof resume, value: string) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const MODEL_STORAGE_KEY = "persona-default-model";
      const LOCAL_STORAGE_KEY = "persona-api-keys";
      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      let apiKeys = [];
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        apiKeys = stored ? JSON.parse(stored) : [];
      } catch {
        // ignore parse errors
      }

      const summary = await generateProfessionalSummary(resume, undefined, {
        model: selectedModel || "",
        apiKeys,
      });
      dispatch({
        type: "UPDATE_FIELD",
        field: "professional_summary",
        value: summary,
      });
    } catch {
      // silently fail — user can retry
    } finally {
      setGeneratingSummary(false);
    }
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
      "avatar_url",
    ];
    fields.forEach((field) => {
      if (profile[field]) updateField(field, profile[field] as string);
    });
  };

  return (
    <div className="space-y-4 pt-2">
      <AvatarUpload avatarUrl={resume.avatar_url} userId={profile.user_id} />

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
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500">Summary</label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="h-6 px-2 text-[11px] text-violet-600 hover:text-violet-700 hover:bg-violet-50 gap-1"
            >
              {generatingSummary ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {generatingSummary ? "Generating…" : "AI Generate"}
            </Button>
          </div>
          <Textarea
            value={resume.professional_summary || ""}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_FIELD",
                field: "professional_summary",
                value: e.target.value,
              })
            }
            className="text-sm border-gray-200 bg-white placeholder:text-gray-400 min-h-[140px] focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
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
