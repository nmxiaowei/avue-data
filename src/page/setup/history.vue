<template>
  <div class="history-panel">
    <section class="history-toolbar">
      <div class="history-summary">
        <el-icon><el-icon-position /></el-icon>
        <div>
          <span>当前版本</span>
          <strong>{{ historyList.length ? currentHistoryIndex + 1 : 0 }} <em>/ {{ historyList.length }}</em></strong>
        </div>
      </div>
      <div class="history-actions">
        <el-tooltip content="撤销 (Ctrl+Z)">
          <el-button circle plain :disabled="!canUndo" aria-label="撤销" @click="contain.editorUndo()">
            <el-icon><el-icon-arrow-left /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="重做 (Ctrl+Y)">
          <el-button circle plain :disabled="!canRedo" aria-label="重做" @click="contain.editorRedo()">
            <el-icon><el-icon-arrow-right /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="清空历史">
          <el-button circle plain type="danger" aria-label="清空历史" @click="handleClear">
            <el-icon><el-icon-delete /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </section>

    <div class="history-list">
      <button
        v-for="entry in displayedHistory"
        :key="entry.item.timestamp"
        class="history-item"
        :class="{
          'history-item--current': entry.index === currentHistoryIndex,
          'history-item--future': entry.index > currentHistoryIndex,
        }"
        type="button"
        @click="contain.goToHistoryIndex(entry.index)">
        <span class="history-item__dot"></span>
        <span class="history-item__index">{{ entry.index + 1 }}</span>
        <span class="history-item__content">
          <strong>{{ getOperation(entry.index) }}</strong>
          <em>{{ formatTime(entry.item.timestamp) }} · {{ entry.item.nav?.length || 0 }} 个组件</em>
        </span>
      </button>
      <el-empty v-if="!historyList.length" description="暂无历史记录" :image-size="56" />
    </div>
  </div>
</template>

<script>
export default {
  name: "HistoryPanel",
  inject: ["contain"],
  computed: {
    historyList() {
      return this.contain.cacheList?.history || [];
    },
    displayedHistory() {
      return this.historyList.map((item, index) => ({ item, index })).reverse();
    },
    currentHistoryIndex() {
      return this.contain.currentHistoryIndex;
    },
    canUndo() {
      return this.contain.canUndo;
    },
    canRedo() {
      return this.contain.canRedo;
    },
  },
  methods: {
    handleClear() {
      this.$confirm("清空后将只保留当前画布状态，是否继续？", "清空历史", {
        type: "warning",
      })
        .then(() => this.contain.clearHistory())
        .catch(() => {});
    },
    formatTime(timestamp) {
      if (!timestamp) return "刚刚";
      return new Date(timestamp).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    },
    getOperation(index) {
      if (index === 0) return "初始状态";
      const current = this.historyList[index]?.nav || [];
      const previous = this.historyList[index - 1]?.nav || [];
      if (current.length > previous.length) return "添加组件";
      if (current.length < previous.length) return "删除组件";
      return "更新画布";
    },
  },
};
</script>

<style lang="scss" scoped>
.history-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  height: 100%;
  padding: 4px 2px;
}

.history-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  background: var(--bg-color-secondary);
}

.history-summary {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;

  > .el-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--primary-color);
    border-radius: 7px;
    background: var(--primary-lighter-color);
  }

  div {
    display: flex;
    flex-direction: column;
  }

  span,
  em {
    color: var(--text-color-placeholder);
    font-size: 10px;
    font-style: normal;
  }

  strong {
    color: var(--primary-color);
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
}

.history-actions {
  display: flex;
  gap: 4px;

  .el-button {
    width: 28px;
    min-width: 28px;
    height: 28px;
    margin: 0;
    padding: 0;
  }
}

.history-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 52px;
  gap: 8px;
  padding: 8px;
  color: var(--text-color-primary);
  text-align: left;
  border: 1px solid var(--border-color-lighter);
  border-radius: 7px;
  background: var(--bg-color-secondary);
  cursor: pointer;

  &:hover {
    border-color: var(--primary-color);
    background: var(--bg-color-hover);
  }

  &--current {
    border-color: var(--primary-color);
    background: var(--primary-lighter-color);

    .history-item__dot {
      background: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-lighter-color);
    }
  }

  &--future {
    opacity: 0.45;
  }

  &__dot {
    flex: 0 0 auto;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--border-color-base);
  }

  &__index {
    flex: 0 0 18px;
    color: var(--text-color-secondary);
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 11px;
  }

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 3px;

    strong,
    em {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      font-size: 12px;
      font-weight: 500;
    }

    em {
      color: var(--text-color-placeholder);
      font-size: 10px;
      font-style: normal;
    }
  }
}
</style>
