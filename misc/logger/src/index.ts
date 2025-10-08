import * as Pino from "pino";
const defaultPino = Pino.default ?? Pino;
export * from "./constants";
export * from "./utils";
export type { Logger } from "pino";
export { defaultPino as pino };
