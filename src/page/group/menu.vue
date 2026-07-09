<template>
  <div
    class="settings-menu"
    :class="{ 'settings-menu--collapsed': !activeTab }"
    v-show="menuFlag"
    @click.stop="handleInitActive">
    <div class="settings-nav">
      <div
        v-for="item in menuItems"
        :key="item.name"
        class="nav-item"
        :class="{ 'nav-item--active': activeTab === item.name }"
        @click="handleTabClick(item.name)">
        <el-icon class="nav-icon">
          <component :is="item.icon" />
        </el-icon>
        <span class="nav-label">{{ item.label }}</span>
      </div>
    </div>

    <div class="settings-content" v-if="activeTab" :style="{ width: setPx(settingsWidth) }">
      <div
        ref="settingsDrag"
        class="menu__drag"
        @mousedown="handleDrag($event, 'settings', $refs.settingsDrag)"></div>
      <div class="menu_header title">
        <div class="title_box">
          <span>{{ currentTabLabel }}</span>
        </div>
      </div>
      <el-scrollbar class="content-scrollbar" :style="contentScrollbarStyle">
        <component
          :is="activeComponent"
          v-bind="activeComponentProps"
          v-if="activeComponent"></component>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { markRaw } from "vue";
import { Box, ChatRound, Files, Filter } from "@element-plus/icons-vue";
import { createAsyncComponent } from "../utils/asyncComponent";

const MenuAiComponent = markRaw(createAsyncComponent(() => import("./menu-ai.vue")));
const ComponentsComponent = markRaw(
  createAsyncComponent(() => import("@/page/setup/components.vue")),
);
const FiltersComponent = markRaw(createAsyncComponent(() => import("@/page/setup/filters.vue")));
const GroupComponent = markRaw(createAsyncComponent(() => import("@/page/setup/group.vue")));

export default {
  name: "SettingsMenu",
  components: {
    Box,
    ChatRound,
    Files,
    Filter,
  },
  props: {
    menuFlag: {
      type: Boolean,
      default: true,
    },
    settingsWidth: {
      type: [String, Number],
    },
  },
  data() {
    return {
      activeTab: "",
      menuItems: [
        {
          name: "ai",
          label: "AI助手",
          icon: markRaw(ChatRound),
          component: MenuAiComponent,
        },
        {
          name: "components",
          label: "基础组件",
          icon: markRaw(Box),
          component: ComponentsComponent,
        },
        {
          name: "groups",
          label: "多屏幕",
          icon: markRaw(Files),
          component: GroupComponent,
        },
        {
          name: "filters",
          label: "过滤器",
          icon: markRaw(Filter),
          component: FiltersComponent,
        },
      ],
    };
  },
  computed: {
    currentItem() {
      return this.menuItems.find(item => item.name === this.activeTab) || null;
    },
    currentTabLabel() {
      return this.currentItem ? this.currentItem.label : "";
    },
    activeComponent() {
      return this.currentItem ? this.currentItem.component : null;
    },
    activeComponentProps() {
      return this.currentItem?.props || {};
    },
    contentScrollbarStyle() {
      return this.activeTab === "components" ? { padding: 0, paddingTop: "40px" } : {};
    },
  },
  methods: {
    setPx(val) {
      return typeof val === "number" ? `${val}px` : val;
    },
    handleInitActive() {
      this.$emit("init-active");
    },
    handleDrag(e, name) {
      this.$emit("drag", e, name);
    },
    handleTabClick(tabName) {
      this.activeTab = this.activeTab === tabName ? "" : tabName;
    },
    showTab(tabName) {
      this.activeTab = tabName;
    },
  },
};
</script>

<style lang="scss" scoped>
.settings-menu {
  position: relative;
  background: var(--bg-color-primary);
  border-right: 1px solid var(--border-color-base);
  display: flex;
  height: 100%;
  width: auto;
  transition: all 0.3s ease;

  &--collapsed {
    width: 70px;
  }

  .settings-nav {
    width: 70px;
    flex-shrink: 0;
    background: var(--bg-color-secondary);
    border-right: 1px solid var(--border-color-base);
    display: flex;
    flex-direction: column;
    overflow-x: hidden;

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 15px 10px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      border-bottom: 1px solid var(--border-color-lighter);

      .nav-icon {
        font-size: 20px;
        margin-bottom: 8px;
        transition: all 0.3s;
        color: var(--text-color-secondary);
      }

      .nav-label {
        font-size: 12px;
        color: var(--text-color-secondary);
        text-align: center;
        transition: all 0.3s;
        white-space: nowrap;
      }

      &:hover {
        background: var(--bg-color-hover);
      }

      &--active {
        background: var(--primary-light-color);

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--primary-color);
          border-radius: 0 2px 2px 0;
        }

        .nav-icon {
          color: var(--primary-color);
        }

        .nav-label {
          color: var(--primary-color);
          font-weight: 600;
        }
      }
    }
  }

  .settings-content {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    animation: slideIn 0.3s ease;

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .content-scrollbar {
      flex: 1;
      overflow: hidden;
      padding: 5px 8px;
      padding-top: 40px;

      :deep(.el-scrollbar__wrap) {
        overflow-x: hidden;
      }

      :deep(.menu__ul) {
        padding: 0;
      }
    }
  }
}
</style>
