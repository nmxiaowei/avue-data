import { setPx } from "./util";

export default {
  computed: {
    styleChartName() {
      const obj = {
        fontFamily: this.component.fontFamily,
        width: setPx(this.minWidth || this.width),
        height: setPx(this.height),
        opacity: this.component.opacity * 0.01 || 1,
        filter: `contrast(${this.component.contrast || 100}%) saturate(${
          this.component.saturate || 100
        }%) brightness(${this.component.brightness || 100}%) opacity(${
          this.component.opacity || 100
        }%) grayscale(${this.component.grayscale || 0}%) hue-rotate(${
          this.component.hueRotate || 0
        }deg) invert(${this.component.invert || 0}%) blur(${this.component.blur}px)`,
        transform: `scale(${this.component.scale || 1}) perspective(${
          this.component.perspective || 500
        }px) rotateX(${this.component.rotateX || 0}deg) rotateY(${
          this.component.rotateY || 0
        }deg) rotateZ(${this.component.rotateZ || 0}deg)`,
      };
      // 公共样式属性
      const opt = this.option || {};
      if (opt.commonOpacity != null) obj.opacity = opt.commonOpacity;
      if (opt.commonBgColor) obj.backgroundColor = opt.commonBgColor;
      if (opt.commonRadius != null) obj.borderRadius = setPx(opt.commonRadius);
      // 公共边框属性
      if (opt.commonBorderWidth) {
        obj.borderWidth = setPx(opt.commonBorderWidth);
        obj.borderStyle = opt.commonBorderStyle || 'solid';
        obj.borderColor = opt.commonBorderColor || 'transparent';
        obj.boxSizing = 'border-box';
      }
      if (opt.commonBoxShadow) obj.boxShadow = opt.commonBoxShadow;
      // 高级样式属性
      if (opt.commonCursor) obj.cursor = opt.commonCursor;
      if (opt.commonOverflow) obj.overflow = opt.commonOverflow;
      if (opt.commonMixBlendMode) obj.mixBlendMode = opt.commonMixBlendMode;
      if (opt.commonOutlineWidth) {
        obj.outlineWidth = setPx(opt.commonOutlineWidth);
        obj.outlineStyle = opt.commonOutlineStyle || 'solid';
        obj.outlineColor = opt.commonOutlineColor || 'currentColor';
      }
      if (opt.commonTransitionDuration) {
        obj.transition = `all ${opt.commonTransitionDuration}ms ease`;
      }
      if (opt.commonBgGradient) obj.backgroundImage = opt.commonBgGradient;
      // 自定义CSS
      if (opt.commonCustomCss) {
        try {
          const cssText = opt.commonCustomCss;
          cssText.replace(/([a-zA-Z-]+)\s*:\s*([^;]+)/g, (match, prop, value) => {
            const camelProp = prop.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
            obj[camelProp] = value.trim();
          });
        } catch (e) {}
      }
      // 规则引擎样式
      const ruleStyle = this.ruleStyle;
      if (ruleStyle) Object.assign(obj, ruleStyle);
      return obj;
    },
    styleSizeName() {
      return Object.assign(
        {
          width: setPx(this.width),
          height: setPx(this.height),
        },
        (() => {
          if (this.minWidth) {
            return {
              overflowX: "auto",
              overflowY: "hidden",
            };
          }
          return {};
        })(),
        this.styles
      );
    },
  },
};
