<template>
  <div :class="[b(), className]" :style="styleSizeName">
    <div :ref="id" :style="styleChartName"></div>
  </div>
</template>

<script>
import create from "../../create";
export default create({
  name: "line",
  methods: {
    updateChart() {
      const optionData = this.deepClone(this.dataChart);
      const option = {
        title: this.getOptionTitle(),
        tooltip: this.getOptionTip({
          trigger: "axis",
        }),
        grid: this.getOptionGrid(),
        legend: this.getOptionLegend(),
        xAxis: this.getOptionXAxis({
          type: "category",
          data: optionData?.categories || [],
        }),
        yAxis: this.getOptionYAxis(
          {
            type: "value",
            data: optionData?.categories || [],
          },
          (optionData?.series || []).flatMap(s => s.data || []),
        ),
        series: (() => {
          const list = (optionData?.series || []).map((ele, index) => {
            return {
              ...ele,
              ...{
                type: "line",
                smooth: this.validData(this.option.smooth, true),
                showSymbol: this.validData(this.option.symbolShow, false),
                symbolSize: this.option.symbolSize || 10,
                symbol: this.option.symbolType || "circle",
                step: this.option.stepType || false,
                stack: ele.stack || this.option.stack,
                connectNulls: this.validData(this.option.connectNulls, false),
                areaStyle: (() => {
                  if (this.option.areaStyle) {
                    return {
                      opacity: this.validData(this.option.areaOpacity, 0.7),
                    };
                  }
                })(),
                lineStyle: {
                  width: this.option.lineWidth || 1,
                  type: this.option.lineType || "solid",
                },
                itemStyle: {
                  color: this.getColor(index),
                },
                label: this.getOptionLabel({
                  position: "top",
                }),
              },
            };
          });
          return list;
        })(),
      };
      if (this.myChart) {
        this.myChart.resize();
        this.myChart.setOption(option, this.initialize);
      }
    },
  },
});
</script>
