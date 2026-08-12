<template>
  <div class="add-component">
    <!-- 左侧分类列表 -->
    <div class="category-sidebar" v-if="baseList.length > 0 || favoriteItems.length">
      <button
        type="button"
        class="category-item category-item--favorite"
        :class="{ 'category-item--active': activeCategoryType === 'favorites' }"
        @click="selectFavorites">
        <el-icon class="category-icon"><StarFilled /></el-icon>
        <span class="category-name">我的收藏</span>
        <span v-if="favoriteItems.length" class="category-count">{{ favoriteItems.length }}</span>
        <div class="active-indicator" v-if="activeCategoryType === 'favorites'"></div>
      </button>
      <div
        v-for="(item, index) in baseList"
        :key="index"
        v-show="item.hidden != 1"
        class="category-item"
        :class="{ 'category-item--active': activeCategoryType === 'catalog' && activeCategoryIndex === index }"
        @click="selectCategory(index)">
        <i :class="'category-icon iconfont ' + item.icon"></i>
        <span class="category-name">{{ item.name }}</span>
        <div class="active-indicator" v-if="activeCategoryIndex === index"></div>
      </div>
    </div>

    <!-- 右侧组件网格 -->
    <div class="component-content">
      <div class="component-toolbar">
        <span>{{ activeCategoryLabel }}</span>
        <el-tooltip content="将当前画布中选中的组件按完整配置保存到我的收藏" placement="top">
          <el-button
            size="small"
            plain
            :disabled="!hasActiveComponent"
            @click="handleFavoriteActive">
            <el-icon><Star /></el-icon>
            收藏当前组件
          </el-button>
        </el-tooltip>
      </div>
      <div v-if="displayItems.length" class="component-grid">
        <template v-for="(citem, cindex) in displayItems" :key="getItemKey(citem, cindex)">
          <div
            v-if="isFavoriteCategory || citem.hidden != 1"
            class="component-item"
            @click="handleAdd(citem.option, true)"
            @dragend="dragend($event, citem.option)"
            draggable="true">
            <div class="component-item__actions">
              <el-tooltip v-if="isFavoriteCategory" content="移出收藏" placement="top">
                <button
                  type="button"
                  class="component-item__action component-item__action--danger"
                  draggable="false"
                  aria-label="移出收藏"
                  @click.stop="handleRemoveFavorite(citem)">
                  <el-icon><Delete /></el-icon>
                </button>
              </el-tooltip>
              <el-tooltip v-else content="收藏组件" placement="top">
                <button
                  type="button"
                  class="component-item__action"
                  draggable="false"
                  aria-label="收藏组件"
                  @click.stop="handleFavoriteCatalog(citem)">
                  <el-icon><Star /></el-icon>
                </button>
              </el-tooltip>
            </div>
            <div class="component-preview">
              <i :class="['component-icon', 'iconfont', citem.icon || citem.option.icon || 'icon-component']"></i>
              <div class="component-name">{{ citem.name }}</div>
            </div>
          </div>
        </template>
      </div>
      <div v-else class="empty-state">
        <el-icon class="empty-icon" :class="{ 'loading-icon': loading }">
          <Loading v-if="loading" />
          <StarFilled v-else-if="isFavoriteCategory" />
          <Box v-else />
        </el-icon>
        <p class="empty-text">{{ emptyText }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Box, Delete, Loading, Star, StarFilled } from "@element-plus/icons-vue";
import { uuid } from "@/utils/utils";
import basicComponentCategories from "@/option/basic-components";
import { downloadComponentCatalog, readLocalComponentCatalog } from "@/api/components";
import {
  deleteComponentFavorite,
  getComponentFavoriteBySourceKey,
  getComponentFavorites,
  saveComponentFavorite,
} from "@/utils/componentFavoriteStore";

