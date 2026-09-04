<template>
  <div
    :class="[b(), className]"
    :style="rootStyle"
    @click="handleClick"
    @dblclick="handleDblClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    <div class="avue-echart-kpi__decor avue-echart-kpi__decor--lt" v-if="option.decor"></div>
    <div class="avue-echart-kpi__decor avue-echart-kpi__decor--rb" v-if="option.decor"></div>

    <div class="avue-echart-kpi__main">
      <div class="avue-echart-kpi__title-row" v-if="titleText">
        <span class="avue-echart-kpi__title" :style="titleStyle">{{ titleText }}</span>
        <span
          v-if="trendVisible"
          class="avue-echart-kpi__trend"
          :class="'avue-echart-kpi__trend--' + trendDir"
          :style="trendStyle">
          <i :class="'avue-echart-kpi__trend-icon'">{{ trendArrow }}</i>
          <span>{{ trendText }}</span>
        </span>
      </div>
      <div class="avue-echart-kpi__value-row">
        <span v-if="prefix" class="avue-echart-kpi__prefix" :style="valueStyle">{{ prefix }}</span>
        <span class="avue-echart-kpi__value" :style="valueStyle">{{ displayValue }}</span>
        <span v-if="unitText" class="avue-echart-kpi__unit" :style="unitStyle">{{ unitText }}</span>
      </div>
      <div v-if="subText" class="avue-echart-kpi__sub" :style="subStyle">{{ subText }}</div>
    </div>
  </div>
</template>

<script>
import create from "../../create";

const normalize = value => {
  if (value == null) return {};
  if (Array.isArray(value)) {
    return value.length ? value[0] : {};
  }
  if (typeof value === "object") return value;
  return { value };
};

export default create({
  name: "kpi",
  computed: {
    kpiData() {
      return normalize(this.dataChart);
    },
    // 数据字段:title/value/unit/trend/subtitle,option 可覆盖展示文案
    titleText() {
      return this.option.title || this.kpiData.title || "";
    },
    unitText() {
      return this.option.unit != null ? this.option.unit : this.kpiData.unit || "";
    },
    subText() {
      return this.kpiData.subtitle || "";
    },
    prefix() {
      return this.option.prefix || "";
    },
    decimals() {
      const val = Number(this.option.decimals);
      return Number.isFinite(val) && val >= 0 ? val : 0;
    },
    rawValue() {
      const value = this.kpiData.value;
      if (value == null || value === "") return 0;
      return Number(value);
    },
    displayValue() {
      const num = this.rawValue;
      if (!Number.isFinite(num)) return String(this.kpiData.value ?? "");
      const fixed = num.toFixed(this.decimals);
      if (this.option.thousands === false) return fixed;
      const parts = fixed.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    },
    trendRaw() {
      const value = this.kpiData.trend;
      if (value == null || value === "") return null;
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    },
    trendDir() {
      if (this.trendRaw == null) return "";
      if (this.trendRaw === 0) return "flat";
      const inverted = this.option.trendInvert;
      const up = this.trendRaw > 0;
      return inverted ? (up ? "down" : "up") : up ? "up" : "down";
    },
    trendArrow() {
      if (this.trendDir === "up") return "▲";
      if (this.trendDir === "down") return "▼";
      return "—";
    },
    trendText() {
      if (this.trendRaw == null) return "";
      const suffix = this.option.trendMode === "value" ? "" : "%";
      const abs = Math.abs(this.trendRaw);
      return (this.decimals ? abs.toFixed(this.decimals) : Math.round(abs)) + suffix;
    },
    trendVisible() {
      return this.option.trendShow !== false && this.trendRaw != null;
    },
    rootStyle() {
      const style = Object.assign({}, this.styleSizeName);
      if (this.option.backgroundColor) style.backgroundColor = this.option.backgroundColor;
      if (this.option.backgroundImage) style.backgroundImage = this.option.backgroundImage;
      if (this.option.borderRadius != null) style.borderRadius = this.setPx(this.option.borderRadius);
      if (this.option.align != null) style.textAlign = this.option.align;
      return style;
    },
    valueStyle() {
      return {
        color: this.option.valueColor || "#ffffff",
        fontSize: this.setPx(this.option.valueFontSize || 36),
        fontWeight: this.option.valueFontWeight || "bold",
        fontFamily: this.option.fontFamily,
        lineHeight: this.setPx(this.option.valueLineHeight || 1.2),
      };
    },
    unitStyle() {
      return {
        color: this.option.unitColor || this.option.valueColor || "#9fb3d1",
        fontSize: this.setPx(this.option.unitFontSize || 16),
        fontWeight: this.option.unitFontWeight || "normal",
        marginLeft: "6px",
      };
    },
    titleStyle() {
      return {
        color: this.option.titleColor || "#cbd5e1",
        fontSize: this.setPx(this.option.titleFontSize || 16),
        fontWeight: this.option.titleFontWeight || "normal",
        fontFamily: this.option.fontFamily,
      };
    },
    trendStyle() {
      return {
        color: this.trendDir === "up" ? "#ff5b6a" : this.trendDir === "down" ? "#2edb8a" : "#9fb3d1",
        fontSize: this.setPx(this.option.trendFontSize || 13),
      };
    },
    subStyle() {
      return {
        color: this.option.subColor || "#64748b",
        fontSize: this.setPx(this.option.subFontSize || 12),
      };
    },
  },
  methods: {
    handleClick() {
      this.handleCommonBind(null, null, "clickFormatter");
    },
    handleDblClick() {
      this.handleCommonBind(null, null, "dblClickFormatter");
    },
    handleMouseEnter() {
      this.handleCommonBind(null, null, "mouseEnterFormatter");
    },
    handleMouseLeave() {
      this.handleCommonBind(null, null, "mouseLeaveFormatter");
    },
  },
});
</script>

<style lang="scss" scoped>
.avue-echart-kpi {
  position: relative;
  box-sizing: border-box;
  padding: 10px 16px;
  overflow: hidden;

  &__decor {
    position: absolute;
    width: 22px;
    height: 22px;
    border-style: solid;
    border-color: rgba(56, 189, 248, 0.65);

    &--lt {
      left: 4px;
      top: 4px;
      border-width: 2px 0 0 2px;
    }

    &--rb {
      right: 4px;
      bottom: 4px;
      border-width: 0 2px 2px 0;
    }
  }

  &__main {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100%;
    box-sizing: border-box;
  }

  &__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 4px;
  }

  &__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
    opacity: 0.95;

    &--up {
      color: #ff5b6a;
    }

    &--down {
      color: #2edb8a;
    }

    &--flat {
      color: #9fb3d1;
    }
  }

  &__value-row {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    overflow: hidden;
  }

  &__value {
    letter-spacing: 1px;
    font-variant-numeric: tabular-nums;
  }

  &__sub {
    margin-top: 2px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
