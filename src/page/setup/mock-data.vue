<template>
  <div class="mock-data-panel">
    <section class="mock-data-panel__summary">
      <div>
        <span>当前组件</span>
        <strong>{{ activeComponentName }}</strong>
      </div>
      <el-tag size="small" :type="hasActiveComponent ? 'success' : 'info'">{{ activeProp }}</el-tag>
    </section>

    <el-empty
      v-if="!hasActiveComponent"
      description="请先在画布中选中一个组件"
      :image-size="72" />

    <template v-else>
      <el-alert
        class="mock-data-panel__tip"
        type="info"
        :closable="false"
        show-icon
        title="生成的数据会覆盖当前组件的静态数据源，不会修改接口地址。" />

      <el-form class="mock-data-panel__form" label-position="top">
        <el-form-item label="数据结构">
          <el-select v-model="format" @change="regenerate">
            <el-option label="自动匹配组件" value="auto" />
            <el-option label="分类与系列" value="series" />
            <el-option label="名称和值列表" value="pie" />
            <el-option label="表格行数据" value="table" />
            <el-option label="单个指标" value="metric" />
            <el-option label="进度数值" value="progress" />
            <el-option label="翻牌数据" value="flop" />
            <el-option label="文本值" value="text" />
          </el-select>
        </el-form-item>
        <el-form-item label="生成方式">
          <el-radio-group v-model="mode" @change="regenerate">
            <el-radio-button value="random">随机</el-radio-button>
            <el-radio-button value="ascending">递增</el-radio-button>
            <el-radio-button value="descending">递减</el-radio-button>
            <el-radio-button value="wave">波动</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="8">
          <el-col :span="12">
            <el-form-item label="数据条数">
              <el-input-number v-model="count" :min="1" :max="12" controls-position="right" @change="regenerate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系列数量" v-if="resolvedFormat === 'series'">
              <el-input-number v-model="seriesCount" :min="1" :max="4" controls-position="right" @change="regenerate" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="8">
          <el-col :span="12">
            <el-form-item label="最小值">
              <el-input-number v-model="min" :max="max - 1" controls-position="right" @change="regenerate" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大值">
              <el-input-number v-model="max" :min="min + 1" controls-position="right" @change="regenerate" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <section class="mock-data-panel__preview">
        <div class="mock-data-panel__preview-header">
          <span>数据预览</span>
          <el-button link type="primary" @click="regenerate">重新生成</el-button>
        </div>
        <pre>{{ formattedPreview }}</pre>
      </section>

      <div class="mock-data-panel__actions">
        <el-button @click="regenerate">生成预览</el-button>
        <el-button type="primary" @click="applyData">应用到当前组件</el-button>
      </div>
    </template>
  </div>
</template>

<script>
import { uuid } from "@/utils/utils";

const CATEGORY_NAMES = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const SERIES_NAMES = ["销售额", "目标值", "完成量", "同比值"];
const PIE_NAMES = ["华东", "华南", "华北", "华中", "西南", "西北", "东北", "海外"];

