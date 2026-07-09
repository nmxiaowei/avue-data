<template>
  <div>
    <el-dialog
      append-to-body
      class="result-config-dialog"
      @open="open"
      :close-on-click-modal="false"
      v-model="show"
      width="min(1080px, 92vw)"
      top="6vh">
      <template #header>
        <div class="result-dialog-title">
          <div class="result-dialog-title__text">
            <div class="result-dialog-title__main">大屏配置</div>
            <div class="result-dialog-title__sub">查看、导入或导出当前画布配置</div>
          </div>
          <el-tag :type="configStatus.type" effect="dark" size="small">
            {{ configStatus.label }}
          </el-tag>
        </div>
      </template>

      <div class="result-config">
        <div class="result-summary">
          <div class="result-summary__item">
            <span class="result-summary__label">大屏名称</span>
            <span class="result-summary__value">{{ summaryTitle }}</span>
          </div>
          <div class="result-summary__item">
            <span class="result-summary__label">画布尺寸</span>
            <span class="result-summary__value">{{ summarySize }}</span>
          </div>
          <div class="result-summary__item">
            <span class="result-summary__label">组件数量</span>
            <span class="result-summary__value">{{ componentCount }}</span>
          </div>
          <div class="result-summary__item">
            <span class="result-summary__label">配置大小</span>
            <span class="result-summary__value">{{ configSizeText }}</span>
          </div>
        </div>

        <div class="result-toolbar">
          <div class="result-toolbar__info">
            <span class="result-toolbar__dot" :class="`is-${configStatus.type}`"></span>
            <span>{{ configStatus.message }}</span>
          </div>
          <div class="result-toolbar__actions">
            <el-button size="small" @click="formatConfig">格式化</el-button>
            <el-button size="small" @click="copyConfig">复制</el-button>
          </div>
        </div>

        <div
          class="result-editor-panel"
          :class="{ 'is-error': configStatus.type === 'danger' }"
          @dragover.prevent
          @drop.prevent="handleConfigDrop">
          <div class="result-editor-panel__header">
            <span>JSON 配置</span>
            <span>支持拖入 .json 文件</span>
          </div>
          <monaco-editor
            class="result-editor"
            v-model="json"
            height="52vh"
            language="json"
            :options="resultEditorOptions"
            :show-code-btn="false"></monaco-editor>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer result-dialog-footer">
          <input
            ref="configFileInput"
            class="config-file-input"
            type="file"
            accept=".json,application/json"
            @change="handleConfigFileChange" />
          <div class="result-dialog-footer__left">
            <el-button @click="show = false">取消</el-button>
          </div>
          <div class="result-dialog-footer__right">
            <el-button @click="openConfigFile">
              <el-icon><Upload /></el-icon>
              导入配置
            </el-button>
            <el-button @click="exportData">
              <el-icon><Download /></el-icon>
              导出配置
            </el-button>
            <el-button type="primary" :disabled="configStatus.type === 'danger'" @click="importData">
              应用配置
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { config as defaultConfig } from "@/option/config";
import MonacoEditor from "@/page/components/monaco-editor";
import { Download, Upload } from "@element-plus/icons-vue";
export default {
  components: { MonacoEditor, Download, Upload },
  inject: ["contain"],
  data() {
    return {
      show: false,
      json: {},
      resultEditorOptions: {
        fontSize: 13,
        tabSize: 2,
        wordWrap: "on",
        scrollBeyondLastLine: false,
      },
    };
  },
  computed: {
    configText() {
      if (typeof this.json === "string") return this.json;
      try {
        return JSON.stringify(this.json || {}, null, 4);
      } catch (err) {
        return "";
      }
    },
    configParseResult() {
      try {
        return {
          config: this.parseConfig(this.json),
          error: null,
        };
      } catch (error) {
        return {
          config: null,
          error,
        };
      }
    },
    activeConfig() {
      return (
        this.configParseResult.config || {
          detail: this.contain?.config || {},
          component: this.contain?.nav || [],
        }
      );
    },
    configStatus() {
      if (!this.configText.trim()) {
        return {
          type: "warning",
          label: "待导入",
          message: "请粘贴配置 JSON，或从本地导入配置文件",
        };
      }

      if (this.configParseResult.error) {
        return {
          type: "danger",
          label: "格式异常",
          message: this.configParseResult.error.message || "JSON 格式或配置结构不正确",
        };
      }

      return {
        type: "success",
        label: "可应用",
        message: `当前配置包含 ${this.componentCount} 个组件，可导出或应用到画布`,
      };
    },
    summaryTitle() {
      const detail = this.activeConfig.detail || {};
      return detail.title || detail.name || this.contain?.config?.title || "未命名";
    },
    summarySize() {
      const detail = this.activeConfig.detail || {};
      const width = detail.width || this.contain?.config?.width || "-";
      const height = detail.height || this.contain?.config?.height || "-";
      return `${width} × ${height}`;
    },
    componentCount() {
      return Array.isArray(this.activeConfig.component) ? this.activeConfig.component.length : 0;
    },
    configSizeText() {
      const size = new Blob([this.configText || ""]).size;
      if (size < 1024) return `${size} B`;
      return `${(size / 1024).toFixed(1)} KB`;
    },
  },
  methods: {
    parseConfig(value) {
      const source = typeof value === "string" ? value.replace(/^\uFEFF/, "") : value;
      const config = typeof source === "string" ? JSON.parse(source) : source;
      if (!config || Array.isArray(config) || typeof config !== "object") {
        throw new Error("配置内容必须是 JSON 对象");
      }
      if (!config.detail || Array.isArray(config.detail) || typeof config.detail !== "object") {
        throw new Error("配置文件缺少有效的 detail 数据");
      }
      if (!Array.isArray(config.component)) {
        throw new Error("配置文件缺少有效的 component 数组");
      }
      return config;
    },
    stringifyConfig(value) {
      return typeof value === "string" ? value : JSON.stringify(value, null, 4);
    },
    readConfigFile(file) {
      if (!file) return;
      const isJsonFile = file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
      if (!isJsonFile) {
        this.$message.warning("请选择 JSON 配置文件");
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const config = this.parseConfig(e.target.result);
          this.json = JSON.stringify(config, null, 4);
          this.$message.success("配置文件读取成功，请确认内容后应用");
        } catch (err) {
          this.$message.error(`导入配置失败：${err.message || "文件格式错误"}`);
        }
      };
      reader.onerror = () => {
        this.$message.error("导入配置失败：文件读取失败");
      };
      reader.readAsText(file, "UTF-8");
    },
    handleConfigDrop(event) {
      const file = event.dataTransfer?.files?.[0];
      this.readConfigFile(file);
    },
    formatConfig() {
      try {
        const config = this.parseConfig(this.json);
        this.json = JSON.stringify(config, null, 4);
        this.$message.success("配置格式化成功");
      } catch (err) {
        this.$message.error(`格式化失败：${err.message || "JSON 格式错误"}`);
      }
    },
    copyConfig() {
      const text = this.configText;
      if (!text.trim()) {
        this.$message.warning("暂无可复制的配置内容");
        return;
      }

      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            this.$message.success("配置已复制");
          })
          .catch(() => {
            this.copyConfigFallback(text);
          });
        return;
      }

      this.copyConfigFallback(text);
    },
    copyConfigFallback(text) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "readonly");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (copied) {
        this.$message.success("配置已复制");
      } else {
        this.$message.error("复制失败，请手动复制");
      }
    },
    openConfigFile() {
      this.$refs.configFileInput.click();
    },
    handleConfigFileChange(event) {
      const file = event.target.files[0];
      this.readConfigFile(file);
      event.target.value = "";
    },
    open() {
      this.json = this.stringifyConfig({
        detail: this.contain.config,
        component: this.contain.nav,
      });
    },
    importData() {
      try {
        const json = this.parseConfig(this.json);
        json.detail = Object.assign({}, defaultConfig, json.detail);
        this.contain.config = json.detail;
        this.contain.nav = json.component;
        this.show = false;
        this.$message.success("数据导入成功");
      } catch (err) {
        console.error("导入配置错误:", err);
        this.$message.error(`导入数据错误：${err.message || "未知错误"}`);
      }
    },
    exportData() {
      try {
        const config = this.parseConfig(this.json);
        const blob = new Blob([JSON.stringify(config, null, 4)], {
          type: "application/json;charset=utf-8",
        });
        saveAs(blob, "data.json");
        this.$message.success("配置导出成功");
      } catch (err) {
        this.$message.error(`配置导出失败：${err.message || "未知错误"}`);
      }
    },
  },
};
</script>

