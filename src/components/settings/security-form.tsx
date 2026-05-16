"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import {
  updateEmail,
  updatePassword,
} from "@/app/(dashboard)/settings/actions";
import { toast } from "sonner";

interface SecurityFormProps {
  user: User | null;
}

const inputClass =
  "h-9 border-gray-200 bg-white placeholder:text-gray-400 text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0";

export function SecurityForm({ user }: SecurityFormProps) {
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleEmailUpdate = async () => {
    try {
      setIsUpdatingEmail(true);
      const formData = new FormData();
      formData.append("email", newEmail);
      formData.append("currentPassword", emailCurrentPassword);
      const result = await updateEmail(formData);
      if (!result.success) {
        toast.error(result.error || "Failed to update email");
        return;
      }
      toast.success("Email update request sent. Check your inbox to confirm.");
      setNewEmail("");
      setEmailCurrentPassword("");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setIsUpdatingPassword(true);
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      const result = await updatePassword(formData);
      if (!result.success) {
        toast.error(result.error || "Failed to update password");
        return;
      }
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Email Address</h4>
          <p className="text-xs text-gray-400 mt-0.5">Current: {user?.email}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="email"
            placeholder="New email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className={inputClass}
          />
          <Input
            type="password"
            placeholder="Current password"
            value={emailCurrentPassword}
            onChange={(e) => setEmailCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <Button
          variant="outline"
          className="h-9 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150 text-sm"
          onClick={handleEmailUpdate}
          disabled={isUpdatingEmail || !newEmail || !emailCurrentPassword}
        >
          {isUpdatingEmail && (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          )}
          {isUpdatingEmail ? "Updating…" : "Change Email"}
        </Button>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Password */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Password</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <Button
          variant="outline"
          className="h-9 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150 text-sm"
          onClick={handlePasswordUpdate}
          disabled={isUpdatingPassword || !currentPassword || !newPassword}
        >
          {isUpdatingPassword && (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          )}
          {isUpdatingPassword ? "Updating…" : "Change Password"}
        </Button>
      </div>
    </div>
  );
}
