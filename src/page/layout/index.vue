<template>
  <el-container class="index" :class="layoutClass">
    <!-- 侧边栏 -->
    <el-aside class="left" v-if="layoutMode !== 'top'">
      <logo :mode="currentMode" @layout-change="handleLayoutChange"></logo>
      <navs :mode="currentMode" @change="handleChange"></navs>
    </el-aside>

    <!-- 顶部导航栏 -->
    <el-header class="top-header" v-if="layoutMode === 'top'">
      <div class="top-header-left">
        <logo mode="horizontal" @layout-change="handleLayoutChange"></logo>
      </div>
      <div class="top-header-center">
        <navs mode="horizontal" @change="handleChange"></navs>
      </div>
      <div class="top-header-right"></div>
    </el-header>

    <!-- 主内容区 -->
    <el-main class="main" :class="{ 'top-main': layoutMode === 'top' }">
      <div class="main-content">
        <router-view />
      </div>
    </el-main>
  </el-container>
</template>
<script>
import navs from "./nav.vue";
import logo from "./logo.vue";
const LAYOUT_STORAGE_KEY = "avue-data-layout-mode";

export default {
  name: "index",
  components: {
    navs,
    logo
  },
  data() {
    return {
      layoutMode: localStorage.getItem(LAYOUT_STORAGE_KEY) || "side", // 'side' | 'top'
    };
  },
  computed: {
    layoutClass() {
      return {
        'layout-top': this.layoutMode === 'top',
        'layout-side': this.layoutMode === 'side'
      };
    },
    currentMode() {
      return this.layoutMode === 'top' ? 'horizontal' : 'vertical';
    }
  },
  methods: {
    handleChange(item, index) {
      this.$router.push({ path: item.path });
    },
    handleLayoutChange(newMode) {
      this.layoutMode = newMode === "top" ? "top" : "side";
    },
  },
};
</script>
<style lang="scss">
@import "@/styles/list.scss";
.index {
  height: 100%;
  & > .left {
    position: relative;
    width: 220px !important;
    height: 100%;
    border-right: 1px solid var(--border-color-base);
    background: var(--bg-color-primary);
  }
  & > .main {
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  // 顶部布局模式
  &.layout-top {
    flex-direction: column;
  }
}

// 顶部布局头部样式
.top-header {
  height: 60px !important;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: var(--bg-color-primary);
  border-bottom: 1px solid var(--border-color-base);
  box-sizing: border-box;
}

.top-header-left {
  width: 180px;
  flex-shrink: 0;
}

.top-header-center {
  flex: 1;
  margin: 0 20px;
  box-sizing: border-box;
}

.top-header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.top-main {
  height: calc(100% - 60px);
}

.main-content {
  flex: 1;
  overflow: auto;
}
</style>
