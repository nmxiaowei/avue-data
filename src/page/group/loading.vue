<template>
  <div class="loading-wrapper" v-if="reload">
    <div class="particles">
      <div class="particle" v-for="n in 20" :key="n"></div>
    </div>

    <div class="loader-box loading-content">
      <div class="loader-logo">
        <div class="logo-container">
          <div class="logo-core">
            <div class="logo-text">
              <span class="logo-main">Avue</span>
              <span class="logo-sub">Data</span>
            </div>
          </div>
        </div>

        <div class="tech-rings">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
        </div>

        <div class="data-flow">
          <div class="flow-line" v-for="n in 5" :key="'flow-' + n"></div>
        </div>
      </div>

      <div class="loader-title">
        <div class="logo-line"></div>
        <div class="logo-desc">大屏可视化设计器</div>
      </div>

      <div class="loader-progress progress-container">
        <div class="progress-bar">
          <div class="progress-fill"></div>
          <div class="progress-glow"></div>
        </div>
        <div class="progress-text">系统加载中...</div>
      </div>
    </div>

    <div class="copyright">Powered by AVUE DATA</div>

    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      reload: false,
    };
  },
  methods: {
    show() {
      this.reload = true;
    },
    hide() {
      this.reload = false;
    },
  },
};
</script>

<style>
/* Shared styles live in /public/css/loading.css. */
</style>
