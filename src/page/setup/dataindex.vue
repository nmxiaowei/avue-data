<template>
  <div class="dataindex">
    <el-form class="dataindex-form" label-width="86px" label-position="left">
      <div class="data-source-card">
        <div class="data-source-card__header">
          <div class="data-source-card__title">
            <span>数据源</span>
            <el-tag size="small">{{ dataTypeLabel }}</el-tag>
          </div>
        </div>

        <div class="data-source-card__body">
          <el-form-item label="名称">
            <avue-input v-model="dataSource.name" placeholder="请输入数据源名称"></avue-input>
          </el-form-item>
          <el-form-item label="类型">
            <avue-select
              v-model="dataSource.dataType"
              placeholder="请选择数据类型"
              :dic="dicOption.dataType"
              @change="handleDataTypeChange"></avue-select>
          </el-form-item>

          <div class="data-source-mode" :key="dataType">
            <template v-if="dataType === 0">
              <el-form-item label="数据">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="
                    contain.openCode({
                      type: 'data',
                      title: '数据',
                      parent: 'dataList',
                      index: 0,
                      isObject: true,
                    })
                  ">
                  编辑
                </el-button>
              </el-form-item>
            </template>

            <template v-else>
              <el-form-item label="方法">
                <div class="data-inline">
                  <avue-select
                    v-model="dataSource.dataMethod"
                    placeholder="请选择请求方式"
                    :dic="dicOption.dataMethod"></avue-select>
                </div>
              </el-form-item>
              <el-form-item label="地址">
                <avue-input v-model="dataSource.url" placeholder="请输入请求地址"></avue-input>
              </el-form-item>
              <el-form-item label="Query 参数" label-position="top">
                <avue-highlight v-model="dataSource.dataQuery" height="96"></avue-highlight>
                <el-button
                  class="el-button--edit"
                  type="primary"
                  icon="el-icon-edit"
                  @click="
                    contain.openCode({
                      type: 'dataQuery',
                      title: 'Query 参数',
                      parent: 'dataList',
                      index: 0,
                    })
                  ">
                  编辑
                </el-button>
              </el-form-item>
              <el-form-item
                v-if="['post', 'put'].includes(dataSource.dataMethod)"
                label="Body 参数"
                label-position="top">
                <el-radio-group v-model="dataSource.dataQueryType">
                  <el-radio label="json">JSON</el-radio>
                  <el-radio label="form">FORM</el-radio>
                </el-radio-group>
                <avue-highlight v-model="dataSource.dataBody" height="96"></avue-highlight>
                <el-button
                  class="el-button--edit"
                  type="primary"
                  icon="el-icon-edit"
                  @click="
                    contain.openCode({
                      type: 'dataBody',
                      title: 'Body 参数',
                      parent: 'dataList',
                      index: 0,
                    })
                  ">
                  编辑
                </el-button>
              </el-form-item>
              <el-form-item label="请求头" label-position="top">
                <avue-highlight v-model="dataSource.dataHeader" height="96"></avue-highlight>
                <el-button
                  class="el-button--edit"
                  type="primary"
                  icon="el-icon-edit"
                  @click="
                    contain.openCode({
                      type: 'dataHeader',
                      title: '请求头',
                      parent: 'dataList',
                      index: 0,
                    })
                  ">
                  编辑
                </el-button>
              </el-form-item>
            </template>
          </div>

          <el-form-item label="参数">
            <div class="data-param-list">
              <div
                v-for="(param, paramIndex) in getDataParamList(dataSource)"
                :key="paramIndex"
                class="data-param-item">
                <avue-input v-model="param.name" placeholder="参数名"></avue-input>
                <avue-input v-model="param.value" placeholder="参数值"></avue-input>
                <el-button type="danger" link @click="handleDelDataParam(paramIndex)">
                  <el-icon><el-icon-delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" link icon="el-icon-plus" @click="handleAddDataParam">
                新增参数
              </el-button>
            </div>
          </el-form-item>
        </div>
      </div>

      <el-form-item label="刷新">
        <el-input v-model="contain.activeObj.time" placeholder="0">
          <template #append>
            <span>ms</span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item class="data-filter-item" label="过滤器">
        <div class="data-filter-control">
          <avue-select
            v-model="contain.activeObj.dataFormatterId"
            :dic="filterDic"
            clearable
            filterable
            :placeholder="contain.activeObj.dataFormatter ? '自定义过滤器' : '暂无过滤器'"
            :props="{ label: 'name', value: 'id' }"
            @change="handleFilterChange"></avue-select>
          <el-button
            v-if="!contain.activeObj.dataFormatterId"
            type="primary"
            icon="el-icon-edit"
            @click="
              contain.openCode({
                type: 'dataFormatter',
                title: '编辑过滤器',
              })
            ">
            编辑
          </el-button>
        </div>
        <avue-highlight
          v-if="activeFilterFormatter"
          :model-value="activeFilterFormatter"
          height="100"></avue-highlight>
      </el-form-item>

      <el-form-item class="data-response-item" label-width="0">
        <div class="data-response-panel">
          <div class="data-response-panel__header">
            <div class="data-response-panel__title">
              <span>响应数据</span>
              <el-tooltip
                v-if="dataStatus !== null"
                :content="dataStatus ? '加载成功' : '加载失败'"
                placement="top">
                <span class="status-dot" :class="dataStatus ? 'is-success' : 'is-error'"></span>
              </el-tooltip>
            </div>
            <span class="data-response-panel__desc">{{ dataStatusText }}</span>
          </div>
          <div class="data-response-panel__actions">
            <el-tooltip content="格式预览" placement="top">
              <el-button
                class="data-response-action"
                icon="el-icon-document"
                :disabled="!hasPreviewData()"
                @click="openDataPreview"></el-button>
            </el-tooltip>
            <el-tooltip content="请求数据" placement="top">
              <el-button
                class="data-response-action data-response-action--primary"
                icon="el-icon-refresh"
                :loading="dataLoading"
                @click="handleRes"></el-button>
            </el-tooltip>
          </div>
        </div>
      </el-form-item>

      <el-tabs class="menu__tabs data-response-tabs" v-model="resTabs">
        <el-tab-pane label="过滤后数据" :name="0">
          <json-viewer
            v-loading="dataLoading"
            v-bind="$loadingParams"
            :value="dataRes"
            copyable
            :expand-depth="5"
            theme="avue-json-theme"
            boxed></json-viewer>
        </el-tab-pane>
        <el-tab-pane label="原始数据" :name="1">
          <json-viewer
            v-loading="dataLoading"
            v-bind="$loadingParams"
            :value="dataOldRes"
            copyable
            :expand-depth="5"
            theme="avue-json-theme"
            boxed></json-viewer>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <data-preview-dialog
      v-model="previewDialog"
      :data="dataRes"
      :old-data="dataOldRes"
      :initial-source="previewSource"></data-preview-dialog>
  </div>
