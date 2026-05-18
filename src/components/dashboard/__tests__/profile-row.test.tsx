import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileRow } from "../profile-row";
import type { Profile } from "@/lib/types";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// ─── fixtures ─────────────────────────────────────────────────────────────────

const emptyProfile: Profile = {
  id: "1",
  user_id: "u1",
  first_name: "Jane",
  last_name: "Doe",
  email: null,
  phone_number: null,
  location: null,
  linkedin_url: null,
  github_url: null,
  website: null,
  work_experience: [],
  education: [],
  skills: [],
  projects: [],
  created_at: "",
  updated_at: "",
};

const fullProfile: Profile = {
  ...emptyProfile,
  phone_number: "555-0100",
  location: "NYC",
  linkedin_url: "https://linkedin.com/in/jane",
  github_url: "https://github.com/jane",
  work_experience: [
    {
      company: "Acme",
      position: "Engineer",
      date: "",
      location: "",
      description: [],
      technologies: [],
    },
  ],
  education: [
    {
      school: "MIT",
      degree: "BS",
      field: "CS",
      date: "",
      location: "",
      gpa: "",
      achievements: [],
    },
  ],
  skills: [{ category: "Languages", items: ["TypeScript"] }],
  projects: [
    {
      name: "Proj",
      description: [],
      technologies: [],
      date: "",
      url: "",
      github_url: "",
    },
  ],
};

// ─── score color ──────────────────────────────────────────────────────────────

describe("ProfileRow — score color", () => {
  it("applies teal color class when score >= 80", () => {
    const { container } = render(<ProfileRow profile={fullProfile} />);
    // full profile = 100 points → teal
    expect(container.querySelector(".text-teal-600")).toBeTruthy();
  });

  it("applies rose color class when score < 50 (empty profile)", () => {
    // emptyProfile only has name (10 pts) → rose
    const { container } = render(<ProfileRow profile={emptyProfile} />);
    expect(container.querySelector(".text-rose-600")).toBeTruthy();
  });

  it("applies amber color class when 50 <= score < 80", () => {
    // name(10) + phone(5) + location(5) + linkedin(10) + github(5) + work(25) = 60 → amber
    const amberProfile: Profile = {
      ...emptyProfile,
      phone_number: "555",
      location: "NYC",
      linkedin_url: "https://linkedin.com/in/jane",
      github_url: "https://github.com/jane",
      work_experience: [
        {
          company: "Acme",
          position: "Engineer",
          date: "",
          location: "",
          description: [],
          technologies: [],
        },
      ],
    };
    const { container } = render(<ProfileRow profile={amberProfile} />);
    expect(container.querySelector(".text-amber-600")).toBeTruthy();
  });
});

// ─── completeness message ─────────────────────────────────────────────────────

describe("ProfileRow — completeness message", () => {
  it("shows 'Profile complete' when score is 100", () => {
    render(<ProfileRow profile={fullProfile} />);
    expect(screen.getByText("Profile complete")).toBeInTheDocument();
  });

  it("shows 'Missing: X' when exactly one section is missing", () => {
    // All fields present except projects (10 pts) → 90%, 1 missing
    const noProjects: Profile = { ...fullProfile, projects: [] };
    render(<ProfileRow profile={noProjects} />);
    expect(screen.getByText(/Missing:/)).toBeInTheDocument();
  });

  it("shows 'N sections missing' when multiple sections are missing", () => {
    // emptyProfile has only name → 8 missing
    render(<ProfileRow profile={emptyProfile} />);
    expect(screen.getByText(/sections missing/)).toBeInTheDocument();
  });
});

// ─── name display ─────────────────────────────────────────────────────────────

describe("ProfileRow — name display", () => {
  it("renders the profile's first and last name", () => {
    render(<ProfileRow profile={emptyProfile} />);
    expect(screen.getByText(/Jane/)).toBeInTheDocument();
    expect(screen.getByText(/Doe/)).toBeInTheDocument();
  });
});

// ─── stat counts ─────────────────────────────────────────────────────────────

describe("ProfileRow — stat counts", () => {
  it("displays correct work experience count", () => {
    render(<ProfileRow profile={fullProfile} />);
    // Each stat renders as a number — work_experience has 1 entry
    const statNumbers = screen
      .getAllByText("1")
      .filter((el) => el.tagName === "SPAN");
    expect(statNumbers.length).toBeGreaterThan(0);
  });

  it("displays 0 counts when profile sections are empty", () => {
    render(<ProfileRow profile={emptyProfile} />);
    const zeros = screen
      .getAllByText("0")
      .filter((el) => el.tagName === "SPAN");
    expect(zeros.length).toBeGreaterThanOrEqual(3); // experience, education, projects
  });
});

// ─── edit link ────────────────────────────────────────────────────────────────

describe("ProfileRow — edit link", () => {
  it("links to /profile", () => {
    render(<ProfileRow profile={emptyProfile} />);
    expect(screen.getByRole("link", { name: /edit profile/i })).toHaveAttribute(
      "href",
      "/profile"
    );
  });
});
