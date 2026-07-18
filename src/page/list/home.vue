<template>
  <div class="home-page" v-loading="loading" v-bind="$loadingParams">
    <header class="home-commandbar">
      <button class="home-brand" type="button" @click="goPage('/list')">
        <span class="home-brand__mark"><i></i><i></i><i></i></span>
        <span>
          <strong>AVUE DATA</strong>
          <em>DIGITAL COMMAND CENTER</em>
        </span>
      </button>
      <div class="home-system-status">
        <i></i>
        <span>SYSTEM ONLINE</span>
        <em>OPEN SOURCE</em>
      </div>
      <button class="home-commandbar__enter" type="button" @click="goPage('/list')">
        进入项目管理 <i class="iconfont icon-right"></i>
      </button>
    </header>

    <section class="home-showcase">
      <div class="home-showcase__content">
        <span class="home-kicker">IMMERSIVE DATA SPACE</span>
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

        <div class="home-scanner">
          <div class="home-scanner__head">
            <span>MODULE SCANNER</span>
            <i></i>
          </div>
          <div class="home-scanner__body">
            <span>01</span>
            <div>
              <strong>可视化设计</strong>
              <em>拖拽组件，配置图表，发布预览</em>
            </div>
          </div>
          <button type="button" @click="goPage('/list')">ENTER PROJECTS <i class="iconfont icon-right"></i></button>
        </div>
      </div>

      <div class="home-overview">
        <div class="home-overview__header">
          <div>
            <span class="home-kicker">WORKSPACE PULSE</span>
            <h2>项目速览</h2>
          </div>
          <el-button text type="primary" @click="goPage('/list')">全部项目</el-button>
        </div>

        <div class="home-overview__summary">
          <div>
            <span>已发布</span>
            <strong>{{ publishedScreens }}</strong>
          </div>
          <div>
            <span>静态资源</span>
            <strong>{{ fileTotal }}</strong>
          </div>
          <div>
            <span>待编辑</span>
            <strong>{{ Math.max(totalScreens - publishedScreens, 0) }}</strong>
          </div>
        </div>

        <div class="home-overview__projects">
          <div class="home-overview__title">
            <span>最近项目</span>
            <em>{{ recentScreenList.length }} / {{ totalScreens || 0 }}</em>
          </div>
          <template v-if="recentScreenList.length">
            <button
              v-for="item in recentScreenList"
              :key="item.id"
              class="home-overview__project"
              type="button"
              @click="openEditor(item)">
              <span class="home-overview__project-icon"><i class="iconfont icon-monitor"></i></span>
              <span class="home-overview__project-info">
                <strong>{{ getScreenTitle(item) }}</strong>
                <em>{{ item.width || 1920 }} × {{ item.height || 1080 }}</em>
              </span>
              <span class="home-overview__project-status" :class="{ 'is-published': Number(item.status) === 1 }">
                {{ getScreenStatus(item) }}
              </span>
            </button>
          </template>
          <div v-else class="home-overview__empty">
            <span>还没有大屏项目</span>
            <el-button type="primary" size="small" @click="goPage('/list')">去创建</el-button>
          </div>
        </div>

        <div class="home-overview__tip">
          <i class="iconfont icon-info"></i>
          <span>从最近项目进入编辑器，继续拖拽组件、配置数据并预览发布。</span>
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
    recentScreenList() {
      return this.screenList.slice(0, 4);
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
    getScreenTitle(item) {
      return item?.title || item?.name || "未命名大屏";
    },
    getScreenStatus(item) {
      return Number(item?.status) === 1 ? "已发布" : "编辑中";
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

.home-commandbar {
  display: flex;
  align-items: center;
  min-height: 54px;
  margin-bottom: 16px;
  padding: 0 18px;
  border: 1px solid rgba(125, 211, 252, 0.2);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.7);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.18);
}

.home-brand,
.home-commandbar__enter {
  display: inline-flex;
  align-items: center;
  border: 0;
  background: transparent;
  color: #f8fafc;
  cursor: pointer;
}

.home-brand {
  gap: 10px;
  padding: 0;
  text-align: left;
}

.home-brand__mark {
  display: flex;
  align-items: end;
  gap: 3px;
  height: 18px;
}

.home-brand__mark i {
  width: 3px;
  border-radius: 2px;
  background: #67e8f9;
  box-shadow: 0 0 10px rgba(103, 232, 249, 0.6);
}

.home-brand__mark i:nth-child(1) {
  height: 8px;
}

.home-brand__mark i:nth-child(2) {
  height: 14px;
}

.home-brand__mark i:nth-child(3) {
  height: 18px;
}

.home-brand strong,
.home-brand em {
  display: block;
}

.home-brand strong {
  font-size: 14px;
  letter-spacing: 1px;
}

.home-brand em {
  margin-top: 2px;
  color: #64748b;
  font-size: 9px;
  font-style: normal;
  letter-spacing: 0.6px;
}

