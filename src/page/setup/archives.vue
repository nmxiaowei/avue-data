<template>
  <div class="archive-panel">
    <section class="archive-panel__intro">
      <div>
        <span>大屏存档</span>
        <strong>完整保存当前配置与全部组件</strong>
      </div>
      <el-button size="small" type="primary" @click="handleSaveArchive">保存存档</el-button>
    </section>

    <section class="archive-section">
      <div class="archive-section__header">
        <span>自动存档</span>
        <em>{{ draftStatus }}</em>
      </div>
      <div v-if="contain.localDraftTimestamp" class="archive-item archive-item--draft">
        <button type="button" @click="handleRestoreDraft">
          <strong>最近自动存档</strong>
          <em>{{ formatDateTime(contain.localDraftTimestamp) }}</em>
        </button>
        <el-button text type="primary" @click.stop="handleRestoreDraft">恢复</el-button>
      </div>
      <el-empty v-else description="暂无自动存档" :image-size="42" />
    </section>

    <section class="archive-section archive-section--versions">
      <div class="archive-section__header">
        <span>手动存档</span>
        <em>最多保留 20 个</em>
      </div>
      <div v-for="version in localVersions" :key="version.id" class="archive-item">
        <button type="button" @click="handleRestoreVersion(version)">
          <strong>{{ version.name }}</strong>
          <em>{{ formatDateTime(version.timestamp) }} · {{ version.nav?.length || 0 }} 个组件</em>
        </button>
        <el-button
          circle
          text
          type="danger"
          aria-label="删除大屏存档"
          @click.stop="handleDeleteVersion(version)">
          <el-icon><el-icon-delete /></el-icon>
        </el-button>
      </div>
      <el-empty v-if="!localVersions.length" description="暂无手动存档" :image-size="50" />
    </section>
  </div>
</template>

<script>
export default {
  name: "ArchivePanel",
  inject: ["contain"],
  computed: {
    localVersions() {
      return this.contain.localVersions || [];
    },
    draftStatus() {
      if (this.contain.localDraftSaving) return "保存中…";
      if (this.contain.localDraftError) return "保存失败";
      return this.contain.localDraftTimestamp ? "可恢复" : "暂无记录";
    },
  },
  created() {
    this.contain.refreshLocalVersions?.();
  },
  methods: {
    async handleSaveArchive() {
      try {
        const { value } = await this.$prompt("为此大屏存档输入名称", "保存大屏存档", {
          inputValue: `大屏存档 ${new Date().toLocaleString("zh-CN")}`,
          inputPlaceholder: "例如：调整主视觉前",
          confirmButtonText: "保存",
          cancelButtonText: "取消",
          inputValidator: name => Boolean(name?.trim()) || "请输入存档名称",
        });
        await this.contain.saveLocalVersion(value.trim());
        this.$message.success("大屏存档已保存");
      } catch (error) {
        if (error !== "cancel" && error !== "close") {
          this.$message.error("大屏存档保存失败");
        }
      }
    },
    async handleRestoreDraft() {
      try {
        await this.$confirm("将恢复最近自动存档，当前内容会先自动保存。是否继续？", "恢复自动存档", {
          confirmButtonText: "恢复",
          cancelButtonText: "取消",
          type: "warning",
        });
        await this.contain.restoreLocalDraft();
      } catch (error) {
        if (error !== "cancel" && error !== "close") {
          this.$message.error("自动存档恢复失败");
        }
      }
    },
    async handleRestoreVersion(version) {
      try {
        await this.$confirm(
          `将恢复“${version.name}”，当前内容会先自动保存。是否继续？`,
          "恢复大屏存档",
          {
            confirmButtonText: "恢复",
            cancelButtonText: "取消",
            type: "warning",
          },
        );
        await this.contain.restoreLocalVersion(version);
      } catch (error) {
        if (error !== "cancel" && error !== "close") {
          this.$message.error("大屏存档恢复失败");
        }
      }
    },
    async handleDeleteVersion(version) {
      try {
        await this.$confirm(`确定删除大屏存档“${version.name}”？`, "删除大屏存档", {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        });
        await this.contain.removeLocalVersion(version.id);
        this.$message.success("大屏存档已删除");
      } catch (error) {
        if (error !== "cancel" && error !== "close") {
          this.$message.error("大屏存档删除失败");
        }
      }
    },
    formatDateTime(timestamp) {
      if (!timestamp) return "刚刚";
      return new Date(timestamp).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.archive-panel {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  gap: 12px;
  padding: 4px 2px;
}

.archive-panel__intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  background: var(--bg-color-secondary);

  > div {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 3px;
  }

  span {
    color: var(--text-color-primary);
    font-size: 13px;
    font-weight: 600;
  }

  strong {
    overflow: hidden;
    color: var(--text-color-placeholder);
    font-size: 10px;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.archive-section {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--versions {
    flex: 1;
    min-height: 0;
  }

  &__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 0 2px;

    span {
      color: var(--text-color-secondary);
      font-size: 12px;
      font-weight: 600;
    }

    em {
      color: var(--text-color-placeholder);
      font-size: 10px;
      font-style: normal;
    }
  }
}

.archive-item {
  display: flex;
  align-items: center;
  gap: 3px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 7px;
  background: var(--bg-color-secondary);

  &:hover {
    border-color: var(--primary-color);
    background: var(--bg-color-hover);
  }

  &--draft {
    border-color: var(--primary-light-color);
    background: var(--primary-lighter-color);
  }

  > button {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 3px;
    padding: 8px;
    color: var(--text-color-primary);
    text-align: left;
    cursor: pointer;
    border: 0;
    background: transparent;

    strong,
    em {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      font-size: 12px;
      font-weight: 500;
    }

    em {
      color: var(--text-color-placeholder);
      font-size: 10px;
      font-style: normal;
    }
  }

  :deep(.el-button) {
    flex: 0 0 auto;
    margin-right: 4px;
  }
}
</style>
