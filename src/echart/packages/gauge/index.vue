<template>
  <div :class="[b(), className]" :style="styleSizeName">
    <div :ref="id" :style="styleChartName"></div>
  </div>
</template>

<script>
import create from "../../create";
export default create({
  name: "gauge",
  methods: {
    updateChart() {
      const optionData = this.deepClone(this.dataChart);
      const option = {
        title: this.getOptionTitle(),
        grid: this.getOptionGrid(),
        series: [
          {
            name: "业务指标",
            type: "gauge",
            min: this.validData(this.option.min, 0),
            max: this.validData(this.option.max, 100),
            startAngle: this.validData(this.option.startAngle, 225),
            endAngle: this.validData(this.option.endAngle, -45),
            clockwise: this.validData(this.option.clockwise, true),
            radius: this.option.radius || "75%",
            splitNumber: this.option.splitNumber || 10,
            pointer: {
              show: this.validData(this.option.pointerShow, true),
              length: this.option.pointerLength || "60%",
              width: this.option.pointerWidth || 6,
            },
            axisLine: {
              lineStyle: {
                color: (() => {
                  let list = [];
                  (this.option.barColor || []).forEach(ele => {
                    list.push([ele.postion, ele.color1]);
                  });
                  if (this.validatenull(list)) {
                    list = [
                      [0, 2, "#91c7ae"],
                      [0.8, "#638693"],
                      [1, "#c23531"],
                    ];
                  }
                  return list;
                })(),
                width: this.option.lineSize || 5,
              },
            },
            axisLabel: {
              show: this.validData(this.option.axisLabelShow, true),
              fontSize: this.option.axisLabelFontSize || 25,
              color: "auto",
            },
            axisTick: {
              lineStyle: {
                color: this.option.lineColor || "#eee",
              },
            },
            detail: {
              valueAnimation: true,
              color: this.option.nameColor || "auto",
              fontSize: this.option.nameFontSize || 30,
              formatter: "{value}" + (this.option.unit || ""),
            },
            data: [optionData],
          },
        ],
      };
      if (this.myChart) {
        this.myChart.resize();
        this.myChart.setOption(option, this.initialize);
      }
    },
  },
});
</script>
