<template>
  <div
    :class="[b(), className]"
    :style="styleSizeName"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @dblclick="handleDblClick"
    @click="handleClick">
    <img
      :style="[styleChartName, styleImgName, ruleStyle]"
      :src="mappingValue"
      :class="[b({ rotate: rotate }), ...ruleClassList]"
      draggable="false" />
  </div>
</template>

<script>
import create from "../../create";
export default create({
  name: "img",
  computed: {
    styleImgName() {
      const style = Object.assign(
        (() => {
          if (this.rotate) {
            return {
              animationDuration: this.duration / 1000 + "s",
            };
          }
          return {};
        })(),
        {
          width: "100%",
          height: "100%",
          borderRadius: this.setPx(this.option.borderRadius),
          opacity: this.option.opacity != null ? this.option.opacity : 1,
          objectFit: this.option.objectFit || "fill",
          transformOrigin: "center center",
          borderWidth: this.setPx(this.option.borderWidth || 0),
          borderColor: this.option.borderColor || "transparent",
          borderStyle: this.option.borderStyle || "solid",
          boxShadow: this.option.boxShadow || "none",
          backgroundColor: this.option.backgroundColor || "transparent",
          transitionDuration: this.option.transitionDuration + "ms",
        },
      );
      // 翻转
      if (this.option.flip) {
        style.transform = this.option.flip;
      }
      // 裁剪路径
      if (this.option.clipPath) {
        style.clipPath = this.option.clipPath;
      }
      // 混合模式
      if (this.option.mixBlendMode) {
        style.mixBlendMode = this.option.mixBlendMode;
      }
      return style;
    },
    duration() {
      return this.option.duration || 3000;
    },
    rotate() {
      return this.option.rotate;
    },
  },
});
</script>
