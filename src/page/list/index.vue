<template>
  <el-container class="list">
    <el-container>
      <el-header class="content__header">
        <div class="content__box content__nav">
          <div class="avue-flex">
            <div class="content__add" @click="handleAdd">
              <img :src="`${$router.options.base}img/project.png`" height="40px" alt="" />
              <div>
                <p>创建大屏</p>
                <span>创建可视化大屏项目</span>
              </div>
            </div>
            <div class="content__add" @click="handleImport">
              <img :src="`${$router.options.base}img/export.png`" height="40px" alt="" />
              <div>
                <p>导入大屏</p>
                <span>解析文件 生成新项目</span>
              </div>
            </div>
          </div>
          <div class="content__page">
            <div class="content__page-left">
              <div class="list-search">
                <el-input
                  v-model="search.name"
                  @keyup.enter="getList"
                  placeholder="请输入名称"
                  clearable>
                  <template #prefix>
                    <el-icon class="el-input__icon">
                      <el-icon-search></el-icon-search>
                    </el-icon>
                  </template>
                </el-input>
              </div>
            </div>
            <div class="content__page-right">
              <el-pagination
                v-if="page.total > 0"
                layout="total, prev, pager, next"
                background
                size="small"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :page-size="page.size"
                v-model:current-page="page.page"
                :total="page.total">
              </el-pagination>
            </div>
          </div>
        </div>
      </el-header>
      <el-main class="content" v-loading="loading" v-bind="$loadingParams">
        <div class="content__box">
          <template v-if="list.length > 0">
            <div
              class="content__item"
              v-for="(item, index) in list"
              :key="index">
              <div class="content__info">
                <img
                  :src="getVisualCover(item)"
                  @error="handleCoverError"
                  alt="" />
                <div class="content__menu">
                  <div class="content__right">
                    <el-tooltip content="分享">
                      <el-icon @click="handleShare(item)">
                        <el-icon-share />
                      </el-icon>
                    </el-tooltip>
                    <el-tooltip content="导出配置">
                      <el-icon @click="handleExportConfig(item)">
                        <el-icon-download />
                      </el-icon>
                    </el-tooltip>
                    <el-tooltip content="修改">
                      <el-icon @click="handleUpdate(item, index)">
                        <el-icon-edit />
                      </el-icon>
                    </el-tooltip>
                    <el-tooltip content="删除">
                      <el-icon @click="handleDel(item, index)">
                        <el-icon-delete />
                      </el-icon>
                    </el-tooltip>
                    <el-tooltip content="复制">
                      <el-icon @click="handleCopy(item, index)">
                        <el-icon-copy-document />
                      </el-icon>
                    </el-tooltip>
                  </div>
                  <div class="content__start">
                    <div class="content__btn" @click="handleViews(item, index)">
                      <el-icon>
                        <el-icon-view />
                      </el-icon>
                    </div>
                    <div class="content__btn" @click="handleEdit(item)">
                      <el-icon>
                        <el-icon-edit />
                      </el-icon>
                    </div>
                  </div>
                </div>
              </div>
              <div class="content__main">
                <span class="content__name">{{ item.title }}</span>
                <div class="content__menulist">
                  <span class="content__status" :class="{ 'is-active': item.status }">
                    <span class="icon"></span>
                    {{ item.status == 1 ? "已发布" : "未发布" }}
                  </span>
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
    <el-dialog
      :title="isEdit ? '编辑大屏' : '创建大屏'"
      :width="isEdit ? '50%' : '70%'"
      class="avue-dialog"
      :close-on-click-modal="false"
      v-model="box">
      <avue-form ref="form" v-if="box" :option="option" v-model="form" @submit="handleSave">
        <template #backgroundUrl>
          <img :src="form.backgroundUrl" v-if="form.backgroundUrl" style="width: 200px" alt="" />
          <el-upload
            :show-file-list="false"
            multiple
            :http-request="httpRequest"
            list-type="picture">
            <el-button :loading="loading1" icon="el-icon-upload" type="primary">点击上传</el-button>
          </el-upload>
        </template>
        <template #screen>
          <div class="create-screen">
            <div
              class="item"
              :class="{ 'is-active': index === screenActive }"
              v-for="(item, index) in screenList"
              @click="handleSetScreen(item)"
              :key="index">
              <svg-icon class="item-icon" :icon-class="item.icon" />
              <div class="item-title">{{ item.label }}</div>
              <div class="item-size">{{ item.width }} x {{ item.height }}</div>
            </div>
          </div>
        </template>
      </avue-form>
      <span class="avue-dialog__footer avue-dialog__footer--center">
        <el-button type="primary" @click="$refs.form.submit()" icon="el-icon-check">{{
          isEdit ? "更新大屏" : "创建大屏"
        }}</el-button>
        <el-button icon="el-icon-close" @click="box = false">关 闭</el-button>
      </span>
    </el-dialog>
    <import-tip ref="importTip"></import-tip>

    <!-- 分享对话框 -->
    <el-dialog
      title="分享大屏地址"
      width="500px"
      class="avue-dialog share-dialog"
      :close-on-click-modal="true"
      v-model="shareDialogVisible">
      <div class="share-content">
        <div class="share-info">
          <div class="share-name">{{ shareItem.title }}</div>
          <div class="share-desc">复制下方地址或扫描二维码分享给他人预览大屏</div>
        </div>
        <div class="share-qrcode">
          <canvas ref="qrcodeCanvas"></canvas>
          <div class="qrcode-tip">扫一扫，手机预览</div>
        </div>
        <div class="share-url-box">
          <el-input v-model="shareUrl" readonly>
            <template #append>
              <el-button
                @click="copyShareUrl"
                icon="el-icon-document-copy"
                style="margin-right: 10px"
                >复制</el-button
              >
              <el-button type="primary" @click="openShareUrl" icon="el-icon-view">打开</el-button>
            </template>
          </el-input>
        </div>
        <div class="share-tips">
          <el-icon><el-icon-info-filled /></el-icon>
          <span>提示：分享链接可直接在浏览器中打开预览</span>
        </div>
      </div>
    </el-dialog>
  </el-container>
