"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SecurityForm } from "./security-form";
import { ApiKeysForm } from "./api-keys-form";
import { DangerZone } from "./danger-zone";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Shield, KeyRound, AlertTriangle } from "lucide-react";

const sections = [
  {
    id: "security",
    title: "Security",
    description: "Manage your email and password settings",
    icon: Shield,
  },
  {
    id: "api-keys",
    title: "API Keys",
    description: "Manage your API keys for different AI providers",
    icon: KeyRound,
  },
  {
    id: "danger-zone",
    title: "Danger Zone",
    description: "Irreversible and destructive actions",
    icon: AlertTriangle,
  },
];

interface SettingsContentProps {
  user: User | null;
  isProPlan: boolean;
  subscriptionStatus: string;
}

export function SettingsContent({ user, isProPlan }: SettingsContentProps) {
  const [activeSection, setActiveSection] = useState<string>("security");

  useEffect(() => {
    const handleScroll = () => {
      const current = sections.find(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom > 100;
      });
      if (current) setActiveSection(current.id);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="flex gap-8 relative animate-fade-in">
      {/* Sidebar TOC */}
      <div className="w-52 hidden lg:block shrink-0">
        <div className="sticky top-20 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 mb-2">
            On this page
          </p>
          <nav className="space-y-0.5">
            {sections.map(({ id, title, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-left transition-colors duration-150",
                  activeSection === id
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 min-w-0">
        <Card
          id="security"
          className="bg-white border border-gray-200 shadow-sm rounded-xl"
        >
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-semibold text-gray-900">
              Security
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Manage your email and password settings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <SecurityForm user={user} />
          </CardContent>
        </Card>

        <Card
          id="api-keys"
          className="bg-white border border-gray-200 shadow-sm rounded-xl"
        >
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-semibold text-gray-900">
              API Keys
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Manage your API keys for different AI providers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ApiKeysForm isProPlan={isProPlan} />
          </CardContent>
        </Card>

        <Card
          id="danger-zone"
          className="bg-white border border-red-200 shadow-sm rounded-xl"
        >
          <CardHeader className="border-b border-red-100 pb-4">
            <CardTitle className="text-base font-semibold text-red-600">
              Danger Zone
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <DangerZone />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
