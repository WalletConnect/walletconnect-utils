import { safeJsonParse } from "@walletconnect/safe-json";

export function parseEntry(entry: [string, string | null]): [string, any] {
  return [entry[0], safeJsonParse(entry[1] ?? "")];
}
