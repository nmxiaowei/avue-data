<template>
  <el-dialog
    :model-value="visible"
    title="本地数据集"
    width="760px"
    top="6vh"
    append-to-body
    :close-on-click-modal="false"
    @update:model-value="handleVisibleChange"
    @open="loadData">
    <div class="dataset-picker">
      <el-collapse class="dataset-create" v-model="createCollapse">
        <el-collapse-item title="新建数据集(粘贴 JSON 或导入文件)" name="create">
          <div class="dataset-create__form">
            <el-form label-width="72px" label-position="left" size="small">
              <el-form-item label="名称">
                <el-input v-model="form.name" placeholder="数据集名称"></el-input>
              </el-form-item>
              <el-form-item label="内容">
                <el-input
                  v-model="form.text"
                  type="textarea"
                  :rows="6"
                  placeholder='粘贴 JSON,如 [{"name":"华东","value":128}]'></el-input>
              </el-form-item>
              <el-form-item label-width="0">
                <div class="dataset-create__actions">
                  <el-button type="primary" size="small" :disabled="!form.text.trim()" @click="handleSaveText">
                    保存为数据集
                  </el-button>
                  <el-button size="small" @click="pickFile">导入文件(.json/.csv/.xlsx)</el-button>
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".json,.csv,.xlsx,.txt"
                    style="display: none"
                    @change="handleFile" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>

      <div class="dataset-picker__hint">
        双击行预览;导入时会把数据集内容写入当前组件数据源(追加合并仅适用于两个数组)。
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        size="small"
        max-height="360"
        empty-text="暂无数据集,先在上方创建一个吧">
        <el-table-column prop="name" label="名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="内容" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ describe(row).type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="说明" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ describe(row).summary }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="previewRow(row)">预览</el-button>
            <el-button link type="success" size="small" @click="emitImport(row, 'overwrite')">
              覆盖导入
            </el-button>
            <el-button link type="warning" size="small" :disabled="!canAppend(row)" @click="emitImport(row, 'append')">
              追加
            </el-button>
            <el-button link type="danger" size="small" @click="removeRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="preview.visible"
      title="数据集预览"
      width="640px"
      append-to-body>
      <json-viewer
        :value="preview.data"
        copyable
        :expand-depth="3"
        theme="avue-json-theme"
        boxed></json-viewer>
    </el-dialog>
  </el-dialog>
</template>

<script>
import {
  describeDataset,
  getDatasets,
  removeDataset,
  saveDataset,
} from "@/utils/datasetStore";

// ---------- 解析辅助 ----------
const trimQuoted = value => {
  const text = String(value == null ? "" : value).trim();
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1);
  }
  return text;
};

const coerceCell = value => {
  const text = trimQuoted(value);
  if (text === "") return text;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
};

const parseCsv = text => {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
  if (!lines.length) return [];
  const splitLine = line => {
    const result = [];
    let current = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (quoted && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (char === "," && !quoted) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };
  const headers = splitLine(lines[0]).map(header => trimQuoted(header.trim()));
  return lines.slice(1).map(line => {
    const cells = splitLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header || `列${index + 1}`] = coerceCell(cells[index]);
    });
    return row;
  });
};

const parseXlsx = buffer => {
  const XLSX = window.XLSX;
  if (!XLSX) {
    throw new Error("缺少 XLSX 解析库,请使用 JSON/CSV 文件");
  }
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
  return Array.isArray(rows) ? rows : [];
};

const cloneValue = value => JSON.parse(JSON.stringify(value == null ? [] : value));

export default {
  name: "dataset-picker",
  data() {
    return {
      visible: false,
      loading: false,
      list: [],
      createCollapse: "create",
      form: {
        name: "",
        text: "",
      },
      preview: {
        visible: false,
        data: null,
      },
    };
  },
  methods: {
    describe: describeDataset,
    handleVisibleChange(value) {
      this.visible = value;
      if (!value) this.resetForm();
    },
    open() {
      this.visible = true;
      this.loadData();
    },
    close() {
      this.visible = false;
      this.resetForm();
    },
    resetForm() {
      this.form.name = "";
      this.form.text = "";
      this.preview.visible = false;
    },
    async loadData() {
      this.loading = true;
      try {
        this.list = await getDatasets();
      } catch (error) {
        console.warn("读取数据集失败", error);
        this.$message.error("读取数据集失败");
      } finally {
        this.loading = false;
      }
    },
    parseText(text) {
      const content = String(text || "").trim();
      const value = JSON.parse(content);
      if (value === undefined || value === null) throw new Error("数据不能为空");
      return value;
    },
    async handleSaveText() {
      let value;
      try {
        value = this.parseText(this.form.text);
      } catch (error) {
        this.$message.error(`JSON 解析失败:${error.message}`);
        return;
      }
      try {
        const record = await saveDataset({
          name: this.form.name,
          data: value,
          kind: Array.isArray(value) ? "table" : "object",
        });
        this.$message.success(`数据集「${record.name}」保存成功`);
        this.form.text = "";
        this.form.name = "";
        this.loadData();
      } catch (error) {
        console.warn("保存数据集失败", error);
        this.$message.error("保存数据集失败");
      }
    },
    pickFile() {
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    async handleFile(event) {
      const file = event.target.files && event.target.files[0];
      event.target.value = "";
      if (!file) return;
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      try {
        let value;
        if (ext === "csv" || ext === "txt") {
          const text = await file.text();
          value = parseCsv(text);
        } else if (ext === "xlsx") {
          const buffer = await file.arrayBuffer();
          value = parseXlsx(buffer);
        } else {
          const text = await file.text();
          value = this.parseText(text);
        }
        const record = await saveDataset({
          name: this.form.name || file.name.replace(/\.[^.]+$/, ""),
          data: value,
          kind: Array.isArray(value) ? "table" : "object",
        });
        this.$message.success(`文件「${file.name}」已导入为数据集`);
        this.form.name = "";
        this.form.text = "";
        this.loadData();
      } catch (error) {
        console.warn("导入文件失败", error);
        this.$message.error(`导入文件失败:${error.message}`);
      }
    },
    canAppend(row) {
      return Array.isArray(row.data) && row.data.length > 0;
    },
    previewRow(row) {
      this.preview.data = row.data;
      this.preview.visible = true;
    },
    emitImport(row, mode) {
      this.$emit("import", {
        dataset: cloneValue(row.data),
        name: row.name,
        mode,
      });
    },
    async removeRow(row) {
      try {
        await this.$confirm(`确定删除数据集「${row.name}」吗?`, "删除数据集", {
          type: "warning",
          confirmButtonText: "删除",
          cancelButtonText: "取消",
        });
        await removeDataset(row.id);
        this.$message.success("数据集已删除");
        this.loadData();
      } catch (error) {
        if (error !== "cancel" && error !== "close") {
          console.warn("删除数据集失败", error);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.dataset-picker {
  width: 100%;

  &__hint {
    margin: 4px 2px 8px;
    color: var(--text-color-placeholder);
    font-size: 12px;
    line-height: 1.6;
  }
}

.dataset-create {
  margin-bottom: 6px;

  &__form {
    padding: 4px 2px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

:deep(.el-collapse-item__header) {
  height: 36px;
  font-size: 13px;
}
</style>
