<template>
  <!-- 底部工具栏容器 -->
  <div class="footer">
    <div class="footer__content">
      <!-- 左侧信息区域 -->
      <div class="footer__left">
        <div class="footer__info">
          <span class="info-item clickable" @click="resetZoom" title="点击重置为100%">
            <i class="el-icon-view"></i>
            缩放: {{ scalePercent }}%
          </span>
          <span class="info-item">
            <i class="el-icon-full-screen"></i>
            {{ canvasSize }}
          </span>
          <span class="info-item" v-if="selectedCount > 0">
            <i class="el-icon-check"></i>
            已选中: {{ selectedCount }}/{{ totalComponents }}
          </span>
          <span class="info-item" v-else>
            <i class="el-icon-menu"></i>
            组件: {{ totalComponents }}
          </span>
          <el-dropdown trigger="click" @command="handleGroupChange" placement="top">
            <span class="info-item clickable">
              <i class="el-icon-collection-tag"></i>
              {{ currentGroup }}
              <el-icon class="dropdown-icon"><el-icon-arrow-up /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="group in groupList"
                  :key="group.id"
                  :command="group.id"
                  :class="{ 'is-active': group.id === contain.group }">
                  {{ group.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 中间操作区域 -->
      <div class="footer__center">
        <div class="footer__brand">
          <span class="brand-text">avue数据可视化编辑器</span>
        </div>
      </div>

      <!-- 右侧工具区域 -->
      <div class="footer__right">
        <div class="footer__tools">
          <!-- 回退/前进按钮组 -->
          <div class="tool-group">
            <div
              class="footer__tool-btn"
              :class="{ 'footer__tool-btn--disabled': !canUndo }"
              @click="handleUndo">
              <el-tooltip effect="dark" content="后退 (Ctrl+Z)" placement="top">
                <el-icon>
                  <el-icon-arrow-left></el-icon-arrow-left>
                </el-icon>
              </el-tooltip>
            </div>

            <div
              class="footer__tool-btn"
              :class="{ 'footer__tool-btn--disabled': !canRedo }"
              @click="handleRedo">
              <el-tooltip effect="dark" content="前进 (Ctrl+Y)" placement="top">
                <el-icon>
                  <el-icon-arrow-right></el-icon-arrow-right>
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <!-- 快捷键工具组 -->
          <div class="tool-group">
            <div class="footer__tool-btn" @click="handleKeys">
              <el-tooltip effect="dark" content="快捷键" placement="top">
                <el-icon>
                  <el-icon-info-filled></el-icon-info-filled>
                </el-icon>
              </el-tooltip>
            </div>
          </div>
          <!-- 缩放控制工具组 -->
          <div class="tool-group scale-control">
            <div
              class="footer__tool-btn"
              @click="handleZoomOut"
              :class="{ 'footer__tool-btn--disabled': scalePercent <= 10 }">
              <el-tooltip effect="dark" content="缩小" placement="top">
                <el-icon>
                  <el-icon-zoom-out></el-icon-zoom-out>
                </el-icon>
              </el-tooltip>
            </div>

            <el-dropdown trigger="click" @command="handleZoomCommand">
              <div class="scale-display">{{ scalePercent }}%</div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="200">200%</el-dropdown-item>
                  <el-dropdown-item :command="150">150%</el-dropdown-item>
                  <el-dropdown-item :command="100">100%</el-dropdown-item>
                  <el-dropdown-item :command="75">75%</el-dropdown-item>
                  <el-dropdown-item :command="50">50%</el-dropdown-item>
                  <el-dropdown-item :command="25">25%</el-dropdown-item>
                  <el-dropdown-item :command="10">10%</el-dropdown-item>
                  <el-dropdown-item divided :command="'fit'">适应画布</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <div
              class="footer__tool-btn"
              @click="handleZoomIn"
              :class="{ 'footer__tool-btn--disabled': scalePercent >= 200 }">
              <el-tooltip effect="dark" content="放大" placement="top">
                <el-icon>
                  <el-icon-zoom-in></el-icon-zoom-in>
                </el-icon>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷键弹窗 -->
    <keys ref="keysRef"></keys>
  </div>
</template>

<script setup>
import { computed, inject, ref } from "vue";
import { ElMessage } from "element-plus";
import keys from "./keys.vue";

// 注入依赖
const contain = inject("contain");

// 组件引用
const keysRef = ref(null);

// 计算属性
/**
 * 获取当前缩放比例（百分比显示）
 * @returns {number} 缩放比例百分比
 */
const scalePercent = computed(() => {
  const scale = contain?.scale || 1;
  return Math.round(scale * 100);
});

/**
 * 获取画布尺寸信息
 * @returns {string} 画布尺寸
 */
const canvasSize = computed(() => {
  const width = contain?.config?.width || 1920;
  const height = contain?.config?.height || 1080;
  return `${width} × ${height}`;
});

/**
 * 是否可以后退
 * @returns {boolean} 能否后退
 */
const canUndo = computed(() => {
  return contain?.canUndo || false;
});

/**
 * 是否可以前进
 * @returns {boolean} 能否前进
 */
const canRedo = computed(() => {
  return contain?.canRedo || false;
});

/**
 * 获取当前选中组件数量
 * @returns {number} 选中组件数量
 */
const selectedCount = computed(() => {
  return contain?.active?.length || 0;
});

/**
 * 获取总组件数量
 * @returns {number} 总组件数量
 */
const totalComponents = computed(() => {
  return contain?.list?.length || 0;
});

/**
 * 获取当前分组信息
 * @returns {string} 分组名称
 */
const currentGroup = computed(() => {
  const groups = contain?.config?.group || [];
  const currentGroupId = contain?.group || "";
  const group = groups.find(g => g.id === currentGroupId);
  return group?.name || "主屏幕";
});

/**
 * 获取所有屏幕列表
 * @returns {Array} 屏幕列表
 */
const groupList = computed(() => {
  return contain?.config?.group || [];
});

/**
 * 切换屏幕
 * @param {string} groupId - 目标屏幕ID
 */
const handleGroupChange = groupId => {
  if (contain) {
    contain.group = groupId;
  }
};

// 方法
/**
 * 处理后退操作
 */
const handleUndo = () => {
  if (contain?.editorUndo && canUndo.value) {
    contain.editorUndo();
  }
};

/**
 * 处理前进操作
 */
const handleRedo = () => {
  if (contain?.editorRedo && canRedo.value) {
    contain.editorRedo();
  }
};

/**
 * 重置缩放到100%
 */
const resetZoom = () => {
  if (contain) {
    contain.scale = 1;
    ElMessage.success("缩放已重置为100%");
  }
};

/**
 * 显示快捷键弹窗
 */
const handleKeys = () => {
  if (keysRef.value) {
    keysRef.value.show = true;
  }
};

/**
 * 缩小画布
 */
const handleZoomOut = () => {
  if (scalePercent.value > 10 && contain) {
    const currentScale = contain.scale || 1;
    const newScale = Math.max(0.1, parseFloat((currentScale - 0.1).toFixed(2)));
    contain.scale = newScale;
  }
};

/**
 * 放大画布
 */
const handleZoomIn = () => {
  if (scalePercent.value < 200 && contain) {
    const currentScale = contain.scale || 1;
    const newScale = Math.min(2, parseFloat((currentScale + 0.1).toFixed(2)));
    contain.scale = newScale;
  }
};

/**
 * 处理缩放命令
 */
const handleZoomCommand = command => {
  if (!contain) return;

  if (command === "fit") {
    // 适应画布 - 设置为1（100%）
    contain.scale = 1;
    ElMessage.success("已适应画布");
  } else {
    // 设置指定百分比
    const scale = parseFloat((command / 100).toFixed(2));
    contain.scale = scale;
  }
};

// 组件名称定义
defineOptions({
  name: "Footer",
  components: {
    keys,
  },
});
</script>

<style lang="scss" scoped>
.footer {
  width: 100%;
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  height: 35px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  background: var(--bg-color-secondary);
  border-top: var(--datav-border-dark);
  color: var(--text-color-primary);
  font-size: 12px;
  user-select: none;
  z-index: 99;

  &__content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__left {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  &__center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    padding: 0 10px;
  }

  &__right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
    min-width: 0;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 16px;
    overflow: hidden;

    .info-item {
      display: flex;
      align-items: center;
      gap: 2px;
      color: var(--text-color-secondary);
      font-size: 12px;
      white-space: nowrap;
      transition: all 0.3s ease;

      i {
        font-size: 14px;
        color: var(--primary-color);
      }

      .dropdown-icon {
        font-size: 10px;
        margin-left: 2px;
        transition: transform 0.3s ease;
      }

      &.clickable {
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 3px;

        &:hover {
          background: var(--bg-color-hover);
          color: var(--text-color-primary);

          .dropdown-icon {
            color: var(--primary-color);
          }
        }
      }
    }
  }

  &__brand {
    .brand-text {
      color: var(--text-color-secondary);
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
  }

  &__tools {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow-x: auto;

    &::-webkit-scrollbar {
      height: 0;
    }
  }

  // 工具组样式
  .tool-group {
    display: flex;
    align-items: center;
    gap: 4px;

    &__label {
      color: var(--text-color-placeholder);
      font-size: 11px;
      white-space: nowrap;
      margin-right: 2px;
    }
  }

  &__tool-btn {
    width: 28px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: var(--bg-color-tertiary);
    border: 1px solid var(--border-color-light);
    border-radius: 2px;
    transition: all 0.3s ease;

    &:hover:not(&--disabled) {
      background: var(--primary-color);
      border-color: var(--primary-color);

      .el-icon {
        color: var(--color-white);
      }
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;
      background: var(--bg-color-disabled);
      border-color: var(--border-color-lighter);

      .el-icon {
        color: var(--text-color-disabled);
      }
    }

    .el-icon {
      font-size: 14px;
      color: var(--text-color-primary);
      transition: color 0.3s ease;
    }
  }

  // 缩放控制样式
  .scale-control {
    display: flex;
    align-items: center;
    gap: 4px;

    .scale-display {
      min-width: 50px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      cursor: pointer;
      background: var(--bg-color-tertiary);
      border: 1px solid var(--border-color-light);
      border-radius: 2px;
      color: var(--text-color-primary);
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
      user-select: none;

      &:hover {
        background: var(--bg-color-hover);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }

}
</style>
