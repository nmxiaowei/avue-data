<template>
  <div
    ref="root"
    :id="id"
    class="avue-draggable"
    :class="{
      'avue-draggable--active': active && !readonly,
      'avue-draggable--hover': overActive && !active && !readonly,
      'avue-draggable--move': moveActive,
      'avue-draggable--click': disabled,
      'avue-draggable--locked': lock && !disabled,
      'avue-draggable--readonly': readonly,
    }"
    :style="styleName"
    :tabindex="active && !disabled && !readonly ? 0 : -1"
    role="group"
    aria-label="可拖拽组件"
    @mousedown.stop="handleMove"
    @mouseenter="handleOver"
    @mouseleave="handleOut"
    @dblclick="handleDbClick"
    @keydown="handleKeydown"
    @keyup="handleKeyup">
    <template v-if="(active || overActive || moveActive) && !readonly && line">
      <template v-if="tool">
        <div class="avue-draggable__line avue-draggable__line--left"></div>
        <div class="avue-draggable__line avue-draggable__line--top"></div>
      </template>
      <div class="avue-draggable__line avue-draggable__line--label">
        <span>{{ operationLabel }}</span>
      </div>
    </template>

    <template v-for="handle in resizeHandles" :key="handle">
      <div
        v-if="showResizeHandles"
        class="avue-draggable__range"
        :class="'avue-draggable__range--' + handle"
        :style="getRangeStyle(handle)"
        @mousedown.stop="rangeMove($event, handle)">
        <button
          v-if="handle === 'top'"
          class="avue-draggable__rotate"
          type="button"
          title="旋转（按 Shift 每 15 度吸附）"
          aria-label="旋转组件"
          @mousedown.stop.prevent="startRotation">
          ↻
        </button>
      </div>
    </template>

    <div ref="item" class="avue-draggable__item">
      <slot></slot>
    </div>
    <div
      v-if="!disabled && !readonly"
      class="avue-draggable__mask"
      aria-hidden="true"
      @mousedown.stop="handleMove"
      @mouseenter="handleOver"
      @mouseleave="handleOut"></div>
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

const RESIZE_HANDLES = Object.freeze([
  "left",
  "right",
  "top",
  "bottom",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
]);
const HORIZONTAL_DIRECTIONS = new Set(["bottom", "top", "middle"]);
const VERTICAL_DIRECTIONS = new Set(["left", "right", "center"]);
const ALL_DIRECTIONS = ["bottom", "left", "top", "right", "middle", "center"];
const RANGE_HANDLE_SIZE = 20;
const GUIDE_SNAP_DISTANCE = 5;
const GUIDE_MAX_DISTANCE = 500;
const ROTATE_SNAP_ANGLE = 15;

const getFixed = (value = 0, precision = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(precision)) : 0;
};

const getStyleNumber = value => parseFloat(value) || 0;
const normalizeAngle = angle => ((angle + 540) % 360) - 180;

