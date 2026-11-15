import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Armenian, Noto_Serif, Noto_Serif_Armenian } from "next/font/google";
import { htmlLang } from "@/lib/i18n/locale";
import { getI18n } from "@/lib/i18n/server";
import "./globals.css";

const sans = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-sans-latin",
  display: "swap",
});

const sansHy = Noto_Sans_Armenian({
  subsets: ["armenian"],
  weight: ["400", "500"],
  variable: "--font-sans-armenian",
  display: "swap",
});

const serif = Noto_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  variable: "--font-serif-latin",
  display: "swap",
});

const serifHy = Noto_Serif_Armenian({
  subsets: ["armenian"],
  weight: ["400"],
  variable: "--font-serif-armenian",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.meta.title, template: t.meta.titleTemplate },
    description: t.meta.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale } = await getI18n();
  return (
    <html
      lang={htmlLang(locale)}
      className={`${sans.variable} ${sansHy.variable} ${serif.variable} ${serifHy.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
