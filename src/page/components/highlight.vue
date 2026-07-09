<template>
  <div class="avue-code" :style="{ height: height + 'px' }">
    <pre><code ref="codeRef" :class="language">{{ modelValue }}</code></pre>
  </div>
</template>

<script>
import hljs from "highlight.js";
export default {
  props: {
    modelValue: String,
    height: [String, Number],
    language: {
      type: String,
      default: "javascript",
    },
  },
  watch: {
    modelValue() {
      this.$nextTick(() => this.highlight());
    },
  },
  mounted() {
    this.highlight();
  },
  methods: {
    highlight() {
      const el = this.$refs.codeRef;
      if (!el) return;
      el.removeAttribute("data-highlighted");
      hljs.highlightElement(el);
    },
  },
};
</script>

<style lang="scss" scoped>
.avue-code {
  box-sizing: border-box;
  width: 100%;
  overflow: auto;
  background: #282c34;
  pre {
    margin: 0;
    height: 100%;
  }
  pre code.hljs {
    padding: 8px;
  }
  code {
    font-size: 12px;
    line-height: 20px;
  }
}
</style>
