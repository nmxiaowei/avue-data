<template>
  <el-dialog title="发布" append-to-body class="avue-dialog" v-model="box" width="70%">
    <div class="avue-flex" style="align-items: flex-start">
      <avue-form :option="option" v-model="form" ref="form" @submit="handleSubmit">
        <template #href="{}">
          <el-input v-model="form.href" disabled> </el-input>
          <div class="share-actions">
            <span @click="handleView">访问地址</span>
            <span @click="handleCopy">复制地址</span>
            <span @click="showQrcode = !showQrcode">{{ showQrcode ? "隐藏" : "显示" }}二维码</span>
            <span @click="showIframe = !showIframe"
              >{{ showIframe ? "隐藏" : "显示" }}嵌入代码</span
            >
          </div>
          <div class="share-qrcode" v-if="showQrcode">
            <qrcode-vue
              ref="qrcodeRef"
              :value="form.href"
              :size="180"
              level="H"
              render-as="canvas" />
            <div class="qrcode-tip">扫一扫，手机预览</div>
            <div class="share-actions share-actions--center">
              <span @click="handleDownloadQrcode">下载二维码</span>
              <span @click="handleCopyShareConfig">复制配置说明</span>
            </div>
          </div>
          <div class="share-iframe-section" v-if="showIframe">
            <el-input v-model="iframeCode" type="textarea" :rows="3" disabled> </el-input>
            <div class="share-actions">
              <span @click="handleCopyIframe">复制嵌入代码</span>
            </div>
          </div>
          <div class="share-config-section">
            <div class="share-label">分享配置说明</div>
            <div class="share-config-grid">
              <div v-for="item in shareConfigItems" :key="item.label" class="share-config-item">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </div>
        </template>
      </avue-form>
    </div>
    <span class="avue-dialog__footer avue-dialog__footer--center">
      <el-button type="primary" icon="el-icon-check" @click="$refs.form.submit()"
        >保存大屏</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { updateObj } from "@/api/visual";
import QrcodeVue from "qrcode.vue";

export default {
  inject: ["contain"],
  provide() {
    return {
      parent: this,
    };
  },
  components: {
    QrcodeVue,
  },
  data() {
    return {
      box: false,
      showQrcode: false,
      showIframe: false,
      form: {},
      visual: {},
      option: {
        emptyBtn: false,
        submitBtn: false,
        span: 24,
        column: [
          {
            label: "大屏名称",
            prop: "title",
          },
          {
            label: "发布",
            prop: "status",
            type: "switch",
            dicData: [
              {
                label: "",
                value: 0,
              },
              {
                label: "",
                value: 1,
              },
            ],
          },
          {
            label: "链接",
            prop: "href",
          },
        ],
      },
    };
  },
  computed: {
    viewUrl() {
      return `${window.location.origin}${this.$router.options.base}view/${this.visual.id}`;
    },
    iframeUrl() {
      return `${window.location.origin}${this.$router.options.base}view.html?id=${this.visual.id}`;
    },
    iframeCode() {
      return `<iframe src="${this.iframeUrl}" width="100%" height="100%" frameborder="0" allowfullscreen style="border:none;outline:none;"></iframe>`;
    },
    shareConfigItems() {
      return [
        { label: "访问地址", value: this.form.href || "-" },
      ];
    },
  },
  methods: {
    handleShow() {
      this.box = true;
      let visual = this.contain.config;
      this.visual = visual;
      this.form.title = visual.title;
      this.form.status = visual.status;
      this.form.href = this.viewUrl;
    },
    handleView() {
      window.open(this.viewUrl, "_blank");
    },
    handleCopy() {
      this.$Clipboard({
        text: this.form.href,
      }).then(() => {
        this.$message.success("链接复制成功");
      });
    },
    handleCopyIframe() {
      this.$Clipboard({
        text: this.iframeCode,
      }).then(() => {
        this.$message.success("嵌入代码复制成功");
      });
    },
    handleDownloadQrcode() {
      this.showQrcode = true;
      this.$nextTick(() => {
        const canvas = document.querySelector(".share-qrcode canvas");
        if (!canvas) {
          this.$message.warning("二维码未生成");
          return;
        }
        const link = document.createElement("a");
        link.download = `${this.form.title || "大屏"}-二维码.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    },
    handleCopyShareConfig() {
      const text = this.shareConfigItems.map(item => `${item.label}: ${item.value}`).join("\n");
      this.$Clipboard({
        text,
      }).then(() => {
        this.$message.success("分享配置已复制");
      });
    },
    handleSubmit(form, done) {
      updateObj({
        id: this.visual.id,
        status: this.form.status,
        title: this.form.title,
        expireEnabled: false,
        expireType: "",
        expireDate: "",
        expireTime: null,
      }).then(() => {
        this.contain.config = Object.assign(this.contain.config, this.form, {
          expireEnabled: false,
          expireType: "",
          expireDate: "",
          expireTime: null,
        });
        this.$parent.handleBuild({
          fn: () => {
            done();
            this.$message.success("大屏设置成功");
          },
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.share-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;

  :is(span) {
    color: var(--primary-color);
    cursor: pointer;
    font-size: 13px;

    &:hover {
      color: var(--primary-hover-color);
    }
  }

  &--center {
    justify-content: center;
  }
}

.share-qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  padding: 20px;
  border-radius: 8px;
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color-lighter);

  .qrcode-tip {
    margin-top: 12px;
    font-size: 13px;
    color: var(--text-color-secondary);
  }
}

.share-label {
  font-size: 14px;
  color: var(--text-color-regular);
  margin-bottom: 8px;
  font-weight: 500;
}

.share-iframe-section {
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color-lighter);
  border-radius: 6px;
}

.share-config-section {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 6px;
  background: var(--bg-color-secondary);
}

.share-config-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.share-config-item {
  min-width: 0;
  padding: 8px 10px;
  border-radius: 4px;
  background: var(--bg-color-tertiary);

  span {
    display: block;
    color: var(--text-color-secondary);
    font-size: 12px;
    line-height: 18px;
  }

  strong {
    display: block;
    min-width: 0;
    margin-top: 3px;
    overflow: hidden;
    color: var(--text-color-primary);
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (max-width: 768px) {
  .share-config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
