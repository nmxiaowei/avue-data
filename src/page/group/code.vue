<template>
  <el-dialog
    :modelValue="visible"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="avue-dialog code-dialog"
    :title="title || '数据处理'"
    width="90%">
    <!-- 工具栏 -->
    <div class="toolbar-controls">
      <el-checkbox v-model="showEditor" label="代码" size="small" border />
      <el-checkbox
        v-if="isDataFormatter"
        v-model="showDataViewer"
        label="数据预览"
        size="small"
        border />
    </div>

    <!-- 主内容区域 -->
    <div class="code-edit-content" :key="reload">
      <!-- 代码编辑器 -->
      <monaco-editor
        v-if="showEditor"
        v-model="code"
        v-loading="loading"
        v-bind="$loadingParams"
        height="100%"
        show-code-btn
        :code-type="type"
        :language="language"
        class="editor-main" />

      <!-- 组件预览 -->
      <!-- 数据预览 -->
      <CodeViewer
        v-if="isDataFormatter && showDataViewer"
        :visible="showDataViewer"
        :data-value="dataValue"
        :data-new-value="dataNewValue"
        :loading="loading"
        :loading-params="$loadingParams"
        :expand-depth="jsonExpandDepth"
        class="data-panel" />

    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <span class="avue-dialog__footer avue-dialog__footer--right">
        <el-button
          v-if="isDataFormatter"
          icon="el-icon-refresh"
          type="success"
          :loading="loading"
          @click="handleTestRefresh">
          刷新数据
        </el-button>
        <el-button icon="el-icon-close" @click="handleClose">取 消</el-button>
        <el-button type="primary" icon="el-icon-check" @click="submit">确 定</el-button>
      </span>
    </template>

    <!-- 移除独立子对话框组件，现已整合到主内容区 -->
  </el-dialog>
</template>

<script>
import CodeViewer from "@/page/components/CodeViewer.vue";
import MonacoEditor from "@/page/components/monaco-editor";

// 代码模板配置
const CODE_TEMPLATES = {
  // 数据处理类
  func: `()=>{
  
}`,
  dataFormatter: `(data,params,refs)=>{
    return {}
}`,
  stylesFormatter: `(data,params,refs)=>{
    return {}
}`,
  // 数据查询类
  query: `(data)=>{
    return {}
}`,
  header: `(data)=>{
    return {}
}`,
  // API 参数类
  dataBody: `(refs,params)=>{
    return {}
}`,
  dataQuery: `(refs,params)=>{
    return {}
}`,
  dataHeader: `(refs,params)=>{
    return {}
}`,
  time: `(refs,params)=>{
    return {}
}`,
  // 事件处理类
  clickFormatter: `(params,refs,safe)=>{
    console.log(params,refs,safe)
}`,
  dblClickFormatter: `(params,refs,safe)=>{
    console.log(params,refs,safe)
}`,
  mouseEnterFormatter: `(params,refs,safe)=>{
    console.log(params,refs,safe)
}`,
  mouseLeaveFormatter: `(params,refs,safe)=>{
    console.log(params,refs,safe)
}`,
  dataBeforeFormatter: `(params,refs,safe)=>{
    console.log(params,refs,safe)
}`,
  dataAfterFormatter: `(params,refs,safe)=>{
    console.log(params,refs,safe)
}`,
  // 标签格式化类
  labelFormatter: `(name,data)=>{
    console.log(name,data)
    return ''
}`,
  formatter: `(name,data)=>{
    console.log(name,data)
    return ''
}`,
  // 图表专用
  echartFormatter: `(data)=>{
    const myChart = this.myChart;
    const option={}
    return option
}`,
  // 异步处理类
  before: `(data)=>{
    return new Promise(resolve=>{
      resolve()
    })
}`,
  // 请求拦截器
  requestInterceptor: `(config)=>{
    // config.url - 请求地址
    // config.method - 请求方法
    // config.headers - 请求头
    // config.data - 请求体(POST/PUT)
    // config.params - 请求参数(GET/DELETE)
    console.log('请求拦截:', config)
    return config
}`,
  // 响应拦截器
  responseInterceptor: `(response)=>{
    // response.status - 响应状态码
    // response.data - 响应数据
    // response.headers - 响应头
    // response.config - 请求配置
    console.log('响应拦截:', response)
    // 返回undefined则继续默认处理，返回其他值则替代默认返回
    return response
}`,
};

