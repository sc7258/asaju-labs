export interface ParsedBirthText {
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute: number | null;
}

const DATE_DIGIT_LENGTH = 8;
const DATE_HOUR_DIGIT_LENGTH = 10;
const DATE_TIME_DIGIT_LENGTH = 12;

export function compactBirthText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(/\D/g, "").slice(0, DATE_TIME_DIGIT_LENGTH);
}

export function formatBirthTextForDisplay(value: string | null | undefined) {
  const digits = compactBirthText(value);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= DATE_DIGIT_LENGTH) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
}

export function formatBirthText(
  year: number,
  month: number,
  day: number,
  hour: number | null,
  minute: number | null,
) {
  const dateText = `${year} ${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;

  if (hour === null || minute === null) {
    return dateText;
  }

  return `${dateText} ${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}`;
}

export function parseBirthText(value: string | null | undefined) {
  const digits = compactBirthText(value);

  if (
    digits.length !== DATE_DIGIT_LENGTH &&
    digits.length !== DATE_HOUR_DIGIT_LENGTH &&
    digits.length !== DATE_TIME_DIGIT_LENGTH
  ) {
    return null;
  }

  return {
    year: Number(digits.slice(0, 4)),
    month: Number(digits.slice(4, 6)),
    day: Number(digits.slice(6, 8)),
    hour:
      digits.length === DATE_HOUR_DIGIT_LENGTH ||
      digits.length === DATE_TIME_DIGIT_LENGTH
        ? Number(digits.slice(8, 10))
        : null,
    minute:
      digits.length === DATE_TIME_DIGIT_LENGTH
        ? Number(digits.slice(10, 12))
        : digits.length === DATE_HOUR_DIGIT_LENGTH
          ? 0
        : null,
  } satisfies ParsedBirthText;
}
