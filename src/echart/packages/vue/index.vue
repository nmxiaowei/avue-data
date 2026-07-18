<template>
  <div
    :class="[b(), className]"
    :id="id"
    ref="containerRef"
    v-loading="loading"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255,0)"
    :style="[styleSizeName]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    <component
      :is="dynamicComponent"
      ref="main"
      :style="styleChartName"
      :object="object"
      :data-params="dataParams"
      :data-chart="dataChart"
      :ref-list="refList"
      :option="option"
      @change="handleChange"
      @click.self="handleClick"
      @dblclick.self="handleDblClick" />
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import { defineAsyncComponent } from "vue";
import { getObj } from "@/api/components";
import create from "../../create";

const EMPTY_COMPONENT = { template: "<div></div>" };

export default create({
  name: "vue",
  data() {
    return {
      loading: false,
      template: "",
      dynamicComponent: null,
      vueUnmounted: false,
    };
  },
  computed: {
    componentId() {
      return this.option.id;
    },
    content() {
      return this.option.content;
    },
    remote() {
      return this.option.remote;
    },
    remoteType() {
      return this.option.remoteType;
    },
    src() {
      return this.option.src;
    },
  },
  watch: {
    componentId() {
      this.debouncedInitVue();
    },
    content() {
      this.debouncedInitVue();
    },
    remote() {
      this.debouncedInitVue();
    },
    remoteType() {
      this.debouncedInitVue();
    },
    src() {
      this.debouncedInitVue();
    },
  },
  created() {
    this.debouncedInitVue = debounce(this.initVue, 300);
    this.initVue();
  },
  beforeUnmount() {
    this.vueUnmounted = true;
    this.debouncedInitVue?.cancel?.();
    this.dynamicComponent = null;
    this.cleanupStyle();
  },
  methods: {
    getSource(type) {
      const content = String(this.template || "");
      const startTag = content.match(new RegExp(`<${type}[^>]*>`, "i"));
      if (!startTag) return "";

      const start = content.indexOf(startTag[0]) + startTag[0].length;
      const end = content.lastIndexOf(`</${type}`);
      return end > start ? content.slice(start, end) : "";
    },
    getTemplate() {
      if (!this.remote) return Promise.resolve(this.content || "");

      this.loading = true;
      if (this.remoteType === "system") {
        return getObj(this.componentId)
          .then(res => res.data?.data?.content || "")
          .catch(() => "");
      }
      if (!this.src) return Promise.resolve("");
      return this.$axios
        .get(this.src)
        .then(res => (typeof res.data === "string" ? res.data : res.data?.content || ""))
        .catch(() => "");
    },
    initVue() {
      if (this.vueUnmounted) return;

      this.loading = true;
      this.dynamicComponent = defineAsyncComponent({
        loader: () =>
          this.getTemplate().then(content => {
            if (this.vueUnmounted) return EMPTY_COMPONENT;

            this.template = content;
            this.$emit("remote-change", { id: this.component, content });

            if (/<script\s+setup(?:\s|>)/i.test(content)) {
              throw new Error("自定义 Vue 组件暂不支持 <script setup>");
            }

            const template = this.getSource("template");
            const script = this.getSource("script").replace(/export\s+default/, "return");
            this.initStyle();

            try {
              const component = script ? new Function(script)() || {} : {};
              Object.assign(component, {
                template,
                props: {
                  object: Object,
                  option: Object,
                  dataParams: Object,
                  dataChart: Object,
                  refList: [Array, Object],
                },
              });
              return component;
            } catch (error) {
              console.error("自定义 Vue 组件解析失败:", error);
              throw error;
            }
          }),
        loadingComponent: { template: "<div>组件加载中...</div>" },
        errorComponent: { template: "<div>组件语法错误</div>" },
        delay: 200,
        timeout: 10000,
        onError: () => {
          this.loading = false;
        },
      });

      this.$nextTick(() => {
        if (!this.vueUnmounted) this.loading = false;
      });
    },
    initStyle() {
      const styleId = `style-${this.id}`;
      document.getElementById(styleId)?.remove();

      const style = document.createElement("style");
      style.id = styleId;
      style.type = "text/css";
      style.textContent = this.scopeStyleCss(this.getSource("style"));
      (document.head || document.getElementsByTagName("head")[0]).appendChild(style);
    },
    scopeStyleCss(styleCss) {
      const cssText = String(styleCss || "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .trim();
      if (!cssText) return "";

      const styleId = String(this.id || "");
      const escapedId =
        window.CSS && typeof window.CSS.escape === "function"
          ? window.CSS.escape(styleId)
          : styleId.replace(/(^-?\d)|([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-])/g, "\\$&");
      const scopeSelector = `#${escapedId}`;

      if (!cssText.includes("{")) return `${scopeSelector} { ${cssText} }`;

      return cssText.replace(/(^|[{}])\s*([^@{};][^{};]*)\s*\{/g, (match, boundary, selectorText) => {
        const selector = selectorText.trim();
        if (/^(from|to|\d+%)(\s*,\s*(from|to|\d+%))*$/i.test(selector)) return match;

        const scopedSelector = selector
          .split(",")
          .map(item => {
            const text = item.trim();
            if (!text || text.startsWith(scopeSelector)) return text;
            if (text.includes(":host")) return text.replace(/:host\b/g, scopeSelector);
            if (/^(html|body|:root)(?=$|[\s>+~.#[:])/i.test(text)) {
              return text.replace(/^(html|body|:root)/i, scopeSelector);
            }
            return `${scopeSelector} ${text}`;
          })
          .join(", ");
        return `${boundary}${scopedSelector} {`;
      });
    },
    cleanupStyle() {
      document.getElementById(`style-${this.id}`)?.remove();
    },
  },
});
</script>

<style scoped>
.mount-container {
  width: 100%;
  height: 100%;
}
</style>
