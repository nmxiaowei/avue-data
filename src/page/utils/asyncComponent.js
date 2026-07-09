import { defineAsyncComponent } from "vue";
import AsyncLoading from "../components/AsyncLoading.vue";
import AsyncError from "../components/AsyncError.vue";

/**
 * 创建带有loading和错误处理的异步组件
 * @param {Function} loader - 组件加载函数
 * @param {number} delay - 延迟显示loading的时间(ms)，默认200ms
 * @param {number} timeout - 超时时间(ms)，默认3000ms
 * @returns {Object} 异步组件配置
 */
export const createAsyncComponent = (loader, delay = 200, timeout = 3000) => {
  return defineAsyncComponent({
    loader,
    loadingComponent: AsyncLoading,
    errorComponent: AsyncError,
    delay,
    timeout,
  });
};
