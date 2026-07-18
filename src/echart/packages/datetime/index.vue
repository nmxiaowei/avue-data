<template>
  <div :class="[b(), className]" :style="styleSizeName" @click="handleClick" @dblclick="handleDblClick">
    <p :style="[styleChartName, styleName]">{{ displayValue }}</p>
  </div>
</template>

<script>
import dayjs from "dayjs";
import create from "../../create";

export default create({
  name: "datetime",
  data() {
    return {
      now: new Date(),
      timer: null,
      weekdays: ["日", "一", "二", "三", "四", "五", "六"],
    };
  },
  computed: {
    displayValue() {
      if (this.option.format === "day") return `星期${this.weekdays[this.now.getDay()]}`;
      const format = (this.option.format || "yyyy-MM-dd hh:mm:ss")
        .replace("yyyy", "YYYY")
        .replace("dd", "DD")
        .replace("hh", "HH");
      return `${this.option.prefix || ""}${dayjs(this.now).format(format)}${this.option.suffix || ""}`;
    },
    styleName() {
      return {
        width: "100%",
        height: "100%",
        margin: 0,
        textAlign: this.option.textAlign || "center",
        fontFamily: this.option.fontFamily,
        fontWeight: this.option.fontWeight || "normal",
        fontSize: `${this.option.fontSize || 30}px`,
        lineHeight: this.option.lineHeight ? `${this.option.lineHeight}px` : `${this.height}px`,
        color: this.option.color || "#ffffff",
        backgroundColor: this.option.backgroundColor,
        letterSpacing: `${this.option.split || 0}px`,
        opacity: this.option.opacity ?? 1,
      };
    },
  },
  created() {
    this.timer = window.setInterval(() => {
      this.now = new Date();
    }, 1000);
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
  },
});
</script>
