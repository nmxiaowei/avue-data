<template>
  <div
    ref="root"
    :id="id"
    class="avue-draggable"
    :class="{
      'avue-draggable--active': isHighlighted,
      'avue-draggable--move': moveActive,
      'avue-draggable--click': disabled,
    }"
    :style="styleName"
    :tabindex="readonly || disabled ? -1 : 0"
    @mousedown.stop="handleMove"
    @mouseover.stop="handleOver"
    @mouseout.stop="handleOut"
    @dblclick="handleDbClick"
    @keydown.stop.prevent="handleKeydown">
    <div v-if="showLabel" class="avue-draggable__label">
      {{ labelText }}
    </div>
    <div
      v-for="handle in resizeHandles"
      :key="handle"
      v-show="showResizeHandles"
      class="avue-draggable__handle"
      :class="`avue-draggable__handle--${handle}`"
      @mousedown.stop="startResize($event, handle)"></div>
    <div
      v-show="showResizeHandles"
      class="avue-draggable__rotate"
      @mousedown.stop="startRotate"></div>
    <div class="avue-draggable__item" ref="item">
      <slot></slot>
    </div>
  </div>
</template>

<script>
const HANDLE_CONFIG = {
  left: { x: true, xp: true, xc: true },
  right: { x: true },
  top: { y: true, yp: true, yc: true },
  bottom: { y: true },
  "top-left": { x: true, xp: true, xc: true, y: true, yp: true, yc: true },
  "top-right": { x: true, y: true, yp: true, yc: true },
  "bottom-left": { x: true, xp: true, xc: true, y: true },
  "bottom-right": { x: true, y: true },
};

const MIN_SIZE = 20;

const toNumber = value => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export default {
  name: "SimpleDraggable",
  props: {
    folder: {
      type: Boolean,
      default: false,
    },
    tool: {
      type: Boolean,
      default: true,
    },
    line: {
      type: Boolean,
      default: true,
    },
    range: {
      type: Boolean,
      default: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    lock: {
      type: Boolean,
      default: false,
    },
    step: {
      type: Number,
      default: 1,
    },
    scale: {
      type: Number,
      default: 1,
    },
    zIndex: {
      type: [Number, String],
      default: 1,
    },
    index: [String, Number],
    id: String,
    left: {
      type: Number,
      default: 0,
    },
    top: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    rotate: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      baseLeft: 0,
      baseTop: 0,
      baseWidth: 0,
      baseHeight: 0,
      baseRotate: 0,
      active: false,
      overActive: false,
      moveActive: false,
      rangeActive: false,
      rotateActive: false,
      resizeHandles: [
        "left",
        "right",
        "top",
        "bottom",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ],
    };
  },
  computed: {
    isHighlighted() {
      return (this.active || this.overActive) && !this.readonly;
    },
    showResizeHandles() {
      return this.active && !this.readonly && !this.disabled && !this.lock && this.range;
    },
    showLabel() {
      return this.line && (this.active || this.moveActive || this.overActive);
    },
    labelText() {
      if (this.rangeActive) {
        return `w:${Math.round(this.baseWidth)} h:${Math.round(this.baseHeight)}`;
      }
      return `x:${Math.round(this.baseLeft)} y:${Math.round(this.baseTop)}`;
    },
    styleName() {
      return {
        top: `${this.baseTop}px`,
        left: `${this.baseLeft}px`,
        width: `${Math.max(MIN_SIZE, this.baseWidth)}px`,
        height: `${Math.max(MIN_SIZE, this.baseHeight)}px`,
        transform: `rotate(${this.baseRotate}deg)`,
        zIndex: this.active ? 9999 : this.zIndex,
      };
    },
  },
  watch: {
    left(val) {
      this.baseLeft = toNumber(val);
    },
    top(val) {
      this.baseTop = toNumber(val);
    },
    width(val) {
      this.baseWidth = this.normalizeSize(val, "width");
    },
    height(val) {
      this.baseHeight = this.normalizeSize(val, "height");
    },
    rotate(val) {
      this.baseRotate = toNumber(val);
    },
  },
  mounted() {
    this.syncFromProps();
  },
  beforeUnmount() {
    this.clearDocumentListeners();
  },
  methods: {
    syncFromProps() {
      this.baseLeft = toNumber(this.left);
      this.baseTop = toNumber(this.top);
      this.baseWidth = this.normalizeSize(this.width, "width");
      this.baseHeight = this.normalizeSize(this.height, "height");
      this.baseRotate = toNumber(this.rotate);
    },
    normalizeSize(value, field) {
      const number = toNumber(value);
      if (number > 0) return number;
      const item = this.$refs.item;
      const rect = item?.getBoundingClientRect?.();
      if (!rect) return MIN_SIZE;
      return Math.max(MIN_SIZE, field === "width" ? rect.width : rect.height);
    },
    currentPayload(extra = {}) {
      return {
        index: this.index,
        left: this.baseLeft,
        top: this.baseTop,
        width: this.baseWidth,
        height: this.baseHeight,
        rotate: this.baseRotate,
        ...extra,
      };
    },
    emitBlur() {
      this.$emit("blur", this.currentPayload());
    },
    setActive(val) {
      this.active = typeof val === "boolean" ? val : true;
      if (this.active) {
        this.$nextTick(() => this.$refs.root?.focus?.());
      }
    },
    setOverActive(val) {
      this.overActive = !!val;
    },
    handleDbClick() {
      this.$emit("dblclick", this.currentPayload());
    },
    handleOver() {
      if (this.disabled || this.readonly) return;
      this.overActive = true;
      this.$emit("over", this.currentPayload());
    },
    handleOut() {
      this.overActive = false;
      this.$emit("out", this.currentPayload());
    },
    handleMove(event) {
      if (this.disabled || this.readonly) return;
      this.setActive(true);
      this.moveActive = true;
      this.$emit("focus", this.currentPayload());
      if (this.lock) {
        this.bindMouseupOnly();
        return;
      }

      let startX = event.clientX;
      let startY = event.clientY;
      document.onmousemove = moveEvent => {
        const deltaX = (moveEvent.clientX - startX) * this.step;
        const deltaY = (moveEvent.clientY - startY) * this.step;
        startX = moveEvent.clientX;
        startY = moveEvent.clientY;
        this.baseLeft += deltaX;
        this.baseTop += deltaY;
        this.$emit("move", {
          index: this.index,
          left: deltaX,
          top: deltaY,
          rotate: this.baseRotate,
        });
      };
      this.bindMouseupOnly();
    },
    startResize(event, handle) {
      if (this.disabled || this.readonly || this.lock) return;
      const config = HANDLE_CONFIG[handle];
      if (!config) return;
      this.setActive(true);
      this.moveActive = true;
      this.rangeActive = true;
      this.$emit("focus", this.currentPayload());

      let startX = event.clientX;
      let startY = event.clientY;
      document.onmousemove = moveEvent => {
        const deltaX = (moveEvent.clientX - startX) * this.step;
        const deltaY = (moveEvent.clientY - startY) * this.step;
        startX = moveEvent.clientX;
        startY = moveEvent.clientY;

        if (config.x) {
          let widthDelta = deltaX;
          if (config.xc) widthDelta = -widthDelta;
          const nextWidth = Math.max(MIN_SIZE, this.baseWidth + widthDelta);
          if (config.xp) {
            this.baseLeft += this.baseWidth + widthDelta - nextWidth;
          }
          this.baseWidth = nextWidth;
        }

        if (config.y) {
          let heightDelta = deltaY;
          if (config.yc) heightDelta = -heightDelta;
          const nextHeight = Math.max(MIN_SIZE, this.baseHeight + heightDelta);
          if (config.yp) {
            this.baseTop += this.baseHeight + heightDelta - nextHeight;
          }
          this.baseHeight = nextHeight;
        }
      };
      this.bindMouseupOnly();
    },
    startRotate(event) {
      if (this.disabled || this.readonly || this.lock) return;
      this.setActive(true);
      this.moveActive = true;
      this.rotateActive = true;
      this.$emit("focus", this.currentPayload());
      let startX = event.clientX;
      document.onmousemove = moveEvent => {
        const deltaX = moveEvent.clientX - startX;
        startX = moveEvent.clientX;
        this.baseRotate += deltaX * 0.5;
      };
      this.bindMouseupOnly();
    },
    bindMouseupOnly() {
      document.onmouseup = () => {
        this.clearDocumentListeners();
        this.moveActive = false;
        this.rangeActive = false;
        this.rotateActive = false;
        this.emitBlur();
      };
    },
    clearDocumentListeners() {
      document.onmousemove = null;
      document.onmouseup = null;
    },
    handleKeydown(event) {
      if (!this.active || this.disabled || this.readonly || this.lock) return;
      const step = event.altKey ? this.step * 10 : this.step;
      if (event.key === "ArrowLeft") this.baseLeft -= step;
      else if (event.key === "ArrowRight") this.baseLeft += step;
      else if (event.key === "ArrowUp") this.baseTop -= step;
      else if (event.key === "ArrowDown") this.baseTop += step;
      else return;
      this.emitBlur();
    },
  },
};
</script>