</template>

<script>
import DataPreviewDialog from "@/page/components/DataPreviewDialog.vue";
import { dicOption } from "@/option/config";
import { uuid } from "@/utils/utils";

export default {
  inject: ["contain"],
  components: {
    DataPreviewDialog,
  },
  data() {
    return {
      resTabs: 0,
      dataLoading: false,
      dataStatus: null,
      dataRes: "",
      dataOldRes: "",
      previewDialog: false,
      previewSource: "data",
      DIC: {
        filter: [],
      },
      dicOption,
    };
  },
  watch: {
    "contain.activeIndex"() {
      if (typeof this.contain.validProp === "function" && !this.contain.validProp("dataList")) {
        return;
      }
      this.ensureDataSource();
      this.refreshFilterDic();
      this.handleRes(false);
    },
  },
  created() {
    this.ensureDataSource();
    this.refreshFilterDic();
    this.handleRes(false);
  },
  computed: {
    dataSource() {
      return this.getDataSource();
    },
    dataType() {
      return Number(this.dataSource.dataType) === 1 ? 1 : 0;
    },
    dataTypeLabel() {
      const option = this.dicOption.dataType.find(item => item.value === this.dataType);
      return option?.label || "静态数据";
    },
    filterDic() {
      const filters = this.ensureFilters();
      return Object.keys(filters).map(key => filters[key]);
    },
    activeFilterFormatter() {
      const activeObj = this.contain.activeObj;
      const filters = this.ensureFilters();
      if (activeObj.dataFormatterId && filters[activeObj.dataFormatterId]) {
        return filters[activeObj.dataFormatterId].dataFormatter || "";
      }
      return activeObj.dataFormatter || "";
    },
    dataStatusText() {
      if (this.dataLoading) return "请求中";
      if (this.dataStatus === true) return "最近一次请求成功";
      if (this.dataStatus === false) return "最近一次请求失败";
      return "尚未请求数据";
    },
  },
  methods: {
    createDefaultDataSource() {
      return {
        id: uuid(),
        name: "数据源",
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
    getDataSource() {
      const list = this.contain.activeObj.dataList;
      if (Array.isArray(list) && list[0]) {
        return list[0];
      }
      return this.ensureDataSource();
    },
    ensureDataSource() {
      const activeObj = this.contain.activeObj;
      if (!Array.isArray(activeObj.dataList)) {
        activeObj.dataList = [];
      }

      if (!activeObj.dataList[0]) {
        activeObj.dataList.push(this.createDefaultDataSource());
      }

      if (activeObj.dataList.length > 1) {
        activeObj.dataList.splice(1);
      }

      const item = activeObj.dataList[0];
      const defaults = this.createDefaultDataSource();
      Object.keys(defaults).forEach(key => {
        if (item[key] === undefined || item[key] === null) {
          item[key] = defaults[key];
        }
      });
      item.dataType = Number(item.dataType) === 1 ? 1 : 0;
      item.switch = true;
      return item;
    },
    ensureFilters() {
      if (!this.contain.config.filters || typeof this.contain.config.filters !== "object") {
        this.contain.config.filters = {};
      }
      return this.contain.config.filters;
    },
    refreshFilterDic() {
      const filters = this.ensureFilters();
      this.DIC.filter = Object.keys(filters).map(key => filters[key]);
      if (
        this.contain.activeObj.dataFormatterId &&
        !filters[this.contain.activeObj.dataFormatterId]
      ) {
        this.contain.activeObj.dataFormatterId = "";
      }
    },
    handleDataTypeChange(value) {
      const item = this.ensureDataSource();
      item.dataType = Number(value) === 1 ? 1 : 0;
      item.switch = true;
      if (this.isApi(item)) {
        item.dataMethod = item.dataMethod || "get";
        item.dataQueryType = item.dataQueryType || "json";
      }
      this.$nextTick(() => this.handleRes(false));
    },
    handleFilterChange() {
      this.$nextTick(() => this.handleRes(false));
    },
    handleSetting() {
      this.ensureDataSource();
      this.resTabs = 0;
    },
    getDataParamList(item = this.dataSource) {
      if (!Array.isArray(item.dataParams)) {
        item.dataParams = Object.keys(item.dataParams || {}).map(key => ({
          name: key,
          value: item.dataParams[key],
        }));
      }
      return item.dataParams;
    },
    handleAddDataParam() {
      this.getDataParamList().push({
        name: "",
        value: "",
      });
    },
    handleDelDataParam(index) {
      this.getDataParamList().splice(index, 1);
    },
    isApi(item) {
      return Number(item.dataType) === 1;
    },
    handleRes(tip = true) {
      this.ensureDataSource();
      this.dataRes = "";
      this.dataOldRes = "";
      this.dataStatus = null;

      this.dataLoading = true;
      return this.contain
        .handleRefresh()
        .then(({ news, old }) => {
          this.dataStatus = true;
          this.dataRes = news;
          this.dataOldRes = old;
          if (tip) this.$message.success("请求数据成功");
          return { news, old };
        })
        .catch(error => {
          this.dataStatus = false;
          if (tip) this.$message.error("请求数据失败");
          throw error;
        })
        .finally(() => {
          this.dataLoading = false;
        });
    },
    openDataPreview() {
      if (!this.hasPreviewData()) {
        this.$message.warning("暂无响应数据");
        return;
      }
      this.previewSource = this.resTabs === 1 ? "old" : "data";
      this.previewDialog = true;
    },
    hasPreviewData() {
      const value = this.resTabs === 1 ? this.dataOldRes : this.dataRes;
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim() !== "";
      return true;
    },
  },
};
</script>

<style lang="scss" scoped>
@use "../../styles/setup-panel.scss" as setup;

.dataindex {
  @include setup.panel-root;
}

.dataindex-form {
  @include setup.compact-form;
}

.status-dot {
  @include setup.status-dot;
}

.data-source-card {
  margin-bottom: 12px;
  @include setup.card;

  &__header {
    @include setup.card-header;
  }

  &__title {
    @include setup.title-row;
  }

  &__body {
    :deep(.el-form-item) {
      margin-bottom: 8px;
    }
  }
}

.data-inline {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.data-param-list {
  width: 100%;
}

.data-param-item {
  @include setup.param-grid;
}

.data-response-item {
  margin-top: 4px;
  margin-bottom: 8px !important;
}

.data-response-panel {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  background: var(--bg-color-secondary);

  &__header {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    display: flex;
    align-items: center;
    color: var(--text-color-primary);
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
  }

  &__desc {
    display: block;
    overflow: hidden;
    color: var(--text-color-placeholder);
    font-size: 12px;
    line-height: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    flex: 0 0 auto;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 6px;

    :deep(.el-button) {
      width: 34px;
      height: 34px;
      min-width: 0;
      margin-left: 0;
      padding-right: 0;
      padding-left: 0;
    }

    :deep(.data-response-action) {
      color: var(--text-color-secondary);
      border-color: var(--border-color-lighter);
      border-radius: 7px;
      background: var(--bg-color-primary);
    }

    :deep(.data-response-action:hover),
    :deep(.data-response-action:focus) {
      color: var(--primary-color);
      border-color: var(--primary-color);
      background: var(--primary-lighter-color);
    }

    :deep(.data-response-action--primary) {
      color: #fff;
      border-color: var(--primary-color);
      background: var(--primary-color);
    }

    :deep(.data-response-action--primary:hover),
    :deep(.data-response-action--primary:focus) {
      color: #fff;
      border-color: var(--primary-color-hover);
      background: var(--primary-color-hover);
    }
  }
}

.data-response-tabs {
  padding: 0 10px;
}

@media (max-width: 520px) {
  .data-inline,
  .data-response-panel {
    grid-template-columns: 1fr;
    align-items: stretch;
    flex-direction: column;
  }

  .data-param-item {
    grid-template-columns: 1fr auto;

    > *:nth-child(2) {
      grid-column: 1 / -1;
      grid-row: 2;
    }
  }
}
</style>
