<template>
  <el-container class="list">
    <el-header class="content__header">
      <div class="content__box content__nav">
        <div class="content__add">
          <img :src="`${$router.options.base}img/files.png`" height="40" alt="" />
          <div>
            <p>回收站</p>
            <span>删除的大屏可在此恢复或彻底删除</span>
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
          <el-pagination
            v-if="page.total > 0"
            layout="total, prev, pager, next"
            background
            size="small"
            :page-size="page.size"
            v-model:current-page="page.page"
            :total="page.total"></el-pagination>
        </div>
      </div>
    </el-header>
    <el-main class="content" v-loading="loading">
      <div class="content__box">
        <el-table :data="list" size="small" v-if="list.length">
          <el-table-column prop="visual.title" label="名称" min-width="180" show-overflow-tooltip />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.visual.status == 1 ? 'success' : 'info'" size="small">
                {{ row.visual.status == 1 ? "已发布" : "未发布" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="尺寸" width="140">
            <template #default="{ row }">
              {{ row.visual.width || "-" }} × {{ row.visual.height || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="deleteTime" label="删除时间" width="180" />
          <el-table-column label="操作" width="170" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="restore(row)">恢复</el-button>
              <el-button link type="danger" size="small" @click="remove(row)">彻底删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else class="content__empty" description="回收站为空">
          <template #image>
            <svg-icon icon-class="empty" />
          </template>
        </el-empty>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { getList, restoreObj, delObj } from "@/api/trash";

export default {
  name: "trashModule",
  data() {
    return {
      loading: false,
      list: [],
      search: {
        name: "",
      },
      page: {
        page: 1,
        size: 10,
        total: 0,
      },
    };
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      try {
        const res = await getList({
          current: this.page.page,
          size: this.page.size,
          title: this.search.name,
        });
        const data = res.data?.data || {};
        this.list = data.records || [];
        this.page.total = data.total || 0;
      } catch (error) {
        console.warn("读取回收站失败", error);
        this.$message.error("读取回收站失败");
      } finally {
        this.loading = false;
      }
    },
    async restore(row) {
      try {
        await restoreObj(row.visual.id);
        this.$message.success(`已恢复「${row.visual.title}」`);
        this.load();
      } catch (error) {
        this.$message.error("恢复失败");
      }
    },
    async remove(row) {
      try {
        await this.$confirm(`确定彻底删除「${row.visual.title}」吗?不可恢复`, "彻底删除", {
          type: "warning",
          confirmButtonText: "删除",
          cancelButtonText: "取消",
        });
        await delObj(row.visual.id);
        this.$message.success("已彻底删除");
        this.load();
      } catch (error) {
        /* 取消 */
      }
    },
  },
};
</script>
