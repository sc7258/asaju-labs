const rawPwaAssetVersion =
  process.env.NEXT_PUBLIC_PWA_ASSET_VERSION ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.VERCEL_URL ??
  new Date().toISOString();

export const PWA_ASSET_VERSION = rawPwaAssetVersion
  .replace(/[^a-zA-Z0-9_-]/g, "")
  .slice(0, 16);

export function withPwaAssetVersion(path: string) {
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}v=${PWA_ASSET_VERSION}`;
}
