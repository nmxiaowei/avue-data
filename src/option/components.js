import main from "./components/main.vue";
import text from "./components/text.vue";
import img from "./components/img.vue";
import iframe from "./components/iframe.vue";
import video from "./components/video.vue";
import flop from "./components/flop.vue";
import common from "./components/common.vue";
import bar from "./components/bar.vue";
import line from "./components/line.vue";
import pie from "./components/pie.vue";
import progress from "./components/progress.vue";
import table from "./components/table.vue";
import gauge from "./components/gauge.vue";
import rectangle from "./components/rectangle.vue";
import datetime from "./components/datetime.vue";
import svg from "./components/svg.vue";
import vue from "./components/vue.vue";
import border from "./components/border.vue";
import kpi from "./components/kpi.vue";
import map from "./components/map.vue";
import customComponents from "@/components";

const list = [
  main,
  text,
  img,
  iframe,
  video,
  flop,
  common,
  bar,
  line,
  pie,
  progress,
  table,
  gauge,
  rectangle,
  datetime,
  svg,
  vue,
  border,
  kpi,
  map,
];

const customOptionModules = import.meta.glob("../components/**/option.vue", { eager: true });
const customOptions = Object.values(customOptionModules).reduce((components, module) => {
  const component = module.default;
  if (component?.name) {
    components[component.optionComponentName || component.name + "Option"] = component;
  }
  return components;
}, {});

export default {
  components: {
    ...list.reduce((components, component) => {
      components[component.optionComponentName || component.name + "Option"] = component;
      return components;
    }, {}),
    ...customComponents,
    ...customOptions,
  },
};