<style scoped>
:deep(.result-config-dialog .el-dialog) {
  overflow: hidden;
  border: 1px solid var(--border-color-base);
  border-radius: 8px;
  background: var(--bg-color-primary);
  box-shadow: 0 18px 48px var(--shadow-color-dark);
}

:deep(.result-config-dialog .el-dialog__header) {
  margin-right: 0;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--border-color-lighter);
}

:deep(.result-config-dialog .el-dialog__body) {
  padding: 16px 22px;
}

:deep(.result-config-dialog .el-dialog__footer) {
  padding: 14px 22px 18px;
  border-top: 1px solid var(--border-color-lighter);
}

.result-dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-right: 34px;
}

.result-dialog-title__text {
  min-width: 0;
}

.result-dialog-title__main {
  color: var(--text-color-primary);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
}

.result-dialog-title__sub {
  margin-top: 4px;
  color: var(--text-color-placeholder);
  font-size: 12px;
  line-height: 1.3;
}

.result-config {
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 12px;
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.result-summary__item {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 6px;
  background: var(--bg-color-component);
}

.result-summary__label {
  display: block;
  color: var(--text-color-placeholder);
  font-size: 12px;
  line-height: 1;
}

.result-summary__value {
  display: block;
  min-width: 0;
  margin-top: 8px;
  overflow: hidden;
  color: var(--text-color-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
  padding: 8px 10px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 6px;
  background: var(--bg-color-secondary);
}

.result-toolbar__info {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  color: var(--text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.result-toolbar__info span:last-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-toolbar__dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: var(--text-color-placeholder);
}

.result-toolbar__dot.is-success {
  background: var(--success-color);
}

.result-toolbar__dot.is-warning {
  background: var(--warning-color);
}

.result-toolbar__dot.is-danger {
  background: var(--error-color);
}

.result-toolbar__actions {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 8px;
}

.result-editor-panel {
  overflow: hidden;
  border: 1px solid var(--border-color-lighter);
  border-radius: 6px;
  background: var(--bg-color-secondary);
  transition: border-color 0.2s ease;
}

.result-editor-panel.is-error {
  border-color: var(--error-color);
}

.result-editor-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 34px;
  padding: 0 12px;
  border-bottom: 1px solid var(--border-color-lighter);
  color: var(--text-color-secondary);
  font-size: 12px;
}

.result-editor-panel__header span:last-child {
  color: var(--text-color-placeholder);
}

.result-editor {
  display: block;
}

.result-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.result-dialog-footer__left,
.result-dialog-footer__right {
  display: flex;
  align-items: center;
}

.result-dialog-footer__right {
  justify-content: flex-end;
  gap: 10px;
}

.result-dialog-footer__right {
  flex-wrap: wrap;
}

.config-file-input {
  display: none;
}

@media (max-width: 860px) {
  .result-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .result-toolbar,
  .result-dialog-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .result-toolbar__actions,
  .result-dialog-footer__left,
  .result-dialog-footer__right {
    width: 100%;
  }

  .result-dialog-footer__left,
  .result-dialog-footer__right {
    justify-content: flex-end;
  }
}

@media (max-width: 560px) {
  :deep(.result-config-dialog .el-dialog__body) {
    padding: 12px;
  }

  .result-summary {
    grid-template-columns: 1fr;
  }

  .result-editor-panel__header {
    align-items: flex-start;
    flex-direction: column;
    padding: 8px 12px;
  }
}
</style>
