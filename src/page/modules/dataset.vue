<template>
  <el-container class="list">
    <el-header class="content__header">
      <div class="content__box content__nav">
        <div class="content__add" @click="openCreate">
          <img :src="`${$router.options.base}img/file.png`" height="40" alt="" />
          <div>
            <p>新建数据集</p>
            <span>粘贴 JSON 或导入文件,供组件复用</span>
          </div>
        </div>
        <div class="content__add" @click="pickFile">
          <img :src="`${$router.options.base}img/export.png`" height="40" alt="" />
          <div>
            <p>导入文件</p>
            <span>支持 .json / .csv / .xlsx</span>
          </div>
        </div>
        <input ref="fileInput" type="file" accept=".json,.csv,.xlsx,.txt" style="display: none" @change="handleFile" />
        <div class="content__page">
          <div class="list-search">
            <el-input v-model="search.name" @keyup.enter="load" placeholder="请输入名称">
              <template #suffix>
                <el-icon @click="load" class="el-input__icon">
                  <el-icon-search />
                </el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </el-header>
    <el-main class="content" v-loading="loading">
      <div class="content__box">
        <el-table :data="list" size="small" v-if="list.length">
          <el-table-column prop="name" label="名称" min-width="180" show-overflow-tooltip />
          <el-table-column label="类型" width="90">
            <template #default="{ row }">
              <el-tag size="small" :type="Array.isArray(row.data) ? 'primary' : 'warning'">
                {{ Array.isArray(row.data) ? "数组" : row.kind === "object" ? "对象" : "原始" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="90">
            <template #default="{ row }">
              {{ Array.isArray(row.data) ? row.data.length : (row.data == null ? 0 : 1) }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
          <el-table-column prop="updatedAt" label="更新时间" width="170" show-overflow-tooltip />
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="preview(row)">预览</el-button>
              <el-button link type="success" size="small" @click="exportCsv(row)">导出CSV</el-button>
              <el-button link size="small" @click="exportJson(row)">导出JSON</el-button>
              <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else class="content__empty" description="暂无数据集">
          <template #image>
            <svg-icon icon-class="empty" />
          </template>
        </el-empty>
      </div>
    </el-main>

    <el-dialog v-model="createVisible" title="新建数据集" width="620px" append-to-body>
      <el-form label-width="72px" label-position="left">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="数据集名称"></el-input>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="form.text"
            type="textarea"
            :rows="8"
            placeholder='粘贴 JSON,如 [{"name":"华东","value":128}]'></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!form.text.trim()" @click="createFromText">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" title="数据集预览" width="640px" append-to-body>
      <json-viewer :value="previewData" copyable :expand-depth="3" theme="avue-json-theme" boxed></json-viewer>
    </el-dialog>
  </el-container>
</template>

<script>
import {
  describeDataset,
  downloadText,
  getDatasets,
  parseCsvText,
  removeDataset,
  rowsToCsv,
  saveDataset,
} from "@/utils/datasetStore";

export default {
  name: "datasetModule",
  data() {
    return {
      loading: false,
      list: [],
      search: { name: "" },
      createVisible: false,
      form: { name: "", text: "" },
      previewVisible: false,
      previewData: null,
    };
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      try {
        const list = await getDatasets();
        const keyword = this.search.name.trim().toLowerCase();
        this.list = keyword
          ? list.filter(item => String(item.name || "").toLowerCase().includes(keyword))
          : list;
      } catch (error) {
        console.warn("读取数据集失败", error);
        this.$message.error("读取数据集失败");
      } finally {
        this.loading = false;
      }
    },
    openCreate() {
      this.form = { name: "", text: "" };
      this.createVisible = true;
    },
    parseText(text) {
      const value = JSON.parse(String(text || "").trim());
      if (value === undefined || value === null) throw new Error("数据不能为空");
      return value;
    },
    async createFromText() {
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
        this.createVisible = false;
        this.load();
      } catch (error) {
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
          value = parseCsvText(await file.text());
        } else if (ext === "xlsx") {
          value = this.parseXlsx(await file.arrayBuffer());
        } else {
          value = this.parseText(await file.text());
        }
        const record = await saveDataset({
          name: file.name.replace(/\.[^.]+$/, ""),
          data: value,
          kind: Array.isArray(value) ? "table" : "object",
        });
        this.$message.success(`文件「${file.name}」已导入为数据集`);
        this.load();
      } catch (error) {
        console.warn("导入文件失败", error);
        this.$message.error(`导入文件失败:${error.message}`);
      }
    },
    parseXlsx(buffer) {
      const XLSX = window.XLSX;
      if (!XLSX) throw new Error("缺少 XLSX 解析库,请使用 JSON/CSV 文件");
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) return [];
      return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
    },
    describe: describeDataset,
    preview(row) {
      this.previewData = row.data;
      this.previewVisible = true;
    },
    exportCsv(row) {
      const data = Array.isArray(row.data)
        ? row.data
        : row.data && typeof row.data === "object"
          ? [row.data]
          : [{ value: row.data }];
      const csv = rowsToCsv(data);
      if (!csv) {
        this.$message.warning("暂无数据可导出");
        return;
      }
      downloadText(`${row.name}.csv`, csv);
      this.$message.success("已导出 CSV");
    },
    exportJson(row) {
      downloadText(`${row.name}.json`, JSON.stringify(row.data, null, 2), "application/json;charset=utf-8");
      this.$message.success("已导出 JSON");
    },
    async remove(row) {
      try {
        await this.$confirm(`确定删除数据集「${row.name}」吗?`, "删除", {
          type: "warning",
          confirmButtonText: "删除",
          cancelButtonText: "取消",
        });
        await removeDataset(row.id);
        this.$message.success("数据集已删除");
        this.load();
      } catch (error) {
        /* 取消 */
      }
    },
  },
};
</script>
