<template>
  <div class="nav-container" :class="{ 'nav-horizontal': mode === 'horizontal' }">
    <div class="nav-sidebar">
      <div class="nav-menu">
        <div
          v-for="(item, index) in navs"
          :key="`${item.name}_${index}`"
          class="menu-group"
          :class="{ 'is-expanded': item.expand }"
          @mouseenter="handleMouseEnter(item, index)"
          @mouseleave="handleMouseLeave(item)">
          <div
            class="menu-item parent-menu"
            :class="{
              'is-active': index === activeIndex && !item.children,
              'has-children': item.children,
            }"
            @click="toggleNav(item, index)">
            <div class="menu-icon-wrapper">
              <el-icon class="menu-icon">
                <component :is="item.icon"></component>
              </el-icon>
            </div>
            <div class="menu-content">
              <div class="menu-title">{{ item.name }}</div>
              <div class="menu-subtitle" v-if="item.children && mode !== 'horizontal'">
                {{ item.children.length }} 个功能
              </div>
            </div>
            <div class="menu-arrow" v-if="item.children">
              <el-icon
                class="arrow-icon"
                :class="{ 'is-expand': mode === 'horizontal' ? item.hoverExpand : item.expand }">
                <ArrowDown />
              </el-icon>
            </div>
          </div>

          <div
            v-if="item.children"
            v-show="mode === 'horizontal' ? item.hoverExpand : item.expand"
            class="submenu-container">
            <div class="submenu-wrapper">
              <div
                v-for="(subItem, subIndex) in item.children"
                :key="`${subItem.name}_${subIndex}`"
                class="menu-item sub-menu-item"
                :class="{ 'is-active': subItem.path === $route.path }"
                @click.stop="toggleSubNav(subItem, index, subIndex)">
                <div class="menu-icon-wrapper submenu-icon">
                  <el-icon class="menu-icon" v-if="subItem.icon">
                    <component :is="subItem.icon"></component>
                  </el-icon>
                </div>
                <div class="menu-content">
                  <div class="menu-title">{{ subItem.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowDown } from "@element-plus/icons-vue";
import navsConfig from "@/option/navs.js";

export default {
  components: {
    ArrowDown,
  },
  props: {
    mode: {
      type: String,
      default: "vertical",
    },
  },
  data() {
    return {
      navs: [],
      activeIndex: -1,
      hoverTimer: null,
    };
  },
  mounted() {
    this.refreshNavs();
  },
  beforeUnmount() {
    clearTimeout(this.hoverTimer);
  },
  watch: {
    "$route.path"() {
      this.syncActiveState();
    },
  },
  methods: {
    cloneNav(item) {
      return {
        ...item,
        expand: false,
        hoverExpand: false,
        children: Array.isArray(item.children)
          ? item.children.map(child => ({ ...child }))
          : undefined,
      };
    },
    refreshNavs() {
      const navs = navsConfig
        .filter(
          item =>
            this.$website.ai?.enabled || !item.children?.some(child => child.path === "/model"),
        )
        .map(item => this.cloneNav(item))
        .filter(item => item.path || item.children?.length);

      this.navs = navs;
      this.syncActiveState();
    },
    syncActiveState() {
      let activeIndex = -1;

      this.navs.forEach((item, index) => {
        const matchedChild = item.children?.some(child => child.path === this.$route.path);
        item.expand = Boolean(matchedChild);
        if (item.path === this.$route.path || matchedChild) {
          activeIndex = index;
        }
      });

      this.activeIndex = activeIndex === -1 ? 0 : activeIndex;
    },
    toggleNav(nav, index) {
      if (nav.children) {
        if (this.mode === "horizontal") return;
        this.navs.forEach((item, currentIndex) => {
          if (currentIndex !== index) item.expand = false;
        });
        nav.expand = !nav.expand;
        return;
      }

      if (nav.href) {
        window.open(nav.href);
        return;
      }

      this.activeIndex = index;
      this.$emit("change", nav, index);
    },
    toggleSubNav(subNav, parentIndex, subIndex) {
      if (subNav.href) {
        window.open(subNav.href);
        return;
      }

      this.activeIndex = parentIndex;
      if (this.mode === "horizontal") {
        this.navs.forEach(item => {
          item.hoverExpand = false;
        });
      }
      this.$emit("change", subNav, parentIndex, subIndex);
    },
    handleMouseEnter(item, index) {
      if (this.mode !== "horizontal" || !item.children) return;
      clearTimeout(this.hoverTimer);
      this.navs.forEach((nav, currentIndex) => {
        if (currentIndex !== index) nav.hoverExpand = false;
      });
      item.hoverExpand = true;
    },
    handleMouseLeave(item) {
      if (this.mode !== "horizontal" || !item.children) return;
      this.hoverTimer = setTimeout(() => {
        item.hoverExpand = false;
      }, 150);
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-container {
  padding-top: 60px;
  height: calc(100% - 60px);
  background: var(--bg-color-primary);
  overflow: hidden;
}

.nav-sidebar {
  height: calc(100% - 100px);
}

.nav-menu {
  height: 100%;
  overflow-y: auto;
  padding: 0 12px;
}

.menu-group {
  margin-bottom: 6px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 10px;
  background: var(--bg-color-component);
  overflow: hidden;
}

.menu-group.is-expanded {
  border-color: var(--primary-color);
}

.menu-item {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: var(--bg-color-hover);
}

.menu-item.is-active {
  background: var(--primary-light-color);
}

.menu-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bg-color-secondary);
  margin-right: 10px;
}

.menu-icon {
  font-size: 16px;
  color: var(--text-color-secondary);
}

.menu-content {
  flex: 1;
  min-width: 0;
}

.menu-title {
  font-size: 14px;
  color: var(--text-color-primary);
}

.menu-subtitle {
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-color-placeholder);
}

.menu-arrow {
  width: 22px;
  display: flex;
  justify-content: center;
}

.arrow-icon {
  transition: transform 0.2s ease;
}

.arrow-icon.is-expand {
  transform: rotate(180deg);
}

.submenu-container {
  border-top: 1px solid var(--border-color-extra-light);
  background: var(--bg-color-page);
}

.submenu-wrapper {
  padding: 4px 0;
}

.sub-menu-item {
  min-height: 36px;
  padding-left: 16px;
}

.submenu-icon {
  width: 28px;
  height: 28px;
}

.menu-badge {
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 10px;
  background: var(--primary-color);
}

.badge-text {
  font-size: 10px;
  color: #fff;
}

.nav-horizontal {
  padding-top: 0;
  height: auto;
  overflow: visible;

  .nav-sidebar {
    height: auto;
  }

  .nav-menu {
    display: flex;
    align-items: center;
    overflow: visible;
    padding: 0;
  }

  .menu-group {
    margin-bottom: 0;
    margin-right: 4px;
    position: relative;
    border: none;
    background: transparent;
    overflow: visible;
  }

  .menu-item {
    min-height: 36px;
    border-radius: 8px;
  }

  .menu-icon-wrapper {
    width: 24px;
    height: 24px;
  }

  .menu-subtitle {
    display: none;
  }

  .submenu-container {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 200px;
    margin-top: 4px;
    border: 1px solid var(--border-color-lighter);
    border-radius: 10px;
    box-shadow: 0 8px 24px var(--shadow-color);
    background: var(--bg-color-primary);
    z-index: 2000;
  }
}
</style>
