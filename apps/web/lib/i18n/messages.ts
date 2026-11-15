import { am } from "./am";
import type { Dictionary } from "./dictionary";
import { en } from "./en";
import type { Locale } from "./locale";
import { ru } from "./ru";

const ALL: Record<Locale, Dictionary> = { am, en, ru };

const SOURCE_NAME = "Համալսարան · դաշտ";
const SOURCE_PLACE = "Արարատյան դաշտ";

export function dictionary(locale: Locale): Dictionary {
  return ALL[locale];
}

export function stationTitle(name: string | null | undefined, copy: Dictionary) {
  if (!name || name === SOURCE_NAME) return copy.station.name;
  return name;
}

export function stationPlace(location: string | null | undefined, copy: Dictionary) {
  if (!location) return "";
  return location.replaceAll(SOURCE_PLACE, copy.station.location);
}
