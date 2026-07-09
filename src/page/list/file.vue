<template>
  <el-container class="list file">
    <avue-crud
      ref="crud"
      style="display: none"
      :option="option"
      v-model="form"
      v-model:page="page"
      @row-save="rowSave"
      @row-update="rowUpdate"
      @row-del="rowDel"
      v-loading="loading"
      v-bind="$loadingParams"
      :before-open="beforeOpen"
      :data="data"
      @on-load="onLoad">
      <template #file-form>
        <el-upload multiple :show-file-list="false" :http-request="httpRequest" drag>
          <div v-loading="loading" v-bind="$loadingParams">
            <el-icon size="40">
              <el-icon-upload />
            </el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </div>
        </el-upload>
      </template>
    </avue-crud>
    <el-container>
      <el-header class="content__header">
        <div class="content__box content__nav">
          <div class="content__add" @click="$refs.crud.rowAdd()">
            <img :src="`${$router.options.base}img/file.png`" height="40" alt="" />
            <div>
              <p>上传文件</p>
              <span>可用于图片、字体和基础静态资源</span>
            </div>
          </div>
          <div class="content__page">
            <div class="list-search">
              <el-input v-model="search.name" @keyup.enter="onLoad" placeholder="请输入名称">
                <template #suffix>
                  <el-icon @click="onLoad" class="el-input__icon">
                    <el-icon-search></el-icon-search>
                  </el-icon>
                </template>
              </el-input>
            </div>
            <el-pagination
              v-if="page.total > 0"
              layout="total, prev, pager, next"
              background
              size="small"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :page-size="page.pageSize"
              v-model:current-page="page.currentPage"
              :total="page.total"></el-pagination>
          </div>
        </div>
      </el-header>
      <el-main class="content" v-loading="loading" v-bind="$loadingParams">
        <div class="content__box">
          <template v-if="data.length > 0">
            <div
              v-for="item in data"
              :key="item.id"
              class="content__item"
              @click="select(item)">
              <div class="content__main">
                <div class="content__logo" @click.stop="openImg(item)">
                  <img
                    :src="
                      isImage(item.assetsName)
                        ? item.assetsUrl
                        : `${$router.options.base}img/files.png`
                    "
                    alt="" />
                </div>
                <span class="content__name">{{ item.assetsName }}</span>
                <span class="content__size">{{ item.assetsSize }}</span>
                <span class="content__type">{{ item.assetsType }}</span>
                <span class="content__time">{{ item.assetsTime }}</span>
              </div>
              <div class="content__menu">
                <div class="content__start">
                  <el-tooltip content="复制链接">
                    <div class="content__btn" @click.stop="handleCopy(item)">
                      <el-icon>
                        <el-icon-paperclip />
                      </el-icon>
                    </div>
                  </el-tooltip>
                  <div class="content__btn" @click.stop="handleEdit(item)">
                    <el-icon>
                      <el-icon-edit />
                    </el-icon>
                  </div>
                  <div class="content__btn" @click.stop="rowDel(item)">
                    <el-icon>
                      <el-icon-delete />
                    </el-icon>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <el-empty v-else class="content__empty" description="暂无数据">
            <template #image>
              <svg-icon icon-class="empty" />
            </template>
          </el-empty>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import dayjs from "dayjs";
import { getList, getObj, addObj, delObj, updateObj } from "@/api/file";
import { uploadImg } from "@/api/visual";

