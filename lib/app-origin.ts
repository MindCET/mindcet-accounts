const DEFAULT_PRODUCTION_ORIGIN = "https://mindcet-accounts.vercel.app";

export function getCanonicalAppOrigin(currentOrigin?: string) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const isCurrentOriginLocal = currentOrigin ? isLocalOrigin(currentOrigin) : false;

  if (configuredOrigin && (!isLocalOrigin(configuredOrigin) || isCurrentOriginLocal)) {
    return configuredOrigin;
  }

  if (currentOrigin && isCurrentOriginLocal) {
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