<style lang="scss" scoped>
.avue-draggable {
  position: absolute;
  box-sizing: border-box;
  cursor: move;
  user-select: none;
  outline: none;

  &--active {
    border: 1px solid #409eff;
    background: rgba(64, 158, 255, 0.08);
  }

  &--move {
    opacity: 0.85;
  }

  &--click {
    cursor: default;
  }

  &__item {
    width: 100%;
    height: 100%;
  }

  &__label {
    position: absolute;
    top: -28px;
    left: 0;
    padding: 4px 8px;
    color: #fff;
    border-radius: 4px;
    background: rgba(17, 24, 39, 0.92);
    font-size: 12px;
    line-height: 1.2;
    white-space: nowrap;
    pointer-events: none;
  }

  &__handle,
  &__rotate {
    position: absolute;
    z-index: 2;
    background: #fff;
    border: 1px solid #409eff;
    border-radius: 50%;
  }

  &__handle {
    width: 8px;
    height: 8px;

    &--left,
    &--right {
      top: calc(50% - 4px);
      cursor: ew-resize;
    }

    &--top,
    &--bottom {
      left: calc(50% - 4px);
      cursor: ns-resize;
    }

    &--left {
      left: -4px;
    }

    &--right {
      right: -4px;
    }

    &--top {
      top: -4px;
    }

    &--bottom {
      bottom: -4px;
    }

    &--top-left {
      top: -4px;
      left: -4px;
      cursor: nwse-resize;
    }

    &--top-right {
      top: -4px;
      right: -4px;
      cursor: nesw-resize;
    }

    &--bottom-left {
      bottom: -4px;
      left: -4px;
      cursor: nesw-resize;
    }

    &--bottom-right {
      right: -4px;
      bottom: -4px;
      cursor: nwse-resize;
    }
  }

  &__rotate {
    top: -26px;
    right: calc(50% - 6px);
    width: 12px;
    height: 12px;
    cursor: grab;
    background: #409eff;
  }
}
</style>
