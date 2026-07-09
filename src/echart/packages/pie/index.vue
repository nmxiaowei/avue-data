<template>
  <div :class="[b(), className]" :style="styleSizeName">
    <div :class="b('title')" v-html="titleFormatter && titleFormatter(dataChart)"></div>
    <div :ref="id" :style="styleChartName"></div>
  </div>
</template>

<script>
import create from "../../create";
export default create({
  name: "pie",
  methods: {
    updateChart() {
      const optionData = this.deepClone(this.dataChart) || [];
      const option = {
        title: this.getOptionTitle(),
        tooltip: this.getOptionTip(),
        grid: this.getOptionGrid(),
        legend: this.getOptionLegend(),
        series: (() => {
          const barColor = this.option.barColor || [];
          const innerRadius = this.option.radiusInner || "40%";
          const outerRadius = this.option.radiusOuter || "55%";
          const list = [
            {
              type: "pie",
              roseType: this.option.roseType ? "radius" : "",
              radius: this.option.radius ? [innerRadius, outerRadius] : "50%",
              center: ["50%", "60%"],
              startAngle: this.option.startAngle || 90,
              minAngle: this.option.minAngle || 0,
              clockwise: this.validData(this.option.clockwise, true),
              selectedOffset: this.option.selectedOffset || 10,
              animationType: "scale",
              animationEasing: "elasticOut",
              animationDelay: function (idx) {
                return Math.random() * 200;
              },
              label: this.getOptionLabel({
                formatter: "{b}:{c}\n{d}%",
              }),
              labelLine: {
                show: this.validData(this.option.labelLineShow, true),
                length: this.option.labelLineLength || 15,
                length2: this.option.labelLineLength2 || 15,
              },
              data: (() => {
                let list = optionData;
                if (this.option.notCount) {
                  list = list.filter(ele => ele.value !== 0 && ele.value);
                }
                if (this.option.sort) {
                  list.sort((a, b) => a.value - b.value);
                }
                return list;
              })(),
              itemStyle: {
                color: params => this.getColor(params.dataIndex, true),
                emphasis: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
            },
          ];
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
