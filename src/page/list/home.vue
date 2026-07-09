<template>
  <div class="home-page" v-loading="loading" v-bind="$loadingParams">
    <section class="home-showcase">
      <div class="home-showcase__content">
        <span class="home-kicker">AVUE DATA OPEN SOURCE</span>
        <h1>数据大屏可视化工作台</h1>
        <p>面向数据展示、业务驾驶舱和可视化编排场景，快速完成大屏设计、资源维护、预览发布。</p>

        <div class="home-showcase__actions">
          <el-button type="primary" @click="openPrimaryScreen('preview')">预览示例</el-button>
          <el-button @click="openPrimaryScreen('edit')">编辑大屏</el-button>
          <el-button text @click="goPage('/list')">项目管理</el-button>
        </div>

        <div class="home-metrics">
          <div class="home-metric" v-for="item in metricList" :key="item.label">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="home-stage">
        <div class="home-stage__toolbar">
          <span></span>
          <span></span>
          <span></span>
          <em>Visual Canvas</em>
        </div>
        <div class="home-stage__screen">
          <img :src="showcaseCover" alt="" @error="handleCoverError" />
          <i class="home-stage__scan"></i>
          <div class="home-stage__panel home-stage__panel--left">
            <strong>{{ primaryScreen.title || "开源版示例大屏" }}</strong>
            <span>{{ primaryScreen.width || 1920 }} x {{ primaryScreen.height || 1080 }}</span>
          </div>
          <div class="home-stage__panel home-stage__panel--right">
            <strong>{{ publishedScreens }}</strong>
            <span>已发布</span>
          </div>
        </div>
      </div>
    </section>

    <section class="home-actions">
      <button
        class="home-action"
        v-for="item in actionList"
        :key="item.title"
        type="button"
        @click="goPage(item.path)">
        <span class="home-action__index">{{ item.index }}</span>
        <span class="home-action__body">
          <strong>{{ item.title }}</strong>
          <em>{{ item.desc }}</em>
        </span>
      </button>
    </section>

    <section class="home-flow">
      <div class="home-flow__title">
        <span class="home-kicker">DESIGN FLOW</span>
        <h2>从组件编排到发布预览，一屏完成</h2>
      </div>
      <div class="home-flow__items">
        <div class="home-flow__item" v-for="item in flowList" :key="item">
          {{ item }}
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getList as getVisualList } from "@/api/visual";
import { getList as getFileList } from "@/api/file";

const DEFAULT_COVER = "/img/bg/bg.png";

export default {
  name: "home",
  data() {
    return {
      loading: false,
      screenList: [],
      totalScreens: 0,
      publishedScreens: 0,
      fileTotal: 0,
      actionList: [
        {
          index: "01",
          title: "大屏管理",
          desc: "创建、复制、导入和导出大屏项目",
          path: "/list",
        },
        {
          index: "02",
          title: "资源管理",
          desc: "维护图片、背景和静态资源文件",
          path: "/file",
        },
        {
          index: "03",
          title: "运行配置",
          desc: "调整应用标题、接口和运行参数",
          path: "/config",
        },
      ],
      flowList: ["拖拽组件", "图表配置", "多屏编排", "滤镜水印", "导入导出", "发布预览"],
    };
  },
  computed: {
    primaryScreen() {
      return (
        this.screenList.find(item => item.id === "screen-demo" || item.title === "开源版示例大屏") ||
        this.screenList[0] ||
        {}
      );
    },
    showcaseCover() {
      return this.getCoverUrl(this.primaryScreen);
    },
    metricList() {
      return [
        {
          label: "大屏项目",
          value: this.totalScreens,
        },
        {
          label: "已发布",
          value: this.publishedScreens,
        },
        {
          label: "静态资源",
          value: this.fileTotal,
        },
      ];
    },
  },
  created() {
    this.loadHomeData();
  },
  methods: {
    async loadHomeData() {
      this.loading = true;
      try {
        const [visualRes, fileRes] = await Promise.all([
          getVisualList({ current: 1, size: 6 }),
          getFileList({ current: 1, size: 1 }),
        ]);
        const visualData = visualRes.data.data || {};
        const records = Array.isArray(visualData.records) ? visualData.records : [];
        this.screenList = records;
        this.totalScreens = Number(visualData.total || records.length || 0);
        this.publishedScreens = records.filter(item => Number(item.status) === 1).length;

        const fileData = fileRes.data.data || {};
        this.fileTotal = Number(fileData.total || 0);
      } catch (error) {
        this.$message.error(error?.message || "首页数据加载失败");
      } finally {
        this.loading = false;
      }
    },
    getAssetUrl(url) {
      const value = String(url || DEFAULT_COVER).replace(/^\/?public\//, "/");
      if (/^(https?:|data:|blob:)/.test(value)) return value;
      return value.startsWith("/") ? value : `/${value}`;
    },
    getCoverUrl(item) {
      return this.getAssetUrl(item?.backgroundUrl || DEFAULT_COVER);
    },
    handleCoverError(event) {
      const target = event.target;
      if (target.dataset.fallback === "true") return;
      target.dataset.fallback = "true";
      target.src = this.getAssetUrl(DEFAULT_COVER);
    },
    goPage(path) {
      this.$router.push({ path });
    },
    openPrimaryScreen(type) {
      if (!this.primaryScreen.id) {
        this.goPage("/list");
        return;
      }
      if (type === "edit") {
        this.openEditor(this.primaryScreen);
        return;
      }
      this.openPreview(this.primaryScreen);
    },
    openEditor(item) {
      const routeUrl = this.$router.resolve({ path: `/build/${item.id}` });
      window.open(routeUrl.href, "_blank");
    },
    openPreview(item) {
      const routeUrl = this.$router.resolve({ path: `/view/${item.id}` });
      window.open(routeUrl.href, "_blank");
    },
  },
};
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100%;
  padding: 24px;
  box-sizing: border-box;
  background:
    linear-gradient(115deg, rgba(8, 145, 178, 0.22), transparent 32%),
    linear-gradient(245deg, rgba(245, 158, 11, 0.16), transparent 34%),
    linear-gradient(135deg, #070b14 0%, #101827 52%, #171323 100%);
  color: #f8fafc;
}

.home-showcase {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(420px, 1.08fr);
  gap: 30px;
  overflow: hidden;
  min-height: 430px;
  padding: 34px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(34, 211, 238, 0.18), transparent 28%, rgba(245, 158, 11, 0.12)),
    linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(17, 24, 39, 0.74)),
    linear-gradient(90deg, rgba(6, 182, 212, 0.12), rgba(245, 158, 11, 0.08));
  background-size: auto, 28px 28px, 28px 28px, auto, auto;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.36);
}

