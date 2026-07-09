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

const key = "Option";
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
];

export default {
  components: list.reduce((components, component) => {
    components[component.name + key] = component;
    return components;
  }, {}),
};
