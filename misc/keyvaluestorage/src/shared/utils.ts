import { safeJsonParse } from "safe-json-utils";
import {
  KeyValueStorageOptions,
  NodeJSStorageOptions,
  ReactNativeStorageOptions,
} from "./types";

export const REACT_NATIVE_REQUIRED_OPTION = "asyncStorage";

export function isReactNativeOptions(
  opts: KeyValueStorageOptions
): opts is ReactNativeStorageOptions {
  return REACT_NATIVE_REQUIRED_OPTION in opts;
}

export function getReactNativeOptions(
  opts?: KeyValueStorageOptions
): ReactNativeStorageOptions {
  if (typeof opts === "undefined" || !isReactNativeOptions(opts)) {
    throw new Error(
      `Missing ${REACT_NATIVE_REQUIRED_OPTION} option required for React-Native`
    );
  }
  return opts;
}

export const NODE_JS_REQUIRED_OPTION = "database";

export function isNodeJSOptions(
  opts: KeyValueStorageOptions
): opts is NodeJSStorageOptions {
  return NODE_JS_REQUIRED_OPTION in opts;
}

export function getNodeJSOptions(
  opts?: KeyValueStorageOptions
): NodeJSStorageOptions {
  if (typeof opts === "undefined" || !isNodeJSOptions(opts)) {
    throw new Error(
      `Missing ${NODE_JS_REQUIRED_OPTION} option required for NodeJS`
    );
  }
  return opts;
}

export function parseEntry(entry: [string, string]): [string, any] {
  return [entry[0], safeJsonParse(entry[1])];
}
