const ASSET_BASE = "/img/assets/";

const chartData = {
  categories: ["一月", "二月", "三月", "四月", "五月"],
  series: [
    {
      name: "指标",
      data: [35, 58, 42, 76, 64],
    },
  ],
};

export const customVueTemplate = `<template>
  <div class="vue-widget" @click="handleClick">
    <div class="vue-widget__title">{{ title }}</div>
    <div class="vue-widget__value">{{ displayValue }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: "自定义 Vue 组件",
    };
  },
  computed: {
    displayValue() {
      const data = this.dataChart || {};
      return data.value || data.text || "通过右侧数据配置传入数据";
    },
  },
  methods: {
    handleClick() {
      this.$emit("click", this.dataChart);
    },
  },
};
</script>

<style>
.vue-widget {
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 24px;
  color: #e0f2fe;
  border: 1px solid rgba(56, 189, 248, .65);
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(14, 116, 144, .72), rgba(15, 23, 42, .9));
}
.vue-widget__title {
  font-size: 16px;
  opacity: .8;
}
.vue-widget__value {
  margin-top: 12px;
  font-size: 26px;
  font-weight: 700;
}
</style>`;

export const customEchartFormatter = `(data = {}) => {
  const categories = data.categories || [];
  const series = data.series || [];
  return {
    color: ["#38bdf8", "#22c55e", "#f59e0b"],
    tooltip: { trigger: "axis" },
    grid: { top: 48, right: 24, bottom: 42, left: 48 },
    xAxis: {
      type: "category",
      data: categories,
      axisLine: { lineStyle: { color: "rgba(226,232,240,.45)" } },
      axisLabel: { color: "#e2e8f0" },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#e2e8f0" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,.18)" } },
    },
    series: series.map(item => ({
      name: item.name,
      type: "bar",
      barWidth: 18,
      data: item.data,
    })),
  };
}`;

const baseOption = {
  scale: 0,
  perspective: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  contrast: 0,
  saturate: 0,
  brightness: 0,
  opacity: 0,
  grayscale: 0,
  hueRotate: 0,
  invert: 0,
  blur: 0,
};

const createComponent = ({
  name,
  prop,
  img,
  width,
  height,
  data,
  option = {},
  icon,
  echartFormatter = "",
}) => ({
  name,
  title: name,
  icon: icon || `icon-${prop}`,
  img: ASSET_BASE + img,
  dataType: 0,
  data,
  echartFormatter,
  dataFormatter: "",
  dataHeader: "",
  dataQuery: "",
  dataBody: "",
  stylesFormatter: "",
  component: {
    ...baseOption,
    width,
    height,
    name: prop,
    prop,
  },
  option,
  left: 0,
  top: 0,
  display: false,
  lock: false,
  group: "",
  child: {
    index: [],
    paramList: [],
  },
  zIndex: 0,
  rotate: 0,
});

