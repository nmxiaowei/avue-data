export default {
  methods: {
    getOptionTitle() {
      const option = this.option || {};
      return {
        show: this.validData(option.titleShow, false),
        text: option.title || "",
        subtext: option.subtext || "",
        textStyle: {
          color: option.titleColor || "#333",
          fontSize: option.titleFontSize || 16,
        },
        left: option.titlePosition || "auto",
        subtextStyle: {
          color: option.subTitleColor || "#aaa",
          fontSize: option.subTitleFontSize || 14,
        },
      };
    },
    getOptionGrid() {
      const option = this.option || {};
      return {
        height: Number(this.option.split) * 10,
        left: this.option.gridX || 20,
        top: this.option.gridY || 60,
        right: this.option.gridX2 || 20,
        bottom: this.option.gridY2 || 60,
      };
    },
    getOptionTip(prop = {}) {
      const option = this.option || {};
      const dataChart = this.dataChart;
      return {
        show: this.validData(option.tipShow, true),
        formatter: this.formatter ? params => this.formatter(params, dataChart) : undefined,
        backgroundColor: option.tipBackgroundColor || "rgba(0,0,0,0.5)",
        textStyle: {
          fontSize: option.tipFontSize || 20,
          color: option.tipColor || "#fff",
        },
        ...prop,
      };
    },
    getOptionLegend(data) {
      const option = this.option || {};
      const dataChart = this.dataChart;
      const legendData = data || dataChart?.series || (Array.isArray(dataChart) ? dataChart : []);
      return {
        type: "scroll",
        show: this.validData(option.legend, false),
        orient: option.legendOrient || "horizontal",
        x: option.legendPosition || "right",
        top: option.legendTop,
        textStyle: {
          fontSize: option.legendFontSize || 12,
          color: option.legendColor,
        },
        data: legendData.map((ele, index) => ({
          name: ele?.name || "",
          textStyle: {
            color: option.legendColor || this.getColor(index, true),
          },
        })),
      };
    },
    _calcAxisAuto(values) {
      if (!values || values.length === 0) return {};
      const dataMin = Math.min(...values);
      const dataMax = Math.max(...values);
      const mid = (dataMin + dataMax) / 2;
      const half = (dataMax - dataMin) / 2 || Math.abs(mid) || 1;
      return {
        min: Math.floor(mid - half * 1.2),
        max: Math.ceil(mid + half * 1.2),
      };
    },
    getOptionXAxis(prop = {}) {
      const option = this.option || {};
      return {
        show: this.validData(option.xAxisShow, true),
        name: option.xAxisName,
        min: option.xAxisMin,
        max: option.xAxisMax,
        nameTextStyle: {
          color: option.xAxisColor || "#fff",
          fontSize: option.xAxisFontSize || 14,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: option.xAxisLineColor || "#fff",
            width: this.validData(option.xAxisLineWidth, 1),
          },
        },
        inverse: this.validData(option.xAxisInverse, false),
        splitLine: {
          show: this.validData(option.xAxisSplitLineShow, false),
          lineStyle: {
            type: option.xAxisSplitLineType || "solid",
          },
        },
        axisLabel: {
          interval: option.xAxisInterval || "auto",
          rotate: option.xAxisRotate || 0,
          textStyle: {
            color: option.xAxisColor || "#fff",
            fontSize: option.xAxisFontSize || 14,
          },
        },
        ...prop,
      };
    },
    getOptionYAxis(prop = {}, values) {
      const option = this.option || {};
      const minMax = option.yAxisAuto
        ? this._calcAxisAuto(values)
        : { min: option.yAxisMin, max: option.yAxisMax };
      return {
        show: this.validData(option.yAxisShow, true),
        name: option.yAxisName,
        nameTextStyle: {
          color: option.yAxisColor || "#fff",
          fontSize: option.yAxisFontSize || 14,
        },
        axisLabel: {
          rotate: option.yAxisRotate || 0,
          textStyle: {
            color: option.yAxisColor || "#fff",
            fontSize: option.yAxisFontSize || 14,
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: option.yAxisLineColor || "#fff",
            width: this.validData(option.yAxisLineWidth, 1),
          },
        },
        ...minMax,
        inverse: this.validData(option.yAxisInverse, false),
        splitLine: {
          show: this.validData(option.yAxisSplitLineShow, false),
          lineStyle: {
            type: option.yAxisSplitLineType || "solid",
          },
        },
        ...prop,
      };
    },
    getOptionLabel(prop = {}) {
      const option = this.option || {};
      const dataChart = this.dataChart;
      return {
        show: this.validData(option.labelShow, false),
        formatter: this.labelFormatter
          ? params => this.labelFormatter(params, dataChart)
          : undefined,
        textStyle: {
          fontSize: option.labelShowFontSize || 14,
          color: option.labelShowColor || "inherit",
          fontWeight: option.labelShowFontWeight || 500,
        },
        ...prop,
      };
    },
  },
};
