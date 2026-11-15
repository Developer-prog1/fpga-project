import type { Locale } from "./locale";

export type NarrativeKey =
  | "airTemp"
  | "soilTemp"
  | "airHumidity"
  | "soilMoisture"
  | "windSpeed"
  | "lightLux"
  | "uvIndex";

export type PartBucket = "night" | "morning" | "midday" | "evening";

export type NarrativeCopy = {
  rainUnit: string;
  during: (clock: boolean) => string;
  dayPart: (bucket: PartBucket, next: "vowel" | "consonant") => string;
  stayed: (key: NarrativeKey, value: string) => string;
  peakSpan: (key: NarrativeKey, maxText: string) => string;
  peakClock: (key: NarrativeKey, when: string, maxText: string) => string;
  flat: (key: NarrativeKey, span: string) => string;
  mixed: (key: NarrativeKey, during: string, span: string) => string;
  fellThenRose: (key: NarrativeKey, when: string | null, minText: string, span: string) => string;
  roseThenFell: (key: NarrativeKey, when: string | null, maxText: string, span: string) => string;
  fellTimed: (key: NarrativeKey, whenMax: string, maxText: string, whenMin: string, minText: string) => string;
  fell: (key: NarrativeKey, during: string, minText: string, maxText: string) => string;
  roseTimed: (key: NarrativeKey, whenMin: string, minText: string, whenMax: string, maxText: string) => string;
  rose: (key: NarrativeKey, during: string, minText: string, maxText: string) => string;
  whole: (watch: string, span: string) => string;
  lowIs: (watch: string, minText: string) => string;
  highIs: (watch: string, maxText: string) => string;
  noRain: string;
  rainWhere: (daily: boolean) => string;
  rain: (total: string, where: string, peak: string, heavy: string | null) => string;
};

const AM_SUBJECT: Record<NarrativeKey, string> = {
  airTemp: "Օդի ջերմաստիճանը",
  soilTemp: "Հողի ջերմաստիճանը",
  airHumidity: "Օդի խոնավությունը",
  soilMoisture: "Հողի խոնավությունը",
  windSpeed: "Քամին",
  lightLux: "Լուսավորությունը",
  uvIndex: "UV ինդեքսը",
};

const AM_GENITIVE: Record<NarrativeKey, string> = {
  airTemp: "Օդի ջերմաստիճանի",
  soilTemp: "Հողի ջերմաստիճանի",
  airHumidity: "Օդի խոնավության",
  soilMoisture: "Հողի խոնավության",
  windSpeed: "Քամու",
  lightLux: "Լուսավորության",
  uvIndex: "UV ինդեքսի",
};

const am: NarrativeCopy = {
  rainUnit: "մմ",
  during: (clock) => (clock ? "օրվա ընթացքում" : "այս օրերի ընթացքում"),
  dayPart: (bucket, next) => {
    if (bucket === "night") return next === "vowel" ? "գիշերն" : "գիշերը";
    if (bucket === "morning") return "առավոտյան";
    if (bucket === "midday") return "կեսօրին";
    return "երեկոյան";
  },
  stayed: (key, value) => `${AM_SUBJECT[key]} մնաց ${value}։`,
  peakSpan: (key, maxText) => `${AM_GENITIVE[key]} առավելագույնը ${maxText} էր։`,
  peakClock: (key, when, maxText) => `${AM_GENITIVE[key]} գագաթնակետը ${when} էր՝ ${maxText}։`,
  flat: (key, span) => `${AM_SUBJECT[key]} գրեթե չփոխվեց։ Մնաց ${span} միջակայքում։`,
  mixed: (key, during, span) => `${AM_SUBJECT[key]} ${during} ${span} միջակայքում էր։`,
  fellThenRose: (key, when, minText, span) => {
    const opening = when ? `${when} իջավ` : "նախ իջավ";
    return `${AM_SUBJECT[key]} ${opening} մինչև ${minText}, հետո նորից բարձրացավ։ Միջակայքը ${span} էր։`;
  },
  roseThenFell: (key, when, maxText, span) => {
    const opening = when ? `${when} հասավ` : "նախ բարձրացավ";
    return `${AM_SUBJECT[key]} ${opening} մինչև ${maxText}, հետո իջավ։ Միջակայքը ${span} էր։`;
  },
  fellTimed: (key, whenMax, maxText, whenMin, minText) =>
    `${AM_SUBJECT[key]} ${whenMax} ${maxText} էր, ${whenMin} իջավ մինչև ${minText}։`,
  fell: (key, during, minText, maxText) =>
    `${AM_SUBJECT[key]} ${during} իջավ։ Նվազագույնը ${minText} էր, առավելագույնը՝ ${maxText}։`,
  roseTimed: (key, whenMin, minText, whenMax, maxText) =>
    `${AM_SUBJECT[key]} ${whenMin} ${minText} էր, ${whenMax} բարձրացավ մինչև ${maxText}։`,
  rose: (key, during, minText, maxText) =>
    `${AM_SUBJECT[key]} ${during} բարձրացավ։ Նվազագույնը ${minText} էր, առավելագույնը՝ ${maxText}։`,
  whole: (watch, span) => `Ամբողջ հատվածը ${watch} է (${span})։`,
  lowIs: (watch, minText) => `Նվազագույնը ${watch} է (${minText})։`,
  highIs: (watch, maxText) => `Առավելագույնը ${watch} է (${maxText})։`,
  noRain: "Տեղում չի եղել։",
  rainWhere: (daily) => (daily ? "մեկ օրում" : "մեկ միջակայքում"),
  rain: (total, where, peak, heavy) => {
    const peakSentence = heavy
      ? `Ամենաշատը ${where} ${peak} էր։ Դա ${heavy} է։`
      : `Ամենաշատը ${where} ${peak} էր։`;
    return `Տեղումների գումարը ${total} է։ ${peakSentence}`;
  },
};

