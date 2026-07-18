<template>
  <div :class="[b(), className]" :style="styleSizeName" @click="handleClick" @dblclick="handleDblClick">
    <component :is="svgComponent" :style="[styleChartName, styleName]" />
  </div>
</template>

<script>
import create from "../../create";

const DEFAULT_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 3.1 5.2 2.9L12 10.9 6.8 8 12 5.1Zm-6 5.4 5 2.8v5.2l-5-2.8v-5.2Zm7 8v-5.2l5-2.8v5.2l-5 2.8Z"/></svg>';

export default create({
  name: "svg",
  computed: {
    svgComponent() {
      return { template: this.option.content || DEFAULT_ICON };
    },
    styleName() {
      return {
        display: "block",
        width: "100%",
        height: "100%",
        color: this.option.color || "#38bdf8",
        fill: this.option.fillColor || this.option.color || "#38bdf8",
        stroke: this.option.strokeColor,
        strokeWidth: this.option.strokeWidth,
        opacity: this.option.opacity ?? 1,
      };
    },
  },
});
</script>