.home-showcase__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.home-kicker {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border: 1px solid rgba(45, 212, 191, 0.28);
  border-radius: 8px;
  background: rgba(20, 184, 166, 0.1);
  color: #67e8f9;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
}

.home-showcase h1 {
  max-width: 560px;
  margin: 18px 0 0;
  color: #ffffff;
  font-size: 44px;
  line-height: 1.12;
}

.home-showcase p {
  max-width: 520px;
  margin: 16px 0 0;
  color: #cbd5e1;
  font-size: 15px;
  line-height: 1.8;
}

.home-showcase__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.home-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  max-width: 520px;
  margin-top: 32px;
}

.home-metric {
  min-width: 0;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.62);
}

.home-metric strong,
.home-metric span {
  display: block;
}

.home-metric strong {
  font-size: 28px;
  line-height: 1;
}

.home-metric span {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}

.home-stage {
  position: relative;
  z-index: 1;
  align-self: center;
  overflow: hidden;
  border: 1px solid rgba(125, 211, 252, 0.28);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.74);
  box-shadow: 0 22px 60px rgba(8, 47, 73, 0.46);
}

.home-stage__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.94);
}

.home-stage__toolbar span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fb7185;
}

.home-stage__toolbar span:nth-child(2) {
  background: #facc15;
}

.home-stage__toolbar span:nth-child(3) {
  background: #34d399;
}

.home-stage__toolbar em {
  margin-left: auto;
  color: #94a3b8;
  font-size: 12px;
  font-style: normal;
}

.home-stage__screen {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  min-height: 260px;
  background:
    linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    #07111f;
  background-size: 24px 24px;
}

.home-stage__screen img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.92;
}

.home-stage__scan {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(103, 232, 249, 0.2) 48%, transparent 100%);
  transform: translateY(-100%);
  animation: home-scan 4.8s linear infinite;
  pointer-events: none;
}

.home-stage__panel {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(12px);
}

.home-stage__panel strong {
  color: #ffffff;
  font-size: 14px;
}

.home-stage__panel span {
  color: #67e8f9;
  font-size: 12px;
}

.home-stage__panel--left {
  left: 18px;
  bottom: 18px;
  max-width: calc(100% - 150px);
}

.home-stage__panel--right {
  right: 18px;
  top: 18px;
  min-width: 76px;
  text-align: center;
}

.home-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.home-action {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.72);
  color: #f8fafc;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.home-action:hover {
  border-color: rgba(103, 232, 249, 0.5);
  background: rgba(30, 41, 59, 0.82);
  transform: translateY(-2px);
}

.home-action__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0891b2, #7c3aed);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.home-action__body {
  min-width: 0;
}

.home-action__body strong,
.home-action__body em {
  display: block;
}

.home-action__body strong {
  font-size: 15px;
}

.home-action__body em {
  margin-top: 6px;
  color: #94a3b8;
  font-size: 12px;
  font-style: normal;
}

.home-flow {
  display: grid;
  grid-template-columns: minmax(0, 0.86fr) minmax(300px, 1.14fr);
  gap: 24px;
  margin-top: 16px;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(21, 94, 117, 0.22), rgba(88, 28, 135, 0.16));
}

.home-flow__title h2 {
  margin: 16px 0 0;
  color: #ffffff;
  font-size: 24px;
  line-height: 1.35;
}

.home-flow__items {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.home-flow__item {
  min-width: 0;
  padding: 16px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.52);
  color: #e2e8f0;
  font-size: 13px;
  text-align: center;
}

@keyframes home-scan {
  0% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(100%);
  }
}

@media (max-width: 1100px) {
  .home-showcase,
  .home-flow {
    grid-template-columns: 1fr;
  }

  .home-showcase {
    min-height: 0;
  }
}

@media (max-width: 760px) {
  .home-page {
    padding: 12px;
  }

  .home-showcase {
    padding: 20px;
  }

  .home-showcase h1 {
    font-size: 32px;
  }

  .home-metrics,
  .home-actions,
  .home-flow__items {
    grid-template-columns: 1fr;
  }

  .home-stage__panel--left {
    max-width: calc(100% - 36px);
  }
}
</style>
