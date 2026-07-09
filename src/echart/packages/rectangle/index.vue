<template>
  <div :class="[b(), className]" :style="styleSizeName">
    <div :ref="id" :style="styleChartName"></div>
  </div>
</template>

<script>
import create from "../../create";
export default create({
  name: "rectangle",
  methods: {
    updateChart() {
      const optionData = this.deepClone(this.dataChart);
      const option = {
        tooltip: this.getOptionTip(),
        series: {
          type: "treemap",
          roam: this.validData(this.option.roam, false),
          breadcrumb: {
            show: this.validData(this.option.breadcrumb, true),
          },
          nodeClick: "zoomToNode",
          levels: [
            {
              itemStyle: {
                borderWidth: this.option.borderWidth || 0,
                borderColor: this.option.borderColor || "#fff",
                gapWidth: this.option.nodeGap || 1,
              },
            },
          ],
          data: optionData,
          label: this.getOptionLabel(),
        },
      };
      if (this.myChart) {
        this.myChart.resize();
        this.myChart.setOption(option, this.initialize);
      }
    },
  },
});
</script>
