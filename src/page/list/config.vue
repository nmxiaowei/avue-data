<template>
  <el-container class="list runtime-config">
    <el-header class="content__header">
      <div class="content__box content__nav">
        <div class="content__add" @click="loadConfig">
          <div class="runtime-config__icon">
            <el-icon><Setting /></el-icon>
          </div>
          <div>
            <p>运行配置</p>
            <span>读取 public/config.js</span>
          </div>
        </div>
        <div class="content__page">
          <div class="runtime-config__actions">
            <el-switch
              v-model="showSensitive"
              size="small"
              active-text="显示敏感值"
              inactive-text="隐藏敏感值" />
            <el-button size="small" :loading="loading" @click="loadConfig">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="list-search runtime-config__search">
            <el-input v-model="keyword" clearable placeholder="搜索字段说明、配置项或配置值">
              <template #suffix>
                <el-icon class="el-input__icon"><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </el-header>

    <el-main class="runtime-config__body" v-loading="loading" v-bind="$loadingParams">
      <div class="runtime-config__summary">
        <div v-for="item in summaryList" :key="item.label" class="runtime-config__summary-item">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>

      <div class="runtime-config__main">
        <section class="runtime-config__panel runtime-config__panel--table">
          <div class="runtime-config__panel-header">
            <div>
              <h3>配置项</h3>
              <p>共 {{ filteredRows.length }} 项，来源：{{ configUrl }}</p>
            </div>
            <el-tag size="small" :type="loadError ? 'danger' : 'success'">
              {{ loadError ? "读取失败" : "已读取" }}
            </el-tag>
          </div>
          <el-alert
            v-if="loadError"
            class="runtime-config__alert"
            type="warning"
            :closable="false"
            :title="loadError"
            show-icon />
          <el-table :data="filteredRows" height="100%" size="small" border>
            <el-table-column
              prop="description"
              label="字段说明"
              min-width="190"
              show-overflow-tooltip />
            <el-table-column prop="path" label="配置项" min-width="210" show-overflow-tooltip />
            <el-table-column prop="type" label="类型" width="90" />
            <el-table-column label="配置值" min-width="260" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="runtime-config__value">{{ displayValue(row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="copyValue(row)">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="runtime-config__panel runtime-config__panel--source">
          <div class="runtime-config__panel-header">
            <div>
              <h3>源码预览</h3>
              <p>展示当前读取到的 config.js 内容</p>
            </div>
            <el-button size="small" text @click="copySource">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
          </div>
          <pre class="runtime-config__source">{{ displaySource }}</pre>
        </section>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { DocumentCopy, Refresh, Search, Setting } from "@element-plus/icons-vue";

const SENSITIVE_RE = /(key|secret|token|password|bearer)/i;
const FIELD_DESCRIPTIONS = {
  title: "网站标题",
  subName: "网站副标题",
  "ai.enabled": "是否开启 AI 功能",
  "ai.provider": "是否使用自定义 AI 服务提供商配置",
  "ai.defaultModel": "默认使用的大模型名称",
  "ai.baseUrl": "AI 服务基础地址",
  "ai.key": "AI 服务访问密钥",
  url: "后端 API 接口地址",
  mqttUrl: "MQTT 消息推送地址",
  exportUrl: "大屏导出服务地址",
  iotUrl: "IoT 物联网平台接口地址",
  iotMqttUrl: "IoT 设备 MQTT 连接地址",
  "routers.mainPath": "主路由路径前缀，用于部署在子目录时配置",
  "autoSave.enabled": "是否开启自动保存功能",
  "autoSave.interval": "自动保存间隔时间，单位毫秒",
};

export default {
  name: "RuntimeConfig",
  components: {
    DocumentCopy,
    Refresh,
    Search,
    Setting,
  },
  data() {
    return {
      loading: false,
      keyword: "",
      source: "",
      config: {},
      loadError: "",
      showSensitive: false,
    };
  },
  computed: {
    configUrl() {
      const base =
        this.$router?.options?.history?.base ||
        this.$router?.options?.base ||
        import.meta.env.BASE_URL ||
        "/";
      return `${String(base).replace(/\/?$/, "/")}config.js`;
    },
    configRows() {
      return this.flattenConfig(this.config);
    },
    filteredRows() {
      const keyword = this.keyword.trim().toLowerCase();
      if (!keyword) return this.configRows;
      return this.configRows.filter(row => {
        return `${row.description} ${row.path} ${row.type} ${this.displayValue(row)}`
          .toLowerCase()
          .includes(keyword);
      });
    },
    displaySource() {
      if (this.showSensitive) return this.source || "暂无源码";
      return this.maskSource(this.source || "暂无源码");
    },
    summaryList() {
      const config = this.config || {};
      return [
        {
          label: "网站标题",
          value: config.title || "-",
        },
        {
          label: "网站副标题",
          value: config.subName || "-",
        },
        {
          label: "后端接口",
          value: config.url || "-",
        },
        {
          label: "AI 功能",
          value: config.ai?.enabled ? "已开启" : "未开启",
        },
        {
          label: "默认模型",
          value: config.ai?.defaultModel || "-",
        },
        {
          label: "自动保存",
          value: config.autoSave?.enabled ? "已开启" : "未开启",
        },
      ];
    },
  },
  mounted() {
    this.loadConfig();
  },
  methods: {
    async loadConfig() {
      this.loading = true;
      this.loadError = "";
      try {
        const response = await fetch(`${this.configUrl}?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`读取失败：${response.status}`);
        }
        this.source = await response.text();
        this.config = this.cloneConfig(window.$website || {});
      } catch (error) {
        this.config = this.cloneConfig(window.$website || {});
        this.loadError = `${error?.message || "读取 config.js 失败"}，已使用当前运行时配置兜底展示`;
      } finally {
        this.loading = false;
      }
    },
    cloneConfig(value) {
      try {
        return JSON.parse(JSON.stringify(value || {}));
      } catch {
        return value || {};
      }
    },
    flattenConfig(source, parentPath = "") {
      if (!source || typeof source !== "object") return [];
      return Object.keys(source).reduce((result, key) => {
        const path = parentPath ? `${parentPath}.${key}` : key;
        const value = source[key];
        const isObject = value && typeof value === "object";
        if (isObject && !Array.isArray(value)) {
          return result.concat(this.flattenConfig(value, path));
        }
        result.push({
          path,
          description: this.getDescription(path),
          value,
          type: Array.isArray(value) ? "array" : typeof value,
          sensitive: SENSITIVE_RE.test(path),
        });
        return result;
      }, []);
    },
    getDescription(path) {
      if (FIELD_DESCRIPTIONS[path]) return FIELD_DESCRIPTIONS[path];
      return "未配置说明";
    },
    formatValue(value) {
      if (typeof value === "string") return value || '""';
      if (value === undefined) return "undefined";
      if (value === null) return "null";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    },
    displayValue(row) {
      if (row.sensitive && !this.showSensitive) {
        const value = this.formatValue(row.value);
        return value ? `${value.slice(0, 4)}******${value.slice(-4)}` : "******";
      }
      return this.formatValue(row.value);
    },
    maskSource(source) {
      return source.replace(/(key|clientSecret|accessToken|tokenHeader|bearer)(\s*:\s*)(["'])(.*?)(\3)/gi, (match, key, separator, quote, value, endQuote) => {
        if (!value) return match;
        return `${key}${separator}${quote}${value.slice(0, 4)}******${value.slice(-4)}${endQuote}`;
      });
    },
    copyValue(row) {
      this.$Clipboard({
        text: this.displayValue(row),
      }).then(() => {
        this.$message.success("配置值已复制");
      });
    },
    copySource() {
      this.$Clipboard({
        text: this.displaySource,
      }).then(() => {
        this.$message.success("配置源码已复制");
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.runtime-config {
  overflow: hidden;

  .content__header {
    flex-shrink: 0;
  }
}

.runtime-config__icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-lighter-color);
  color: var(--primary-color);
  font-size: 22px;
}

.runtime-config__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.runtime-config__search {
  width: 320px;
}

.runtime-config__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  padding: 16px;
  overflow: hidden;
  background: var(--bg-color-primary);
}

.runtime-config__summary {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  flex-shrink: 0;
}

.runtime-config__summary-item {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  background: var(--bg-color-secondary);

  span,
  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    margin-bottom: 8px;
    color: var(--text-color-secondary);
    font-size: 12px;
  }

  strong {
    color: var(--text-color-primary);
    font-size: 14px;
    font-weight: 600;
  }
}

.runtime-config__main {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  gap: 16px;
}

.runtime-config__panel {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  background: var(--bg-color-secondary);
  overflow: hidden;
}

.runtime-config__panel-header {
  flex-shrink: 0;
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color-lighter);

  h3 {
    margin: 0 0 4px;
    color: var(--text-color-primary);
    font-size: 15px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: var(--text-color-placeholder);
    font-size: 12px;
  }
}

.runtime-config__alert {
  flex-shrink: 0;
  border-radius: 0;
}

.runtime-config__value {
  font-family: Consolas, Monaco, monospace;
}

.runtime-config__source {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 14px;
  overflow: auto;
  color: var(--text-color-primary);
  background: var(--bg-color-primary);
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 1200px) {
  .runtime-config__summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .runtime-config__main {
    grid-template-columns: 1fr;
  }

  .runtime-config__panel--source {
    min-height: 360px;
  }
}

@media (max-width: 768px) {
  .runtime-config__actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .runtime-config__search {
    width: 100%;
  }

  .runtime-config__summary {
    grid-template-columns: 1fr;
  }
}
</style>
