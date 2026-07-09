<template>
  <el-dialog
    width="min(680px, 92vw)"
    top="12vh"
    class="avue-dialog import-screen-dialog"
    :close-on-click-modal="false"
    @closed="resetImport"
    v-model="box">
    <template #header>
      <div class="import-screen__header">
        <div>
          <div class="import-screen__title">导入大屏</div>
          <div class="import-screen__desc">上传从设计器导出的 JSON 配置文件，校验通过后生成新大屏</div>
        </div>
        <el-tag :type="statusType" effect="dark" size="small">{{ statusText }}</el-tag>
      </div>
    </template>

    <div class="import-screen" v-loading="loading" v-bind="$loadingParams">
      <el-upload
        drag
        v-if="box"
        class="import-screen__upload"
        action="#"
        accept=".json,application/json"
        :show-file-list="false"
        :auto-upload="false"
        :on-change="uploadFile">
        <el-icon size="40">
          <el-icon-upload />
        </el-icon>
        <div class="el-upload__text">将 JSON 文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="import-screen__tip">仅支持包含 detail 和 component 字段的大屏配置 JSON</div>
        </template>
      </el-upload>

      <div class="import-screen__result" v-if="fileName || validateError">
        <div class="import-screen__file">
          <div class="import-screen__file-main">
            <el-icon><el-icon-document /></el-icon>
            <span>{{ fileName || "未选择文件" }}</span>
          </div>
          <el-button v-if="fileName" text type="primary" @click="resetImport">重新选择</el-button>
        </div>

        <el-alert
          v-if="validateError"
          type="error"
          :title="validateError"
          show-icon
          :closable="false" />

        <div class="import-screen__summary" v-else-if="preview">
          <div class="import-screen__summary-item">
            <span>大屏名称</span>
            <strong>{{ preview.title }}</strong>
          </div>
          <div class="import-screen__summary-item">
            <span>画布尺寸</span>
            <strong>{{ preview.width }} × {{ preview.height }}</strong>
          </div>
          <div class="import-screen__summary-item">
            <span>组件数量</span>
            <strong>{{ preview.componentCount }}</strong>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="import-screen__footer">
        <el-button @click="box = false">取消</el-button>
        <el-button
          type="primary"
          :loading="importLoading"
          :disabled="!importPayload || !!validateError"
          @click="confirmImport">
          确认导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { impotObj } from "@/api/visual";

export default {
  data() {
    return {
      loading: false,
      importLoading: false,
      box: false,
      fileName: "",
      validateError: "",
      preview: null,
      importPayload: null,
    };
  },
  computed: {
    statusType() {
      if (this.validateError) return "danger";
      if (this.importPayload) return "success";
      return "info";
    },
    statusText() {
      if (this.validateError) return "校验失败";
      if (this.importPayload) return "可导入";
      return "待选择";
    },
  },
  methods: {
    uploadFile(file) {
      this.loading = true;
      this.validateError = "";
      this.preview = null;
      this.importPayload = null;
      this.fileName = file.name || "";

      if (!this.isJsonFile(file.raw)) {
        this.loading = false;
        this.validateError = "请选择 .json 格式的大屏配置文件";
        return;
      }

      const reader = new FileReader();

      reader.onload = fileReader => {
        try {
          const config = this.parseImportConfig(fileReader.target.result);
          const detail = config.detail;
          const component = config.component;
          const title = detail.title || detail.name;

          this.preview = {
            title,
            width: detail.width,
            height: detail.height,
            componentCount: component.length,
          };
          this.importPayload = {
            title,
            name: title,
            width: detail.width,
            height: detail.height,
            detail: JSON.stringify(detail),
            component: JSON.stringify(component),
          };
          this.$message.success("文件校验通过");
        } catch (err) {
          this.validateError = err.message || "导入文件格式错误";
          this.$message.error(this.validateError);
        } finally {
          this.loading = false;
        }
      };

      reader.onerror = () => {
        this.loading = false;
        this.validateError = "文件读取失败，请重新选择";
        this.$message.error(this.validateError);
      };

      reader.readAsText(file.raw, "UTF-8");
    },
    isJsonFile(file) {
      if (!file) return false;
      return file.type === "application/json" || file.name?.toLowerCase().endsWith(".json");
    },
    parseImportConfig(value) {
      let result;
      try {
        result = JSON.parse(String(value || "").replace(/^\uFEFF/, ""));
      } catch (err) {
        throw new Error("JSON 解析失败，请检查文件内容是否为合法 JSON");
      }

      if (!result || Array.isArray(result) || typeof result !== "object") {
        throw new Error("配置根节点必须是 JSON 对象");
      }

      const detail = result.detail;
      if (!detail || Array.isArray(detail) || typeof detail !== "object") {
        throw new Error("配置文件缺少有效的 detail 对象");
      }

      if (!Array.isArray(result.component)) {
        throw new Error("配置文件缺少有效的 component 数组");
      }

      const title = detail.title || detail.name;
      if (!title) {
        throw new Error("detail 中缺少大屏名称 name 或 title");
      }

      if (!this.isPositiveSize(detail.width) || !this.isPositiveSize(detail.height)) {
        throw new Error("detail 中缺少有效的大屏宽高 width、height");
      }

      return {
        detail,
        component: result.component,
      };
    },
    isPositiveSize(value) {
      const numberValue = Number(value);
      return Number.isFinite(numberValue) && numberValue > 0;
    },
    confirmImport() {
      if (!this.importPayload || this.validateError) return;

      this.importLoading = true;
      impotObj(this.importPayload)
        .then(res => {
          const data = res.data.data;
          const id = data.id;
          this.$message.success("导入成功");
          this.box = false;
          setTimeout(() => {
            let routeUrl = this.$router.resolve({
              path: "/build/" + id,
            });
            window.open(routeUrl.href, "_blank");
          }, 300);
        })
        .catch(() => {
          this.$message.error("导入失败，请稍后重试");
        })
        .finally(() => {
          this.importLoading = false;
        });
    },
    resetImport() {
      this.loading = false;
      this.importLoading = false;
      this.fileName = "";
      this.validateError = "";
      this.preview = null;
      this.importPayload = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.import-screen__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-right: 34px;
}

.import-screen__title {
  color: var(--text-color-primary);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
}

.import-screen__desc {
  margin-top: 4px;
  color: var(--text-color-placeholder);
  font-size: 12px;
  line-height: 1.35;
}

.import-screen {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.import-screen__upload {
  width: 100%;
}

.import-screen__tip {
  margin-top: 8px;
  color: var(--text-color-placeholder);
  font-size: 12px;
}

.import-screen__result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.import-screen__file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 6px;
  background: var(--bg-color-secondary);
}

.import-screen__file-main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  color: var(--text-color-primary);
  font-size: 13px;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.import-screen__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.import-screen__summary-item {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 6px;
  background: var(--bg-color-component);

  span,
  strong {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--text-color-placeholder);
    font-size: 12px;
  }

  strong {
    margin-top: 8px;
    color: var(--text-color-primary);
    font-size: 14px;
  }
}

.import-screen__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 640px) {
  .import-screen__header,
  .import-screen__file,
  .import-screen__footer {
    align-items: stretch;
    flex-direction: column;
  }

  .import-screen__summary {
    grid-template-columns: 1fr;
  }
}
</style>
