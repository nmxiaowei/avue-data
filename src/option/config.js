export const themeList = {
  1: {
    id: 1,
    name: "明亮",
    color: [
      "rgb(73, 146, 255)",
      "rgb(124, 255, 178)",
      "rgb(253, 221, 96)",
      "rgb(255, 110, 118)",
      "rgb(88, 217, 249)",
      "rgb(5, 192, 145)",
    ],
    data: [],
  },
  2: {
    id: 2,
    name: "暗淡",
    color: [
      "rgb(84, 112, 198)",
      "rgb(145, 204, 117)",
      "rgb(250, 200, 88)",
      "rgb(238, 102, 102)",
      "rgb(115, 192, 222)",
      "rgb(59, 162, 114)",
    ],
    data: [],
  },
  3: {
    id: 3,
    name: "马卡龙",
    color: [
      "rgb(46, 199, 201)",
      "rgb(182, 162, 222)",
      "rgb(90, 177, 239)",
      "rgb(255, 185, 128)",
      "rgb(216, 122, 128)",
      "rgb(141, 152, 179)",
    ],
    data: [],
  },
  4: {
    id: 4,
    name: "深色",
    color: [
      "rgb(193, 46, 52)",
      "rgb(230, 182, 0)",
      "rgb(0, 152, 217)",
      "rgb(43, 130, 29)",
      "rgb(0, 94, 170)",
      "rgb(51, 156, 168)",
    ],
    data: [],
  },
  5: {
    id: 5,
    name: "罗马红",
    color: [
      "rgb(224, 31, 84)",
      "rgb(94, 78, 165)",
      "rgb(245, 232, 200)",
      "rgb(184, 210, 199)",
      "rgb(198, 179, 142)",
      "rgb(164, 216, 194)",
    ],
    data: [],
  },
};
//基本配置
export const config = {
  width: 1920,
  height: 1080,
  screen: "x",
  group: [],
  groupCarousel: false,
  groupList: [],
  groupTime: 0,
  groupId: "",
  filters: {},
  theme: themeList,
  themeId: "1",
  overflow: false,
  styles: {
    show: false,
    contrast: 100,
    saturate: 100,
    brightness: 100,
    opacity: 100,
    grayscale: 0,
    hueRotate: 0,
    invert: 0,
    blur: 0,
  },
  mark: {
    show: false,
    text: "",
    fontSize: 20,
    color: "rgba(100,100,100,0.2)",
    degree: -20,
  },
  autoRefresh: {
    enabled: false, // 是否开启定时刷新
    interval: 60, // 刷新间隔（秒）
  },
  scale: 1,
  backgroundImage: `/img/bg/bg.png`,
  toolShow: true,
  folderDeep: false,
  gradeShow: false,
  gradeLen: 30,
};
// 颜色的配置
export const colorOption = {
  menuWidth: 150,
  refreshBtn: false,
  columnBtn: false,
  labelWidth: 100,
  column: [
    {
      label: "颜色1",
      prop: "color1",
      type: "color",
    },
    {
      label: "渐变色",
      prop: "color2",
      type: "color",
    },
    {
      label: "位置",
      prop: "postion",
      type: "number",
    },
  ],
};

