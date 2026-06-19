import packageJson from "../../package.json";

const BUILD_ID_LENGTH = 12;

export interface AppVersionInfo {
  version: string;
  buildId: string | null;
  displayVersion: string;
}

function sanitizeBuildId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const sanitized = value.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, BUILD_ID_LENGTH);

  return sanitized || null;
}

function getBuildId() {
  return sanitizeBuildId(
    process.env.NEXT_PUBLIC_APP_BUILD ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.VERCEL_DEPLOYMENT_ID ??
      process.env.VERCEL_URL,
  );
}

export function getAppVersionInfo(): AppVersionInfo {
  const version = packageJson.version;
  const buildId = getBuildId();

  return {
    version,
    buildId,
    displayVersion: buildId ? `${version}+${buildId}` : version,
  };
}