export default {
  name: "components",
  inject: ["contain"],
  components: {
    Box,
    Delete,
    Loading,
    Star,
    StarFilled,
  },
  data() {
    return {
      activeCategoryType: "catalog",
      activeCategoryIndex: -1,
      baseList: [],
      favoriteItems: [],
      favoriteLoading: false,
      loading: false,
    };
  },
  computed: {
    activeCategory() {
      if (this.activeCategoryIndex >= 0 && this.activeCategoryIndex < this.baseList.length) {
        return this.baseList[this.activeCategoryIndex];
      }
      return null;
    },
    isFavoriteCategory() {
      return this.activeCategoryType === "favorites";
    },
    displayItems() {
      if (this.isFavoriteCategory) return this.favoriteItems;
      return this.activeCategory?.children || [];
    },
    activeCategoryLabel() {
      return this.isFavoriteCategory ? "我的收藏" : this.activeCategory?.name || "组件库";
    },
    hasActiveComponent() {
      return Boolean(this.contain?.activeIndex && this.contain?.activeObj?.component);
    },
    emptyText() {
      if (this.loading || this.favoriteLoading) return "组件加载中";
      if (this.isFavoriteCategory) return "暂无收藏，选中画布组件后即可收藏";
      return "暂无组件";
    },
  },
  watch: {
    baseList: {
      handler(newVal) {
        // 当数据加载完成后，默认选中第一个分类
        if (newVal && newVal.length > 0 && this.activeCategoryIndex === -1) {
          this.selectCategory(0);
        }
      },
      immediate: true,
    },
  },
  created() {
    this.loadComponentsData();
    this.loadFavoriteItems();
  },
  methods: {
    getItemKey(item, index) {
      return item.id || item.sourceKey || `${item.name || "component"}-${index}`;
    },
    getCatalogFavoriteKey(item) {
      const prop = item?.option?.component?.prop || item?.option?.name || "unknown";
      return `catalog:${prop}:${item?.name || ""}`;
    },
    cloneOption(value) {
      const visited = new WeakSet();
      return JSON.parse(
        JSON.stringify(value, (key, current) => {
          if (key === "$parent" || typeof current === "function") return undefined;
          if (current && typeof current === "object") {
            if (visited.has(current)) return undefined;
            visited.add(current);
          }
          return current;
        }),
      );
    },
    async loadFavoriteItems() {
      this.favoriteLoading = true;
      try {
        this.favoriteItems = await getComponentFavorites();
      } catch (error) {
        console.warn("读取组件收藏失败", error);
        this.$message.error("组件收藏读取失败");
      } finally {
        this.favoriteLoading = false;
      }
    },
    async loadComponentsData() {
      const localCatalog = readLocalComponentCatalog();
      if (localCatalog.length) this.setComponentsData(localCatalog);

      this.loading = true;
      try {
        const remoteCatalog = await downloadComponentCatalog();
        this.setComponentsData(remoteCatalog.length ? remoteCatalog : basicComponentCategories);
      } catch {
        this.setComponentsData(localCatalog.length ? localCatalog : basicComponentCategories);
      } finally {
        this.loading = false;
      }
    },
    setComponentsData(list) {
      this.baseList = this.deepClone(Array.isArray(list) && list.length ? list : basicComponentCategories);
      this.contain.navBaseList = this.baseList;
      if (this.baseList.length && this.activeCategoryIndex === -1) {
        this.selectCategory(0);
      }
    },
    selectCategory(index) {
      this.activeCategoryType = "catalog";
      this.activeCategoryIndex = index;
    },
    selectFavorites() {
      this.activeCategoryType = "favorites";
    },
    async handleFavoriteCatalog(item) {
      const sourceKey = this.getCatalogFavoriteKey(item);
      try {
        const existing = await getComponentFavoriteBySourceKey(sourceKey);
        if (existing) {
          this.$message.info("该组件已在我的收藏中");
          return;
        }
        await saveComponentFavorite({
          name: item.name,
          option: this.cloneOption(item.option),
          sourceKey,
          icon: item.option?.icon,
        });
        await this.loadFavoriteItems();
        this.$message.success("组件已收藏");
      } catch (error) {
        console.warn("收藏组件失败", error);
        this.$message.error("组件收藏失败");
      }
    },
    async handleFavoriteActive() {
      const activeItem = this.contain?.findnav?.(this.contain.activeIndex)?.item || this.contain?.activeObj;
      if (!activeItem?.component) return;

      try {
        const { value } = await this.$prompt("收藏名称", "收藏当前组件", {
          inputValue: activeItem.name || "未命名组件",
          inputPlaceholder: "例如：蓝色销售额趋势图",
          confirmButtonText: "收藏",
          cancelButtonText: "取消",
          inputValidator: value => Boolean(value?.trim()) || "请输入收藏名称",
        });
        await saveComponentFavorite({
          name: value.trim(),
          option: this.cloneOption(activeItem),
          sourceKey: `custom:${uuid()}`,
          icon: activeItem.component?.icon,
        });
        await this.loadFavoriteItems();
        this.$message.success("当前组件已收藏");
      } catch (error) {
        if (error !== "cancel" && error !== "close") {
          console.warn("收藏当前组件失败", error);
          this.$message.error("组件收藏失败");
        }
      }
    },
    async handleRemoveFavorite(item) {
      try {
        await this.$confirm(`确定将“${item.name}”移出收藏吗？`, "移出收藏", {
          confirmButtonText: "移出",
          cancelButtonText: "取消",
          type: "warning",
        });
        await deleteComponentFavorite(item.id);
        await this.loadFavoriteItems();
        this.$message.success("已移出收藏");
      } catch (error) {
        if (error !== "cancel" && error !== "close") {
          this.$message.error("移出收藏失败");
        }
      }
    },
    dragend(e, option) {
      let parentRect = document.getElementById("container").getBoundingClientRect();
      let x = (e.clientX - parentRect.left) / this.contain.scale;
      let y = (e.clientY - parentRect.top) / this.contain.scale;
      this.handleAdd(option, true, x, y);
    },
    handleAdd(option, first = false, x, y) {
      let obj = this.cloneOption(option);
      const resetIndexes = item => {
        item.index = uuid();
        (item.children || []).forEach(resetIndexes);
      };
      resetIndexes(obj);
      const index = obj.index;
      obj.left = Number.isFinite(x) ? x : 0;
      obj.top = Number.isFinite(y) ? y : 0;
      obj.display = false;
      obj.lock = false;
      obj.group = this.contain.group;
      if (first) {
        this.contain.nav.unshift(obj);
      } else {
        this.contain.nav.push(obj);
      }
      setTimeout(() => this.contain.selectNav(index));
    },
  },
};
</script>