const items = [
  createComponent({
    name: "文本",
    prop: "text",
    img: "text.png",
    width: 260,
    height: 60,
    data: { value: "Avue Data" },
    option: {
      fontSize: 30,
      color: "#ffffff",
      textAlign: "center",
      lineHeight: 60,
      fontWeight: "normal",
    },
  }),
  createComponent({
    name: "图片",
    prop: "img",
    img: "img.png",
    width: 320,
    height: 180,
    data: { value: ASSET_BASE + "img.png" },
    option: {
      objectFit: "contain",
      opacity: 1,
      transitionDuration: 300,
    },
  }),
  createComponent({
    name: "Iframe",
    prop: "iframe",
    img: "iframe.png",
    width: 520,
    height: 280,
    data: { value: "about:blank" },
    option: {
      scrolling: "auto",
      loading: "eager",
      contentScale: 1,
      allowFullscreen: true,
    },
  }),
  createComponent({
    name: "视频",
    prop: "video",
    img: "video.png",
    width: 520,
    height: 300,
    data: { value: "" },
    option: {
      autoplay: false,
      controls: true,
      loop: false,
      muted: true,
      preload: "auto",
      playbackRate: 1,
      volume: 0.8,
      startTime: 0,
      endTime: 0,
      endedAction: "pause",
      pip: false,
      poster: ASSET_BASE + "video.png",
      objectFit: "contain",
      borderRadius: 0,
      opacity: 1,
    },
  }),
  createComponent({
    name: "翻牌器",
    prop: "flop",
    img: "flop.png",
    width: 280,
    height: 90,
    data: [{ value: 3280, prefixText: "", suffixText: " 次" }],
    option: {
      whole: true,
      fontSize: 42,
      color: "#38bdf8",
      width: 48,
      height: 66,
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      textAlign: "center",
    },
  }),
  createComponent({
    name: "柱状图",
    prop: "bar",
    img: "bar.png",
    width: 520,
    height: 320,
    data: chartData,
    option: {
      gridX: 50,
      gridY: 60,
      gridX2: 30,
      gridY2: 50,
      barWidth: 18,
      barRadius: 4,
      barOpacity: 0.9,
      xAxisShow: true,
      yAxisShow: true,
      tipShow: true,
      labelShow: false,
    },
  }),
  createComponent({
    name: "自定义EChart",
    prop: "common",
    img: "bar2.png",
    width: 520,
    height: 320,
    data: chartData,
    echartFormatter: customEchartFormatter,
    option: {
      remote: false,
      remoteType: "system",
      id: "local-custom-echart",
      src: "",
      renderer: false,
    },
  }),
  createComponent({
    name: "折线图",
    prop: "line",
    img: "line.png",
    width: 520,
    height: 320,
    data: chartData,
    option: {
      gridX: 50,
      gridY: 60,
      gridX2: 30,
      gridY2: 50,
      smooth: true,
      lineWidth: 2,
      symbolShow: false,
      xAxisShow: true,
      yAxisShow: true,
      tipShow: true,
      labelShow: false,
    },
  }),
  createComponent({
    name: "饼图",
    prop: "pie",
    img: "pie.png",
    width: 360,
    height: 320,
    data: [
      { name: "A", value: 36 },
      { name: "B", value: 28 },
      { name: "C", value: 18 },
      { name: "D", value: 12 },
    ],
    option: {
      radius: true,
      radiusInner: "38%",
      radiusOuter: "62%",
      labelShow: true,
      legend: false,
      tipShow: true,
    },
  }),
  createComponent({
    name: "进度条",
    prop: "progress",
    img: "progress.png",
    width: 320,
    height: 80,
    data: { data: 68 },
    option: {
      type: "line",
      strokeWidth: 14,
      strokeLinecap: "round",
      borderColor: "#38bdf8",
      trackColor: "rgba(148, 163, 184, 0.24)",
      showText: true,
      fontSize: 20,
      color: "#ffffff",
    },
  }),
  createComponent({
    name: "表格",
    prop: "table",
    img: "table.png",
    width: 620,
    height: 280,
    data: [
      { name: "华东", value: 1280, rate: "36%" },
      { name: "华南", value: 960, rate: "27%" },
      { name: "华北", value: 720, rate: "20%" },
    ],
    option: {
      column: [
        { label: "区域", prop: "name" },
        { label: "数值", prop: "value" },
        { label: "占比", prop: "rate" },
      ],
      showHeader: true,
      border: false,
      index: true,
      count: 6,
      headerFontSize: 14,
      bodyFontSize: 14,
      headerColor: "#e2e8f0",
      bodyColor: "#e2e8f0",
      nthColor: "rgba(15, 23, 42, 0.3)",
      othColor: "rgba(30, 41, 59, 0.34)",
    },
  }),
  createComponent({
    name: "仪表盘",
    prop: "gauge",
    img: "gauge.png",
    width: 360,
    height: 320,
    data: { value: 72, name: "完成率" },
    option: {
      min: 0,
      max: 100,
      radius: "75%",
      splitNumber: 10,
      pointerShow: true,
      lineSize: 10,
      axisLabelShow: true,
      unit: "%",
    },
  }),
  createComponent({
    name: "矩形树图",
    prop: "rectangle",
    img: "rectangle.png",
    width: 420,
    height: 300,
    data: [
      {
        name: "总量",
        children: [
          { name: "A", value: 40 },
          { name: "B", value: 28 },
          { name: "C", value: 18 },
        ],
      },
    ],
    option: {
      roam: false,
      breadcrumb: true,
      nodeGap: 2,
      borderWidth: 1,
      borderColor: "#0f172a",
      labelShow: true,
    },
  }),
  createComponent({
    name: "实时日期",
    prop: "datetime",
    img: "datetime.png",
    width: 360,
    height: 64,
    data: {},
    icon: "icon-datetime",
    option: {
      format: "yyyy-MM-dd hh:mm:ss",
      color: "#ffffff",
      fontSize: 30,
      fontWeight: "normal",
      textAlign: "center",
      opacity: 1,
    },
  }),
  createComponent({
    name: "SVG 图标",
    prop: "svg",
    img: "svg.png",
    width: 160,
    height: 160,
    data: {},
    icon: "icon-svg",
    option: {
      color: "#38bdf8",
      fillColor: "#38bdf8",
      opacity: 1,
      content:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 3.1 5.2 2.9L12 10.9 6.8 8 12 5.1Zm-6 5.4 5 2.8v5.2l-5-2.8v-5.2Zm7 8v-5.2l5-2.8v5.2l-5 2.8Z"/></svg>',
    },
  }),
  createComponent({
    name: "输入框",
    prop: "input",
    img: "input.png",
    width: 360,
    height: 56,
    data: {},
    icon: "icon-vue",
    option: {
      type: "text",
      placeholder: "请输入内容",
      clearable: true,
      disabled: false,
      readonly: false,
      size: "default",
    },
  }),
  createComponent({
    name: "下拉选择",
    prop: "select",
    img: "select.png",
    width: 360,
    height: 56,
    data: [
      { label: "选项一", value: "one" },
      { label: "选项二", value: "two" },
      { label: "选项三", value: "three" },
    ],
    icon: "icon-vue",
    option: {
      placeholder: "请选择",
      clearable: true,
      disabled: false,
      multiple: false,
      filterable: false,
      size: "default",
    },
  }),
  createComponent({
    name: "单选组",
    prop: "radio",
    img: "radio.png",
    width: 360,
    height: 48,
    data: [
      { label: "选项一", value: "one" },
      { label: "选项二", value: "two" },
    ],
    icon: "icon-vue",
    option: { disabled: false, button: false, size: "default" },
  }),
  createComponent({
    name: "复选组",
    prop: "checkbox",
    img: "checkbox.png",
    width: 360,
    height: 48,
    data: [
      { label: "选项一", value: "one" },
      { label: "选项二", value: "two" },
    ],
    icon: "icon-vue",
    option: { disabled: false, button: false, size: "default" },
  }),
  createComponent({
    name: "开关",
    prop: "switch",
    img: "switch.png",
    width: 100,
    height: 48,
    data: {},
    icon: "icon-vue",
    option: { disabled: false, loading: false, inlinePrompt: false, size: "default", width: 48 },
  }),
  createComponent({
    name: "日期选择",
    prop: "datetimes",
    img: "datetimes.png",
    width: 360,
    height: 56,
    data: {},
    icon: "icon-datetime",
    option: {
      type: "date",
      placeholder: "选择日期",
      clearable: true,
      disabled: false,
      size: "default",
      format: "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD",
    },
  }),
  createComponent({
    name: "导航菜单",
    prop: "menu",
    img: "menu.png",
    width: 220,
    height: 210,
    data: [
      { index: "1", title: "首页" },
      { index: "2", title: "数据中心" },
      { index: "3", title: "系统设置" },
    ],
    icon: "icon-group",
    option: {
      mode: "vertical",
      collapse: false,
      backgroundColor: "rgba(15, 23, 42, .82)",
      textColor: "#cbd5e1",
      activeTextColor: "#38bdf8",
    },
  }),
  createComponent({
    name: "树形菜单",
    prop: "tree",
    img: "tree.png",
    width: 280,
    height: 240,
    data: [
      {
        label: "数据资产",
        value: "data",
        children: [
          { label: "数据源", value: "source" },
          { label: "数据集", value: "dataset" },
        ],
      },
      { label: "可视化大屏", value: "screen" },
    ],
    icon: "icon-group",
    option: {
      showCheckbox: false,
      defaultExpandAll: true,
      expandOnClickNode: true,
      accordion: false,
    },
  }),
  createComponent({
    name: "自定义 Vue 组件",
    prop: "vue",
    img: "text.png",
    width: 420,
    height: 180,
    data: { value: "Avue Data" },
    icon: "icon-vue",
    option: {
      remote: false,
      remoteType: "url",
      src: "",
      id: "",
      content: customVueTemplate,
    },
  }),
];

