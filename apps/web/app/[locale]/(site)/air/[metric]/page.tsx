import type { Metadata } from "next";
import { ReadingDetail } from "@/components/reading-detail";
import { airPageBySlug } from "@/lib/air-detail";
import { getI18n } from "@/lib/i18n/server";

type AirRouteProps = { params: Promise<{ metric: string }> };

export async function generateMetadata({ params }: AirRouteProps): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const page = airPageBySlug((await params).metric, locale);
  return { title: page?.metric.label ?? t.meta.reading };
}

export default async function AirMetricPage({ params }: AirRouteProps) {
  return <ReadingDetail group="air" slug={(await params).metric} />;
}
