<template>
  <div class="layout-switcher" @click="toggleLayout">
    <el-tooltip :content="tooltipText" placement="bottom" effect="dark">
      <el-icon>
        <component :is="currentIcon" />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script>
import { Fold, Expand } from "@element-plus/icons-vue";

const LAYOUT_STORAGE_KEY = "avue-data-layout-mode";

export default {
  name: "LayoutSwitcher",
  components: {
    Fold,
    Expand,
  },
  props: {
    mode: {
      type: String,
      default: "vertical", // 'vertical' | 'horizontal'
    },
  },
  computed: {
    currentIcon() {
      return this.mode === "horizontal" ? "Fold" : "Expand";
    },
    tooltipText() {
      return this.mode === "horizontal" ? "切换到侧边栏布局" : "切换到顶部布局";
    },
  },
  methods: {
    toggleLayout() {
      const currentMode = localStorage.getItem(LAYOUT_STORAGE_KEY) || "side";
      const newMode = currentMode === "side" ? "top" : "side";
      localStorage.setItem(LAYOUT_STORAGE_KEY, newMode);
      this.$emit("toggle", newMode);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

