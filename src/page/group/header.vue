<template>
  <div class="head">
    <div class="head__brand">
      <div class="head_btn head_btn--plain head__home" @click="handleGoIndex">
        <el-tooltip effect="dark" content="首页" placement="bottom">
          <el-icon>
            <el-icon-home-filled></el-icon-home-filled>
          </el-icon>
        </el-tooltip>
      </div>
      <div class="head_info">
        <span class="head__title">{{ contain.config.title || "未命名" }}</span>
      </div>
    </div>

    <div class="head__center">
      <div class="head_group">
        <div
          class="head_btn"
          :class="{ 'head_btn--active': contain.menuShow }"
          @click="handleFlag('menuShow')">
          <el-tooltip effect="dark" content="图层" placement="bottom">
            <el-icon>
              <el-icon-operation></el-icon-operation>
            </el-icon>
          </el-tooltip>
        </div>
        <div
          class="head_btn"
          :class="{ 'head_btn--active': contain.paramsShow }"
          @click="handleFlag('paramsShow')">
          <el-tooltip effect="dark" content="操作" placement="bottom">
            <el-icon>
              <el-icon-setting></el-icon-setting>
            </el-icon>
          </el-tooltip>
        </div>
        <div class="head_btn">
          <ThemeSwitcher />
        </div>
      </div>

      <div class="head_group head_group--save">
        <div class="head_btn head_btn--text head_btn--primary" @click="handleSave(false)">
          <el-tooltip effect="dark" content="保存" placement="bottom">
            <span class="head_btn__inner">
              <i class="iconfont icon-save"></i>
              <span>保存</span>
            </span>
          </el-tooltip>
        </div>
        <el-popover
          v-model:visible="saveMoreVisible"
          placement="bottom-start"
          trigger="click"
          :width="170"
          popper-class="head-more-popper">
          <template #reference>
            <div class="head_btn head_btn--more">
              <el-icon>
                <el-icon-more-filled></el-icon-more-filled>
              </el-icon>
            </div>
          </template>
          <div class="head-more-menu">
            <div class="head-more-menu__item" @click="handleSaveWithSnapshot">
              <el-icon>
                <el-icon-camera></el-icon-camera>
              </el-icon>
              <span>保存并截图</span>
            </div>
          </div>
        </el-popover>
        <el-popconfirm title="是否清空当前画布?" @confirm="handleClear()">
          <template #reference>
            <div class="head_btn head_btn--text">
              <el-tooltip effect="dark" content="清空画布" placement="bottom">
                <span class="head_btn__inner">
                  <el-icon>
                    <el-icon-delete></el-icon-delete>
                  </el-icon>
                  <span>清空</span>
                </span>
              </el-tooltip>
            </div>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <div class="head_actions">
      <div class="head_group">
        <el-popconfirm title="是否导出当前截图?" :width="200" @confirm="handleImg()">
          <template #reference>
            <div class="head_btn head_btn--text">
              <el-tooltip effect="dark" content="导出截图" placement="bottom">
                <span class="head_btn__inner">
                  <el-icon>
                    <el-icon-camera></el-icon-camera>
                  </el-icon>
                  <span>截图</span>
                </span>
              </el-tooltip>
            </div>
          </template>
        </el-popconfirm>
        <div class="head_btn head_btn--text" @click="$refs.result.show = true">
          <el-tooltip effect="dark" content="导入导出" placement="bottom">
            <span class="head_btn__inner">
              <el-icon>
                <el-icon-download></el-icon-download>
              </el-icon>
              <span>配置</span>
            </span>
          </el-tooltip>
        </div>
      </div>

      <div class="head_group">
        <div
          class="head_btn head_btn--text"
          :class="{ 'head_btn--active': !contain.menuFlag }"
          @click="handlePreviewToggle">
          <el-tooltip
            effect="dark"
            :content="contain.menuFlag ? '预览' : '还原'"
            placement="bottom">
            <span class="head_btn__inner">
              <i :class="['iconfont', contain.menuFlag ? 'icon-view' : 'icon-reset']"></i>
              <span>{{ contain.menuFlag ? "预览" : "还原" }}</span>
            </span>
          </el-tooltip>
        </div>
        <div class="head_btn head_btn--text head_btn--primary" @click="handleShare">
          <el-tooltip effect="dark" content="发布" placement="bottom">
            <span class="head_btn__inner">
              <el-icon>
                <el-icon-share></el-icon-share>
              </el-icon>
              <span>发布</span>
            </span>
          </el-tooltip>
        </div>
      </div>
    </div>

    <result ref="result"></result>
    <share ref="share"></share>
  </div>
</template>

<script>
import { dataURLtoFile } from "@/utils/utils";
import html2canvas from "html2canvas-pro";
import result from "./result.vue";
import { uploadImg, updateComponent } from "@/api/visual";
import share from "./share.vue";
import ThemeSwitcher from "../components/ThemeSwitcher.vue";

