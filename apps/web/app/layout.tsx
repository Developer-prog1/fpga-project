import type { Metadata } from "next";
import { Noto_Sans_Armenian, Noto_Serif_Armenian } from "next/font/google";
import { AppFrame } from "@/components/app-frame";
import "./globals.css";

const sans = Noto_Sans_Armenian({
  subsets: ["armenian"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-armenian",
  display: "swap",
});

const serif = Noto_Serif_Armenian({
  subsets: ["armenian"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif-armenian",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Համալսարան",
    template: "%s · Համալսարան",
  },
  description: "Համալսարանի վարչական համակարգ — ֆակուլտետներ, դասընթացներ և ադմիններ։",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="hy"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