.home-system-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-left: auto;
  color: #94a3b8;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.home-system-status > i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.12);
}

.home-system-status em {
  padding-left: 7px;
  border-left: 1px solid rgba(148, 163, 184, 0.24);
  color: #67e8f9;
  font-size: 10px;
  font-style: normal;
}

.home-commandbar__enter {
  gap: 6px;
  margin-left: 22px;
  padding: 7px 10px;
  border: 1px solid rgba(103, 232, 249, 0.32);
  border-radius: 5px;
  color: #a5f3fc;
  font-size: 12px;
}

.home-commandbar__enter:hover {
  border-color: #67e8f9;
  background: rgba(34, 211, 238, 0.1);
}

.home-showcase {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
  gap: 20px;
  overflow: hidden;
  min-height: 360px;
  padding: 28px;
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

.home-scanner {
  max-width: 520px;
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(103, 232, 249, 0.22);
  border-left-color: #22d3ee;
  background: rgba(2, 6, 23, 0.48);
}

.home-scanner__head,
.home-scanner__body {
  display: flex;
  align-items: center;
}

.home-scanner__head {
  justify-content: space-between;
  color: #67e8f9;
  font-size: 10px;
  letter-spacing: 1.2px;
}

.home-scanner__head i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22d3ee;
  animation: home-status 1.6s ease-in-out infinite;
}

.home-scanner__body {
  gap: 10px;
  margin-top: 8px;
}

.home-scanner__body > span {
  color: #fbbf24;
  font-size: 22px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.home-scanner__body strong,
.home-scanner__body em {
  display: block;
}

.home-scanner__body strong {
  color: #e2e8f0;
  font-size: 13px;
}

.home-scanner__body em {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 11px;
  font-style: normal;
}

.home-scanner button {
  margin-top: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #67e8f9;
  font-size: 10px;
  letter-spacing: 0.8px;
  cursor: pointer;
}

.home-scanner button:hover {
  color: #ffffff;
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

.home-overview {
  z-index: 1;
  align-self: stretch;
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 22px;
  border: 1px solid rgba(125, 211, 252, 0.28);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.74);
  box-shadow: 0 22px 60px rgba(8, 47, 73, 0.3);
}

.home-overview__header,
.home-overview__title,
.home-overview__project,
.home-overview__tip,
.home-overview__empty {
  display: flex;
  align-items: center;
}

.home-overview__header,
.home-overview__title {
  justify-content: space-between;
  gap: 12px;
}

.home-overview__header h2 {
  margin: 12px 0 0;
  color: #ffffff;
  font-size: 24px;
  line-height: 1.2;
}

.home-overview__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 22px;
}

.home-overview__summary > div {
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.58);
}

.home-overview__summary span,
.home-overview__summary strong {
  display: block;
}

.home-overview__summary span,
.home-overview__title em,
.home-overview__project-info em {
  overflow: hidden;
  color: #94a3b8;
  font-size: 11px;
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-overview__summary strong {
  margin-top: 6px;
  color: #67e8f9;
  font-size: 24px;
  font-variant-numeric: tabular-nums;
}

.home-overview__projects {
  flex: 1;
  min-height: 0;
  margin-top: 20px;
}

.home-overview__title {
  margin-bottom: 8px;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
}

.home-overview__project {
  width: 100%;
  gap: 10px;
  padding: 11px 0;
  border: 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  background: transparent;
  color: #f8fafc;
  text-align: left;
  cursor: pointer;
}

.home-overview__project:hover .home-overview__project-info strong {
  color: #67e8f9;
}

.home-overview__project-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: rgba(34, 211, 238, 0.12);
  color: #67e8f9;
  font-size: 14px;
}

.home-overview__project-info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.home-overview__project-info strong {
  overflow: hidden;
  font-size: 13px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-overview__project-status {
  flex: 0 0 auto;
  padding: 3px 6px;
  border: 1px solid rgba(251, 191, 36, 0.28);
  border-radius: 4px;
  color: #fbbf24;
  font-size: 10px;
}

.home-overview__project-status.is-published {
  border-color: rgba(52, 211, 153, 0.3);
  color: #6ee7b7;
}

.home-overview__empty {
  justify-content: space-between;
  gap: 12px;
  min-height: 126px;
  padding: 0 12px;
  border: 1px dashed rgba(148, 163, 184, 0.28);
  border-radius: 6px;
  color: #94a3b8;
  font-size: 12px;
}

.home-overview__tip {
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.6;
}

.home-overview__tip i {
  color: #67e8f9;
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

@keyframes home-status {
  50% {
    opacity: 0.3;
    transform: scale(0.7);
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

  .home-commandbar {
    padding: 0 12px;
  }

  .home-system-status {
    display: none;
  }

  .home-commandbar__enter {
    margin-left: auto;
  }

  .home-metrics,
  .home-actions,
  .home-flow__items {
    grid-template-columns: 1fr;
  }

  .home-overview__summary {
    grid-template-columns: 1fr;
  }
}
</style>
