<template>
  <el-popover
    :visible="visible"
    placement="bottom-start"
    :width="300"
    trigger="click"
    @update:visible="val => (visible = val)">
    <template #reference>
      <button type="button" class="toolbar-btn" title="插入引用">
        <el-icon><el-icon-position /></el-icon> 插入引用
      </button>
    </template>
    <div class="quick-insert">
      <div class="quick-insert__search">
        <el-input
          v-model="keyword"
          placeholder="搜索..."
          size="small"
          clearable
          :prefix-icon="Search" />
      </div>

      <el-tabs v-model="activeTab" class="quick-insert__tabs">
        <el-tab-pane name="refs">
          <template #label>
            <span class="tab-label">
              <el-icon><el-icon-files /></el-icon> 组件
              <em v-if="filteredRefs.length">({{ filteredRefs.length }})</em>
            </span>
          </template>
          <div class="quick-insert__list">
            <div
              v-for="item in filteredRefs"
              :key="item.index"
              class="quick-insert__item"
              @click="handleCopy(`refs['${item.index}']`)">
              <span class="quick-insert__item-name" :title="item.name">{{ item.name }}</span>
              <span class="quick-insert__item-code">refs['...']</span>
            </div>
            <div v-if="!filteredRefs.length" class="quick-insert__empty">暂无组件</div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="group">
          <template #label>
            <span class="tab-label">
              <el-icon><el-icon-monitor /></el-icon> 大屏
              <em v-if="filteredGroups.length">({{ filteredGroups.length }})</em>
            </span>
          </template>
          <div class="quick-insert__list">
            <div
              v-for="item in filteredGroups"
              :key="item.id"
              class="quick-insert__item"
              @click="handleCopy(`$glob.group = '${item.id}'`)">
              <span class="quick-insert__item-name" :title="item.name">{{ item.name }}</span>
              <span class="quick-insert__item-code">$glob.group</span>
            </div>
            <div v-if="!filteredGroups.length" class="quick-insert__empty">暂无大屏</div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="quick-insert__tip">
        <el-icon><el-icon-info-filled /></el-icon> 点击复制代码到剪贴板
      </div>
    </div>
  </el-popover>
</template>

<script>
import { Search } from "@element-plus/icons-vue";

export default {
  name: "QuickInsert",
  components: { Search },
  inject: ["contain"],
  data() {
    return {
      visible: false,
      keyword: "",
      activeTab: "refs",
    };
  },
  computed: {
    flatNav() {
      const result = [];
      const flatten = (list = []) => {
        list.forEach(item => {
          result.push({ index: item.index, name: item.name });
          if (item.children) flatten(item.children);
        });
      };
      flatten(this.contain?.nav || []);
      return result;
    },
    groups() {
      return this.contain?.config?.group || [];
    },
    filteredRefs() {
      return this.filterByKeyword(this.flatNav, ["name", "index"]);
    },
    filteredGroups() {
      return this.filterByKeyword(this.groups, ["name"]);
    },
  },
  watch: {
    visible(val) {
      if (!val) this.keyword = "";
    },
  },
  methods: {
    filterByKeyword(list, fields) {
      if (!this.keyword) return list;
      const kw = this.keyword.toLowerCase();
      return list.filter(item =>
        fields.some(field => {
          const val = item[field];
          return val && String(val).toLowerCase().includes(kw);
        }),
      );
    },
    handleCopy(text) {
      this.$Clipboard({ text })
        .then(() => {
          this.$message.success(`已复制 ${text}`);
          this.visible = false;
        })
        .catch(() => {
          this.$message.error("复制失败");
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.quick-insert {
  &__search {
    margin-bottom: 8px;
  }

  &__tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
    :deep(.el-tabs__item) {
      padding: 0 8px;
      height: 32px;
      line-height: 32px;
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;

      em {
        font-style: normal;
        color: var(--text-color-secondary);
        font-size: 11px;
      }
    }
  }

  &__list {
    max-height: 240px;
    overflow-y: auto;
    padding: 8px 0;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: var(--bg-color-hover);
    }
  }

  &__item-name {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }

  &__item-code {
    color: var(--text-color-secondary);
    font-family: monospace;
    font-size: 11px;
  }

  &__empty {
    padding: 20px 0;
    text-align: center;
    color: var(--text-color-secondary);
    font-size: 12px;
  }

  &__tip {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border-color-lighter);
    color: var(--text-color-secondary);
    font-size: 11px;
  }
}
</style>
