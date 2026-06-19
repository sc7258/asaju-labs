import type { ManselyeokPageState } from "./manselyeok";

const DEFAULT_SITE_URL = "https://sajucube.vercel.app";

type SearchParamValue = string | string[] | undefined;
type SearchParams = Record<string, SearchParamValue>;

export function flattenSearchParams(searchParams: SearchParams) {
  const flattened: Record<string, string> = {};

  for (const [key, value] of Object.entries(searchParams)) {
    const picked = Array.isArray(value) ? value[0] : value;

    if (!picked) {
      continue;
    }

    flattened[key] = picked;
  }

  return flattened;
}

export function buildOgImageUrl(
  searchParams: SearchParams,
  siteUrl = DEFAULT_SITE_URL,
) {
  const url = new URL("/api/og", siteUrl);

  for (const [key, value] of Object.entries(flattenSearchParams(searchParams))) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

export function buildManselyeokShareDescription(
  state: ManselyeokPageState,
) {
  if (!state.viewModel) {
    return "사주 만세력을 확인하는 웹앱";
  }

  const calendarLabel =
    state.input.calendarType === "solar"
      ? "양력"
      : state.input.isLeapMonth
        ? "음력 윤달"
        : "음력";
  const timeLabel =
    state.input.hour === null || state.input.minute === null
      ? "시간 모름"
      : null;

  return [
    state.input.birthText,
    state.viewModel.genderLabel,
    calendarLabel,
    timeLabel,
  ]
    .filter(Boolean)
    .join(" · ");
}

export { DEFAULT_SITE_URL };