</template>
<script>
import {
  getList,
  getObj as getVisualObj,
  addObj,
  updateObj,
  delObj,
  copyObj,
  uploadImg,
} from "@/api/visual";
import { createAsyncComponent } from "@/page/utils/asyncComponent";
import QRCode from "qrcode";

const importTip = createAsyncComponent(() => import("@/page/components/importTip.vue"));
const DEFAULT_COVER = "/img/bg/bg.png";

export default {
  name: "list",
  components: {
    importTip,
  },
  data() {
    return {
      search: {},
      screenList: [
        {
          label: "Desktop(默认)",
          width: 1920,
          height: 1080,
          icon: "desktop",
        },
        {
          label: "MacBook pro",
          width: 1440,
          height: 900,
          icon: "mac",
        },
        {
          label: "iPad pro",
          width: 1366,
          height: 1024,
          icon: "pad",
        },
        {
          label: "手机 Max",
          width: 430,
          height: 932,
          icon: "phone",
        },
        {
          label: "自定义",
          width: "-",
          height: "-",
          icon: "slot",
        },
      ],
      loading1: false,
      loading: false,
      index: -1,
      box: false,
      addColumn: [
        {
          label: "大屏名称",
          span: 24,
          prop: "title",
          rules: [
            {
              required: true,
              message: "请输入大屏名称",
              trigger: "blur",
            },
          ],
        },
        {
          label: "密码",
          span: 24,
          type: "password",
          labelWidth: 100,
          prop: "password",
        },
        {
          label: "大屏尺寸",
          span: 24,
          prop: "screen",
        },
        {
          label: "",
          span: 14,
          prop: "width",
          display: false,
          placeholder: "请输入宽度",
          rules: [
            {
              required: true,
              message: "请输入宽度",
              trigger: "blur",
            },
          ],
        },
        {
          label: "",
          span: 10,
          labelWidth: 1,
          display: false,
          prop: "height",
          placeholder: "请输入高度",
          rules: [
            {
              required: true,
              message: "请输入高度",
              trigger: "blur",
            },
          ],
        },
        {
          label: "缩略图",
          span: 24,
          prop: "backgroundUrl",
        },
      ],
      editColumn: [
        {
          label: "大屏名称",
          span: 24,
          prop: "title",
          rules: [
            {
              required: true,
              message: "请输入大屏名称",
              trigger: "blur",
            },
          ],
        },
        {
          label: "密码",
          span: 24,
          type: "password",
          labelWidth: 100,
          prop: "password",
        },
        {
          label: "发布状态",
          prop: "status",
          span: 24,
          type: "select",
          dicData: [
            {
              label: "未发布",
              value: 0,
            },
            {
              label: "已发布",
              value: 1,
            },
          ],
        },
        {
          label: "缩略图",
          span: 24,
          prop: "backgroundUrl",
        },
      ],
      option: {
        emptyBtn: false,
        submitBtn: false,
        labelWidth: 100,
        column: [],
      },
      page: {
        page: 1,
        size: 50,
        total: 0,
      },
      form: {},
      list: [],
      importBox: true,
      shareDialogVisible: false,
      shareItem: {},
      shareUrl: "",
    };
  },
  created() {
    this.getList();
  },
  computed: {
    isEdit() {
      return !!this.form.id;
    },
    screenActive() {
      let len = this.screenList.length;
      let index = this.screenList.findIndex(
        ele => ele.width == this.form.width && ele.height == this.form.height,
      );
      return index == -1 ? len - 1 : index;
    },
  },
  methods: {
    getAssetUrl(url) {
      const value = String(url || DEFAULT_COVER).replace(/^\/?public\//, "/");
      if (/^(https?:|data:|blob:)/.test(value)) return value;
      return value.startsWith("/") ? value : `/${value}`;
    },
    getVisualCover(item) {
      return this.getAssetUrl(item?.backgroundUrl || DEFAULT_COVER);
    },
    handleCoverError(event) {
      const target = event.target;
      if (target.dataset.fallback === "true") return;
      target.dataset.fallback = "true";
      target.src = this.getAssetUrl(DEFAULT_COVER);
    },
    handleImport() {
      this.$refs.importTip.box = true;
    },
    httpRequest(config) {
      this.loading1 = true;
      var formdata = new FormData();
      formdata.append("file", config.file);
      uploadImg(formdata).then(res => {
        const url = res.data.data.link;
        this.loading1 = false;
        this.form.backgroundUrl = url;
      });
    },
    handleExportConfig(item) {
      this.loading = true;
      getVisualObj(item.id)
        .then(res => {
          const data = res.data.data || {};
          const config = this.normalizeExportConfig(data.config);
          const title = config.detail.title || config.detail.name || item.title || `screen-${item.id}`;
          this.downloadJson(config, `${this.normalizeFileName(title)}.json`);
          this.$message.success("配置导出成功");
        })
        .catch(err => {
          console.error("导出配置失败:", err);
          this.$message.error(err?.message || "配置导出失败");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    normalizeExportConfig(config = {}) {
      const detail = this.parseJsonField(config.detail, {});
      const component = this.parseJsonField(config.component, []);

      if (!detail || Array.isArray(detail) || typeof detail !== "object") {
        throw new Error("大屏 detail 配置格式异常");
      }

      if (!Array.isArray(component)) {
        throw new Error("大屏 component 配置格式异常");
      }

      return {
        detail,
        component,
      };
    },
    parseJsonField(value, fallback) {
      if (value === undefined || value === null || value === "") return fallback;
      if (typeof value !== "string") return value;
      return JSON.parse(value.replace(/^\uFEFF/, ""));
    },
    normalizeFileName(name) {
      return String(name || "data")
        .trim()
        .replace(/[\\/:*?"<>|]/g, "_")
        .slice(0, 80) || "data";
    },
    downloadJson(data, fileName) {
      const blob = new Blob([JSON.stringify(data, null, 4)], {
        type: "application/json;charset=utf-8",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    handleCopy(item) {
      this.$confirm("确认复制当前大屏", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          copyObj(item.id).then(res => {
            this.$message.success("复制成功");
            const id = res.data.data;
            this.handleEdit({ id });
          });
        })
        .catch(() => {});
    },
    handleDel(item, index) {
      this.$confirm("是否确认永久删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          delObj(item.id).then(() => {
            this.list.splice(index, 1);
            this.$message.success("删除成功");
          });
        })
        .catch(() => {});
    },
    handleAdd() {
      this.form = {
        id: "",
        name: "",
        backgroundUrl: "",
        width: "1920",
        height: "1080",
      };
      this.option.column = this.addColumn;
      this.box = true;
    },
    handleUpdate(item, index) {
      this.form = item;
      this.index = index;
      this.option.column = this.editColumn;
      this.box = true;
    },
    handleSetScreen(item) {
      let column = this.option.column;
      let widthColumn = this.findObject(column, "width");
      let heightColumn = this.findObject(column, "height");
      widthColumn.display = false;
      heightColumn.display = false;
      if (item.width == "-" && item.height == "-") {
        widthColumn.display = true;
        heightColumn.display = true;
        this.form.width = "";
        this.form.height = "";
      } else {
        this.form.width = item.width;
        this.form.height = item.height;
      }
    },
    handleEdit(item) {
      let routeUrl = this.$router.resolve({
        path: "/build/" + item.id,
      });
      window.open(routeUrl.href, "_blank");
    },
    handleViews(item) {
      let routeUrl = this.$router.resolve({
        path: "/view/" + item.id,
      });
      window.open(routeUrl.href, "_blank");
    },
    handleSave(form, done) {
      if (this.isEdit) {
        updateObj(this.form).then(() => {
          done();
          this.box = false;
          this.$message.success("修改成功");
          this.getList();
        });
      } else {
        addObj(this.form).then(res => {
          const id = res.data.data.id;
          this.box = false;
          setTimeout(() => {
            this.handleEdit({ id });
          });
        });
      }
    },
    handleCurrentChange(val) {
      this.page.page = val;
      this.getList();
    },
    handleSizeChange(val) {
      this.page.size = val;
      this.getList();
    },
    getList() {
      this.loading = true;
      this.list = [];
      getList({
        title: this.search.name,
        current: this.page.page,
        size: this.page.size,
      }).then(res => {
        this.loading = false;
        const data = res.data.data;
        this.page.total = data.total;
        this.list = data.records;
      });
    },
    // 分享大屏
    handleShare(item) {
      this.shareItem = item;
      const routeUrl = this.$router.resolve({
        path: "/view/" + item.id,
      });
      this.shareUrl = window.location.origin + routeUrl.href;
      this.shareDialogVisible = true;
      this.$nextTick(() => {
        this.generateQrcode();
      });
    },
    // 生成二维码
    generateQrcode() {
      if (this.$refs.qrcodeCanvas && this.shareUrl) {
        QRCode.toCanvas(this.$refs.qrcodeCanvas, this.shareUrl, {
          width: 180,
          margin: 1,
          errorCorrectionLevel: "H",
        });
      }
    },
    // 复制分享地址
    copyShareUrl() {
      navigator.clipboard
        .writeText(this.shareUrl)
        .then(() => {
          this.$message.success("复制成功");
        })
        .catch(() => {
          // 降级方案
          const input = document.createElement("input");
          input.value = this.shareUrl;
          document.body.appendChild(input);
          input.select();
          document.execCommand("copy");
          document.body.removeChild(input);
          this.$message.success("复制成功");
        });
    },
    // 打开分享地址
    openShareUrl() {
      window.open(this.shareUrl, "_blank");
    },
  },
};
</script>

<style lang="scss" scoped>
.share-dialog {
  .share-content {
    padding: 10px 0;
  }

  .share-info {
    margin-bottom: 20px;
    text-align: center;
  }

  .share-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color-primary);
    margin-bottom: 8px;
  }

  .share-desc {
    font-size: 14px;
    color: var(--text-color-secondary);
  }

  .share-qrcode {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    border-radius: 8px;

    .qrcode-tip {
      margin-top: 12px;
      font-size: 13px;
      color: var(--text-color-secondary);
    }
  }

  .share-url-box {
    margin-bottom: 16px;

    :deep(.el-input-group__append) {
      padding: 0 15px;
    }
  }

  .share-tips {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-color-placeholder);
    padding: 10px 12px;
    background: var(--bg-color-secondary);
    border-radius: 4px;

    .el-icon {
      color: var(--primary-color);
    }
  }

}
</style>