export default {
  name: "SimpleDraggable",
  emits: ["move", "focus", "blur", "over", "out", "dblclick"],
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
    resize: {
      type: Boolean,
      default: true,
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
    id: [String, Number],
    left: {
      type: Number,
      default: 0,
    },
    top: {
      type: Number,
      default: 0,
    },
    width: Number,
    height: Number,
    minWidth: {
      type: Number,
      default: 1,
    },
    minHeight: {
      type: Number,
      default: 1,
    },
    rotate: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      resizeHandles: RESIZE_HANDLES,
      itemElement: null,
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
      deepIndex: 0,
      first: true,
      rawRotate: 0,
      startRotateAngle: 0,
      keyList: {
        alt: false,
      },
      dragDirection: "",
      interactionType: "",
      documentMoveHandler: null,
      documentUpHandler: null,
      guideElements: [],
      folderTimer: null,
      syncingLeft: false,
      syncingTop: false,
      syncingRotate: false,
    };
  },
  computed: {
    controlScale() {
      const scale = Number(this.scale);
      return Number.isFinite(scale) ? Math.min(Math.max(scale, 0.1), 10) : 1;
    },
    movementStep() {
      const step = Number(this.step);
      return Number.isFinite(step) && step > 0 ? step : 1;
    },
    showResizeHandles() {
      return this.active && !this.readonly && !this.disabled && !this.lock && this.range;
    },
    styleName() {
      const style = {
        top: this.setPx(this.baseTop),
        left: this.setPx(this.baseLeft),
        width: this.setPx(this.baseWidth),
        height: this.setPx(this.baseHeight),
        transform: "rotate(" + this.baseRotate + "deg)",
        "--avue-drag-scale": this.controlScale,
      };
      style.zIndex = this.active ? 9999 : this.deepIndex || this.zIndex;
      return style;
    },
    eventData() {
      return {
        index: this.index,
        left: this.baseLeft,
        top: this.baseTop,
        width: this.baseWidth,
        height: this.baseHeight,
        rotate: this.baseRotate,
      };
    },
    operationLabel() {
      if (this.rotateActive) return "R " + this.baseRotate + "°";
      if (this.rangeActive) return "W " + this.baseWidth + "  H " + this.baseHeight;
      return "X " + this.baseLeft + "  Y " + this.baseTop;
    },
  },
  watch: {
    width(value) {
      this.baseWidth = this.resolveDimension(value, this.itemElement?.offsetWidth, this.minWidth);
    },
    height(value) {
      this.baseHeight = this.resolveDimension(value, this.itemElement?.offsetHeight, this.minHeight);
    },
    left(value) {
      const nextValue = getFixed(value);
      if (nextValue === this.baseLeft) return;
      this.syncingLeft = true;
      this.baseLeft = nextValue;
    },
    top(value) {
      const nextValue = getFixed(value);
      if (nextValue === this.baseTop) return;
      this.syncingTop = true;
      this.baseTop = nextValue;
    },
    rotate(value) {
      const nextValue = getFixed(value);
      if (nextValue === this.baseRotate) return;
      this.syncingRotate = true;
      this.baseRotate = nextValue;
    },
    baseWidth(value) {
      if (this.resize && this.itemElement?.style) {
        this.itemElement.style.width = this.setPx(value);
      }
    },
    baseHeight(value) {
      if (this.resize && this.itemElement?.style) {
        this.itemElement.style.height = this.setPx(value);
      }
    },
    baseLeft(value, oldValue) {
      if (this.syncingLeft) {
        this.syncingLeft = false;
        return;
      }
      if (!this.first) this.setMove(value - oldValue, 0);
    },
    baseTop(value, oldValue) {
      if (this.syncingTop) {
        this.syncingTop = false;
        return;
      }
      if (!this.first) this.setMove(0, value - oldValue);
    },
    baseRotate(value) {
      if (this.syncingRotate) {
        this.syncingRotate = false;
        return;
      }
      if (!this.first) this.setMove(0, 0, value);
    },
  },
  mounted() {
    this.syncFromProps();
  },
  beforeUnmount() {
    this.unbindDocumentInteraction();
    this.removeShowLine();
    if (this.folderTimer) clearTimeout(this.folderTimer);
  },
  methods: {
    setPx(value) {
      return getFixed(value, 2) + "px";
    },
    resolveDimension(value, fallback, minimum) {
      const hasValue = value !== undefined && value !== null && Number.isFinite(Number(value));
      const dimension = hasValue ? Number(value) : Number(fallback);
      return Math.max(getFixed(minimum), getFixed(dimension));
    },
    syncFromProps() {
      this.itemElement = this.$refs.item?.firstElementChild || null;
      this.baseWidth = this.resolveDimension(this.width, this.itemElement?.offsetWidth, this.minWidth);
      this.baseHeight = this.resolveDimension(this.height, this.itemElement?.offsetHeight, this.minHeight);
      this.baseLeft = getFixed(this.left);
      this.baseTop = getFixed(this.top);
      this.baseRotate = getFixed(this.rotate);
      this.$nextTick(() => {
        this.first = false;
      });
    },
    focusEditor() {
      this.$nextTick(() => {
        if (!this.active || this.disabled || this.readonly) return;
        this.$refs.root?.focus?.({ preventScroll: true });
      });
    },
    currentPayload(extra = {}) {
      return {
        ...this.eventData,
        ...extra,
      };
    },
    setMove(left, top, rotate) {
      this.$emit("move", {
        index: this.index,
        left,
        top,
        rotate,
      });
    },
    setLeft(left) {
      this.baseLeft = getFixed(left);
    },
    setTop(top) {
      this.baseTop = getFixed(top);
    },
    setActive(value) {
      this.active = Boolean(value);
      if (this.active) {
        this.focusEditor();
        return;
      }
      this.keyList.alt = false;
      this.dragDirection = "";
    },
    setOverActive(value) {
      this.overActive = Boolean(value);
    },
    handleDbClick() {
      if (this.folder && !this.disabled && !this.readonly) {
        this.deepIndex = -9999;
        this.setActive(false);
        if (this.folderTimer) clearTimeout(this.folderTimer);
        this.folderTimer = setTimeout(() => {
          this.deepIndex = 0;
          this.folderTimer = null;
        }, 1500);
      }
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
      if (this.disabled || this.readonly || event.button !== 0) return;

      this.setActive(true);
      this.handleMouseDown(this.lock ? "select" : "move");
      if (this.lock) return;

      event.preventDefault();
      const point = { x: event.clientX, y: event.clientY };
      this.dragDirection = "";
      this.bindDocumentInteraction(moveEvent => this.handleDragMove(moveEvent, point));
    },
    handleDragMove(event, point) {
      let offsetX = event.clientX - point.x;
      let offsetY = event.clientY - point.y;
      point.x = event.clientX;
      point.y = event.clientY;

      if (event.altKey || this.keyList.alt) {
        if (!this.dragDirection && (offsetX || offsetY)) {
          this.dragDirection = Math.abs(offsetX) >= Math.abs(offsetY) ? "x" : "y";
        }
        if (this.dragDirection === "x") offsetY = 0;
        if (this.dragDirection === "y") offsetX = 0;
      } else {
        this.dragDirection = "";
      }

      this.baseLeft = getFixed(this.baseLeft + offsetX * this.movementStep);
      this.baseTop = getFixed(this.baseTop + offsetY * this.movementStep);
      this.removeShowLine();
      this.isShowLine();
    },
    rangeMove(event, position) {
      if (this.disabled || this.readonly || this.lock || event.button !== 0) return;
      const config = HANDLE_CONFIG[position];
      if (!config) return;

      event.preventDefault();
      this.setActive(true);
      this.rangeActive = true;
      this.handleMouseDown("resize");
      const point = { x: event.clientX, y: event.clientY };
      this.bindDocumentInteraction(moveEvent => this.handleResizeMove(moveEvent, point, config));
    },
    handleResizeMove(event, point, config) {
      const offsetX = (event.clientX - point.x) * this.movementStep;
      const offsetY = (event.clientY - point.y) * this.movementStep;
      point.x = event.clientX;
      point.y = event.clientY;

      if (config.x) {
        const widthDelta = config.xc ? -offsetX : offsetX;
        const nextWidth = Math.max(getFixed(this.minWidth), this.baseWidth + widthDelta);
        const appliedDelta = nextWidth - this.baseWidth;
        if (config.xp) this.baseLeft = getFixed(this.baseLeft - appliedDelta);
        this.baseWidth = getFixed(nextWidth);
      }

      if (config.y) {
        const heightDelta = config.yc ? -offsetY : offsetY;
        const nextHeight = Math.max(getFixed(this.minHeight), this.baseHeight + heightDelta);
        const appliedDelta = nextHeight - this.baseHeight;
        if (config.yp) this.baseTop = getFixed(this.baseTop - appliedDelta);
        this.baseHeight = getFixed(nextHeight);
      }
    },
    startRotation(event) {
      if (this.disabled || this.readonly || this.lock || event.button !== 0) return;

      const rect = this.$el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      this.startRotateAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      this.rawRotate = this.baseRotate;
      this.setActive(true);
      this.rotateActive = true;
      this.handleMouseDown("rotate");
      this.bindDocumentInteraction(moveEvent => this.handleRotate(moveEvent, centerX, centerY));
    },
    handleRotate(event, centerX, centerY) {
      if (!this.rotateActive) return;
      const currentAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      const delta = normalizeAngle(((currentAngle - this.startRotateAngle) * 180) / Math.PI);
      this.rawRotate += delta;
      this.startRotateAngle = currentAngle;
      const rotate = event.shiftKey
        ? Math.round(this.rawRotate / ROTATE_SNAP_ANGLE) * ROTATE_SNAP_ANGLE
        : this.rawRotate;
      this.baseRotate = getFixed(rotate);
    },
    handleKeydown(event) {
      if (event.key === "Alt") {
        this.keyList.alt = true;
        return;
      }
      if (!this.active || this.disabled || this.readonly || this.lock) return;

      const step = this.movementStep * (event.altKey || this.keyList.alt ? 10 : 1);
      const actions = {
        ArrowLeft: () => (this.baseLeft = getFixed(this.baseLeft - step)),
        ArrowUp: () => (this.baseTop = getFixed(this.baseTop - step)),
        ArrowRight: () => (this.baseLeft = getFixed(this.baseLeft + step)),
        ArrowDown: () => (this.baseTop = getFixed(this.baseTop + step)),
      };
      const action = actions[event.key];
      if (!action) return;
      action();
      event.preventDefault();
      event.stopPropagation();
      this.$emit("blur", this.currentPayload());
    },
    handleKeyup(event) {
      if (event.key !== "Alt") return;
      this.keyList.alt = false;
      this.dragDirection = "";
    },
    handleMouseDown(type) {
      this.removeShowLine();
      this.interactionType = type;
      this.moveActive = type !== "select";
      this.$emit("focus", this.currentPayload());
      this.focusEditor();
    },
    bindDocumentInteraction(moveHandler) {
      this.unbindDocumentInteraction();
      this.documentMoveHandler = moveHandler;
      this.documentUpHandler = this.handleMouseUp;
      document.addEventListener("mousemove", this.documentMoveHandler);
      document.addEventListener("mouseup", this.documentUpHandler);
      window.addEventListener("blur", this.documentUpHandler);
    },
    unbindDocumentInteraction() {
      if (this.documentMoveHandler) {
        document.removeEventListener("mousemove", this.documentMoveHandler);
      }
      if (this.documentUpHandler) {
        document.removeEventListener("mouseup", this.documentUpHandler);
        window.removeEventListener("blur", this.documentUpHandler);
      }
      this.documentMoveHandler = null;
      this.documentUpHandler = null;
    },
    handleMouseUp() {
      const shouldEmit = this.moveActive || this.rangeActive || this.rotateActive;
      this.unbindDocumentInteraction();
      this.removeShowLine();
      this.moveActive = false;
      this.rangeActive = false;
      this.rotateActive = false;
      this.interactionType = "";
      this.dragDirection = "";
      if (shouldEmit) this.$emit("blur", this.currentPayload());
    },
    getRangeStyle(position) {
      const offset = (RANGE_HANDLE_SIZE * this.controlScale) / 2;
      const style = {};
      position.split("-").forEach(direction => {
        style[direction] = this.setPx(-offset);
      });
      return style;
    },
    getClientRect(element) {
      const style = getComputedStyle(element);
      const left = getStyleNumber(style.left);
      const top = getStyleNumber(style.top);
      const width = getStyleNumber(style.width);
      const height = getStyleNumber(style.height);
      return {
        left,
        top,
        right: left + width,
        bottom: top + height,
        center: left + width / 2,
        middle: top + height / 2,
      };
    },
    isShowLine() {
      if (!this.tool || !this.line) return;
      const container = this.$el.closest("#container") || document.getElementById("container");
      if (!container) return;

      const rect = this.getClientRect(this.$el);
      const guideKeys = new Set();
      const itemList = container.querySelectorAll(".avue-draggable");
      itemList.forEach(item => {
        if (item === this.$el) return;
        const itemRect = this.getClientRect(item);
        ALL_DIRECTIONS.forEach(from => {
          ALL_DIRECTIONS.forEach(to => {
            if (!this.isValidDirectionPair(from, to)) return;
            if (Math.abs(rect[from] - itemRect[to]) >= GUIDE_SNAP_DISTANCE) return;
            if (HORIZONTAL_DIRECTIONS.has(from) && HORIZONTAL_DIRECTIONS.has(to)) {
              if (Math.abs(rect.left - itemRect.left) > GUIDE_MAX_DISTANCE) return;
            } else if (VERTICAL_DIRECTIONS.has(from) && VERTICAL_DIRECTIONS.has(to)) {
              if (Math.abs(rect.top - itemRect.top) > GUIDE_MAX_DISTANCE) return;
            }

            const horizontal = HORIZONTAL_DIRECTIONS.has(to);
            const guideKey = (horizontal ? "horizontal:" : "vertical:") + itemRect[to];
            if (guideKeys.has(guideKey)) return;
            guideKeys.add(guideKey);
            this.createShowLine(container, to, itemRect[to]);
          });
        });
      });
    },
    isValidDirectionPair(first, second) {
      return (
        (HORIZONTAL_DIRECTIONS.has(first) && HORIZONTAL_DIRECTIONS.has(second)) ||
        (VERTICAL_DIRECTIONS.has(first) && VERTICAL_DIRECTIONS.has(second))
      );
    },
    createShowLine(container, direction, value) {
      const horizontal = HORIZONTAL_DIRECTIONS.has(direction);
      const line = document.createElement("div");
      line.className =
        "avue-draggable-guide avue-draggable-guide--" + (horizontal ? "horizontal" : "vertical");
      line.style[horizontal ? "top" : "left"] = this.setPx(value);
      container.appendChild(line);
      this.guideElements.push(line);
    },
    removeShowLine() {
      this.guideElements.forEach(item => item.remove());
      this.guideElements = [];
    },
  },
};
</script>

