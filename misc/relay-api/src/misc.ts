export function assertType(obj: any, key: string, type = "string") {
  if (!obj[key] || typeof obj[key] !== type) {
    throw new Error(`Missing or invalid "${key}" param`);
  }
}

export function hasParamsLength(params: any, length: number): boolean {
  return Array.isArray(params)
    ? params.length === length
    : Object.keys(params).length === length;
}

export function methodEndsWith(
  method: string,
  expected: string,
  separator = "_"
) {
  const split = method.split(separator);
  return (
    split[split.length - 1].trim().toLowerCase() ===
    expected.trim().toLowerCase()
  );
}
