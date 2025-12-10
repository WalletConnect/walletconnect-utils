import esbuild from "rollup-plugin-esbuild";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { name } from "./package.json";

const input = "./src/index.ts";

const plugins = [
  nodeResolve({ preferBuiltins: false, browser: true }),
  commonjs(),
  esbuild({
    minify: true,
    tsconfig: "./tsconfig.json",
    loaders: { ".json": "json" },
  }),
];

export default [
  // UMD build (for script tags)
  {
    input,
    plugins,
    output: {
      file: "./dist/index.umd.js",
      format: "umd",
      exports: "named",
      name: name,
      sourcemap: true,
    },
  },
  // CJS/ESM builds (pino bundled)
  {
    input,
    plugins,
    output: [
      {
        file: "./dist/index.cjs.js",
        format: "cjs",
        exports: "named",
        name: name,
        sourcemap: true,
      },
      {
        file: "./dist/index.es.js",
        format: "es",
        exports: "named",
        name: name,
        sourcemap: true,
      },
    ],
  },
];
