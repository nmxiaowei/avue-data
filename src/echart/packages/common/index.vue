<template>
  <div
    :class="[b(), className]"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255,255,255,0)"
    v-loading="loading"
    :style="styleSizeName">
    <div :ref="id" :style="styleChartName"></div>
  </div>
</template>

<script>
import create from "../../create";
import { getFunction } from "@/utils/utils";
import { getObj } from "@/api/components";
import debounce from "lodash/debounce";
export default create({
  name: "common",
  data() {
    return {
      loading: false,
      commonUnmounted: false,
    };
  },
  computed: {
    ids() {
      return this.option.id;
    },
    src() {
      return this.option.src;
    },
    remoteType() {
      return this.option.remoteType;
    },
    remote() {
      return this.option.remote;
    },
  },
  created() {
    // 在组件创建时初始化 debounce 函数
    this.debouncedUpdateChart = debounce(this.updateChart, 300);
  },
  watch: {
    ids() {
      this.debouncedUpdateChart();
    },
    src() {
      this.debouncedUpdateChart();
    },
    remoteType() {
      this.updateChart();
    },
    remote() {
      this.updateChart();
    },
  },
  methods: {
    getTemplate() {
      return new Promise((resolve, reject) => {
        if (this.remote) {
          this.loading = true;
          let axiosObj;
          if (this.remoteType == "system") {
            axiosObj = getObj(this.ids);
          } else if (this.remoteType == "url") {
            axiosObj = this.$axios.get(this.src);
          }
          if (!axiosObj) {
            resolve();
            return;
          }
          axiosObj
            .then(res => {
              resolve(this.remoteType == "system" ? res.data.data.content : res.data);
            })
            .catch(() => {
              resolve();
            });
        } else {
          resolve(this.echartFormatter);
        }
      });
    },
    updateChart() {
      if (this.commonUnmounted) return;

      const optionData = this.deepClone(this.dataChart) || [];
      let option;
      const callback = res => {
        if (this.commonUnmounted) return;

        this.loading = false;
        if (this.myChart) {
          this.myChart.resize();
          this.myChart.setOption(option, this.initialize);
          this.bindEvent();
        }
      };
      this.getTemplate()
        .then(res => {
          if (this.commonUnmounted) return;

          if (this.remote) {
            let result = getFunction(res);
            option = result && result(optionData, this.dataParams);
          } else {
            option = this.echartFormatter(optionData, this.dataParams) || {};
          }
          this.$emit("remote-change", {
            id: this.component,
            content: option,
          });
          callback();
        })
        .finally(() => {
          if (this.commonUnmounted) return;
          this.loading = false;
        });
    },
  },
  beforeUnmount() {
    this.commonUnmounted = true;
    this.debouncedUpdateChart &&
      this.debouncedUpdateChart.cancel &&
      this.debouncedUpdateChart.cancel();
  },
});
</script>
