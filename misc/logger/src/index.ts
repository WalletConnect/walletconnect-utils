import * as Pino from "pino";
const defaultPino = Pino.default ?? Pino.pino;
export * from "./constants";
export * from "./utils";
export type { Logger } from "pino";
export { defaultPino as pino };
