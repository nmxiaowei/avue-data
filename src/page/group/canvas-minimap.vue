<template>
  <aside class="canvas-minimap" :class="{ 'canvas-minimap--collapsed': collapsed }">
    <button
      type="button"
      class="canvas-minimap__header"
      :aria-expanded="String(!collapsed)"
      @click="collapsed = !collapsed">
      <span>小地图</span>
      <el-icon><FullScreen /></el-icon>
    </button>

    <div v-show="!collapsed" class="canvas-minimap__content">
      <div
        ref="mapRef"
        class="canvas-minimap__map"
        :style="mapStyle"
        role="application"
        aria-label="画布小地图，点击或拖动可定位画布"
        @mousedown.stop.prevent="handlePointerDown"
        @click.stop>
        <span
          v-for="item in mapItems"
          :key="item.index"
          class="canvas-minimap__item"
          :class="{ 'canvas-minimap__item--active': activeIndexes.has(item.index) }"
          :style="getItemStyle(item)"></span>
        <span class="canvas-minimap__viewport" :style="viewportStyle"></span>
      </div>
      <p>点击或拖动定位画布</p>
    </div>
  </aside>
</template>

<script>
import { FullScreen } from "@element-plus/icons-vue";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default {
  name: "CanvasMinimap",
  inject: ["contain"],
  components: {
    FullScreen,
  },
  data() {
    return {
      collapsed: false,
      isPointerDown: false,
      viewport: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
      updateFrame: null,
      screensElement: null,
      resizeObserver: null,
    };
  },
  computed: {
    canvasWidth() {
      return Math.max(1, this.toNumber(this.contain?.config?.width, 1920));
    },
    canvasHeight() {
      return Math.max(1, this.toNumber(this.contain?.config?.height, 1080));
    },
    mapItems() {
      return (this.contain?.list || []).filter(item => item?.index && item?.component);
    },
    activeIndexes() {
      return new Set(this.contain?.active || []);
    },
    mapStyle() {
      return {
        aspectRatio: `${this.canvasWidth} / ${this.canvasHeight}`,
      };
    },
    viewportStyle() {
      const { left, top, width, height } = this.viewport;
      return {
        left: `${(clamp(left, 0, this.canvasWidth) / this.canvasWidth) * 100}%`,
        top: `${(clamp(top, 0, this.canvasHeight) / this.canvasHeight) * 100}%`,
        width: `${Math.max(1, (clamp(width, 0, this.canvasWidth) / this.canvasWidth) * 100)}%`,
        height: `${Math.max(1, (clamp(height, 0, this.canvasHeight) / this.canvasHeight) * 100)}%`,
      };
    },
  },
  watch: {
    "contain.scale"() {
      this.queueViewportUpdate();
    },
    "contain.config.width"() {
      this.queueViewportUpdate();
    },
    "contain.config.height"() {
      this.queueViewportUpdate();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.screensElement = this.contain?.$refs?.screensRef || null;
      this.screensElement?.addEventListener("scroll", this.queueViewportUpdate, { passive: true });
      window.addEventListener("resize", this.queueViewportUpdate);

      if (typeof ResizeObserver !== "undefined" && this.screensElement) {
        this.resizeObserver = new ResizeObserver(this.queueViewportUpdate);
        this.resizeObserver.observe(this.screensElement);
      }
      this.queueViewportUpdate();
    });
  },
  beforeUnmount() {
    this.screensElement?.removeEventListener("scroll", this.queueViewportUpdate);
    window.removeEventListener("resize", this.queueViewportUpdate);
    this.resizeObserver?.disconnect();
    if (this.updateFrame) cancelAnimationFrame(this.updateFrame);
    this.stopPointerTracking();
  },
  methods: {
    toNumber(value, fallback = 0) {
      const result = Number(value);
      return Number.isFinite(result) ? result : fallback;
    },
    queueViewportUpdate() {
      if (this.updateFrame) return;
      this.updateFrame = requestAnimationFrame(() => {
        this.updateFrame = null;
        this.updateViewport();
      });
    },
    updateViewport() {
      const screens = this.contain?.$refs?.screensRef;
      const canvas = this.contain?.$refs?.canvasRef;
      const scale = this.toNumber(this.contain?.scale, 1) || 1;
      if (!screens || !canvas) return;

      const screensRect = screens.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const left = clamp((screensRect.left - canvasRect.left) / scale, 0, this.canvasWidth);
      const top = clamp((screensRect.top - canvasRect.top) / scale, 0, this.canvasHeight);
      const right = clamp((screensRect.right - canvasRect.left) / scale, 0, this.canvasWidth);
      const bottom = clamp((screensRect.bottom - canvasRect.top) / scale, 0, this.canvasHeight);

      this.viewport = {
        left,
        top,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      };
    },
    getItemStyle(item) {
      const width = Math.max(0, this.toNumber(item.component?.width));
      const height = Math.max(0, this.toNumber(item.component?.height));
      const left = this.toNumber(item.left);
      const top = this.toNumber(item.top);

      return {
        left: `${clamp((left / this.canvasWidth) * 100, 0, 100)}%`,
        top: `${clamp((top / this.canvasHeight) * 100, 0, 100)}%`,
        width: `${Math.max(0.8, Math.min(100, (width / this.canvasWidth) * 100))}%`,
        height: `${Math.max(0.8, Math.min(100, (height / this.canvasHeight) * 100))}%`,
      };
    },
    handlePointerDown(event) {
      this.isPointerDown = true;
      this.navigateByPointer(event);
      window.addEventListener("mousemove", this.handlePointerMove);
      window.addEventListener("mouseup", this.stopPointerTracking, { once: true });
    },
    handlePointerMove(event) {
      if (!this.isPointerDown) return;
      this.navigateByPointer(event);
    },
    stopPointerTracking() {
      this.isPointerDown = false;
      window.removeEventListener("mousemove", this.handlePointerMove);
      window.removeEventListener("mouseup", this.stopPointerTracking);
    },
    navigateByPointer(event) {
      const map = this.$refs.mapRef;
      const screens = this.contain?.$refs?.screensRef;
      const canvas = this.contain?.$refs?.canvasRef;
      if (!map || !screens || !canvas) return;

      const mapRect = map.getBoundingClientRect();
      const xRatio = clamp((event.clientX - mapRect.left) / mapRect.width, 0, 1);
      const yRatio = clamp((event.clientY - mapRect.top) / mapRect.height, 0, 1);
      const scale = this.toNumber(this.contain?.scale, 1) || 1;
      const targetLeft = canvas.offsetLeft + this.canvasWidth * xRatio * scale - screens.clientWidth / 2;
      const targetTop = canvas.offsetTop + this.canvasHeight * yRatio * scale - screens.clientHeight / 2;

      screens.scrollLeft = clamp(targetLeft, 0, Math.max(0, screens.scrollWidth - screens.clientWidth));
      screens.scrollTop = clamp(targetTop, 0, Math.max(0, screens.scrollHeight - screens.clientHeight));
      this.queueViewportUpdate();
    },
  },
};
</script>

