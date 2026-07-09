<template>
  <div class="theme-switcher" @click="handleToggleTheme">
    <!-- 主题切换按钮 -->
    <el-tooltip :content="themeTooltip" placement="bottom" effect="dark">
      <el-icon>
        <component :is="themeIcon" />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import { Sunny, Moon } from "@element-plus/icons-vue";
import {
  toggleTheme,
  getCurrentTheme,
  getThemeDisplayName,
  getThemeIcon,
  onThemeChange,
  THEME_TYPES,
} from "@/utils/theme";

// 闪电图标组件 (用于赛博朋克主题)
const Lightning = defineComponent({
  name: "Lightning",
  template: `
    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M505.7 661a8 8 0 0 0 13.6 0L660.6 368H592c-4.4 0-8-3.6-8-8v-56c0-4.4 3.6-8 8-8h162.2c5.7 0 10.9 3.1 13.6 8.1c2.7 5 2.5 11.1-.4 15.9L557.5 727c-5.7 9.4-18.9 9.4-24.6 0L323 320c-2.9-4.8-3.1-10.9-.4-15.9c2.7-5 7.9-8.1 13.6-8.1H498c4.4 0 8 3.6 8 8v56c0 4.4-3.6 8-8 8h-68.6L505.7 661z"
      />
    </svg>
  `,
});

export default defineComponent({
  name: "ThemeSwitcher",
  components: {
    Sunny,
    Moon,
    Lightning,
  },
  setup() {
    // 当前主题
    const currentTheme = ref(getCurrentTheme());

    // 主题图标组件
    const themeIcon = computed(() => {
      return getThemeIcon(currentTheme.value);
    });

    // 主题提示文本
    const themeTooltip = computed(() => {
      let nextTheme;
      switch (currentTheme.value) {
        case THEME_TYPES.DARK:
          nextTheme = THEME_TYPES.LIGHT;
          break;
        case THEME_TYPES.LIGHT:
          nextTheme = THEME_TYPES.CYBERPUNK;
          break;
        case THEME_TYPES.CYBERPUNK:
          nextTheme = THEME_TYPES.DARK;
          break;
        default:
          nextTheme = THEME_TYPES.DARK;
      }
      return `切换到${getThemeDisplayName(nextTheme)}`;
    });

    // 主题切换处理函数
    const handleToggleTheme = () => {
      const newTheme = toggleTheme();
      currentTheme.value = newTheme;
    };

    // 监听主题变更
    let unsubscribe = null;

    onMounted(() => {
      unsubscribe = onThemeChange(theme => {
        currentTheme.value = theme;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    return {
      currentTheme,
      themeIcon,
      themeTooltip,
      handleToggleTheme,
    };
  },
  emits: ["theme-change"],
});
</script>
