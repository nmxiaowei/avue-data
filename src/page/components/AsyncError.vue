<template>
  <div class="async-error">
    <div class="error-icon">⚠️</div>
    <span class="error-text">组件加载失败</span>
    <button class="retry-btn" @click="retry">重试</button>
  </div>
</template>

<script>
/**
 * 异步组件加载失败时的错误组件
 * 用于在异步组件加载失败时显示错误信息
 */
export default {
  name: "AsyncError",
  emits: ["retry"],
  methods: {
    /**
     * 重试加载组件
     */
    retry() {
      this.$emit("retry");
      // 刷新页面重新加载
      window.location.reload();
    },
  },
};
</script>

<style scoped>
.async-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--error-color);
  text-align: center;
}

.error-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.error-text {
  font-size: 12px;
  margin-bottom: 10px;
}

.retry-btn {
  padding: 4px 12px;
  font-size: 12px;
  background-color: var(--primary-color);
  color: var(--text-color-primary);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: var(--primary-color-hover);
}
</style>
