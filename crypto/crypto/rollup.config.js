import esbuild from "rollup-plugin-esbuild";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import glob from "glob";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { name, dependencies } from "./package.json";

const plugins = [nodeResolve({ preferBuiltins: false, browser: true }), commonjs()];

export default [
  {
    input: "./src/fallback/index.ts",
    plugins: [esbuild({ minify: true }), ...plugins],
    output: {
      file: "dist/umd/index.min.js",
      format: "umd",
      exports: "named",
      name,
      sourcemap: true,
    },
  },
  {
    input: Object.fromEntries(
      glob.sync("./src/**/*.ts").map((file) => [
        // This removes `src/` as well as the file extension from each
        // file, so e.g. src/nested/foo.js becomes nested/foo
        path.relative("src", file.slice(0, file.length - path.extname(file).length)),
        // This expands the relative paths to absolute paths, so e.g.
        // src/nested/foo becomes /project/src/nested/foo.js
        fileURLToPath(new URL(file, import.meta.url)),
      ]),
    ),
    plugins: [esbuild({ minify: false }), ...plugins],
    external: dependencies,
    output: [
      {
        dir: "dist/cjs",
        format: "cjs",
        exports: "named",
        name,
        sourcemap: true,
      },
      {
        dir: "dist/esm",
        format: "es",
        exports: "named",
        name,
        sourcemap: true,
      },
    ],
  },
];
