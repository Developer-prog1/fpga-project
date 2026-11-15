import type { Metadata } from "next";
import { ReadingDetail } from "@/components/reading-detail";
import { detailPage } from "@/lib/air-detail";
import { getI18n } from "@/lib/i18n/server";

type SoilRouteProps = { params: Promise<{ metric: string }> };

export async function generateMetadata({ params }: SoilRouteProps): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const page = detailPage("soil", (await params).metric, locale);
  return { title: page?.metric.label ?? t.meta.reading };
}

export default async function SoilMetricPage({ params }: SoilRouteProps) {
  return <ReadingDetail group="soil" slug={(await params).metric} />;
}
