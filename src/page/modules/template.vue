<template>
  <el-container class="list">
    <el-header class="content__header">
      <div class="content__box content__nav">
        <div class="content__add">
          <img :src="`${$router.options.base}img/files.png`" height="40" alt="" />
          <div>
            <p>模板库</p>
            <span>在编辑器中“保存为整屏模板”,此处一键套用</span>
          </div>
        </div>
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
          <el-table-column prop="name" label="名称" min-width="200" show-overflow-tooltip />
          <el-table-column label="组件数" width="90">
            <template #default="{ row }">
              {{ countComponents(row.nav) }}
            </template>
          </el-table-column>
          <el-table-column label="尺寸" width="140">
            <template #default="{ row }">
              {{ row.width }} × {{ row.height }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
          <el-table-column prop="updatedAt" label="更新时间" width="170" show-overflow-tooltip />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="apply(row)">套用</el-button>
              <el-button link size="small" @click="exportJson(row)">导出</el-button>
              <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else class="content__empty" description="暂无模板">
          <template #image>
            <svg-icon icon-class="empty" />
          </template>
        </el-empty>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { getTemplates, removeTemplate } from "@/utils/templateStore";
import { impotObj } from "@/api/visual";
import { downloadText } from "@/utils/datasetStore";

export default {
  name: "templateModule",
  data() {
    return {
      loading: false,
      list: [],
      search: { name: "" },
    };
  },
  created() {
    this.load();
  },
  computed: {
    mainPath() {
      return (window.$website && window.$website.routers && window.$website.routers.mainPath) || "/";
    },
  },
  methods: {
    countComponents(nav) {
      let count = 0;
      const walk = items => {
        (Array.isArray(items) ? items : []).forEach(item => {
          if (!item.children || !item.children.length) count++;
          if (item.children) walk(item.children);
        });
      };
      walk(nav);
      return count;
    },
    async load() {
      this.loading = true;
      try {
        const list = await getTemplates();
        const keyword = this.search.name.trim().toLowerCase();
        this.list = keyword
          ? list.filter(item => String(item.name || "").toLowerCase().includes(keyword))
          : list;
      } catch (error) {
        console.warn("读取模板失败", error);
        this.$message.error("读取模板失败");
      } finally {
        this.loading = false;
      }
    },
    // 套用模板:以模板的 detail/nav 新建大屏并进入编辑器
    async apply(row) {
      this.loading = true;
      try {
        const res = await impotObj({
          title: row.name,
          status: 1,
          detail: JSON.stringify(row.detail || {}),
          component: JSON.stringify(row.nav || []),
        });
        const visual = res.data?.data;
        if (visual && visual.id) {
          this.$message.success(`已套用模板并创建大屏「${row.name}」`);
          this.$router.push({ path: `${this.mainPath}build/${visual.id}` });
        } else {
          this.$message.error("套用模板失败");
        }
      } catch (error) {
        console.warn("套用模板失败", error);
        this.$message.error("套用模板失败");
      } finally {
        this.loading = false;
      }
    },
    exportJson(row) {
      downloadText(
        `${row.name}.template.json`,
        JSON.stringify({ name: row.name, detail: row.detail, nav: row.nav, width: row.width, height: row.height }, null, 2),
        "application/json;charset=utf-8",
      );
      this.$message.success("模板已导出");
    },
    async remove(row) {
      try {
        await this.$confirm(`确定删除模板「${row.name}」吗?`, "删除", {
          type: "warning",
          confirmButtonText: "删除",
          cancelButtonText: "取消",
        });
        await removeTemplate(row.id);
        this.$message.success("模板已删除");
        this.load();
      } catch (error) {
        /* 取消 */
      }
    },
  },
};
</script>