<style lang="scss">
.avue-draggable {
  --avue-drag-primary: #409eff;
  --avue-drag-primary-light: rgba(64, 158, 255, 0.16);
  --avue-drag-scale: 1;

  position: absolute;
  box-sizing: border-box;
  padding: 0;
  cursor: grab;
  outline: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;

  &__item {
    position: relative;
    z-index: 0;
    width: 100%;
    height: 100%;
  }

  &__mask {
    position: absolute;
    z-index: 1;
    inset: 0;
    background: transparent;
    cursor: inherit;
    transition: background-color 0.18s ease;
  }

  &--hover {
    box-shadow: 0 0 0 calc(1px * var(--avue-drag-scale)) rgba(64, 158, 255, 0.72);
  }

  &--hover &__mask {
    background-color: rgba(64, 158, 255, 0.2);
  }

  &--active {
    box-shadow:
      0 0 0 calc(1px * var(--avue-drag-scale)) var(--avue-drag-primary),
      0 0 0 calc(3px * var(--avue-drag-scale)) var(--avue-drag-primary-light);
  }

  &--move {
    cursor: grabbing;
    box-shadow:
      0 0 0 calc(1px * var(--avue-drag-scale)) var(--avue-drag-primary),
      0 0 calc(12px * var(--avue-drag-scale)) rgba(64, 158, 255, 0.32);
  }

  &--click,
  &--readonly {
    cursor: pointer;
    touch-action: auto;
  }

  &--locked {
    cursor: not-allowed;
  }

  &--locked.avue-draggable--active {
    box-shadow:
      0 0 0 calc(1px * var(--avue-drag-scale)) #e6a23c,
      0 0 0 calc(3px * var(--avue-drag-scale)) rgba(230, 162, 60, 0.16);
  }

  &__line {
    position: absolute;
    z-index: 2;
    pointer-events: none;

    &--left {
      top: 0;
      right: 100%;
      width: 10000px;
      height: 0;
      border-top: calc(1px * var(--avue-drag-scale)) dashed rgba(64, 158, 255, 0.74);
    }

    &--top {
      bottom: 100%;
      left: 0;
      width: 0;
      height: 10000px;
      border-left: calc(1px * var(--avue-drag-scale)) dashed rgba(64, 158, 255, 0.74);
    }

    &--label {
      top: calc(-8px * var(--avue-drag-scale));
      left: 0;
      z-index: 2052;
      padding: calc(4px * var(--avue-drag-scale)) calc(7px * var(--avue-drag-scale));
      transform: translateY(-100%);
      border: calc(1px * var(--avue-drag-scale)) solid rgba(255, 255, 255, 0.12);
      border-radius: calc(4px * var(--avue-drag-scale));
      background: rgba(31, 41, 55, 0.94);
      box-shadow: 0 calc(2px * var(--avue-drag-scale)) calc(8px * var(--avue-drag-scale))
        rgba(0, 0, 0, 0.24);
      color: #fff;
      font-size: calc(12px * var(--avue-drag-scale));
      font-family: Consolas, Monaco, monospace;
      line-height: 1.2;
      white-space: nowrap;
    }
  }

  &__range {
    position: absolute;
    z-index: 2050;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(20px * var(--avue-drag-scale));
    height: calc(20px * var(--avue-drag-scale));
    border-radius: 50%;
    background: transparent;

    &::before {
      box-sizing: border-box;
      width: calc(9px * var(--avue-drag-scale));
      height: calc(9px * var(--avue-drag-scale));
      border: calc(1.5px * var(--avue-drag-scale)) solid var(--avue-drag-primary);
      border-radius: calc(2px * var(--avue-drag-scale));
      background: #fff;
      box-shadow: 0 calc(1px * var(--avue-drag-scale)) calc(4px * var(--avue-drag-scale))
        rgba(0, 0, 0, 0.18);
      content: "";
    }

    &:hover::before {
      border-color: #337ecc;
      background: #ecf5ff;
    }

    &--left,
    &--right {
      top: 50%;
      transform: translateY(-50%);
      cursor: ew-resize;
    }

    &--top,
    &--bottom {
      left: 50%;
      transform: translateX(-50%);
      cursor: ns-resize;
    }

    &--bottom-right,
    &--top-left {
      cursor: nwse-resize;
    }

    &--bottom-left,
    &--top-right {
      cursor: nesw-resize;
    }
  }

  &__rotate {
    position: absolute;
    top: calc(-25px * var(--avue-drag-scale));
    left: 50%;
    z-index: 2052;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(24px * var(--avue-drag-scale));
    height: calc(24px * var(--avue-drag-scale));
    padding: 0;
    transform: translate(-50%, -50%);
    border: calc(1px * var(--avue-drag-scale)) solid rgba(64, 158, 255, 0.48);
    border-radius: calc(7px * var(--avue-drag-scale));
    background: rgba(31, 41, 55, 0.88);
    box-shadow: 0 calc(2px * var(--avue-drag-scale)) calc(7px * var(--avue-drag-scale))
      rgba(0, 0, 0, 0.16);
    color: #93c5fd;
    font-size: calc(16px * var(--avue-drag-scale));
    line-height: 1;
    cursor: grab;

    &::after {
      position: absolute;
      bottom: calc(-12px * var(--avue-drag-scale));
      left: 50%;
      width: calc(1px * var(--avue-drag-scale));
      height: calc(12px * var(--avue-drag-scale));
      transform: translateX(-50%);
      background: rgba(64, 158, 255, 0.58);
      content: "";
    }

    &:active {
      cursor: grabbing;
    }
  }
}

.avue-draggable-guide {
  position: absolute;
  z-index: 9998;
  background: rgba(64, 158, 255, 0.9);
  box-shadow: 0 0 4px rgba(64, 158, 255, 0.38);
  pointer-events: none;

  &--horizontal {
    left: 0;
    width: 100%;
    height: 1px;
  }

  &--vertical {
    top: 0;
    width: 1px;
    height: 100%;
  }
}
</style>
