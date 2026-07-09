<template>
  <div class="logo-container" :class="{ 'logo-horizontal': mode === 'horizontal' }">
    <div class="logo-wrapper" @click="$router.push('/')" style="cursor: pointer;">
      <div class="logo-icon">
        <svg-icon icon-class="brand-logo" class="brand-icon" />
      </div>
      <div class="logo-content">
        <div class="logo-title">{{ $website.title }}</div>
        <div class="logo-subtitle">{{ $website.subName }}</div>
      </div>
    </div>
    <div class="header-actions">  
      <ThemeSwitcher />
      <LayoutSwitcher :mode="mode" @toggle="handleLayoutToggle" />
    </div>
  </div>
</template>

<script>
import ThemeSwitcher from "../components/ThemeSwitcher.vue";
import LayoutSwitcher from "../components/LayoutSwitcher.vue";

export default {
  name: "Logo",
  components: {
    ThemeSwitcher,
    LayoutSwitcher,
  },
  props: {
    mode: {
      type: String,
      default: "vertical", // 'vertical' | 'horizontal'
    },
  },
  methods: {
    handleLayoutToggle(newMode) {
      this.$emit("layout-change", newMode);
    },
  },
};
</script>

<style lang="scss" scoped>

.logo-container {
  width: 100%;
  height: 56px;
  position: absolute;
  top: 0;
  left: 0;
  background: var(--bg-color-primary);
  border-bottom: 1px solid var(--border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1024;
  box-sizing: border-box;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--primary-light-color);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    transform: translateX(-100%);
    animation: shine 3s ease-in-out infinite;
  }

  @keyframes shine {
    0%,
    100% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(100%);
    }
  }
}

.brand-icon {
  width: 18px;
  height: 18px;
  color: var(--color-white);
}

.logo-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-color-primary);
  line-height: 1.2;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  font-size: 11px;
  color: var(--text-color-placeholder);
  font-weight: 400;
  line-height: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .logo-container {
    height: 50px;
    padding: 0 12px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .brand-icon {
    width: 16px;
    height: 16px;
  }

  .logo-title {
    font-size: 14px;
  }

  .logo-subtitle {
    font-size: 10px;
  }
}

// 水平模式样式
.logo-horizontal {
  position: relative;
  height: auto;
  padding: 0;
  border-bottom: none;
  background: transparent;
}
</style>
