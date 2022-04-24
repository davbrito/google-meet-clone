import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

import postcssNormalize from "postcss-normalize";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    root: "./src",
    build: {
      outDir: "../dist",
    },
    define: {
      "process.env": env,
    },
    server: {
      https: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    css: {
      postcss: {
        plugins: [postcssNormalize()],
      },
    },
  };
});
