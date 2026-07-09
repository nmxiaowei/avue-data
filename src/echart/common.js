import { markRaw } from "vue";
import config from "./config";
import commonOption from "./option";
import { getFunction, uuid } from "@/utils/utils";
import COMMON from "@/config";
import styleMixin from "./style";
import dataMixin from "./data";
import eventMixin from "./event";
export default (() => {
  return {
    inject: ["subgroup"],
    props: {
      filterList: Object,
      dataFormatterId: String,
      dataFormatterStr: [String, Function],
      clickFormatterStr: [String, Function],
      dblClickFormatterStr: [String, Function],
      mouseEnterFormatterStr: [String, Function],
      mouseLeaveFormatterStr: [String, Function],
      dataBeforeFormatterStr: [String, Function],
      dataAfterFormatterStr: [String, Function],
      echartFormatterStr: [String, Function],
      labelFormatterStr: [String, Function],
      stylesFormatterStr: [String, Function],
      formatterStr: [String, Function],
      titleFormatter: Function,
      transfer: Function,
      data: [Object, String, Array],
      dataQueryType: String,
      dataQuery: String,
      dataHeader: String,
      fontFamily: String,
      dataList: Array,
      object: {
        type: Object,
        default: () => {
          return {};
        },
      },
      initialize: {
        type: Boolean,
        default: true,
      },
      index: String,
      width: {
        type: [Number, String],
        default: 600,
      },
      height: {
        type: [Number, String],
        default: 600,
      },
      theme: {
        type: String,
      },
      child: {
        type: Object,
        default: () => {
          return {};
        },
      },
      time: {
        type: [Number, String],
        default: 0,
      },
      url: {
        type: String,
      },
      dataType: {
        type: Number,
        default: 0,
      },
      dataMethod: {
        type: String,
        default: "get",
      },
      id: {
        type: String,
        default: "main_" + uuid(),
      },
      display: Boolean,
      component: {
        type: Object,
        default: () => {
          return {};
        },
      },
      option: {
        type: Object,
        default: () => {
          return {};
        },
      },
    },
    mixins: [commonOption, styleMixin, dataMixin, eventMixin],
    data() {
      return {
        headerHeight: "",
        myChart: "",
        refList: [],
        styles: {},
        dataChartSnapshot: "",
        debugger: null, // 数据流调试器实例
        isChartUnmounted: false,
      };
    },
    watch: {
      dataChart: {
        handler(val) {
          const newSnapshot = this.getDataChartSnapshot(val);
          if (newSnapshot === this.dataChartSnapshot) return;

          this.dataChartSnapshot = newSnapshot;
          this.updateChart();
          this.bindEvent();
          this.handleChange(val);
        },
        deep: true,
      },
      echartFormatter() {
        this.updateChart();
        this.bindEvent();
      },
      width() {
        this.$nextTick(() => {
          this.updateChart();
        });
      },
      height() {
        this.$nextTick(() => {
          this.updateChart();
        });
      },
      theme() {
        this.recreateChart();
      },
      option: {
        handler() {
          this.updateChart();
          this.bindEvent();
        },
        deep: true,
      },
    },
    computed: {
      // 组件信息，用于调试日志
      componentInfo() {
        return {
          name: this.component?.name || this.option?.title || "未命名组件",
          id: this.index || "unknown",
        };
      },
      mappingValue() {
        return this.dataChart[this.option.mapping || "value"];
      },
      clickFormatter() {
        return this.getFormatter(this.clickFormatterStr, true);
      },
      dblClickFormatter() {
        return this.getFormatter(this.dblClickFormatterStr, true);
      },
      mouseEnterFormatter() {
        return this.getFormatter(this.mouseEnterFormatterStr, true);
      },
      mouseLeaveFormatter() {
        return this.getFormatter(this.mouseLeaveFormatterStr, true);
      },
      dataBeforeFormatter() {
        return this.getFormatter(this.dataBeforeFormatterStr, true);
      },
      dataAfterFormatter() {
        return this.getFormatter(this.dataAfterFormatterStr, true);
      },
      echartFormatter() {
        return this.getFormatter(this.echartFormatterStr);
      },
      labelFormatter() {
        return this.getFormatter(this.labelFormatterStr);
      },
      stylesFormatter() {
        return this.getFormatter(this.stylesFormatterStr);
      },
      formatter() {
        return this.getFormatter(this.formatterStr);
      },
      count() {
        return this.option.count;
      },
      name() {
        let className = this.$el.className.split(" ")[0];
        const result = className.replace(config.name, "");
        return result;
      },
      minWidth() {
        const val = this.option.minWidth;
        if (val > this.width) return val;
      },
    },
    created() {
      this.init();
      this.dataChartSnapshot = this.getDataChartSnapshot(this.dataChart);
    },
    mounted() {
      this.initChart();
    },
    methods: {
      getDataChartSnapshot(val) {
        if (typeof val === "string") return val;
        try {
          return JSON.stringify(val ?? null);
        } catch (e) {
          return String(val);
        }
      },
      init() {
        this.initDataList();
      },
      initChart() {
        if (this.isChartUnmounted) return;

        this.refList = this.getItemRefs();
        this.initChartInstance();
        this.updateChart();
        this.updateData();
      },
      initChartInstance() {
        if (this.isChartUnmounted) return;

        const main = this.$refs[this.id];
        if (main) {
          // 判断是否图表去初始化
          const isChart = config.echart.includes(this.name);
          if (isChart) {
            this.disposeChart();
            this.myChart = markRaw(
              window.echarts.init(main, this.theme, {
                renderer: this.option.renderer ? "svg" : "canvas",
              }),
            );
          }
        }
      },
      recreateChart() {
        this.$nextTick(() => {
          if (this.isChartUnmounted) return;
          this.initChartInstance();
          this.updateChart();
          this.bindEvent();
        });
      },
      disposeChart() {
        if (this.myChart && !this.myChart.isDisposed?.()) {
          this.myChart.off && this.myChart.off();
          this.myChart.dispose && this.myChart.dispose();
        }
        this.myChart = null;
      },
      getFormatter(formatterStr, isEchart = false) {
        return typeof formatterStr === "function"
          ? formatterStr
          : getFunction(formatterStr, isEchart, this.index);
      },
      getItemRefs() {
        let refList = (this.subgroup || {}).$refs || [];
        let result = {};
        Object.keys(refList).forEach(ele => {
          if (ele.indexOf(COMMON.NAME) !== -1) {
            let obj = refList[ele][0];
            if (obj) result[ele.replace(COMMON.NAME, "")] = obj.$refs.temp;
          } else if ((refList[ele][0] || {}).type === "folder") {
            let obj = refList[ele][0];
            if (obj) result[ele.replace(COMMON.DEAFNAME, "")] = obj;
          }
        });
        return result;
      },
      updateChart() {},
      // 下面俩都是chart的公共的方法,就放这里面共用
      getColor(index, first) {
        const category = this.option.category;
        if ((this.option.barColor || []).length > 0) {
          const barColor = this.option.barColor || [];
          if (barColor[index]) {
            const color1 = barColor[index].color1;
            const color2 = barColor[index].color2;
            const postion = (barColor[index].postion || 0.9) * 0.01;
            if (first) return color1;
            if (color2) {
              return {
                type: "linear",
                x: 0,
                y: 0,
                x2: category ? 1 : 0,
                y2: category ? 0 : 1,
                colorStops: [
                  {
                    offset: 0,
                    color: color1, // 0% 处的颜色
                  },
                  {
                    offset: postion,
                    color: color2, // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              };
            }
            return color1;
          } else {
            return [];
          }
        } else if (!this.validatenull(window.$glob.theme)) {
          let colors = window.$glob.theme.color;
          if (colors[index]) {
            return colors[index];
          }
        }
      },
    },
    beforeUnmount() {
      this.isChartUnmounted = true;
      // 清理 ECharts 实例
      this.disposeChart();
    },
  };
})();
