import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/i18n-provider";
import { SiteHeader } from "@/components/site-header";
import { isUrlLocale, localeFromUrl } from "@/lib/i18n/locale";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: urlLocale } = await params;
  if (!isUrlLocale(urlLocale)) notFound();
  const locale = localeFromUrl(urlLocale);
  if (!locale) notFound();

  return (
    <I18nProvider locale={locale}>
      <div className="canvas min-h-dvh">
        <SiteHeader />
        {children}
      </div>
    </I18nProvider>
  );
}
