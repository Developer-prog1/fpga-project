import { METRICS, type MetricDef, type MetricKey } from "@/lib/metrics";

export type AirDetail = {
  slug: string;
  key: MetricKey;
  about: string;
  reading: string;
  kind: "area" | "bars";
  metric: MetricDef;
};

const COPY: { slug: string; key: MetricKey; about: string; reading: string; kind: "area" | "bars" }[] = [
  {
    slug: "temperature",
    key: "airTemp",
    kind: "area",
    about:
      "Օդի ջերմաստիճանը չափվում է կայանի բարձրության վրա և ցույց է տալիս, թե դաշտի օդը հիմա որքան տաք կամ սառն է։",
    reading:
      "Գիծը վերջին 24 ժամն է։ Բարձրանալը տաքացում է, իջնելը՝ հովացում։ Մուգ շերտը գիշերն է։ 0 °C-ից ցածրը ցրտահարության նշան է, 35 °C-ից բարձրը՝ շոգ։",
  },
  {
    slug: "humidity",
    key: "airHumidity",
    kind: "area",
    about: "Օդի հարաբերական խոնավությունը ցույց է տալիս, թե օդը որքանով է հագեցած ջրային գոլորշիով։",
    reading:
      "100%-ին մոտ արժեքը նշանակում է, որ օդը գրեթե հագեցած է և կարող է ցող կամ մառախուղ գալ։ 25%-ից ցածրը չոր օդ է, 90%-ից բարձրը՝ շատ խոնավ։",
  },
  {
    slug: "wind",
    key: "windSpeed",
    kind: "area",
    about: "Քամու արագությունը մետր/վայրկյանով է։ Ուղղությունը ցույց է տալիս, թե որտեղից է գալիս քամին։",
    reading:
      "10 m/s և ավելին ուժեղ քամի է։ 0° հյուսիսն է, 90°՝ արևելքը, 180°՝ հարավը, 270°՝ արևմուտքը։",
  },
  {
    slug: "rain",
    key: "rainfallMm",
    kind: "bars",
    about: "Տեղումները յուրաքանչյուր չափման միջակայքում թափված անձրևն են, միլիմետրով։",
    reading:
      "Սյուները ցույց են տալիս, թե երբ է եկել անձրևը։ 24 ժամվա գումարը բոլոր միջակայքերի հանրագումարն է։ 3 մմ և ավելին մեկ չափման մեջ ուժեղ անձրև է։",
  },
  {
    slug: "pressure",
    key: "pressureHpa",
    kind: "area",
    about: "Մթնոլորտային ճնշումը հեկտոպասկալով է և ցույց է տալիս եղանակի փոփոխության միտումը։",
    reading:
      "Արագ իջնելը հաճախ նախորդում է ամպամածության կամ տեղումների։ 1000 hPa-ից ցածրը ցածր ճնշում է, 1035-ից բարձրը՝ բարձր։",
  },
  {
    slug: "dew-point",
    key: "dewPoint",
    kind: "area",
    about: "Ցողի կետն այն ջերմաստիճանն է, որին օդը պետք է սառչի, որպեսզի գոլորշին խտանա ջրի։",
    reading:
      "Երբ օդի ջերմաստիճանը մոտենում է ցողի կետին, օդը խոնավ է և կարող է ցող առաջանալ։ Մեծ տարբերությունը չոր օդ է նշանակում։",
  },
];

function withMetric(row: (typeof COPY)[number]): AirDetail | null {
  const metric = METRICS.find((item) => item.key === row.key);
  return metric ? { ...row, metric } : null;
}

export function airPageBySlug(slug: string) {
  const row = COPY.find((item) => item.slug === slug);
  return row ? withMetric(row) : null;
}

export function airPath(key: MetricKey) {
  const row = COPY.find((item) => item.key === key);
  return row ? `/air/${row.slug}` : null;
}
