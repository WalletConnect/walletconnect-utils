import { name, dependencies } from "./package.json";
import createConfig from "../../rollup.config";

// A plain array in Rollup's `external` only matches exact names, so subpath imports such as
// "@noble/curves/ed25519" were bundled into the cjs and es builds instead of staying external.
// Matching subpaths too lets consumers dedupe noble with their own copy.
const dependencyNames = Object.keys(dependencies || {});
const isExternal = (id) => dependencyNames.some((dep) => id === dep || id.startsWith(dep + "/"));

export default createConfig(name, isExternal);
