<template>
  <div :class="[b(),className]"
       :style="styleSizeName"
       ref="main"
       @mouseenter="handleMouseEnter"
       @mouseleave="handleMouseLeave"
       @dblclick="handleDblClick"
       @click="handleClick">
    <iframe :style="[styleChartName, iframeStyle, ruleStyle]"
            :class="ruleClassList"
            :src="iframeSrc"
            :scrolling="option.scrolling || 'auto'"
            :allowfullscreen="option.allowFullscreen"
            :allow="option.allow"
            :loading="option.loading || 'eager'"
            :referrerpolicy="option.referrerPolicy || undefined"
            :sandbox="sandboxValue"
            :name="option.iframeName || undefined"
            draggable="false"
            ref="iframeEl"></iframe>
  </div>
</template>

<script>
import create from "../../create";
export default create({
  name: "iframe",
  props: {
    option: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data () {
    return {
      refreshKey: 0,
      refreshTimer: null,
    };
  },
  computed: {
    iframeSrc () {
      // refreshKey 变化时强制刷新
      const src = this.mappingValue;
      if (!src) return '';
      if (this.refreshKey > 0) {
        const sep = src.includes('?') ? '&' : '?';
        return src + sep + '_t=' + this.refreshKey;
      }
      return src;
    },
    sandboxValue () {
      if (!this.option.sandbox) return undefined;
      const permissions = this.option.sandboxPermissions;
      if (permissions && permissions.length) {
        return permissions.join(' ');
      }
      return '';
    },
    iframeStyle () {
      const style = {
        borderRadius: this.setPx(this.option.borderRadius || 0),
        borderWidth: this.setPx(this.option.borderWidth || 0),
        borderColor: this.option.borderColor || 'transparent',
        borderStyle: this.option.borderWidth ? (this.option.borderStyle || 'solid') : 'none',
        opacity: this.option.opacity != null ? this.option.opacity : 1,
        backgroundColor: this.option.backgroundColor || 'transparent',
        boxShadow: this.option.boxShadow || 'none',
      };
      // 内容缩放
      if (this.option.contentScale && this.option.contentScale !== 1) {
        const scale = this.option.contentScale;
        style.transform = `scale(${scale})`;
        style.transformOrigin = 'top left';
        style.width = (100 / scale) + '%';
        style.height = (100 / scale) + '%';
      }
      return style;
    }
  },
  watch: {
    'option.autoRefreshInterval': {
      handler (val) {
        this.setupAutoRefresh(val);
      },
    },
  },
  mounted () {
    if (this.option.autoRefreshInterval) {
      this.setupAutoRefresh(this.option.autoRefreshInterval);
    }
  },
  beforeUnmount () {
    this.clearAutoRefresh();
  },
  methods: {
    refresh () {
      this.refreshKey = Date.now();
    },
    setupAutoRefresh (interval) {
      this.clearAutoRefresh();
      if (interval && interval > 0) {
        this.refreshTimer = setInterval(() => {
          this.refresh();
        }, interval * 1000);
      }
    },
    clearAutoRefresh () {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },
  }
});
</script>
