<template>
  <el-dialog
    v-model="visible"
    :title="currentElement?.name || '元素预览'"
    width="80%"
    top="5vh"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    destroy-on-close
    @close="handleClose"
    class="zoom-dialog">
    <div class="zoom-content" ref="zoomContent">
      <temp
        v-if="currentElement"
        :item="currentElement"
        :parent="null"
        :key="currentElement.index" />
    </div>
  </el-dialog>
</template>

<script>
import temp from "@/page/block/temp.vue";

export default {
  name: "ElementZoom",
  components: {
    temp,
  },
  inject: ["contain"],
  data() {
    return {
      visible: false,
      currentElement: null,
      zoomIndex: null,
    };
  },
  mounted() {
    // 监听放大事件
    window.addEventListener("element-zoom", this.handleZoomEvent);
    // 监听关闭事件
    window.addEventListener("element-close", this.handleCloseEvent);
  },
  beforeUnmount() {
    window.removeEventListener("element-zoom", this.handleZoomEvent);
    window.removeEventListener("element-close", this.handleCloseEvent);
  },
  methods: {
    handleZoomEvent(event) {
      const { index, name } = event.detail;
      this.showElement(index);
    },
    handleCloseEvent() {
      this.handleClose();
    },
    showElement(index) {
      // 仏contain.nav中查找对应的元素
      const element = this.contain.nav.find(item => item.index === index);

      if (!element) {
        console.warn("未找到对应元素:", index);
        return;
      }

      // 克隆元素配置，避免修改原始数据
      this.currentElement = this.deepClone(element);

      // 调整元素尺寸和位置以适应放大容器
      this.adjustElementSize();

      this.zoomIndex = index;
      this.visible = true;
    },
    adjustElementSize() {
      if (!this.currentElement) return;

      // 重置位置到容器中心
      this.currentElement.left = 50;
      this.currentElement.top = 50;

      // 可以根据需要调整尺寸
      const scaleFactor = 1.5;
      this.currentElement.component.width = Math.floor(
        this.currentElement.component.width * scaleFactor
      );
      this.currentElement.component.height = Math.floor(
        this.currentElement.component.height * scaleFactor
      );
    },
    handleClose() {
      this.visible = false;
      this.currentElement = null;
      this.zoomIndex = null;
    },
  },
};
</script>

<style scoped>
.zoom-content {
  padding: 20px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color-base);
}

:deep(.el-dialog__body) {
  padding: 0;
  overflow: auto;
  max-height: 80vh;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
}
</style>
