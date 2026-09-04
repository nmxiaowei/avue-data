<template>
  <div
    :class="[b(), className, 'avue-echart-border']"
    :data-type="String(option.type || 1)"
    :style="rootStyle">
    <div
      v-if="titleText && option.titleShow"
      :class="['avue-echart-border__title', { 'avue-echart-border__title--left': option.titlePosition === 'left' }]"
      :style="titleStyle">{{ titleText }}</div>
    <div class="avue-echart-border__glow" v-if="option.glow && option.type !== 2"></div>
    <i class="avue-echart-border__corner avue-echart-border__corner--tl"></i>
    <i class="avue-echart-border__corner avue-echart-border__corner--tr"></i>
    <i class="avue-echart-border__corner avue-echart-border__corner--bl"></i>
    <i class="avue-echart-border__corner avue-echart-border__corner--br"></i>
    <span class="avue-echart-border__scan" v-if="option.type === 3"></span>
  </div>
</template>

<script>
import create from "../../create";

export default create({
  name: "border",
  computed: {
    titleText() {
      const data = this.dataChart;
      return (data && (data.title || data.value)) || this.option.title || "";
    },
    rootStyle() {
      return Object.assign({}, this.styleSizeName, {
        "--ad-c": this.option.color || "#38bdf8",
        "--ad-c2": this.option.color2 || "rgba(56, 189, 248, 0.25)",
        "--ad-bg": this.option.backgroundColor || "transparent",
        "--ad-bw": (this.option.borderWidth || 1) + "px",
      });
    },
    titleStyle() {
      return {
        color: this.option.titleColor || this.option.color || "#38bdf8",
        fontSize: this.setPx(this.option.titleFontSize || 18),
        fontWeight: this.option.titleFontWeight || "bold",
        letterSpacing: this.setPx(this.option.titleLetterSpacing || 2),
        lineHeight: this.setPx(this.option.titleLineHeight || 36),
      };
    },
  },
  methods: {
    handleClick(item = {}, index) {
      this.handleCommonBind(this.dataChart, index, "clickFormatter");
    },
    handleDblClick(item = {}, index) {
      this.handleCommonBind(this.dataChart, index, "dblClickFormatter");
    },
    handleMouseEnter(item = {}, index) {
      this.handleCommonBind(this.dataChart, index, "mouseEnterFormatter");
    },
    handleMouseLeave(item = {}, index) {
      this.handleCommonBind(this.dataChart, index, "mouseLeaveFormatter");
    },
  },
});
</script>

<style lang="scss" scoped>
.avue-echart-border {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  pointer-events: auto;
  border-radius: 2px;
  background: var(--ad-bg);
  cursor: default;

  // type1 经典科技四角
  &[data-type="1"] {
    background-image: linear-gradient(var(--ad-c), var(--ad-c)),
      linear-gradient(var(--ad-c), var(--ad-c)),
      linear-gradient(var(--ad-c), var(--ad-c)),
      linear-gradient(var(--ad-c), var(--ad-c));
    background-position: 0 0, 100% 0, 0 100%, 100% 100%;
    background-repeat: no-repeat;
    background-size: 22px 2px, 22px 2px, 22px 2px, 22px 2px;

    &::before,
    &::after {
      content: "";
      position: absolute;
      width: 2px;
      height: 22px;
      background: var(--ad-c);
    }

    &::before {
      left: 0;
      top: 0;
      box-shadow: 0 calc(100% - 22px) 0 var(--ad-c);
    }

    &::after {
      right: 0;
      top: 0;
      box-shadow: 0 calc(100% - 22px) 0 var(--ad-c);
    }

    .avue-echart-border__corner {
      display: none;
    }
  }

  // type2 发光描边
  &[data-type="2"] {
    border: var(--ad-bw) solid var(--ad-c);
    box-shadow: 0 0 18px var(--ad-c2), inset 0 0 18px var(--ad-c2);
  }

  // type3 角标 + 扫描线
  &[data-type="3"] {
    border: var(--ad-bw) solid var(--ad-c);

    .avue-echart-border__corner {
      display: block;
      width: 14px;
      height: 14px;
      border-style: solid;
      border-color: var(--ad-c);
      border-width: 0;
    }

    .avue-echart-border__corner--tl {
      left: -2px;
      top: -2px;
      border-top-width: 2px;
      border-left-width: 2px;
    }

    .avue-echart-border__corner--tr {
      right: -2px;
      top: -2px;
      border-top-width: 2px;
      border-right-width: 2px;
    }

    .avue-echart-border__corner--bl {
      left: -2px;
      bottom: -2px;
      border-bottom-width: 2px;
      border-left-width: 2px;
    }

    .avue-echart-border__corner--br {
      right: -2px;
      bottom: -2px;
      border-bottom-width: 2px;
      border-right-width: 2px;
    }

    .avue-echart-border__scan {
      position: absolute;
      left: 0;
      top: -30%;
      width: 100%;
      height: 30%;
      pointer-events: none;
      background: linear-gradient(
        180deg,
        transparent,
        var(--ad-c2),
        var(--ad-c2),
        transparent
      );
      animation: ad-scan 3.2s linear infinite;
    }
  }

  // type4 圆角渐变描边
  &[data-type="4"] {
    border-radius: 10px;
    border: var(--ad-bw) solid transparent;
    background: linear-gradient(var(--ad-bg), var(--ad-bg)) padding-box,
      linear-gradient(135deg, var(--ad-c2), var(--ad-c), var(--ad-c2)) border-box;
  }

  // type5 虚线科技框
  &[data-type="5"] {
    border: var(--ad-bw) dashed var(--ad-c);
  }

  // type6 上下双线装饰
  &[data-type="6"] {
    border-top: 2px solid var(--ad-c);
    border-bottom: 2px solid var(--ad-c);

    &::before,
    &::after {
      content: "";
      position: absolute;
      left: 0;
      width: 26px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--ad-c));
    }

    &::before {
      top: -2px;
      right: 0;
      left: auto;
      background: linear-gradient(270deg, transparent, var(--ad-c));
    }

    &::after {
      bottom: -2px;
      background: linear-gradient(90deg, var(--ad-c), transparent);
    }

    .avue-echart-border__glow {
      display: none;
    }
  }

  // type7 内外双层
  &[data-type="7"] {
    border: var(--ad-bw) solid var(--ad-c);

    &::before {
      content: "";
      position: absolute;
      left: 4px;
      top: 4px;
      right: 4px;
      bottom: 4px;
      border: 1px solid var(--ad-c2);
      pointer-events: none;
    }
  }

  &__title {
    position: relative;
    z-index: 3;
    box-sizing: border-box;
    display: inline-block;
    max-width: 90%;
    padding: 0 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-shadow: 0 0 10px var(--ad-c2);

    &::after {
      content: "";
      position: absolute;
      left: 8px;
      right: 8px;
      bottom: 0;
      height: 1px;
      background: linear-gradient(90deg, var(--ad-c2), transparent);
    }

    &--left {
      display: block;
      text-align: left;
    }
  }

  &__glow {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: radial-gradient(ellipse at 50% 0%, var(--ad-c2), transparent 62%);
    opacity: 0.55;
  }

  &__corner {
    display: none;
  }
}

@keyframes ad-scan {
  0% {
    top: -30%;
  }
  100% {
    top: 110%;
  }
}
</style>
