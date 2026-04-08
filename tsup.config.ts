import { defineConfig } from "tsup";

const entry = ["src/**/*.ts"];

export default defineConfig({
  bundle: false,
  clean: true,
  dts: true,
  entry,
  format: ["esm"],
  outDir: "dist",
  platform: "node",
  shims: false,
  sourcemap: true,
  splitting: false,
  target: "node18",
});