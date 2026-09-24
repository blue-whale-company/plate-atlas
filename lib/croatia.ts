export interface RegistrationArea {
  readonly code: string;
  readonly name: string;
}

export const CROATIAN_AREAS = [
  { code: "BJ", name: "Bjelovar" },
  { code: "BM", name: "Beli Manastir" },
  { code: "ČK", name: "Čakovec" },
  { code: "DA", name: "Daruvar" },
  { code: "DE", name: "Delnice" },
  { code: "DJ", name: "Đakovo" },
  { code: "DU", name: "Dubrovnik" },
  { code: "GS", name: "Gospić" },
  { code: "IM", name: "Imotski" },
  { code: "KA", name: "Karlovac" },
  { code: "KC", name: "Koprivnica" },
  { code: "KR", name: "Krapina" },
  { code: "KT", name: "Kutina" },
  { code: "KŽ", name: "Križevci" },
  { code: "MA", name: "Makarska" },
  { code: "NA", name: "Našice" },
  { code: "NG", name: "Nova Gradiška" },
  { code: "OG", name: "Ogulin" },
  { code: "OS", name: "Osijek" },
  { code: "PU", name: "Pula" },
  { code: "PŽ", name: "Požega" },
  { code: "RI", name: "Rijeka" },
  { code: "SB", name: "Slavonski Brod" },
  { code: "SK", name: "Sisak" },
  { code: "SL", name: "Slatina" },
  { code: "ST", name: "Split" },
  { code: "ŠI", name: "Šibenik" },
  { code: "VK", name: "Vinkovci" },
  { code: "VT", name: "Virovitica" },
  { code: "VU", name: "Vukovar" },
  { code: "VŽ", name: "Varaždin" },
  { code: "ZD", name: "Zadar" },
  { code: "ZG", name: "Zagreb" },
  { code: "ŽU", name: "Županja" },
] as const satisfies readonly RegistrationArea[];

export type CroatianAreaCode = (typeof CROATIAN_AREAS)[number]["code"];

const CROATIAN_AREA_CODES = new Set<string>(
  CROATIAN_AREAS.map((area) => area.code),
);

export interface CroatianPlateValue {
  readonly area: CroatianAreaCode;
  readonly digits: string;
  readonly letters: string;
}

export const DEFAULT_PLATE: CroatianPlateValue = {
  area: "ZG",
  digits: "1987",
  letters: "JG",
};

const PLATE_DIGITS = /^\d{3,4}$/;
const PLATE_LETTERS = /^[A-Z]{1,2}$/;

export function isCroatianPlateValid(value: CroatianPlateValue): boolean {
  return PLATE_DIGITS.test(value.digits) && PLATE_LETTERS.test(value.letters);
}

export function isCroatianAreaCode(value: string): value is CroatianAreaCode {
  return CROATIAN_AREA_CODES.has(value);
}

export function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

export function sanitizeLetters(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/gi, "")
    .toUpperCase()
    .slice(0, 2);
}

export function getPlateFilename(value: CroatianPlateValue): string {
  const registration = `${value.area}-${value.digits}-${value.letters}`;
  return `plateatlas-${registration.toLowerCase()}.png`;
}