const EN_SUBJECT: Record<NarrativeKey, string> = {
  airTemp: "Air temperature",
  soilTemp: "Soil temperature",
  airHumidity: "Relative humidity",
  soilMoisture: "Soil moisture",
  windSpeed: "The wind",
  lightLux: "Illuminance",
  uvIndex: "The UV index",
};

const EN_GENITIVE: Record<NarrativeKey, string> = {
  airTemp: "air temperature",
  soilTemp: "soil temperature",
  airHumidity: "relative humidity",
  soilMoisture: "soil moisture",
  windSpeed: "wind speed",
  lightLux: "illuminance",
  uvIndex: "UV index",
};

const en: NarrativeCopy = {
  rainUnit: "mm",
  during: (clock) => (clock ? "over the day" : "over these days"),
  dayPart: (bucket) => {
    if (bucket === "night") return "at night";
    if (bucket === "morning") return "in the morning";
    if (bucket === "midday") return "at midday";
    return "in the evening";
  },
  stayed: (key, value) => `${EN_SUBJECT[key]} held steady at ${value}.`,
  peakSpan: (key, maxText) => `The highest ${EN_GENITIVE[key]} was ${maxText}.`,
  peakClock: (key, when, maxText) => `${EN_SUBJECT[key]} reached a peak of ${maxText} ${when}.`,
  flat: (key, span) => `${EN_SUBJECT[key]} barely changed. It stayed within ${span}.`,
  mixed: (key, during, span) => `${EN_SUBJECT[key]} stayed within ${span} ${during}.`,
  fellThenRose: (key, when, minText, span) => {
    const motion = when ? `fell ${when}` : "fell at first";
    return `${EN_SUBJECT[key]} ${motion} to ${minText}, then rose again. The range was ${span}.`;
  },
  roseThenFell: (key, when, maxText, span) => {
    const motion = when ? `reached ${maxText} ${when}` : `rose at first to ${maxText}`;
    return `${EN_SUBJECT[key]} ${motion}, then fell. The range was ${span}.`;
  },
  fellTimed: (key, whenMax, maxText, whenMin, minText) =>
    `${EN_SUBJECT[key]} was ${maxText} ${whenMax}, then fell ${whenMin} to ${minText}.`,
  fell: (key, during, minText, maxText) =>
    `${EN_SUBJECT[key]} fell ${during}. The low was ${minText} and the high was ${maxText}.`,
  roseTimed: (key, whenMin, minText, whenMax, maxText) =>
    `${EN_SUBJECT[key]} was ${minText} ${whenMin} and rose ${whenMax} to ${maxText}.`,
  rose: (key, during, minText, maxText) =>
    `${EN_SUBJECT[key]} rose ${during}. The low was ${minText} and the high was ${maxText}.`,
  whole: (watch, span) => `The whole stretch is ${watch} (${span}).`,
  lowIs: (watch, minText) => `The minimum is ${watch} (${minText}).`,
  highIs: (watch, maxText) => `The maximum is ${watch} (${maxText}).`,
  noRain: "There was no precipitation.",
  rainWhere: (daily) => (daily ? "in a single day" : "in one interval"),
  rain: (total, where, peak, heavy) => {
    const peakSentence = heavy
      ? `The most ${where} was ${peak}. That is ${heavy}.`
      : `The most ${where} was ${peak}.`;
    return `Total precipitation was ${total}. ${peakSentence}`;
  },
};

const RU_SUBJECT: Record<NarrativeKey, string> = {
  airTemp: "Температура воздуха",
  soilTemp: "Температура почвы",
  airHumidity: "Влажность воздуха",
  soilMoisture: "Влажность почвы",
  windSpeed: "Ветер",
  lightLux: "Освещённость",
  uvIndex: "Индекс УФ",
};

