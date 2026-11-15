import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { isUrlLocale } from "@/lib/i18n/locale";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isUrlLocale(locale)) notFound();

  return (
    <div className="canvas min-h-dvh">
      <SiteHeader />
      {children}
    </div>
  );
}
