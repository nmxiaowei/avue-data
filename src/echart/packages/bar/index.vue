<template>
  <div :class="[b(), className]" :style="styleSizeName">
    <div :ref="id" :style="styleChartName"></div>
  </div>
</template>

<script>
import create from "../../create";

export default create({
  name: "bar",
  methods: {
    updateChart() {
      const optionData = this.deepClone(this.dataChart) || {};
      const option = {
        title: this.getOptionTitle(),
        tooltip: this.getOptionTip({
          trigger: "axis",
        }),
        grid: this.getOptionGrid(),
        legend: this.getOptionLegend(),
        xAxis: this.getOptionXAxis({
          type: this.option.category ? "value" : "category",
          data: optionData?.categories || [],
        }),
        yAxis: this.getOptionYAxis(
          {
            type: this.option.category ? "category" : "value",
            data: optionData?.categories || [],
          },
          (optionData.series || []).flatMap(s => s.data || []),
        ),
        series: (() => {
          const list = (optionData.series || []).map((ele, index) => {
            return Object.assign(ele, {
              type: "bar",
              stack: ele.stack || this.option.stack,
              barWidth: this.option.barWidth || 16,
              barMinHeight: this.option.barMinHeight || 0,
              barGap: this.option.barGap,
              barCategoryGap: this.option.barCategoryGap,
              itemStyle: {
                barBorderRadius: this.option.barRadius || 0,
                color: this.getColor(index),
                opacity: this.option.barOpacity,
                borderColor: this.option.barBorderColor,
                borderWidth: this.option.barBorderWidth || 0,
              },
              label: this.getOptionLabel({
                position: this.option.category ? "right" : "top",
              }),
            });
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
