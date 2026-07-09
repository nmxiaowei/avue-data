import text from "./packages/text/index.vue";
import img from "./packages/img/index.vue";
import iframe from "./packages/iframe/index.vue";
import video from "./packages/video/index.vue";
import flop from "./packages/flop/index.vue";
import common from "./packages/common/index.vue";
import bar from "./packages/bar/index.vue";
import line from "./packages/line/index.vue";
import pie from "./packages/pie/index.vue";
import progress from "./packages/progress/index.vue";
import table from "./packages/table/index.vue";
import gauge from "./packages/gauge/index.vue";
import rectangle from "./packages/rectangle/index.vue";

const list = [
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
];

export default list.reduce((components, component) => {
  components[component.name] = component;
  return components;
}, {});
