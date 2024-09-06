import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  dts: true,
  format: ["esm"],
  //external: ["react"],
  loader: {
    ".ttf": "base64",
  },
});
