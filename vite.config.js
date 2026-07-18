import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import createVitePlugins from "./vite/plugins";

const manualChunkPackages = {
  "element-plus": ["element-plus"],
  avue: ["@smallwei/avue"],
  "monaco-editor": ["monaco-editor"],
  vuedraggable: ["vuedraggable"],
  vendor: ["vue", "vue-router", "vue-i18n", "axios"],
  lodash: ["lodash"],
  xlsx: ["xlsx", "exceljs"],
};

const resolveManualChunk = id => {
  const normalizedId = id.replaceAll("\\", "/");
  return Object.entries(manualChunkPackages).find(([, packages]) =>
    packages.some(packageName => normalizedId.includes(`/node_modules/${packageName}/`)),
  )?.[0];
};

// https://vitejs.dev/config/
export default ({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_BASE, VITE_APP_ENV } = env;
  const isBuild = command === "build";
  return defineConfig({
    base: VITE_APP_BASE,
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    build: {
      target: "esnext",
      minify: "oxc",
      // 提升构建速度：关闭 sourcemap
      sourcemap: false,
      // 提升构建速度：关闭 brotli 压缩体积报告
      reportCompressedSize: false,
      // 提升构建速度：增大 chunk 警告阈值，避免无意义的分析开销
      chunkSizeWarningLimit: 8000,
      rolldownOptions: {
        onwarn(warning, warn) {
          if (warning.code === "EVAL" && /node_modules[\\/].*mockjs/.test(warning.id || "")) {
            return;
          }
          warn(warning);
        },
        output: {
          minify: {
            compress: {
              dropConsole: true,
              dropDebugger: true,
            },
          },
          manualChunks: resolveManualChunk,
        },
      },
      // 提升构建速度：CSS 代码分离
      cssCodeSplit: true,
    },
    css: {
      lightningcss: {
        errorRecovery: true,
      },
    },
    optimizeDeps: {
      rolldownOptions: {
        transform: {
          target: "esnext",
        },
      },
      // 预构建大型依赖，加速 dev 冷启动
      include: [
        "vue",
        "vue-router",
        "axios",
        "element-plus",
        "@smallwei/avue",
        "lodash",
        "dayjs",
        "monaco-editor",
        "vuedraggable",
      ],
    },
    server: {
      port: 8081,
      // 预热常用文件，加速 dev 首次加载
      warmup: {
        clientFiles: [
          "./src/main.js",
          "./src/registerConfig.js",
          "./src/echart/index.js",
          "./src/components/index.js",
        ],
      },
    },
    resolve: {
      alias: {
        vue: "vue/dist/vue.esm-bundler.js",
        "~": resolve(__dirname, "./"),
        "@": resolve(__dirname, "./src"),
        components: resolve(__dirname, "./src/components"),
        styles: resolve(__dirname, "./src/styles"),
        utils: resolve(__dirname, "./src/utils"),
      },
    },
    plugins: createVitePlugins(env, isBuild),
  });
};
