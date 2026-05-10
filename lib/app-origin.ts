const DEFAULT_PRODUCTION_ORIGIN = "https://mindcet-accounts.vercel.app";

export function getCanonicalAppOrigin(currentOrigin?: string) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (currentOrigin && isLocalOrigin(currentOrigin)) {
    return currentOrigin;
  }

  return DEFAULT_PRODUCTION_ORIGIN;
}

function isLocalOrigin(origin: string) {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}
