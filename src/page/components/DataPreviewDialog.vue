<template>
  <el-dialog
    v-model="dialogVisible"
    width="760px"
    append-to-body
    destroy-on-close
    title="数据格式预览"
    class="avue-dialog data-preview-dialog">
    <div class="preview-toolbar">
      <span class="preview-toolbar__label">数据源</span>
      <el-radio-group v-model="previewSource" size="small">
        <el-radio-button label="data">过滤器后</el-radio-button>
        <el-radio-button label="old">原始数据</el-radio-button>
      </el-radio-group>
    </div>
    <div class="preview-summary">
      <div v-for="item in previewSummaryCards" :key="item.label" class="preview-summary__item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>
    <div v-if="previewFields.length" class="preview-field-list">
      <div class="preview-field-list__head">
        <span>字段路径</span>
        <span>示例值</span>
      </div>
      <div class="preview-field-list__body">
        <div
          v-for="field in previewFields"
          :key="field.path"
          class="preview-field"
          :style="{ '--preview-field-indent': field.level * 14 + 'px' }">
          <div class="preview-field__main">
            <el-tooltip
              :content="field.path"
              :disabled="!shouldShowTextTip(field.path, 32)"
              placement="top-start"
              popper-class="preview-field-tooltip">
              <span class="preview-field__path">{{ field.path }}</span>
            </el-tooltip>
            <el-tag
              class="preview-field__tag"
              size="small"
              effect="plain"
              :type="getPreviewTagType(field.type)">
              {{ field.type }}
            </el-tag>
          </div>
          <el-tooltip
            :content="field.sample"
            :disabled="!shouldShowTextTip(field.sample, 36)"
            placement="top-end"
            popper-class="preview-field-tooltip">
            <span class="preview-field__sample">{{ field.sample }}</span>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div v-else class="preview-empty">
      <el-icon><el-icon-document /></el-icon>
      <p>暂无可解析字段</p>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "DataPreviewDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    data: {
      type: [String, Number, Boolean, Array, Object],
      default: "",
    },
    oldData: {
      type: [String, Number, Boolean, Array, Object],
      default: "",
    },
    initialSource: {
      type: String,
      default: "data",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      previewTabs: "fields",
      previewSource: "data",
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    currentPreviewData() {
      return this.previewSource === "old" ? this.oldData : this.data;
    },
    parsedPreviewData() {
      return this.normalizePreviewData(this.currentPreviewData);
    },
    previewFields() {
      return this.flattenPreviewFields(this.parsedPreviewData);
    },
    previewSummaryCards() {
      const data = this.parsedPreviewData;
      const rows = this.getPreviewRows(data);
      return [
        { label: "根类型", value: this.getValueType(data) },
        { label: "记录数", value: rows.length },
        { label: "字段数", value: this.previewFields.length },
        { label: "最大层级", value: this.getMaxPreviewLevel(this.previewFields) },
      ];
    },
    previewSourceLabel() {
      return this.previewSource === "old" ? "原始数据" : "过滤器后";
    },
  },
  watch: {
    modelValue(value) {
      if (value) {
        this.previewSource = this.initialSource;
        this.previewTabs = "fields";
      }
    },
  },
  methods: {
    normalizePreviewData(value) {
      if (value === null || value === undefined || value === "") return null;
      if (typeof value !== "string") return value;
      const text = value.trim();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    },
    getValueType(value) {
      if (Array.isArray(value)) return "array";
      if (value === null) return "null";
      return typeof value;
    },
    getPreviewTagType(type) {
      const typeMap = {
        array: "success",
        object: "warning",
        number: "info",
        boolean: "danger",
        null: "info",
      };
      return typeMap[type] || "";
    },
    shouldShowTextTip(value, maxLength) {
      return value !== null && value !== undefined && String(value).length > maxLength;
    },
    formatPreviewSample(value) {
      if (value === null || value === undefined) return "";
      if (typeof value === "object") {
        try {
          return JSON.stringify(value).slice(0, 80);
        } catch {
          return "[object]";
        }
      }
      return String(value).slice(0, 80);
    },
    flattenPreviewFields(data) {
      const result = [];
      const walk = (value, path, level) => {
        if (result.length >= 160 || level > 6) return;
        const type = this.getValueType(value);
        if (path) {
          result.push({
            path,
            level,
            type,
            sample: this.formatPreviewSample(value),
          });
        }
        if (Array.isArray(value) && value.length) {
          walk(value[0], path ? `${path}[0]` : "[0]", level + 1);
        } else if (value && typeof value === "object") {
          Object.keys(value)
            .slice(0, 80)
            .forEach(key => {
              walk(value[key], path ? `${path}.${key}` : key, level + 1);
            });
        }
      };
      walk(data, "", 0);
      return result;
    },
    getPreviewRows(data) {
      if (Array.isArray(data)) return data;
      if (!data || typeof data !== "object") return [];
      const arrayValue = Object.values(data).find(item => Array.isArray(item));
      if (arrayValue) return arrayValue;
      return [data];
    },
    getMaxPreviewLevel(fields) {
      if (!fields.length) return 0;
      return Math.max(...fields.map(item => item.level));
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.data-preview-dialog.el-dialog),
:deep(.data-preview-dialog .el-dialog) {
  max-width: calc(100vw - 28px);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.data-preview-dialog .el-dialog__header) {
  padding: 16px 18px;
  margin-right: 0;
  border-bottom: 1px solid var(--border-color-lighter);
}

:deep(.data-preview-dialog .el-dialog__headerbtn) {
  top: 17px;
  right: 18px;
}

:deep(.data-preview-dialog .el-dialog__body) {
  padding: 14px 18px 18px;
}

.preview-header {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 32px;

  &__icon {
    width: 32px;
    height: 32px;
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    border: 1px solid var(--border-color-lighter);
    border-radius: 8px;
    background: var(--primary-lighter-color);
  }

  &__content {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__title {
    color: var(--text-color-primary);
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  &__source {
    max-width: 96px;
    overflow: hidden;
    padding: 2px 8px;
    color: var(--primary-color);
    border: 1px solid var(--primary-light-color);
    border-radius: 999px;
    background: var(--primary-lighter-color);
    font-size: 12px;
    line-height: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 34px;
  margin-bottom: 14px;
  padding: 8px 10px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  background: var(--bg-color-secondary);

  &__label {
    flex: 0 0 auto;
    color: var(--text-color-secondary);
    font-size: 13px;
    line-height: 20px;
  }

  :deep(.el-radio-button__inner) {
    min-width: 74px;
  }
}

.preview-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;

  &__item {
    position: relative;
    min-width: 0;
    overflow: hidden;
    padding: 12px 12px 12px 14px;
    border: 1px solid var(--border-color-lighter);
    border-radius: 8px;
    background: var(--bg-color-secondary);

    &::before {
      content: "";
      position: absolute;
      top: 12px;
      bottom: 12px;
      left: 0;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: var(--primary-color);
    }

    &:nth-child(2)::before {
      background: var(--success-color);
    }

    &:nth-child(3)::before {
      background: var(--info-color);
    }

    &:nth-child(4)::before {
      background: var(--warning-color);
    }

    span {
      display: block;
      overflow: hidden;
      color: var(--text-color-secondary);
      font-size: 12px;
      line-height: 18px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      display: block;
      margin-top: 4px;
      overflow: hidden;
      color: var(--text-color-primary);
      font-size: 18px;
      line-height: 24px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.preview-field-list {
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  background: var(--bg-color-secondary);
  overflow: hidden;

  &__head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(140px, 260px);
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    color: var(--text-color-secondary);
    border-bottom: 1px solid var(--border-color-lighter);
    background: var(--bg-color-primary);
    font-size: 12px;
    line-height: 18px;

    span:last-child {
      text-align: right;
    }
  }

  &__body {
    max-height: 360px;
    overflow-y: auto;
  }
}

.preview-field {
  min-height: 38px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(140px, 260px);
  align-items: center;
  gap: 12px;
  padding: 8px 14px 8px calc(14px + var(--preview-field-indent, 0px));
  border-bottom: 1px solid var(--border-color-lighter);
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--bg-color-hover);
  }

  &:last-child {
    border-bottom: 0;
  }

  &__main {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__path {
    min-width: 0;
    display: block;
    flex: 1 1 auto;
    overflow: hidden;
    color: var(--text-color-primary);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tag {
    flex: 0 0 auto;
    max-width: 82px;
  }

  &__sample {
    min-width: 0;
    display: block;
    overflow: hidden;
    color: var(--text-color-secondary);
    font-size: 12px;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

:global(.preview-field-tooltip) {
  max-width: 420px;
  line-height: 18px;
  word-break: break-all;
}

.preview-empty {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--border-color-lighter);
  border-radius: 8px;
  background: var(--bg-color-secondary);
  color: var(--text-color-placeholder);

  .el-icon {
    font-size: 34px;
    color: var(--text-color-secondary);
  }

  p {
    margin: 8px 0 0;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  :deep(.data-preview-dialog .el-dialog__body) {
    padding: 12px;
  }

  .preview-header__content,
  .preview-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .preview-toolbar {
    gap: 8px;
  }

  .preview-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .preview-field-list__head,
  .preview-field {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .preview-field-list__head {
    display: none;
  }

  .preview-field__sample {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .preview-summary {
    grid-template-columns: 1fr;
  }
}
</style>