export default {
  inject: ["contain"],
  components: {
    result,
    share,
    ThemeSwitcher,
  },
  data() {
    return {
      loading: null,
      minWidth: 0,
      maxWidth: 0,
      selectDialog: {
        visible: false,
        id: "",
      },
      saveMoreVisible: false,
      autoSaveTimer: null,
      autoSavePending: false,
    };
  },
  created() {
    const autoSave = this.$website.autoSave;
    if (autoSave?.enabled) {
      this.autoSaveTimer = setInterval(() => {
        if (this.autoSavePending) return;
        this.autoSavePending = true;
        this.handleBuild({ tip: false }).finally(() => {
          this.autoSavePending = false;
        });
      }, autoSave.interval);
    }
  },
  beforeUnmount() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  },
  methods: {
    handleGoIndex() {
      this.$router.push({ path: "/" });
    },
    handleClear() {
      this.contain.nav = [];
      this.$message.success("画布清空成功");
    },
    handleReset() {
      this.contain.menuFlag = true;
      this.handleSet();
    },
    handlePreviewToggle() {
      if (this.contain.menuFlag) {
        this.handleView();
      } else {
        this.handleReset();
      }
    },
    handleFlag(name) {
      this.contain[name] = !this.contain[name];
      this.handleSet();
    },
    handleView() {
      this.contain.menuFlag = false;
      this.handleSet();
    },
    handleSet(select = true) {
      this.$nextTick(() => {
        if (select) this.contain.handleInitActive();
        if (!this.contain.$refs.screensRef) return;
        const screensRect = this.contain.$refs.screensRef.getBoundingClientRect();
        if (screensRect.width) this.contain.setScale(screensRect.width);
      });
    },
    handleSave(flag) {
      if (!flag) {
        return this.handleBuild();
      }
      this.loading = this.$loading({
        lock: true,
        text: "正在保存配置，请稍后",
        spinner: "el-icon-loading",
        background: "var(--color-overlay)",
      });
      this.exportImg().then(canvas => {
        const file = dataURLtoFile(
          canvas.toDataURL("image/jpeg", 0.1),
          this.contain.config.title + ".jpg",
        );
        const formdata = new FormData();
        formdata.append("file", file);
        uploadImg(formdata).then(res => {
          const url = res.data.data.link;
          this.handleBuild({ url });
        });
      });
    },
    handleSaveWithSnapshot() {
      this.saveMoreVisible = false;
      this.handleSave(true);
    },
    handleBuild(params = {}) {
      const { fn, tip = true, init = false, url } = params;
      if (init) this.contain.handleInitActive();
      if (tip) {
        this.loading = this.$loading({
          lock: true,
          text: "正在保存配置，请稍后",
          spinner: "el-icon-loading",
          background: "var(--color-overlay)",
        });
      }
      const formdata = {
        visual: {
          id: this.contain.id,
          backgroundUrl: url || this.contain.config.backgroundUrl,
        },
        config: {
          id: this.contain.visualId,
          visualId: this.contain.id,
          detail: JSON.stringify(this.contain.config),
          component: JSON.stringify(this.contain.nav),
        },
      };
      return updateComponent(formdata)
        .then(() => {
          if (fn && typeof fn === "function") {
            fn();
          } else if (tip) {
            this.$message.success("大屏配置保存成功");
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("大屏配置保存失败");
        })
        .finally(() => {
          this.loading && this.loading.close();
        });
    },
    exportImg() {
      return new Promise((resolve, reject) => {
        html2canvas(document.querySelector(".canvas"), {
          useCORS: true,
          backgroundColor: null,
          logging: false,
          allowTaint: true,
        })
          .then(canvas => {
            resolve(canvas);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    handleImg() {
      this.exportImg()
        .then(canvas => {
          this.downFile(canvas.toDataURL("image/jpeg", 0.8), this.contain.config.title + ".jpg");
          this.$message.success("图片导出成功");
        })
        .catch(() => {
          this.$message.error("图片导出失败");
        });
    },
    handleShare() {
      this.$refs.share.handleShow();
    },
  },
};
</script>

<style lang="scss">
@mixin inline-center {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-center {
  display: flex;
  align-items: center;
}

@mixin text-ellipsis {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.head_btn {
  width: 40px;
  height: 24px;
  margin-left: 4px;
  cursor: pointer;
  line-height: 26px;
  text-align: center;
  background: var(--bg-color-tertiary);
  transition: 0.2s;

  i {
    color: var(--text-color-primary);
  }

  &--active {
    background-color: var(--primary-color);
  }
}

.head {
  @include flex-center;
  position: relative;
  z-index: 100;
  box-sizing: border-box;
  height: 46px;
  min-width: 0;
  padding: 0 8px;
  overflow: hidden;
  color: #d7dce7;
  user-select: none;
  border-bottom: 1px solid #262a33;
  background: #111318;
  box-shadow: none;

  .head_btn {
    @include inline-center;
    width: 36px;
    min-width: 34px;
    height: 30px;
    margin-left: 0;
    box-sizing: border-box;
    flex-shrink: 0;
    color: #9da5b4;
    line-height: 30px;
    border: 0;
    border-radius: 3px;
    background: transparent;
    box-shadow: none;
    transform: none;
    transition:
      color 0.18s ease,
      background 0.18s ease,
      border-color 0.18s ease,
      transform 0.18s ease;

    i,
    .el-icon {
      color: inherit;
      font-size: 16px;
    }

    &:hover {
      color: #e8edf7;
      background: #222733;
      border-color: transparent;
      transform: none;
    }

    &--active {
      color: #3f8cff;
      background: #1d2738;
      border-color: transparent;
    }

    &--plain {
      background: transparent;
    }

    &--text {
      width: auto;
      min-width: 58px;
      gap: 8px;
      padding: 0 9px;
    }

    &--primary {
      color: #f5f8ff;
      background: #1f5eff;

      &:hover {
        color: #fff;
        background: #276bff;
        border-color: transparent;
      }
    }

    &--more {
      width: 34px;
      min-width: 34px;
    }
  }

  .theme-switcher {
    @include inline-center;
    width: 100%;
    height: 100%;
    color: inherit;
  }
}

.head__brand,
.head_info,
.head__center,
.head_actions,
.sync-users,
.sync-list__item,
.sync-list__name {
  @include flex-center;
}

.head__brand {
  min-width: 0;
  flex: 0 0 290px;
  gap: 8px;
}

.head__home {
  width: 30px !important;
  color: #8d95a3 !important;

  &:hover {
    color: #fff !important;
  }
}

.head_info {
  min-width: 0;
  gap: 8px;
  cursor: default;
}

.head__title {
  @include text-ellipsis;
  display: block;
  max-width: 145px;
  color: #e8edf7;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
}

.head__center,
.head_actions {
  min-width: 0;
  gap: 8px;
}

.head__center {
  flex: 1 1 auto;
  justify-content: flex-start;
  overflow: hidden;
}

.head_actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  overflow: visible;
}

.head_group {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  height: 30px;
  gap: 2px;
  padding: 0 6px;
  flex-shrink: 0;
  border-left: 1px solid #262a33;
  border-radius: 0;

  &:first-child {
    padding-left: 0;
    border-left: 0;
  }
}

.head_btn__inner {
  @include inline-center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}

.head-more-popper.el-popper {
  padding: 6px;
  border: 1px solid #30343e;
  border-radius: 4px;
  background: #4a4b52;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.32);

  .el-popper__arrow::before {
    background: #4a4b52;
    border-color: #30343e;
  }
}

.head-more-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.head-more-menu__item {
  @include flex-center;
  height: 34px;
  gap: 10px;
  padding: 0 10px;
  color: #f0f2f7;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  border-radius: 3px;

  .el-icon {
    color: #d6d9e0;
    font-size: 16px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.09);
  }
}

.sync-users {
  gap: 2px;
  padding: 0;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.2s;

  &:hover {
    background: transparent;
  }
}

.sync-avatar {
  @include inline-center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--text-color-primary);
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  border: 1px solid;
  border-radius: 50%;

  &--more {
    border-color: var(--text-color-secondary);
    background: var(--bg-color-tertiary) !important;
  }
}

.sync-list {
  &__item {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-color-lighter);
    transition: background 0.15s;

    &:hover {
      background: var(--bg-color-hover);
    }
  }

  &__avatar {
    @include inline-center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    margin-right: 10px;
    color: var(--text-color-primary);
    font-size: 14px;
    font-weight: bold;
    border: 2px solid;
    border-radius: 50%;
  }

  &__info {
    min-width: 0;
    flex: 1;
  }

  &__name {
    color: var(--text-color-primary);
    font-size: 13px;
    font-weight: 500;
  }

  &__status {
    margin-top: 2px;
    font-size: 11px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    margin-left: 8px;
    border-radius: 50%;
  }

  &__empty {
    padding: 40px 0;
    color: var(--text-color-secondary);
    font-size: 13px;
    text-align: center;
  }
}

@media (max-width: 1440px) {
  .head {
    padding: 0 8px;

    .head_btn--text {
      min-width: 52px;
      padding: 0 8px;
    }
  }

  .head__brand {
    flex-basis: 160px;
  }

  .head__title {
    max-width: 112px;
  }
}

@media (max-width: 1180px) {
  .head {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .head__center,
  .head_actions {
    overflow: visible;
  }
}
</style>
