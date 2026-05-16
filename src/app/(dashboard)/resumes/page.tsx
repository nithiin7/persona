import { getDashboardData } from "@/utils/actions";
import { Suspense } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniResumePreview } from "@/components/resume/shared/mini-resume-preview";
import { ResumeSortControls } from "@/components/resume/management/resume-sort-controls";
import type {
  SortOption,
  SortDirection,
} from "@/components/resume/management/resume-sort-controls";

const RESUMES_PER_PAGE = 12;

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function ResumesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { baseResumes, tailoredResumes } = await getDashboardData();

  const allResumes = [...baseResumes, ...tailoredResumes];
  const currentPage = Number(params.page) || 1;
  const sort = (params.sort as SortOption) || "createdAt";
  const direction = (params.direction as SortDirection) || "desc";

  const sortedResumes = [...allResumes].sort((a, b) => {
    const mod = direction === "asc" ? 1 : -1;
    switch (sort) {
      case "name":
        return mod * a.name.localeCompare(b.name);
      case "jobTitle":
        return mod * (a.target_role?.localeCompare(b.target_role || "") || 0);
      case "createdAt":
      default:
        return (
          mod *
          (new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );
    }
  });

  const totalPages = Math.ceil(sortedResumes.length / RESUMES_PER_PAGE);
  const paginatedResumes = sortedResumes.slice(
    (currentPage - 1) * RESUMES_PER_PAGE,
    currentPage * RESUMES_PER_PAGE
  );

  return (
    <div className="relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-gray-50">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Resumes</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span>{allResumes.length} total</span>
              <span className="w-px h-3.5 bg-gray-200" />
              <span>{baseResumes.length} base</span>
              <span className="w-px h-3.5 bg-gray-200" />
              <span>{tailoredResumes.length} tailored</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Suspense>
              <ResumeSortControls />
            </Suspense>
            <Link
              href="/home"
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium",
                "bg-gray-900 text-white hover:bg-gray-700",
                "transition-colors duration-150"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              New Resume
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="animate-fade-up bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <Suspense fallback={<GridSkeleton />}>
            {paginatedResumes.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-5">
                {paginatedResumes.map((resume) => (
                  <Link href={`/resumes/${resume.id}`} key={resume.id}>
                    <MiniResumePreview
                      name={resume.name}
                      type={resume.is_base_resume ? "base" : "tailored"}
                      target_role={resume.target_role}
                      createdAt={resume.created_at}
                    />
                  </Link>
                ))}
              </div>
            )}
          </Suspense>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1">
            {currentPage > 1 && (
              <PaginationLink
                href={`?page=${currentPage - 1}&sort=${sort}&direction=${direction}`}
                label="←"
              />
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationLink
                key={page}
                href={`?page=${page}&sort=${sort}&direction=${direction}`}
                label={String(page)}
                active={page === currentPage}
              />
            ))}
            {currentPage < totalPages && (
              <PaginationLink
                href={`?page=${currentPage + 1}&sort=${sort}&direction=${direction}`}
                label="→"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PaginationLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center h-8 min-w-[2rem] px-2.5 rounded-md text-sm transition-colors duration-150",
        active
          ? "bg-gray-900 text-white font-medium"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      )}
    >
      {label}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
        <FileText className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">No resumes yet</h3>
      <p className="text-sm text-gray-400 mb-5">
        Create your first resume from your dashboard.
      </p>
      <Link
        href="/home"
        className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-150"
      >
        <Plus className="h-3.5 w-3.5" />
        Go to Dashboard
      </Link>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="w-full aspect-[8.5/11] rounded-lg bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  );
}
