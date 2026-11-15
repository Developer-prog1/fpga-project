import type { Metadata } from "next";
import { ReadingDetail } from "@/components/reading-detail";
import { detailPage } from "@/lib/air-detail";
import { getI18n } from "@/lib/i18n/server";

type LightRouteProps = { params: Promise<{ metric: string }> };

export async function generateMetadata({ params }: LightRouteProps): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const page = detailPage("light", (await params).metric, locale);
  return { title: page?.metric.label ?? t.meta.reading };
}

export default async function LightMetricPage({ params }: LightRouteProps) {
  return <ReadingDetail group="light" slug={(await params).metric} />;
}
