import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  sourcemap: false,
  minify: false,
  dts: true,
  format: ["esm", "cjs"],
  clean: true,
  target: "es2022",
});
