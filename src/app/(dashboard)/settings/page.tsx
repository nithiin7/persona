// src/app/settings/page.tsx

"use server";

import { SettingsContent } from "@/components/settings/settings-content";
import { createClient } from "@/utils/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProPlan = true;
  const subscription = {
    plan: "pro",
    status: "active",
    currentPeriodEnd: "",
  };

  return (
    <div className="relative pt-14">
      {/* Clean Background */}
      <div className="fixed inset-0 z-0 bg-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>
      <main className="relative z-10 pt-6 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SettingsContent
          user={user}
          isProPlan={isProPlan}
          subscriptionStatus={subscription.status}
        />
      </main>
    </div>
  );
}
