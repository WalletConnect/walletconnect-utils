const HTTP_REGEX = "^https?:";

const WS_REGEX = "^wss?:";

function getUrlProtocol(url: string): string | undefined {
  const matches = url.match(new RegExp(/^\w+:/, "gi"));
  if (!matches || !matches.length) return;
  return matches[0];
}

function matchRegexProtocol(url: string, regex: string): boolean {
  const protocol = getUrlProtocol(url);
  if (typeof protocol === "undefined") return false;
  return new RegExp(regex).test(protocol);
}

export function isHttpUrl(url: string): boolean {
  return matchRegexProtocol(url, HTTP_REGEX);
}

export function isWsUrl(url: string): boolean {
  return matchRegexProtocol(url, WS_REGEX);
}

export function isLocalhostUrl(url: string): boolean {
  // Used to relax TLS verification for local websockets only. Must match an
  // exact loopback host — an unanchored "localhost" prefix would treat
  // wss://localhost.evil.example as local and disable certificate checks.
  if (!isWsUrl(url)) return false;
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname === "::1"
    );
  } catch {
    return false;
  }
}