<style lang="scss" scoped>
.canvas-minimap {
  position: absolute;
  z-index: 90;
  right: 12px;
  bottom: 46px;
  width: 220px;
  overflow: hidden;
  border: 1px solid var(--border-color-base);
  border-radius: 7px;
  background: var(--bg-color-secondary);
  box-shadow: 0 8px 24px var(--shadow-color);
  backdrop-filter: blur(8px);
  user-select: none;

  &__header {
    display: flex;
    width: 100%;
    height: 29px;
    align-items: center;
    justify-content: space-between;
    padding: 0 9px;
    color: var(--text-color-primary);
    cursor: pointer;
    font-size: 12px;
    border: 0;
    border-bottom: 1px solid var(--border-color-light);
    background: var(--bg-color-tertiary);

    &:hover {
      color: var(--text-color-primary);
      background: var(--bg-color-hover);
    }

    .el-icon {
      color: var(--primary-color);
      font-size: 13px;
    }
  }

  &__content {
    padding: 8px;

    > p {
      margin: 6px 0 0;
      color: var(--text-color-placeholder);
      font-size: 10px;
      text-align: center;
    }
  }

  &__map {
    position: relative;
    width: 100%;
    min-height: 94px;
    overflow: hidden;
    cursor: crosshair;
    border: 1px solid var(--border-color-base);
    border-radius: 3px;
    background-color: var(--bg-color-primary);
    background-image: radial-gradient(circle, var(--grid-line-color) 0.8px, transparent 1px);
    background-size: 6px 6px;
  }

  &__item,
  &__viewport {
    position: absolute;
    box-sizing: border-box;
  }

  &__item {
    min-width: 2px;
    min-height: 2px;
    opacity: 0.8;
    border: 1px solid var(--primary-color);
    background: var(--primary-lighter-color);

    &--active {
      z-index: 2;
      opacity: 1;
      border-color: var(--warning-color);
      background: var(--warning-light-color);
    }
  }

  &__viewport {
    z-index: 3;
    min-width: 4px;
    min-height: 4px;
    pointer-events: none;
    border: 1px solid var(--text-color-primary);
    background: var(--primary-lighter-color);
    box-shadow: 0 0 0 1px var(--shadow-color-dark);
  }

  &--collapsed {
    width: 82px;

    .canvas-minimap__header {
      border-bottom: 0;
    }
  }
}

@media (max-width: 760px) {
  .canvas-minimap {
    right: 8px;
    bottom: 42px;
    width: 178px;
  }
}
</style>
