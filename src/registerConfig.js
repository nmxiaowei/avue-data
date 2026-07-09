import { registerRoutes } from "@/router";
import "virtual:svg-icons-register";
import SvgIcon from "./icons/index.vue";
import JsonViewer from "vue-json-viewer";
import "vue-json-viewer/style.css";
import AvueData from "@/page/view.vue";
import highlight from "@/page/components/highlight.vue";
import { loadScript } from "@/utils/utils";
import { website } from "@/config.js";
import "@/styles/common.scss";
import hljs from "highlight.js"; //导入代码高亮文件
import "highlight.js/styles/atom-one-dark.css";

import echartComponents from "@/echart/";

import error from "./error";

export function registerInstall(app, { config = {}, axios }) {
  config = Object.assign(website, config);
  let list = { ...echartComponents };
  Object.keys(list).map(ele => {
    let component = list[ele];
    app.component(component.name, component);
  });
  const $loadingParams = {};
  $loadingParams["element-loading-text"] = "加载中...";
  $loadingParams["element-loading-background"] = "rgba(32,32,35, 0.8)";
  app.config.globalProperties.$loadingParams = $loadingParams;
  app.config.globalProperties.$website = Object.assign(window.$website || website, config);
  app.config.globalProperties.$axios = axios;
  app.component("avue-data", AvueData);
  document.title = website.title;
  window.axios = axios;
  window.$loadScript = loadScript;
}

function registerLibs(config, axios, router, app) {
  registerInstall(app, { config, axios });
  app.directive("highlight", function (el) {
    let blocks = el.querySelectorAll("pre code");
    blocks.forEach(block => {
      block.removeAttribute("data-highlighted");
      hljs.highlightElement(block);
    });
  });
  app.use(router);
  app.use(error);
  app.use(JsonViewer);
  app.component("avue-highlight", highlight);
  app.component("svg-icon", SvgIcon);
}

function registerRouters(config, router) {
  if (!router) return;
  // 路由配置已迁移到 router.js 中
  registerRoutes(config);
}
export default function ({ app, config = {}, router, axios }) {
  config = Object.assign(website, config);
  registerRouters(config, router);
  registerLibs(config, axios, router, app);
}