const RU_PEAK: Record<NarrativeKey, { noun: string; feminine: boolean }> = {
  airTemp: { noun: "температура воздуха", feminine: true },
  soilTemp: { noun: "температура почвы", feminine: true },
  airHumidity: { noun: "влажность воздуха", feminine: true },
  soilMoisture: { noun: "влажность почвы", feminine: true },
  windSpeed: { noun: "скорость ветра", feminine: true },
  lightLux: { noun: "освещённость", feminine: true },
  uvIndex: { noun: "индекс УФ", feminine: false },
};

function ruForms(key: NarrativeKey) {
  const feminine = key !== "windSpeed" && key !== "uvIndex";
  return {
    subject: RU_SUBJECT[key],
    fell: feminine ? "снизилась" : "снизился",
    rose: feminine ? "выросла" : "вырос",
    reached: feminine ? "достигла" : "достиг",
    held: feminine ? "держалась" : "держался",
    barely: feminine ? "почти не менялась" : "почти не менялся",
    remained: feminine ? "оставалась" : "оставался",
    was: feminine ? "была" : "был",
  };
}

const ru: NarrativeCopy = {
  rainUnit: "мм",
  during: (clock) => (clock ? "за день" : "за эти дни"),
  dayPart: (bucket) => {
    if (bucket === "night") return "ночью";
    if (bucket === "morning") return "утром";
    if (bucket === "midday") return "в полдень";
    return "вечером";
  },
  stayed: (key, value) => `${ruForms(key).subject} ${ruForms(key).held} на уровне ${value}.`,
  peakSpan: (key, maxText) => {
    const peak = RU_PEAK[key];
    const adjective = peak.feminine ? "Максимальная" : "Максимальный";
    const verb = peak.feminine ? "составила" : "составил";
    return `${adjective} ${peak.noun} ${verb} ${maxText}.`;
  },
  peakClock: (key, when, maxText) =>
    `${ruForms(key).subject} ${ruForms(key).reached} пика ${when} — ${maxText}.`,
  flat: (key, span) => {
    const forms = ruForms(key);
    return `${forms.subject} ${forms.barely} и ${forms.remained} в пределах ${span}.`;
  },
  mixed: (key, during, span) =>
    `${ruForms(key).subject} ${during} ${ruForms(key).remained} в пределах ${span}.`,
  fellThenRose: (key, when, minText, span) => {
    const forms = ruForms(key);
    const opening = when ?? "сначала";
    return `${forms.subject} ${opening} ${forms.fell} до ${minText}, затем снова ${forms.rose}. Диапазон — ${span}.`;
  },
  roseThenFell: (key, when, maxText, span) => {
    const forms = ruForms(key);
    const sentence = when
      ? `${forms.subject} ${when} ${forms.reached} ${maxText}, затем ${forms.fell}.`
      : `${forms.subject} сначала ${forms.rose} до ${maxText}, затем ${forms.fell}.`;
    return `${sentence} Диапазон — ${span}.`;
  },
  fellTimed: (key, whenMax, maxText, whenMin, minText) => {
    const forms = ruForms(key);
    return `${forms.subject} ${whenMax} ${forms.was} ${maxText}, а ${whenMin} ${forms.fell} до ${minText}.`;
  },
  fell: (key, during, minText, maxText) =>
    `${ruForms(key).subject} ${during} ${ruForms(key).fell}. Минимум — ${minText}, максимум — ${maxText}.`,
  roseTimed: (key, whenMin, minText, whenMax, maxText) => {
    const forms = ruForms(key);
    return `${forms.subject} ${whenMin} ${forms.was} ${minText}, а ${whenMax} ${forms.rose} до ${maxText}.`;
  },
  rose: (key, during, minText, maxText) =>
    `${ruForms(key).subject} ${during} ${ruForms(key).rose}. Минимум — ${minText}, максимум — ${maxText}.`,
  whole: (watch, span) => `Весь период — ${watch} (${span}).`,
  lowIs: (watch, minText) => `Минимум — ${watch} (${minText}).`,
  highIs: (watch, maxText) => `Максимум — ${watch} (${maxText}).`,
  noRain: "Осадков не было.",
  rainWhere: (daily) => (daily ? "за одни сутки" : "за один интервал"),
  rain: (total, where, peak, heavy) => {
    const peakSentence = heavy
      ? `Больше всего ${where} — ${peak}. Это ${heavy}.`
      : `Больше всего ${where} — ${peak}.`;
    return `Сумма осадков — ${total}. ${peakSentence}`;
  },
};

const COPIES: Record<Locale, NarrativeCopy> = { am, en, ru };

export function narrativeCopy(locale: Locale = "am") {
  return COPIES[locale];
}
