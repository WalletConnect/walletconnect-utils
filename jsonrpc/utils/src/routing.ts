export function isValidRoute(route: string): boolean {
  if (route.includes("*")) {
    return isValidWildcardRoute(route);
  }
  if (/\W/g.test(route)) {
    return false;
  }
  return true;
}

export function isValidDefaultRoute(route: string): boolean {
  return route === "*";
}

export function isValidWildcardRoute(route: string): boolean {
  if (isValidDefaultRoute(route)) {
    return true;
  }
  if (!route.includes("*")) {
    return false;
  }
  if (route.split("*").length !== 2) {
    return false;
  }
  if (route.split("*").filter(x => x.trim() === "").length !== 1) {
    return false;
  }
  return true;
}

export function isValidLeadingWildcardRoute(route: string): boolean {
  return !isValidDefaultRoute(route) && isValidWildcardRoute(route) && !route.split("*")[0].trim();
}

export function isValidTrailingWildcardRoute(route: string): boolean {
  return !isValidDefaultRoute(route) && isValidWildcardRoute(route) && !route.split("*")[1].trim();
}