//一些字典的配置
export const dicOption = {
  strokeLinecap: [
    {
      label: "butt",
      value: "butt",
    },
    {
      label: "round",
      value: "round",
    },
    {
      label: "square",
      value: "square",
    },
  ],
  transfer: [
    {
      label: "传参",
      value: "params",
    },
    {
      label: "跳转链接",
      value: "href",
    },
    {
      label: "跳转大屏",
      value: "group",
    },
    {
      label: "显隐",
      value: "display",
    },
    {
      label: "弹窗",
      value: "dialog",
    },
    {
      label: "移动",
      value: "move",
    },
    {
      label: "刷新数据",
      value: "refresh",
    },
    {
      label: "发送API数据",
      value: "sendApi",
    },
    {
      label: "设置样式",
      value: "style",
    },
  ],
  animateSpeed: [
    {
      label: "匀速",
      value: "linear",
    },
    {
      label: "慢快慢",
      value: "ease",
    },
    {
      label: "低速开始",
      value: "ease-in",
    },
    {
      label: "低速结束",
      value: "ease-out",
    },
    {
      label: "低速开始结束",
      value: "ease-in-out",
    },
  ],
  animateDirection: [
    {
      label: "默认",
      value: "normal",
    },
    {
      label: "向后",
      value: "reverse",
    },
    {
      label: "向前向后",
      value: "alternate",
    },
    {
      label: "向后向前",
      value: "alternate-reverse",
    },
  ],
  lineAnimation: [
    {
      label: "无",
      value: "",
    },
    {
      label: "正向",
      value: "positive",
    },
    {
      label: "反向",
      value: "reverse",
    },
  ],
  lineType: [
    {
      label: "实线",
      value: "",
    },
    {
      label: "点线",
      value: "dotted",
    },
    {
      label: "虚线",
      value: "dashed",
    },
    {
      label: "混合线",
      value: "blend",
    },
  ],
  line: [
    {
      label: "线条",
      value: "line",
    },
    {
      label: "圆环",
      value: "circle",
    },
    {
      label: "仪表",
      value: "dashboard",
    },
  ],
  fontWeight: [
    {
      label: "normal",
      value: "normal",
    },
    {
      label: "bold",
      value: "bold",
    },
    {
      label: "bolder",
      value: "bolder",
    },
    {
      label: "ligter",
      value: "ligter",
    },
  ],
  border: [
    {
      label: "无边框",
      value: "",
    },
    {
      label: "内置图片",
      value: "img",
    },
    {
      label: "内置边框",
      value: "border",
    },
  ],
  textAlign: [
    {
      label: "居中",
      value: "center",
    },
    {
      label: "左对齐",
      value: "left",
    },
    {
      label: "右对齐",
      value: "right",
    },
  ],
  dataType: [
    {
      label: "静态数据",
      value: 0,
    },
    {
      label: "API接口数据",
      value: 1,
    },
  ],
  orientList: [
    {
      label: "竖排",
      value: "vertical",
    },
    {
      label: "横排",
      value: "horizontal",
    },
  ],
  dataMethod: [
    {
      label: "GET",
      value: "get",
    },
    {
      label: "DELETE",
      value: "delete",
    },
    {
      label: "POST",
      value: "post",
    },
    {
      label: "PUT",
      value: "put",
    },
  ],
  funType: [
    {
      label: "过滤器",
      value: 0,
    },
    {
      label: "数据",
      value: 1,
    },
    {
      label: "公共",
      value: 2,
    },
    {
      label: "事件",
      value: 3,
    },
    {
      label: "其它",
      value: 4,
    },
  ],
  transferEvent: [
    {
      label: "点击事件",
      value: "clickFormatter",
    },
    {
      label: "双击事件",
      value: "dblClickFormatter",
    },
    {
      label: "移入事件",
      value: "mouseEnterFormatter",
    },
    {
      label: "移出事件",
      value: "mouseLeaveFormatter",
    },
    {
      label: "值改变事件",
      value: "changeFormatter",
    },
  ],
  notEventList: ["time", "notice", "data"],
  dataList: [
    "text",
    "img",
    "iframe",
    "flop",
    "bar",
    "line",
    "pie",
    "progress",
    "table",
    "gauge",
    "rectangle",
  ],
  barList: ["bar", "line"],
  mappingList: ["text", "iframe", "img"],
  titleList: ["bar", "pie", "line", "gauge"],
  labelList: ["bar", "line", "pie", "rectangle"],
  legendList: ["bar", "pie", "line"],
  echartList: ["bar", "pie", "line", "gauge", "rectangle"],
  colorList: ["bar", "pie", "line", "gauge"],
  tipList: ["bar", "pie", "line", "rectangle"],
  positionList: ["bar", "line"],
  labelFormatterList: [
    "bar",
    "line",
    "pie",
    "gauge",
    "rectangle",
  ],
  mapType: [
    {
      label: "原生",
      value: 0,
    },
  ],
  target: [
    {
      label: "本窗口",
      value: "_self",
    },
    {
      label: "新窗口",
      value: "_blank",
    },
  ],
  swiperType: [
    {
      label: "普通",
      value: "",
    },
    {
      label: "立体",
      value: "card",
    },
  ],
  swiperIndicator: [
    {
      label: "外部",
      value: "indicator",
    },
    {
      label: "不显示",
      value: "none",
    },
  ],
  format: [
    {
      label: "日期",
      value: "yyyy-MM-dd",
    },
    {
      label: "日期+时分",
      value: "yyyy-MM-dd hh:mm",
    },
    {
      label: "日期+时分秒",
      value: "yyyy-MM-dd hh:mm:ss",
    },
    {
      label: "日期(无年)",
      value: "MM-dd",
    },
    {
      label: "时分",
      value: "hh:mm",
    },
    {
      label: "时分秒",
      value: "hh:mm:ss",
    },
    {
      label: "星期",
      value: "day",
    },
  ],
  fontFamily: [
    {
      label: "宋体",
      value: "SimSun",
    },
    {
      label: "新宋体",
      value: "NSimSun",
    },
    {
      label: "黑体",
      value: "SimHei",
    },
    {
      label: "楷体",
      value: "KaiTi_GB2312",
    },
    {
      label: "微软雅黑",
      value: "Microsoft YaHei",
    },
    {
      label: "幼园",
      value: "YouYuan",
    },
    {
      label: "华文细黑",
      value: "STXihei",
    },
    {
      label: "细明体",
      value: "MingLiU",
    },
    {
      label: "新细明体",
      value: "PMingLiU",
    },
  ],
  tableSize: [
    {
      label: "大型",
      value: "large",
    },
    {
      label: "默认",
      value: "default",
    },
    {
      label: "小型",
      value: "small",
    },
  ],
  objectFit: [
    {
      label: "填充",
      value: "fill",
    },
    {
      label: "包含",
      value: "contain",
    },
    {
      label: "覆盖",
      value: "cover",
    },
    {
      label: "原始尺寸",
      value: "none",
    },
    {
      label: "缩小自适应",
      value: "scale-down",
    },
  ],
  symbolType: [
    {
      label: "圆形",
      value: "circle",
    },
    {
      label: "矩形",
      value: "rect",
    },
    {
      label: "圆角矩形",
      value: "roundRect",
    },
    {
      label: "三角形",
      value: "triangle",
    },
    {
      label: "菱形",
      value: "diamond",
    },
    {
      label: "别针",
      value: "pin",
    },
    {
      label: "箭头",
      value: "arrow",
    },
  ],
  echartLineType: [
    {
      label: "实线",
      value: "solid",
    },
    {
      label: "虚线",
      value: "dashed",
    },
    {
      label: "点线",
      value: "dotted",
    },
  ],
  stepType: [
    {
      label: "关闭",
      value: "",
    },
    {
      label: "起点阶梯",
      value: "start",
    },
    {
      label: "中点阶梯",
      value: "middle",
    },
    {
      label: "终点阶梯",
      value: "end",
    },
  ],
  funnelSort: [
    {
      label: "降序",
      value: "descending",
    },
    {
      label: "升序",
      value: "ascending",
    },
    {
      label: "无",
      value: "none",
    },
  ],
  radarShape: [
    {
      label: "多边形",
      value: "polygon",
    },
    {
      label: "圆形",
      value: "circle",
    },
  ],
  preload: [
    {
      label: "自动",
      value: "auto",
    },
    {
      label: "元数据",
      value: "metadata",
    },
    {
      label: "不预加载",
      value: "none",
    },
  ],
  textDecoration: [
    {
      label: "无",
      value: "none",
    },
    {
      label: "下划线",
      value: "underline",
    },
    {
      label: "上划线",
      value: "overline",
    },
    {
      label: "删除线",
      value: "line-through",
    },
  ],
  scrollDirection: [
    {
      label: "向左",
      value: "left",
    },
    {
      label: "向右",
      value: "right",
    },
    {
      label: "向上",
      value: "up",
    },
    {
      label: "向下",
      value: "down",
    },
  ],
  borderStyle: [
    {
      label: "实线",
      value: "solid",
    },
    {
      label: "虚线",
      value: "dashed",
    },
    {
      label: "点线",
      value: "dotted",
    },
    {
      label: "双线",
      value: "double",
    },
  ],
  wordcloudShape: [
    {
      label: "圆形",
      value: "circle",
    },
    {
      label: "心形",
      value: "cardioid",
    },
    {
      label: "菱形",
      value: "diamond",
    },
    {
      label: "三角形",
      value: "triangle-forward",
    },
    {
      label: "三角形(反)",
      value: "triangle",
    },
    {
      label: "五角星",
      value: "star",
    },
  ],
  playbackRate: [
    {
      label: "0.5x",
      value: 0.5,
    },
    {
      label: "0.75x",
      value: 0.75,
    },
    {
      label: "1x(正常)",
      value: 1,
    },
    {
      label: "1.25x",
      value: 1.25,
    },
    {
      label: "1.5x",
      value: 1.5,
    },
    {
      label: "2x",
      value: 2,
    },
  ],
  overflowType: [
    {
      label: "默认",
      value: "",
    },
    {
      label: "隐藏",
      value: "hidden",
    },
    {
      label: "滚动",
      value: "auto",
    },
    {
      label: "省略号",
      value: "ellipsis",
    },
  ],
  graphType: [
    {
      label: "水平线",
      value: "horizontal",
    },
    {
      label: "垂直线",
      value: "vertical",
    },
    {
      label: "矩形",
      value: "rotundity",
    },
    {
      label: "圆形",
      value: "rectangle",
    },
  ],
  fontStyle: [
    {
      label: "正常",
      value: "normal",
    },
    {
      label: "斜体",
      value: "italic",
    },
    {
      label: "倾斜",
      value: "oblique",
    },
  ],
  textTransform: [
    {
      label: "无",
      value: "none",
    },
    {
      label: "大写",
      value: "uppercase",
    },
    {
      label: "小写",
      value: "lowercase",
    },
    {
      label: "首字母大写",
      value: "capitalize",
    },
  ],
  writingMode: [
    {
      label: "水平",
      value: "horizontal-tb",
    },
    {
      label: "垂直从右到左",
      value: "vertical-rl",
    },
    {
      label: "垂直从左到右",
      value: "vertical-lr",
    },
  ],
  verticalAlign: [
    {
      label: "顶部",
      value: "flex-start",
    },
    {
      label: "居中",
      value: "center",
    },
    {
      label: "底部",
      value: "flex-end",
    },
  ],
  wordBreak: [
    {
      label: "默认",
      value: "normal",
    },
    {
      label: "全部断行",
      value: "break-all",
    },
    {
      label: "单词断行",
      value: "break-word",
    },
  ],
  whiteSpace: [
    {
      label: "默认",
      value: "normal",
    },
    {
      label: "不换行",
      value: "nowrap",
    },
    {
      label: "保留换行",
      value: "pre-wrap",
    },
  ],
  gradientDirection: [
    {
      label: "从上到下",
      value: "to bottom",
    },
    {
      label: "从下到上",
      value: "to top",
    },
    {
      label: "从左到右",
      value: "to right",
    },
    {
      label: "从右到左",
      value: "to left",
    },
    {
      label: "左上到右下",
      value: "to bottom right",
    },
    {
      label: "右上到左下",
      value: "to bottom left",
    },
  ],
  colorMode: [
    {
      label: "随机",
      value: "random",
    },
    {
      label: "自定义",
      value: "custom",
    },
  ],
  clipPath: [
    {
      label: "无",
      value: "",
    },
    {
      label: "圆形",
      value: "circle(50%)",
    },
    {
      label: "椭圆",
      value: "ellipse(50% 40%)",
    },
    {
      label: "菱形",
      value: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    },
    {
      label: "三角形",
      value: "polygon(50% 0%, 0% 100%, 100% 100%)",
    },
    {
      label: "五边形",
      value: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
    },
  ],
  blendMode: [
    {
      label: "正常",
      value: "normal",
    },
    {
      label: "正片叠底",
      value: "multiply",
    },
    {
      label: "滤色",
      value: "screen",
    },
    {
      label: "叠加",
      value: "overlay",
    },
    {
      label: "柔光",
      value: "soft-light",
    },
    {
      label: "强光",
      value: "hard-light",
    },
    {
      label: "差值",
      value: "difference",
    },
  ],
  flipDirection: [
    {
      label: "无",
      value: "",
    },
    {
      label: "水平翻转",
      value: "scaleX(-1)",
    },
    {
      label: "垂直翻转",
      value: "scaleY(-1)",
    },
    {
      label: "水平+垂直翻转",
      value: "scale(-1,-1)",
    },
  ],
  crossorigin: [
    {
      label: "无",
      value: "",
    },
    {
      label: "匿名",
      value: "anonymous",
    },
    {
      label: "携带凭证",
      value: "use-credentials",
    },
  ],
  endedAction: [
    {
      label: "无",
      value: "",
    },
    {
      label: "暂停",
      value: "pause",
    },
    {
      label: "重播",
      value: "replay",
    },
    {
      label: "隐藏",
      value: "hide",
    },
  ],
  iframeLoading: [
    {
      label: "立即加载",
      value: "eager",
    },
    {
      label: "懒加载",
      value: "lazy",
    },
  ],
  cursor: [
    {
      label: "默认",
      value: "default",
    },
    {
      label: "指针",
      value: "pointer",
    },
    {
      label: "移动",
      value: "move",
    },
    {
      label: "文本",
      value: "text",
    },
    {
      label: "等待",
      value: "wait",
    },
    {
      label: "禁止",
      value: "not-allowed",
    },
    {
      label: "十字",
      value: "crosshair",
    },
    {
      label: "隐藏",
      value: "none",
    },
  ],
  overflow: [
    {
      label: "默认",
      value: "visible",
    },
    {
      label: "隐藏",
      value: "hidden",
    },
    {
      label: "滚动",
      value: "scroll",
    },
    {
      label: "自动",
      value: "auto",
    },
  ],
  mixBlendMode: [
    {
      label: "正常",
      value: "normal",
    },
    {
      label: "正片叠底",
      value: "multiply",
    },
    {
      label: "滤色",
      value: "screen",
    },
    {
      label: "叠加",
      value: "overlay",
    },
    {
      label: "柔光",
      value: "soft-light",
    },
    {
      label: "强光",
      value: "hard-light",
    },
    {
      label: "差值",
      value: "difference",
    },
    {
      label: "排除",
      value: "exclusion",
    },
    {
      label: "色相",
      value: "hue",
    },
    {
      label: "饱和度",
      value: "saturation",
    },
    {
      label: "亮度",
      value: "luminosity",
    },
  ],
  referrerPolicy: [
    {
      label: "默认",
      value: "",
    },
    {
      label: "不发送",
      value: "no-referrer",
    },
    {
      label: "同源发送",
      value: "origin",
    },
    {
      label: "同源时完整",
      value: "same-origin",
    },
    {
      label: "降级时不发送",
      value: "no-referrer-when-downgrade",
    },
    {
      label: "严格同源",
      value: "strict-origin",
    },
  ],
};
