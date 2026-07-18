<template>
  <div>
    <el-form-item label="配置">
      <el-button type="primary" @click="openCode">编辑</el-button>
      <el-button @click="downloadTemplate">下载示例</el-button>
    </el-form-item>
    <el-form-item label-width="0">
      <avue-highlight v-model="main.activeOption.content" :height="500" />
    </el-form-item>
    <codeedit
      v-if="code.box"
      v-model="code.obj"
      v-model:visible="code.box"
      title="自定义 Vue 组件"
      code-type="vue"
      type="content"
      language="html"
      :rules="false"
      @submit="codeClose" />
  </div>
</template>

<script>
import codeedit from "../../page/group/code.vue";
import { getObj } from "@/api/components";

export default {
  name: "vue",
  inject: ["main"],
  components: { codeedit },
  data() {
    return {
      code: {
        box: false,
        obj: "",
      },
    };
  },
  methods: {
    codeClose(value) {
      this.main.activeOption.content = value;
    },
    openCode() {
      this.code.obj = this.main.activeOption.content || "";
      this.code.box = true;
    },
    downloadTemplate() {
      getObj("local-custom-vue").then(res => {
        const content = res.data?.data?.content;
        if (!content) return;
        this.main.activeOption.content = content;
        this.main.activeOption.remote = false;
        this.$message.success("示例配置已下载到本地");
      });
    },
  },
};
</script>
