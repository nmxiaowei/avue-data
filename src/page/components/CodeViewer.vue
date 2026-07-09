<template>
  <div v-if="visible" class="data-viewer">
    <div class="viewer-header">
      <span class="viewer-title">数据预览</span>
    </div>
    <div class="viewer-content">
      <div v-show="dataValue" class="data-section">
        <div class="section-header">原始数据</div>
        <json-viewer
          :value="dataValue"
          v-loading="loading"
          v-bind="loadingParams"
          copyable
          :expand-depth="expandDepth"
          theme="avue-json-theme"
          boxed />
      </div>
      <div v-show="dataNewValue" class="data-section">
        <div class="section-header">过滤后的数据</div>
        <json-viewer
          :value="dataNewValue"
          v-loading="loading"
          v-bind="loadingParams"
          copyable
          :expand-depth="expandDepth"
          theme="avue-json-theme"
          boxed />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DataViewer",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    dataValue: {
      type: [Object, Array],
      default: () => ({}),
    },
    dataNewValue: {
      type: [Object, Array],
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingParams: {
      type: Object,
      default: () => ({}),
    },
    expandDepth: {
      type: Number,
      default: 5,
    },
  },
};
</script>

<style lang="scss" scoped>
.data-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color-secondary);
  border-radius: 6px;
  overflow: hidden;

  .viewer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px;
    background: var(--bg-color-secondary);
    border-bottom: 1px solid var(--border-color-base);

    .viewer-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color-primary);
    }
  }

  .viewer-content {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .data-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      border-bottom: 1px solid var(--border-color-base);

      &:last-child {
        margin-bottom: 0;
      }

      .section-header {
        padding: 8px 10px;
        font-size: 12px;
        color: var(--text-color-regular);
        font-weight: 500;
      }

      :deep(.avue-json-theme) {
        flex: 1;
        margin-top: 0;
        height: calc(100% - 50px);
        background-color: var(--color-transparent);
        border-radius: 0 0 4px 4px;
      }
    }
  }
}
</style>