// JSON 展开层级
const JSON_EXPAND_DEPTH = 5;

export default {
  name: "CodeEditor",
  components: { CodeViewer, MonacoEditor },
  inject: ["contain"],
  props: {
    language: {
      type: String,
      default: "javascript",
    },
    defaultValue: {
      type: String,
      default: "",
    },
    codeType: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    visible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "",
    },
    modelValue: {
      type: [String, Object, Array],
      default: "",
    },
  },
  emits: ["update:visible", "submit"],
  data() {
    return {
      dataValue: {},
      dataNewValue: {},
      reload: Math.random(),
      loading: false,
      code: "",
      jsonExpandDepth: JSON_EXPAND_DEPTH,
      showEditor: true, // 控制代码编辑器显示，默认显示
      showDataViewer: true, // 控制数据预览面板显示，默认显示
    };
  },
  computed: {
    // 是否为数据格式化器
    isDataFormatter() {
      return this.type === "dataFormatter";
    },
  },
  watch: {
    modelValue: {
      handler(val) {
        this.code = this.validatenull(val) ? this.getDefaultCodeTemplate() : val;
      },
      immediate: true,
      deep: true,
    },
  },
  created() {
    this.initDataFormatter();
  },
  methods: {
    /**
     * 初始化 dataFormatter 类型的数据
     */
    initDataFormatter() {
      if (!this.isDataFormatter) return;

      const dataIndex = this.contain.$refs.dataindex;
      if (dataIndex) {
        this.dataValue = dataIndex.dataOldRes || {};
        this.dataNewValue = dataIndex.dataRes || {};
      }
    },

    /**
     * 获取默认代码模板
     */
    getDefaultCodeTemplate() {
      // 优先使用传入的默认值
      if (!this.validatenull(this.defaultValue)) {
        return this.defaultValue;
      }
      // 根据类型返回对应的模板
      return CODE_TEMPLATES[this.type] || this.modelValue || "";
    },

    /**
     * 格式化数据值为字符串
     */
    formatDataValue(value) {
      return typeof value === "object" ? JSON.stringify(value) : value;
    },

    /**
     * 切换数据预览面板显示状态（已废弃，改用 v-model）
     */
    handleToggleDataViewer() {
      this.showDataViewer = !this.showDataViewer;
    },

    /**
     * 处理代码变更（已废弃，保留以兼容）
     */
    handleCodeChange(val) {
      if (val?.content) {
        this.code = val.content;
      }
    },

    /**
     * 测试刷新数据格式化
     */
    handleTestRefresh() {
      this.loading = true;
      this.contain
        .handleRefresh({ dataFormatter: this.code })
        .then(({ news, old }) => {
          this.dataNewValue = news;
          this.dataValue = old;
          this.$message.success("刷新成功");
        })
        .catch(err => {
          console.error("刷新失败:", err);
          this.$message.error("刷新失败");
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * 关闭弹窗
     */
    handleClose() {
      this.setVisible(false);
    },

    /**
     * 提交代码
     */
    submit() {
      let value = this.code;

      // 如果原始值是对象类型，尝试解析字符串
      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch {}
      }

      this.$emit("submit", value);
      this.setVisible(false);
    },

    /**
     * 设置弹窗显示状态
     */
    setVisible(val) {
      this.$emit("update:visible", val);
    },
  },
};
</script>

<style lang="scss">
.code-dialog {
  height: 100%;
  &.el-dialog {
    margin-top: 10vh;
  }
  // 工具栏控制区域
  .toolbar-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-color-secondary);
    border-bottom: 1px solid var(--border-color-base);
    .el-checkbox {
      margin-right: 0 !important;
    }
  }

  // 主内容区域布局
  .code-edit-content {
    height: calc(100% - 50px);
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  // 代码编辑器样式
  .editor-main {
    flex: 1;
    min-width: 0;
  }

  // 数据预览面板样式
  .data-panel {
    flex-shrink: 0;
    flex: 1;
    max-width: 300px;
    height: 100%;
  }
}
</style>
