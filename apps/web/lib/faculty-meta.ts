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

const palette: Omit<FacultyTheme, "latin" | "index">[] = [
  { accent: "#2e4a6e", wash: "rgba(46, 74, 110, 0.1)", mark: "✦" },
  { accent: "#2a4a3a", wash: "rgba(42, 74, 58, 0.1)", mark: "◈" },
  { accent: "#7a2433", wash: "rgba(122, 36, 51, 0.1)", mark: "§" },
  { accent: "#6b4c2a", wash: "rgba(107, 76, 42, 0.1)", mark: "◇" },
];

export function facultyTheme(slug: string): FacultyTheme {
  if (themes[slug]) return themes[slug];
  const hash = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const swatch = palette[hash % palette.length];
  return {
    ...swatch,
    latin: slug,
    index: "—",
  };
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Հ";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[1][0]}`;
}
