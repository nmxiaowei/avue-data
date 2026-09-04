<template>
  <el-container class="list">
    <el-main class="content" v-loading="loading">
      <div class="content__box module-box">
        <div class="module-stats">
          <div class="module-stat">
            <span class="module-stat__num">{{ errorStats.total }}</span>
            <span class="module-stat__label">错误日志总数</span>
          </div>
          <div class="module-stat">
            <span class="module-stat__num">{{ flowStats.total }}</span>
            <span class="module-stat__label">数据流变更</span>
          </div>
          <div class="module-stat">
            <span class="module-stat__num">{{ errorStats.recent24h }}</span>
            <span class="module-stat__label">24h 内错误</span>
          </div>
          <div class="module-stat module-stat--action" @click="handleClearAll">
            <span class="module-stat__link">清空全部日志</span>
          </div>
        </div>

        <el-tabs v-model="tab" class="module-tabs">
          <el-tab-pane label="错误日志" name="error">
            <el-table :data="errorList" size="small" max-height="520">
              <el-table-column label="时间" width="160">
                <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
              </el-table-column>
              <el-table-column prop="visualId" label="大屏" width="120" show-overflow-tooltip />
              <el-table-column prop="componentId" label="组件" width="120" show-overflow-tooltip />
              <el-table-column prop="type" label="类型" width="110" />
              <el-table-column prop="message" label="信息" min-width="240" show-overflow-tooltip />
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="{ row }">
                  <el-button link type="danger" size="small" @click="removeError(row)">删除</el-button>
                </template>
              </el-table-column>
              <template #empty>
                <el-empty description="暂无错误日志" :image-size="60" />
              </template>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="数据流变更" name="flow">
            <el-table :data="flowList" size="small" max-height="520">
              <el-table-column label="时间" width="160">
                <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
              </el-table-column>
              <el-table-column prop="visualId" label="大屏" width="120" show-overflow-tooltip />
              <el-table-column prop="source" label="来源" width="110" />
              <el-table-column prop="action" label="事件" width="110" />
              <el-table-column prop="componentName" label="组件" min-width="140" show-overflow-tooltip />
              <el-table-column prop="summary" label="说明" min-width="200" show-overflow-tooltip />
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="{ row }">
                  <el-button link type="danger" size="small" @click="removeFlow(row)">删除</el-button>
                </template>
              </el-table-column>
              <template #empty>
                <el-empty description="暂无数据流变更日志" :image-size="60" />
              </template>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import dayjs from "dayjs";
import {
  clearAllErrorLogs,
  deleteErrorLog,
  getAllErrorLogs,
  getErrorLogStats,
} from "@/utils/errorLogDB";
import {
  clearAllDataFlowChangeLogs,
  deleteDataFlowChangeLog,
  getAllDataFlowChangeLogs,
  getDataFlowChangeStats,
} from "@/utils/dataFlowChangeDB";

export default {
  name: "monitorModule",
  data() {
    return {
      loading: false,
      tab: "error",
      errorList: [],
      flowList: [],
      errorStats: { total: 0, recent24h: 0, byType: {}, byVisualId: {} },
      flowStats: { total: 0, recent24h: 0 },
    };
  },
  created() {
    this.load();
  },
  methods: {
    formatTime(ts) {
      return ts ? dayjs(ts).format("YYYY-MM-DD HH:mm:ss") : "-";
    },
    async load() {
      this.loading = true;
      try {
        const [errorList, flowList, errorStats, flowStats] = await Promise.all([
          getAllErrorLogs(),
          getAllDataFlowChangeLogs(),
          getErrorLogStats(),
          getDataFlowChangeStats(),
        ]);
        this.errorList = errorList;
        this.flowList = flowList;
        this.errorStats = errorStats;
        this.flowStats = flowStats;
      } catch (error) {
        console.warn("读取监控日志失败", error);
        this.$message.error("读取监控日志失败");
      } finally {
        this.loading = false;
      }
    },
    async removeError(row) {
      await deleteErrorLog(row.id);
      this.$message.success("已删除该日志");
      this.load();
    },
    async removeFlow(row) {
      await deleteDataFlowChangeLog(row.id);
      this.$message.success("已删除该日志");
      this.load();
    },
    async handleClearAll() {
      try {
        await this.$confirm("确定清空全部监控日志吗(错误 + 数据流)?", "清空日志", {
          type: "warning",
          confirmButtonText: "清空",
          cancelButtonText: "取消",
        });
        await Promise.all([clearAllErrorLogs(), clearAllDataFlowChangeLogs()]);
        this.$message.success("已清空全部监控日志");
        this.load();
      } catch (error) {
        /* 取消 */
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.module-box {
  padding: 16px;
}

.module-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.module-stat {
  flex: 1;
  min-width: 120px;
  padding: 14px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 10px;
  background: var(--bg-color-secondary);
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__num {
    color: var(--primary-color);
    font-size: 26px;
    font-weight: bold;
  }

  &__label {
    color: var(--text-color-placeholder);
    font-size: 12px;
  }

  &--action {
    flex: 0 0 auto;
    justify-content: center;
  }

  &__link {
    color: var(--danger-color, #f56c6c);
    cursor: pointer;
    font-size: 13px;

    &:hover {
      text-decoration: underline;
    }
  }
}

.module-tabs {
  padding: 0 4px;
}
</style>
