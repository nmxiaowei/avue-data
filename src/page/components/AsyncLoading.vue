<template>
  <div class="async-loading">
    <div class="loading-spinner"></div>
    <span class="loading-text">加载中...</span>
  </div>
</template>

<script>
/**
 * 异步组件加载中的Loading组件
 * 用于在异步组件加载时显示加载状态
 */
export default {
  name: "AsyncLoading",
};
</script>

<style scoped>
.async-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--text-color-secondary);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color-lighter);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.loading-text {
  font-size: 12px;
  color: var(--text-color-placeholder);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
