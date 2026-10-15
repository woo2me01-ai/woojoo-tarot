import { defineConfig } from "vite";

// Capacitor는 dist/를 앱 안에 그대로 넣어요. 상대 경로로 빌드해야 WebView에서 파일을 찾을 수 있어요.
export default defineConfig({
  base: "./",
  server: { port: 5173 },
  build: { target: "es2022", assetsInlineLimit: 0 },
});