const basicProps = ["text", "img", "iframe", "video", "flop", "datetime"];
const iconProps = ["svg"];
const formProps = ["input", "select", "radio", "checkbox", "switch", "datetimes"];
const navigationProps = ["menu", "tree"];
const customProps = ["vue"];
const chartProps = ["bar", "common", "line", "pie", "progress", "table", "gauge", "rectangle"];

export default [
  {
    name: "基础组件",
    icon: "icon-daping",
    children: items
      .filter(option => basicProps.includes(option.component.prop))
      .map(option => ({ name: option.name, option })),
  },
  {
    name: "图标组件",
    icon: "icon-svg",
    children: items
      .filter(option => iconProps.includes(option.component.prop))
      .map(option => ({ name: option.name, option })),
  },
  {
    name: "表单组件",
    icon: "icon-vue",
    children: items
      .filter(option => formProps.includes(option.component.prop))
      .map(option => ({ name: option.name, option })),
  },
  {
    name: "导航组件",
    icon: "icon-group",
    children: items
      .filter(option => navigationProps.includes(option.component.prop))
      .map(option => ({ name: option.name, option })),
  },
  {
    name: "自定义组件",
    icon: "icon-vue",
    children: items
      .filter(option => customProps.includes(option.component.prop))
      .map(option => ({ name: option.name, option })),
  },
  {
    name: "图表组件",
    icon: "icon-bar",
    children: items
      .filter(option => chartProps.includes(option.component.prop))
      .map(option => ({ name: option.name, option })),
  },
];
