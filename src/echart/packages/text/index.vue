<template>
  <div :class="[b(),className]"
       :style="styleSizeName"
       ref="main"
       @mouseenter="onMouseEnter"
       @mouseleave="onMouseLeave"
       @dblclick="handleDblClick"
       @click="handleClick">
    <div :style="[styleChartName, styleBoxName, ruleStyle]"
         ref="box"
         :class="[b('box'), ...ruleClassList]">
      <component :is="componentName"
                 ref="text"
                 :class="[b('text'), ellipsisClass, animationClass]"
                 :href="linkHref"
                 :style="styleName"
                 :target="linkTarget">{{displayValue}}</component>
    </div>
  </div>
</template>

<script>
import create from "../../create";
export default create({
  name: "text",
  data () {
    return {
      check: "",
      date: new Date(),
      left: 0,
      scrollPaused: false,
      typewriterIndex: 0,
      typewriterTimer: null,
      typewriterText: "",
    };
  },
  computed: {
    componentName () {
      return this.option.link ? 'a' : 'span'
    },
    scroll () {
      return this.validData(this.option.scroll, false);
    },
    linkHref () {
      return this.option.linkHref
    },
    linkTarget () {
      return this.option.linkTarget || "_self";
    },
    numberTransform () {
      return this.validData(this.option.numberTransform, false);
    },
    step () {
      return this.option.step || 5;
    },
    speed () {
      return this.option.speed || 100;
    },
    lineHeight () {
      return this.option.lineHeight || 40;
    },
    fontSize () {
      return this.option.fontSize || 30;
    },
    split () {
      return this.option.split;
    },
    textWidth () {
      const textLen = (this.dataChart.value || '').length;
      return textLen * this.fontSize;
    },
    scrollDirection () {
      return this.option.scrollDirection || 'left';
    },
    isVerticalScroll () {
      return this.scrollDirection === 'up' || this.scrollDirection === 'down';
    },
    ellipsisClass () {
      if (this.option.overflowType === 'ellipsis') {
        return this.b('text') + '--ellipsis';
      }
      return '';
    },
    formattedValue () {
      let val = this.mappingValue;
      if (val == null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      val = String(val);
      if (!this.numberTransform) return val;
      // 数字格式化
      const num = parseFloat(val);
      if (!isNaN(num)) {
        let result = num;
        // 小数位数
        if (this.option.decimalPlaces != null && this.option.decimalPlaces >= 0) {
          result = result.toFixed(this.option.decimalPlaces);
        } else {
          result = String(result);
        }
        // 千分位
        if (this.option.thousandSeparator) {
          const parts = result.split('.');
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          result = parts.join('.');
        }
        return result;
      }
      return val;
    },
    displayValue () {
      if (this.option.typewriter) {
        return this.typewriterText;
      }
      const prefix = this.option.textPrefix || '';
      const suffix = this.option.textSuffix || '';
      return prefix + this.formattedValue + suffix;
    },
    animationClass () {
      const classes = [];
      if (this.option.blinkEnabled) {
        classes.push(this.b('text') + '--blink');
      }
      if (this.option.typewriter) {
        classes.push(this.b('text') + '--typewriter');
      }
      return classes.join(' ');
    },
    styleBoxName () {
      const style = {};
      if (this.option.verticalAlign) {
        style.display = 'flex';
        style.alignItems = this.option.verticalAlign;
      }
      return style;
    },
    styleName () {
      let dataOption = this.dataChart || {}
      const transform = this.isVerticalScroll
        ? "translateY(" + this.left + "px)"
        : "translateX(" + this.left + "px)";
      const style = Object.assign({
        width: (this.scroll && !this.isVerticalScroll) ? this.setPx(this.textWidth) : 'auto',
        transform: transform,
        textAlign: this.option.textAlign,
        letterSpacing: this.setPx(this.split),
        textIndent: this.setPx(this.split),
        backgroundColor: this.option.backgroundColor,
        fontWeight: this.option.fontWeight || "normal",
        fontFamily: this.option.fontFamily,
        fontSize: (dataOption.fontSize || this.fontSize) + "px",
        lineHeight: (dataOption.lineHeight || this.lineHeight) + "px",
        color: dataOption.color || this.option.color || "#333",
        textDecoration: this.option.textDecoration || "none",
        textShadow: this.option.textShadow || "none",
        opacity: this.option.opacity != null ? this.option.opacity : 1,
      }, this.styles);
      // 溢出处理
      if (this.option.overflowType === 'hidden') {
        style.overflow = 'hidden';
      } else if (this.option.overflowType === 'auto') {
        style.overflow = 'auto';
      }
      if (this.option.overflowType === 'ellipsis' && this.option.maxLines) {
        style['-webkit-line-clamp'] = this.option.maxLines;
      }
      // 字体样式
      if (this.option.fontStyle) {
        style.fontStyle = this.option.fontStyle;
      }
      // 文字转换
      if (this.option.textTransform) {
        style.textTransform = this.option.textTransform;
      }
      // 词间距
      if (this.option.wordSpacing != null) {
        style.wordSpacing = this.option.wordSpacing + 'px';
      }
      // 书写模式
      if (this.option.writingMode) {
        style.writingMode = this.option.writingMode;
      }
      // 内边距
      if (this.option.padding != null) {
        style.padding = this.option.padding + 'px';
        style.boxSizing = 'border-box';
      }
      // 圆角
      if (this.option.borderRadius != null) {
        style.borderRadius = this.option.borderRadius + 'px';
      }
      // 换行规则
      if (this.option.wordBreak) {
        style.wordBreak = this.option.wordBreak;
      }
      // 空白处理
      if (this.option.whiteSpace) {
        style.whiteSpace = this.option.whiteSpace;
      }
      // 文字描边
      if (this.option.textStrokeWidth) {
        style['-webkit-text-stroke'] = this.option.textStrokeWidth + 'px ' + (this.option.textStrokeColor || '#000');
      }
      // 文字渐变
      if (this.option.gradientColor) {
        const dir = this.option.gradientDirection || 'to right';
        const from = this.option.gradientFrom || '#fff';
        const to = this.option.gradientTo || '#000';
        style.background = `linear-gradient(${dir}, ${from}, ${to})`;
        style['-webkit-background-clip'] = 'text';
        style['-webkit-text-fill-color'] = 'transparent';
        style.backgroundClip = 'text';
      }
      // 文字边框
      if (this.option.textBorderWidth) {
        style.border = `${this.option.textBorderWidth}px ${this.option.textBorderStyle || 'solid'} ${this.option.textBorderColor || '#333'}`;
      }
      // 闪烁速度
      if (this.option.blinkEnabled && this.option.blinkSpeed) {
        style.animationDuration = this.option.blinkSpeed + 's';
      }
      return style;
    }
  },
  watch: {
    scroll () {
      this.move();
    },
    speed () {
      this.move();
    },
    'option.typewriter' (val) {
      if (val) {
        this.startTypewriter();
      } else {
        this.stopTypewriter();
      }
    },
  },
  mounted () {
    this.move();
    if (this.option.typewriter) {
      this.startTypewriter();
    }
  },
  beforeUnmount () {
    this.stopTypewriter();
    clearInterval(this.check);
  },
  methods: {
    move () {
      clearInterval(this.check);
      if (this.scroll) {
        this.check = setInterval(() => {
          if (this.scrollPaused) return;
          const dir = this.scrollDirection;
          if (dir === 'left' || dir === 'up') {
            const limit = this.isVerticalScroll ? this.height : this.textWidth;
            if (this.left < -limit) {
              this.left = this.isVerticalScroll ? this.height : this.width;
            }
            this.left = this.left - this.step;
          } else {
            const limit = this.isVerticalScroll ? this.height : this.width;
            if (this.left > limit) {
              this.left = this.isVerticalScroll ? -this.height : -this.textWidth;
            }
            this.left = this.left + this.step;
          }
        }, this.speed);
      } else {
        this.left = 0;
      }
    },
    startTypewriter () {
      this.stopTypewriter();
      this.typewriterIndex = 0;
      this.typewriterText = '';
      const fullText = (this.option.textPrefix || '') + this.formattedValue + (this.option.textSuffix || '');
      const speed = this.option.typewriterSpeed || 100;
      this.typewriterTimer = setInterval(() => {
        if (this.typewriterIndex < fullText.length) {
          this.typewriterText = fullText.substring(0, this.typewriterIndex + 1);
          this.typewriterIndex++;
        } else {
          // 循环播放：重置
          this.typewriterIndex = 0;
          this.typewriterText = '';
        }
      }, speed);
    },
    stopTypewriter () {
      if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
      }
    },
    onMouseEnter (e) {
      if (this.option.scrollPauseOnHover && this.scroll) {
        this.scrollPaused = true;
      }
      this.handleMouseEnter(e);
    },
    onMouseLeave (e) {
      if (this.option.scrollPauseOnHover && this.scroll) {
        this.scrollPaused = false;
      }
      this.handleMouseLeave(e);
    },
  },
  props: {
    option: {
      type: Object,
      default: () => {
        return {};
      }
    }
  }
});
</script>
