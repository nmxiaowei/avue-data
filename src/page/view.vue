<template>
  <div class="build views" :style="viewStyle">
    <container :id="id" :target="target" :option="option" ref="container"></container>
    <demo-cruise v-if="!embed && isStandaloneView"></demo-cruise>
  </div>
</template>

<script>
import init from "@/mixins/";
import demoCruise from "@/page/group/demo-cruise.vue";

export default {
  props: {
    id: [String, Number],
    target: String,
    option: Object,
    // 以组件方式嵌入时(如弹窗预览)不展示演示控制条
    embed: {
      type: Boolean,
      default: false,
    },
    query: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  mixins: [init],
  components: {
    demoCruise,
  },
  computed: {
    // 仅独立的 /view/:id 分享页展示演示控制条
    isStandaloneView() {
      return Boolean(this.$route && this.$route.name === "view");
    },
  },
  data() {
    return {
      viewStyle: {},
    };
  },
  created() {
    if (this.query && Object.keys(this.query).length > 0) {
      Object.keys(this.query).forEach(key => {
        window.$glob.params[key] = this.query[key];
      });
    }
  },
  methods: {},
};
</script>

<style lang="scss"></style>
