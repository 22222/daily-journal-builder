import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
//import topLevelAwait from "vite-plugin-top-level-await";
//import { viteSingleFile } from "vite-plugin-singlefile";
// https://vitejs.dev/config/
// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    plugins: [
        //topLevelAwait(),
        react(),
        //viteSingleFile({ removeViteModuleLoader: true }),
    ],
    assetsInclude: ["**/*.ttf"],
    build: {
        //minify: false,
        target: "ES2022",
    },
    // build: {
    //   target: "ES2022",
    // },
});
