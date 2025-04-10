import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// 第一步
import path from "path";
 
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  }, 
  // 第二步
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/components/index.js"),
      name: "xsSignature",
      fileName: (format) => `xs-signature.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue"],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: "Vue",
        },
      },
    },
    sourcemap: 'inline'  // source map 内联到文件中
  },
});