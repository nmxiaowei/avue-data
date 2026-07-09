<template>
  <div class="add-component">
    <!-- 左侧分类列表 -->
    <div class="category-sidebar" v-if="baseList.length>0">
      <div
        v-for="(item, index) in baseList"
        :key="index"
        v-show="item.hidden != 1"
        class="category-item"
        :class="{ 'category-item--active': activeCategoryIndex === index }"
        @click="selectCategory(index)">
        <i :class="'category-icon iconfont ' + item.icon"></i>
        <span class="category-name">{{ item.name }}</span>
        <div class="active-indicator" v-if="activeCategoryIndex === index"></div>
      </div>
    </div>

    <!-- 右侧组件网格 -->
    <div class="component-content">
      <div v-if="activeCategory" class="component-grid">
        <template v-for="(citem, cindex) in activeCategory.children" :key="cindex">
          <div
            v-if="citem.hidden != 1"
            class="component-item"
            @click="handleAdd(citem.option, true)"
            @dragend="dragend($event, citem.option)"
            draggable="true">
            <div class="component-preview">
              <div class="component-name">{{ citem.name }}</div>
              <img :src="getImageUrl(citem.option.img)" class="component-img" />
            </div>
          </div>
        </template>
      </div>
      <div v-else class="empty-state">
        <el-icon class="empty-icon loading-icon">
          <el-icon-loading />
        </el-icon>
        <p class="empty-text">{{ loading ? "组件加载中" : "暂无组件" }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { uuid } from "@/utils/utils";
import basicComponentCategories from "@/option/basic-components";
import { downloadComponentCatalog, readLocalComponentCatalog } from "@/api/components";

export default {
  name: "components",
  inject: ["contain"],
  data() {
    return {
      activeCategoryIndex: -1,
      baseList: [],
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
  },
  methods: {
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
      this.activeCategoryIndex = index;
    },
    dragend(e, option) {
      let parentRect = document.getElementById("container").getBoundingClientRect();
      let x = (e.clientX - parentRect.left) / this.contain.scale;
      let y = (e.clientY - parentRect.top) / this.contain.scale;
      this.handleAdd(option, true, x, y);
    },
    handleAdd(option, first = false, x, y) {
      let obj = this.deepClone(option);
      let index = uuid();
      obj.left = x || 0;
      obj.top = y || 0;
      obj.index = index;
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
    getImageUrl(img) {
      if (img && img.startsWith("/img")) {
        return this.$router.options.base + img.substring(1);
      }
      return img;
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
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid var(--border-color-lighter);
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
  }
}

// 右侧内容区域
.component-content {
  flex: 1;
  padding: 10px;
  background: var(--bg-color-primary);

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
        width: 100%;
        height: 90px;
        position: relative;
        border-radius: 6px;
        overflow: hidden;
        background: #000;

        .component-name {
          font-size: 11px;
          color: var(--primary-color);
          padding: 4px 8px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: bold;
        }

        .component-img {
          box-sizing: border-box;
          width: 100%;
          height: calc(100% - 30px);
          object-fit: contain;
          display: block;
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

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