export default {
  name: "MockDataPanel",
  inject: ["contain"],
  data() {
    return {
      format: "auto",
      mode: "random",
      count: 6,
      seriesCount: 2,
      min: 20,
      max: 100,
      previewData: null,
    };
  },
  computed: {
    activeObject() {
      return this.contain?.activeObj || {};
    },
    hasActiveComponent() {
      return Boolean(this.contain?.activeIndex && this.activeObject?.component?.prop);
    },
    activeProp() {
      return this.hasActiveComponent ? this.activeObject.component.prop : "未选择";
    },
    activeComponentName() {
      return this.hasActiveComponent ? this.activeObject.name || this.activeObject.title || "未命名组件" : "未选择";
    },
    resolvedFormat() {
      if (this.format !== "auto") return this.format;
      const prop = this.activeProp;
      if (["bar", "line", "common"].includes(prop)) return "series";
      if (prop === "pie") return "pie";
      if (prop === "table") return "table";
      if (prop === "progress") return "progress";
      if (prop === "flop") return "flop";
      if (prop === "gauge") return "metric";
      return "text";
    },
    formattedPreview() {
      return JSON.stringify(this.previewData, null, 2);
    },
  },
  watch: {
    "contain.activeIndex"() {
      this.regenerate();
    },
  },
  created() {
    this.regenerate();
  },
  methods: {
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    },
    getValue(index, total, seriesIndex = 0) {
      const min = Number(this.min) || 0;
      const max = Math.max(min + 1, Number(this.max) || min + 1);
      const range = max - min;
      const divisor = Math.max(total - 1, 1);
      let value;

      if (this.mode === "ascending") {
        value = min + (range * index) / divisor + seriesIndex * 4;
      } else if (this.mode === "descending") {
        value = max - (range * index) / divisor - seriesIndex * 4;
      } else if (this.mode === "wave") {
        value = min + range * (0.5 + 0.42 * Math.sin((index + seriesIndex * 0.6) * 1.45));
      } else {
        value = min + Math.random() * range;
      }

      return Math.round(this.clamp(value, min, max));
    },
    generateSeries() {
      const count = Number(this.count) || 1;
      const seriesCount = Number(this.seriesCount) || 1;
      return {
        categories: Array.from({ length: count }, (_, index) => CATEGORY_NAMES[index] || `指标 ${index + 1}`),
        series: Array.from({ length: seriesCount }, (_, seriesIndex) => ({
          name: SERIES_NAMES[seriesIndex] || `指标 ${seriesIndex + 1}`,
          data: Array.from({ length: count }, (_, index) => this.getValue(index, count, seriesIndex)),
        })),
      };
    },
    generatePie() {
      const count = Number(this.count) || 1;
      return Array.from({ length: count }, (_, index) => ({
        name: PIE_NAMES[index] || `分类 ${index + 1}`,
        value: this.getValue(index, count),
      }));
    },
    generateTable() {
      const count = Number(this.count) || 1;
      return Array.from({ length: count }, (_, index) => {
        const value = this.getValue(index, count);
        return {
          name: PIE_NAMES[index] || `区域 ${index + 1}`,
          value,
          rate: `${Math.max(1, Math.round((value / Math.max(1, this.max)) * 100))}%`,
        };
      });
    },
    generateData() {
      const value = this.getValue(0, 1);
      switch (this.resolvedFormat) {
        case "series":
          return this.generateSeries();
        case "pie":
          return this.generatePie();
        case "table":
          return this.generateTable();
        case "metric":
          return { name: this.activeComponentName, value };
        case "progress":
          return { data: value };
        case "flop":
          return [{ value: value * 100, prefixText: "", suffixText: "" }];
        default:
          return { value: `模拟数据 ${value}` };
      }
    },
    cloneData(value) {
      return JSON.parse(JSON.stringify(value));
    },
    regenerate() {
      this.previewData = this.generateData();
    },
    createStaticDataSource() {
      return {
        id: uuid(),
        name: "本地模拟数据",
        switch: true,
        dataType: 0,
        dataMethod: "get",
        dataHeader: "",
        url: "",
        data: {},
        dataQuery: "",
        dataBody: "",
        dataParams: [],
        dataQueryType: "json",
      };
    },
    applyData() {
      if (!this.hasActiveComponent) return;
      const activeObj = this.activeObject;
      const data = this.cloneData(this.previewData);
      if (!Array.isArray(activeObj.dataList)) activeObj.dataList = [];
      if (!activeObj.dataList[0]) activeObj.dataList.push(this.createStaticDataSource());

      const source = activeObj.dataList[0];
      source.switch = true;
      source.dataType = 0;
      source.data = this.cloneData(data);
      activeObj.dataType = 0;
      activeObj.data = data;

      this.$nextTick(() => {
        const refreshTask = this.contain.$refs.container?.handleRefresh?.();
        refreshTask?.catch?.(() => {});
      });
      this.$message.success("模拟数据已应用到当前组件");
    },
  },
};
</script>

<style lang="scss" scoped>
.mock-data-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
  padding: 4px 2px;

  &__summary,
  &__preview {
    border: 1px solid var(--border-color-lighter);
    border-radius: 8px;
    background: var(--bg-color-secondary);
  }

  &__summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px;

    div {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 3px;
    }

    span {
      color: var(--text-color-secondary);
      font-size: 11px;
    }

    strong {
      overflow: hidden;
      color: var(--text-color-primary);
      font-size: 13px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__tip {
    :deep(.el-alert__title) {
      font-size: 12px;
      line-height: 1.5;
    }
  }

  &__form {
    :deep(.el-form-item) {
      margin-bottom: 10px;
    }

    :deep(.el-form-item__label) {
      padding-bottom: 4px;
      color: var(--text-color-secondary);
      font-size: 12px;
      line-height: 1.2;
    }

    :deep(.el-select),
    :deep(.el-input-number) {
      width: 100%;
    }

    :deep(.el-radio-group) {
      display: flex;
      width: 100%;
    }

    :deep(.el-radio-button) {
      flex: 1;

      .el-radio-button__inner {
        width: 100%;
        padding-right: 4px;
        padding-left: 4px;
      }
    }
  }

  &__preview {
    overflow: hidden;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      color: var(--text-color-primary);
      font-size: 12px;
      border-bottom: 1px solid var(--border-color-lighter);
    }

    pre {
      max-height: 220px;
      margin: 0;
      padding: 10px;
      overflow: auto;
      color: var(--text-color-regular);
      background: var(--bg-color-primary);
      font-family: Consolas, Monaco, monospace;
      font-size: 11px;
      line-height: 1.55;
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 8px;
  }
}
</style>
