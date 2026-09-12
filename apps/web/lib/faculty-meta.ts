export type FacultyTheme = {
  accent: string;
  wash: string;
  latin: string;
  index: string;
  mark: string;
};

const themes: Record<string, FacultyTheme> = {
  informatics: {
    accent: "#2e4a6e",
    wash: "rgba(46, 74, 110, 0.1)",
    latin: "Informatics",
    index: "01",
    mark: "⟨⟩",
  },
  economics: {
    accent: "#2a4a3a",
    wash: "rgba(42, 74, 58, 0.1)",
    latin: "Economics",
    index: "02",
    mark: "◈",
  },
  law: {
    accent: "#7a2433",
    wash: "rgba(122, 36, 51, 0.1)",
    latin: "Law",
    index: "03",
    mark: "§",
  },
};

const fallback: FacultyTheme = {
  accent: "#7a2433",
  wash: "rgba(122, 36, 51, 0.08)",
  latin: "Faculty",
  index: "00",
  mark: "✦",
};

export function facultyTheme(slug: string): FacultyTheme {
  return themes[slug] ?? fallback;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Հ";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[1][0]}`;
}
