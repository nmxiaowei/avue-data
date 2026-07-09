/**
 * 主题切换工具函数
 * 支持亮色、暗色和赛博朋克主题切换
 */

// 主题类型枚举
export const THEME_TYPES = {
  DARK: "dark",
  LIGHT: "light",
  CYBERPUNK: "cyberpunk",
};

// 默认主题
export const DEFAULT_THEME = THEME_TYPES.DARK;

// 主题存储键名
const THEME_STORAGE_KEY = "avue-data-theme";

/**
 * 获取当前主题
 * @returns {string} 当前主题类型
 */
export function getCurrentTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme || DEFAULT_THEME;
}

/**
 * 设置主题
 * @param {string} theme - 主题类型 (dark | light | cyberpunk)
 */
export function setTheme(theme) {
  if (!Object.values(THEME_TYPES).includes(theme)) {
    console.warn(`无效的主题类型: ${theme}`);
    return;
  }
  // 保存到本地存储
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  // 应用主题到 DOM
  applyTheme(theme);

  // 触发主题变更事件
  window.dispatchEvent(
    new CustomEvent("theme-changed", {
      detail: { theme },
    })
  );
}

/**
 * 应用主题到 DOM
 * @param {string} theme - 主题类型
 */
export function applyTheme(theme) {
  const root = document.documentElement;

  // 移除所有主题属性
  root.removeAttribute("data-theme");

  // 应用指定主题
  if (theme === THEME_TYPES.DARK) {
    // 暗色主题添加 dark class
    root.classList.add("dark");
  } else if (theme === THEME_TYPES.LIGHT) {
    root.setAttribute("data-theme", "light");
    root.classList.remove("dark");
  } else if (theme === THEME_TYPES.CYBERPUNK) {
    root.setAttribute("data-theme", "cyberpunk");
    root.classList.remove("dark");
  }
}

/**
 * 切换主题（循环切换：暗色 -> 亮色 -> 赛博朋克 -> 暗色）
 * @returns {string} 切换后的主题类型
 */
export function toggleTheme() {
  const currentTheme = getCurrentTheme();
  let newTheme;

  switch (currentTheme) {
    case THEME_TYPES.DARK:
      newTheme = THEME_TYPES.LIGHT;
      break;
    case THEME_TYPES.LIGHT:
      newTheme = THEME_TYPES.CYBERPUNK;
      break;
    case THEME_TYPES.CYBERPUNK:
      newTheme = THEME_TYPES.DARK;
      break;
    default:
      newTheme = THEME_TYPES.DARK;
  }

  setTheme(newTheme);
  return newTheme;
}

/**
 * 初始化主题
 * 在应用启动时调用
 */
export function initTheme() {
  const theme = getCurrentTheme();
  applyTheme(theme);
}

/**
 * 获取主题显示名称
 * @param {string} theme - 主题类型
 * @returns {string} 主题显示名称
 */
export function getThemeDisplayName(theme) {
  const names = {
    [THEME_TYPES.DARK]: "暗色主题",
    [THEME_TYPES.LIGHT]: "亮色主题",
    [THEME_TYPES.CYBERPUNK]: "赛博朋克主题",
  };
  return names[theme] || "未知主题";
}

/**
 * 获取主题图标名称
 * @param {string} theme - 主题类型
 * @returns {string} 主题图标名称
 */
export function getThemeIcon(theme) {
  const icons = {
    [THEME_TYPES.DARK]: "Moon",
    [THEME_TYPES.LIGHT]: "Sunny",
    [THEME_TYPES.CYBERPUNK]: "Lightning",
  };
  return icons[theme] || "Moon";
}

/**
 * 监听主题变更事件
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消监听的函数
 */
export function onThemeChange(callback) {
  const handler = event => {
    callback(event.detail.theme);
  };

  window.addEventListener("theme-changed", handler);

  // 返回取消监听的函数
  return () => {
    window.removeEventListener("theme-changed", handler);
  };
}

/**
 * 判断是否为暗色主题
 * @param {string} theme - 主题类型，如果不传则获取当前主题
 * @returns {boolean} 是否为暗色主题
 */
export function isDarkTheme(theme) {
  return (theme || getCurrentTheme()) === THEME_TYPES.DARK;
}

/**
 * 判断是否为亮色主题
 * @param {string} theme - 主题类型，如果不传则获取当前主题
 * @returns {boolean} 是否为亮色主题
 */
export function isLightTheme(theme) {
  return (theme || getCurrentTheme()) === THEME_TYPES.LIGHT;
}

/**
 * 判断是否为赛博朋克主题
 * @param {string} theme - 主题类型，如果不传则获取当前主题
 * @returns {boolean} 是否为赛博朋克主题
 */
export function isCyberpunkTheme(theme) {
  return (theme || getCurrentTheme()) === THEME_TYPES.CYBERPUNK;
}
