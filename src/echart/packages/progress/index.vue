<template>
  <div
    :class="[b(), className]"
    :style="styleSizeName"
    ref="main"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @dblclick="handleDblClick"
    @click="handleClick">
    <div :style="[styleChartName, progressContainerStyle]">
      <el-progress
        :color="progressColor"
        :width="width"
        :stroke-linecap="option.strokeLinecap"
        :striped="option.striped"
        :striped-flow="option.stripedFlow"
        :show-text="option.showText"
        :text-inside="textInside"
        :stroke-width="strokeWidth"
        :percentage="Number(dataChart.data)"
        :type="type"
        :define-back-color="option.trackColor"
        :format="formatFn">
        <template #default="{ percentage }" v-if="option.showText">
          <span :style="progressTextStyle">{{ option.textFormat ? option.textFormat.replace('{percentage}', percentage) : `${percentage}%` }}</span>
        </template>
      </el-progress>
    </div>
  </div>
</template>

<script>
import create from "../../create";
export default create({
  name: "progress",
  computed: {
    styleSuffixName() {
      return {
        fontWeight: this.option.suffixFontWeight || "normal",
        fontSize: (this.option.suffixFontSize || 40) + "px",
        color: this.option.suffixColor || "#333",
      };
    },
    styleName() {
      return {
        fontWeight: this.option.fontWeight || "normal",
        fontSize: (this.option.fontSize || 40) + "px",
        color: this.option.color || "#333",
      };
    },
    textInside() {
      return this.option.textInside || false;
    },
    type() {
      return this.option.type || "line";
    },
    progressColor() {
      if (this.option.gradient && this.option.gradientStart && this.option.gradientEnd) {
        return [
          { color: this.option.gradientStart, percentage: 0 },
          { color: this.option.gradientEnd, percentage: 100 },
        ];
      }
      return this.option.borderColor || "#333";
    },
    strokeWidth() {
      return this.option.strokeWidth || 14;
    },
    progressTextStyle() {
      return {
        fontSize: this.setPx(this.option.fontSize),
        color: this.option.color,
        fontWeight: this.option.fontWeight || 'normal',
      };
    },
    progressContainerStyle() {
      const style = {};
      if (this.option.animationDuration) {
        style['--el-progress-duration'] = this.option.animationDuration + 's';
      }
      return style;
    },
    formatFn() {
      if (this.option.textFormat) {
        return (percentage) => this.option.textFormat.replace('{percentage}', percentage);
      }
      return undefined;
    },
  },
  props: {
    option: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  methods: {},
});
</script>
