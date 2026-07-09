<!-- 自定义 EChart 配置 -->
<template>
  <div>
    <el-form-item label="配置">
      <el-button type="primary" @click="openCode">编辑</el-button>
      <el-button @click="downloadTemplate">下载示例</el-button>
    </el-form-item>
    <el-form-item label-width="0">
      <avue-highlight :height="500" v-model="main.activeObj.echartFormatter"></avue-highlight>
    </el-form-item>
    <codeedit
      @submit="codeClose"
      title="EChart配置"
      codeType="echart"
      v-model="code.obj"
      v-if="code.box"
      :type="code.type"
      v-model:visible="code.box">
    </codeedit>
  </div>
</template>

<script>
import codeedit from "../../page/group/code.vue";
import { getObj } from "@/api/components";

export default {
  name: "common",
  inject: ["main"],
  components: {
    codeedit,
  },
  data() {
    return {
      code: {
        type: "echartFormatter",
        box: false,
        obj: "",
      },
    };
  },
  methods: {
    openCode() {
      this.code.obj = this.main.activeObj[this.code.type] || "";
      this.code.box = true;
    },
    codeClose(value) {
      this.main.activeObj[this.code.type] = value;
    },
    downloadTemplate() {
      getObj("local-custom-echart").then(res => {
        const content = res.data?.data?.content;
        if (content) {
          this.main.activeObj.echartFormatter = content;
          this.main.activeOption.remote = false;
          this.$message.success("示例配置已下载到本地");
        }
      });
    },
  },
};
</script>