export default {
  name: "FileList",
  props: {
    menu: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      search: {},
      loading: false,
      form: {},
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      },
      data: [],
      uploadStatus: {
        total: 0,
        completed: 0,
        inProgress: false,
      },
      option: {
        dialogWidth: "600",
        dialogMenuPosition: "center",
        height: "auto",
        calcHeight: 330,
        header: false,
        index: true,
        align: "center",
        headerAlign: "center",
        saveBtn: false,
        column: [
          {
            label: "文件名称",
            prop: "assetsName",
            addDisplay: false,
            span: 24,
            rules: [
              {
                required: true,
                message: "请输入文件名称",
                trigger: "blur",
              },
            ],
          },
          {
            label: "文件上传",
            prop: "file",
            span: 24,
            editDisplay: false,
          },
          {
            label: "文件类型",
            addDisplay: false,
            prop: "assetsType",
            span: 24,
          },
          {
            label: "文件地址",
            addDisplay: false,
            prop: "assetsUrl",
            span: 24,
          },
          {
            label: "文件大小",
            addDisplay: false,
            prop: "assetsSize",
            disabled: true,
            span: 24,
          },
          {
            label: "上传时间",
            addDisplay: false,
            prop: "assetsTime",
            disabled: true,
            span: 24,
          },
        ],
      },
    };
  },
  methods: {
    select(item) {
      this.$emit("submit", item.assetsUrl);
    },
    openImg(item) {
      if (typeof this.$ImagePreview === "function") {
        this.$ImagePreview([{ url: item.assetsUrl }], 0, {});
        return;
      }
      window.open(item.assetsUrl, "_blank");
    },
    isImage(filename = "") {
      return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(filename);
    },
    async httpRequest(config) {
      const { file } = config;
      if (!this.uploadStatus.inProgress) {
        this.uploadStatus.inProgress = true;
        this.uploadStatus.total = 0;
        this.uploadStatus.completed = 0;
        this.loading = true;
      }

      this.uploadStatus.total += 1;
      const match = file.name.match(/\.([^.]+)$/);
      const form = {
        assetsName: file.name,
        assetsType: match ? match[1] : "file",
        assetsTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        assetsSize: `${(file.size / 1024 / 1024).toFixed(2)}M`,
      };

      try {
        const formdata = new FormData();
        formdata.append("file", file);
        const res = await uploadImg(formdata);
        form.assetsUrl = res.data.data.link;
        await addObj(form);
      } finally {
        this.uploadStatus.completed += 1;
        this.checkUploadCompletion();
      }
    },
    checkUploadCompletion() {
      if (this.uploadStatus.completed < this.uploadStatus.total) return;
      this.loading = false;
      if (this.$refs.crud?.$refs?.dialogForm) {
        this.$refs.crud.$refs.dialogForm.boxVisible = false;
      }
      this.uploadStatus.inProgress = false;
      this.onLoad();
    },
    beforeOpen(done, type) {
      if (type === "edit") {
        getObj(this.form.id).then(res => {
          this.form = res.data.data;
          done();
        });
        return;
      }
      done();
    },
    rowDel(row) {
      this.$confirm("此操作将永久删除该资源，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => delObj(row.id))
        .then(() => {
          this.$message.success("删除成功");
          this.onLoad();
        })
        .catch(() => {});
    },
    rowUpdate(row, index, done, loading) {
      updateObj(row)
        .then(() => {
          done();
          this.$message.success("修改成功");
          this.onLoad();
        })
        .catch(() => loading());
    },
    handleCopy(row) {
      this.$Clipboard({ text: row.assetsUrl }).then(() => {
        this.$message.success("链接复制成功");
      });
    },
    handleEdit(row) {
      const index = this.data.findIndex(item => item.id === row.id);
      this.$refs.crud.rowEdit(row, index);
    },
    rowSave(row, done, loading) {
      addObj(row)
        .then(() => {
          done();
          this.$message.success("新增成功");
          this.onLoad();
        })
        .catch(() => loading());
    },
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.onLoad();
    },
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.onLoad();
    },
    onLoad() {
      this.loading = true;
      const params = {
        assetsName: this.search.name,
        current: this.page.currentPage,
        size: this.page.pageSize,
      };
      getList(params).then(res => {
        const result = res.data.data;
        this.page.total = result.total;
        this.data = result.records.map(item => ({ ...item, _menu: false }));
        this.loading = false;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.file {
  .content {
    &__item {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-right: 0;
      margin-bottom: 10px;
    }

    &__logo {
      margin-right: 10px;

      img {
        width: 40px !important;
        height: 40px !important;
        object-fit: cover;
      }
    }

    &__main {
      flex: 1;
      justify-content: flex-start;
    }

    &__menu {
      width: 130px !important;
      position: relative;
      display: inline-block;
      margin-right: 10px;
      right: 0;
    }

    &__name {
      width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__size,
    &__type {
      min-width: 80px;
      margin-right: 100px;
    }
  }
}
</style>