<style lang="scss" scoped>
.add-component {
  min-height: 100vh;
  display: flex;
  overflow: visible;
}

// 左侧分类栏
.category-sidebar {
  width: 95px;
  flex-shrink: 0;
  background: var(--bg-color-secondary);
  border-right: 1px solid var(--border-color-base);
  position: sticky;
  top: 0;
  align-self: flex-start;
  max-height: 100vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--scrollbar-track-color);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb-color);
    border-radius: 2px;

    &:hover {
      background: var(--primary-color);
    }
  }

  .category-item {
    display: flex;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 12px;
    color: inherit;
    text-align: left;
    cursor: pointer;
    border: 0;
    border-bottom: 1px solid var(--border-color-lighter);
    background: transparent;
    transition: all 0.2s ease;
    position: relative;

    .category-icon {
      font-size: 16px;
      color: var(--text-color-secondary);
      margin-right: 6px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .category-name {
      font-size: 12px;
      color: var(--text-color-secondary);
      transition: all 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .active-indicator {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 70%;
      background: var(--primary-color);
      border-radius: 0 2px 2px 0;
    }

    &:hover {
      background: var(--bg-color-hover);

      .category-icon,
      .category-name {
        color: var(--primary-color);
      }
    }

    &--active {
      background: var(--primary-light-color);

      .category-icon,
      .category-name {
        color: var(--primary-color);
        font-weight: 600;
      }
    }

    &--favorite {
      .category-icon {
        color: #e6a23c;
      }
    }

    .category-count {
      display: inline-flex;
      min-width: 16px;
      height: 16px;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      color: var(--primary-color);
      font-size: 10px;
      border-radius: 10px;
      background: var(--primary-lighter-color);
    }
  }
}

// 右侧内容区域
.component-content {
  flex: 1;
  padding: 10px;
  background: var(--bg-color-primary);

  .component-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;

    > span {
      overflow: hidden;
      color: var(--text-color-primary);
      font-size: 13px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :deep(.el-button) {
      flex-shrink: 0;

      .el-icon {
        margin-right: 3px;
      }
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-color-secondary);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb-color);
    border-radius: 3px;

    &:hover {
      background: var(--primary-color);
    }
  }

  .component-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;

    .component-item {
      position: relative;
      cursor: pointer;
      border-radius: 8px;
      background: var(--bg-color-secondary);
      border: 2px solid var(--color-transparent);
      transition: all 0.3s ease;
      overflow: hidden;

      &:hover {
        border-color: var(--primary-color);
        background: var(--primary-light-color);
        transform: translateY(-3px);
        box-shadow: 0 6px 16px var(--shadow-color);

        .component-name {
          color: var(--primary-color);
          background: var(--primary-lighter-color);
        }
      }

      &:active {
        transform: translateY(-1px);
      }

      .component-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        height: 90px;
        position: relative;
        border-radius: 6px;
        overflow: hidden;
        background: #000;

        .component-icon {
          color: var(--primary-color);
          font-size: 32px;
          line-height: 1;
          transition: transform 0.25s ease, color 0.25s ease;
        }

        .component-name {
          max-width: calc(100% - 16px);
          font-size: 11px;
          color: var(--primary-color);
          padding: 0 8px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: bold;
        }
      }

      &:hover .component-icon {
        color: var(--text-color-primary);
        transform: translateY(-2px) scale(1.08);
      }

      &__actions {
        position: absolute;
        z-index: 2;
        top: 5px;
        right: 5px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      &:hover .component-item__actions {
        opacity: 1;
      }

      &__action {
        display: inline-flex;
        width: 24px;
        height: 24px;
        align-items: center;
        justify-content: center;
        padding: 0;
        color: #e6a23c;
        cursor: pointer;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 50%;
        background: rgba(20, 22, 28, 0.84);

        &:hover {
          color: #fff;
          border-color: #e6a23c;
          background: #e6a23c;
        }

        &--danger {
          color: var(--danger-color, #f56c6c);

          &:hover {
            border-color: var(--danger-color, #f56c6c);
            background: var(--danger-color, #f56c6c);
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-color-placeholder);

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .loading-icon {
      animation: rotate 1.5s linear infinite;
    }

    .empty-text {
      font-size: 14px;
      margin: 0;
    }
  }
}

@media (max-width: 560px) {
  .category-sidebar {
    width: 72px;

    .category-item {
      padding: 10px 7px;

      .category-name {
        font-size: 11px;
      }
    }
  }

  .component-content {
    padding: 8px;

    .component-toolbar {
      align-items: flex-start;
      flex-direction: column;

      :deep(.el-button) {
        width: 100%;
      }
    }

    .component-grid {
      grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
      gap: 8px;
    }
  }
}

@media (hover: none) {
  .component-content .component-grid .component-item__actions {
    opacity: 1;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
