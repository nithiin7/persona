import { redirect } from "next/navigation";
import { getDashboardData } from "@/utils/actions";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Force dynamic behavior and disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditProfilePage() {
  // Fetch profile data and handle authentication
  let data;
  try {
    data = await getDashboardData();
  } catch (error: unknown) {
    void error;
    redirect("/");
  }

  const { profile } = data;

  // Display a friendly message if no profile exists
  if (!profile) {
    redirect("/home");
  }

  return (
    <main className="relative">
      {/* Clean Background */}
      <div className="fixed inset-0 z-0 bg-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          }
        >
          <ProfileEditForm profile={profile} />
        </Suspense>
      </div>
    </main>
  );
}
