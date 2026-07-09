<template>
  <div class="build views" :style="viewStyle">
    <container :id="id" :target="target" :option="option" ref="container"></container>
  </div>
</template>

<script>
import init from "@/mixins/";

export default {
  props: {
    id: [String, Number],
    target: String,
    option: Object,
    query: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  mixins: [init],
  components: {},
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
