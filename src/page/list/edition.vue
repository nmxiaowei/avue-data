<template>
  <div class="edition-page">
    <section class="edition-hero">
      <div>
        <span class="edition-hero__eyebrow">EDITION COMPARISON</span>
        <h1>开源版与 Pro 版功能对比</h1>
        <p>开源版聚焦数据大屏的设计、管理与发布；Pro 版在此基础上扩展数据治理、AI、开发协作和平台管理能力。</p>
      </div>
    </section>

    <section class="edition-summary" aria-label="功能统计">
      <article v-for="item in summaryList" :key="item.label" class="edition-summary__item">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
        <em>{{ item.desc }}</em>
      </article>
    </section>

    <section class="edition-card">
      <div class="edition-card__header">
        <div>
          <span class="edition-section-label">MODULE MATRIX</span>
          <h2>功能清单</h2>
        </div>
        <span class="edition-card__tip">以两版现有菜单、路由及依赖模块为准</span>
      </div>

      <div class="edition-table-wrap">
        <table class="edition-table">
          <thead>
            <tr>
              <th>功能模块</th>
              <th>具体能力</th>
              <th>开源版</th>
              <th>Pro 版</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in featureList" :key="item.module">
              <td>
                <strong>{{ item.module }}</strong>
              </td>
              <td>{{ item.description }}</td>
              <td>
                <span class="edition-status" :class="item.openSource ? 'is-available' : 'is-unavailable'">
                  {{ item.openSource ? "支持" : "未提供" }}
                </span>
              </td>
              <td>
                <span class="edition-status is-available">支持</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="edition-notes">
      <div class="edition-notes__content">
        <span class="edition-section-label">HOW TO CHOOSE</span>
        <h2>版本选择建议</h2>
        <p>仅需搭建、编辑、预览和发布数据大屏时，开源版即可覆盖核心流程；需要统一管理数据源、数据集、用户、插件或 AI 能力时，可评估 Pro 版。</p>
      </div>
      <a class="edition-notes__link" href="https://data.avuejs.com" target="_blank" rel="noopener noreferrer">
        查看 Pro 版
        <i class="iconfont icon-right"></i>
      </a>
    </section>
  </div>
</template>

<script>
const featureList = [
  {
    module: "数据大屏管理",
    description: "创建、编辑、复制、删除及项目搜索",
    openSource: true,
  },
  {
    module: "屏幕规格配置",
    description: "预设或自定义画布尺寸、封面、访问密码与发布状态",
    openSource: true,
  },
  {
    module: "可视化画布编辑",
    description: "拖拽编排、标尺辅助、缩放和组件位置尺寸调整",
    openSource: true,
  },
  {
    module: "图表可视化组件",
    description: "柱状图、折线图、饼图、仪表盘、进度条、表格和翻牌器等",
    openSource: true,
  },
  {
    module: "基础与媒体组件",
    description: "文本、图片、SVG、视频、Iframe、实时日期等内容展示",
    openSource: true,
  },
  {
    module: "表单与导航组件",
    description: "输入框、下拉选择、单选、复选、开关、日期和菜单组件",
    openSource: true,
  },
  {
    module: "自定义扩展组件",
    description: "自定义 ECharts 配置和 Vue 组件接入",
    openSource: true,
  },
  {
    module: "静态与 API 数据",
    description: "组件静态数据、HTTP 请求、Query、Body 和请求头配置",
    openSource: true,
  },
  {
    module: "数据处理与预览",
    description: "响应数据预览、数据格式化和数据过滤器",
    openSource: true,
  },
  {
    module: "交互事件编排",
    description: "组件显隐、移动、刷新、联动、切换大屏和 API 请求事件",
    openSource: true,
  },
  {
    module: "图层与分组管理",
    description: "图层排序、锁定、显隐、复制剪切、成组与解组",
    openSource: true,
  },
  {
    module: "多屏幕编排",
    description: "多屏添加、切换、共享组件与预览轮播",
    openSource: true,
  },
  {
    module: "编辑历史与快捷键",
    description: "撤销重做、历史记录，以及复制、粘贴、对齐等快捷操作",
    openSource: true,
  },
  {
    module: "大屏视觉配置",
    description: "背景、滤镜、水印和主题样式配置",
    openSource: true,
  },
  {
    module: "配置导入导出",
    description: "通过 JSON 文件或文本导入、导出大屏配置",
    openSource: true,
  },
  {
    module: "预览、发布与分享",
    description: "大屏预览、发布、分享链接、二维码及截图导出",
    openSource: true,
  },
  {
    module: "静态资源管理",
    description: "图片、背景及其他静态资源文件维护",
    openSource: true,
  },
  {
    module: "运行配置",
    description: "应用标题、接口地址与运行参数配置",
    openSource: true,
  },
  {
    module: "编辑器内 AI 助手",
    description: "针对当前大屏提供设计、数据配置与组件调整建议",
    openSource: true,
  },
  {
    module: "数据库数据源与数据集",
    description: "数据库数据源配置、数据集维护、分类与统一数据接入",
    openSource: false,
  },
  {
    module: "数据库查询工作台",
    description: "SQL 编辑与执行、格式化、结果分析和常用 SQL 收藏",
    openSource: false,
  },
  {
    module: "数据库结构与关系",
    description: "数据库表结构查看、字段检索与表关系可视化",
    openSource: false,
  },
  {
    module: "数据填报与消息通道",
    description: "业务数据填报、推送渠道、消息模板与发送调试",
    openSource: false,
  },
  {
    module: "工作流设计与版本流转",
    description: "工作流新建、导入导出、画布编排、执行面板与结果变量",
    openSource: false,
  },
  {
    module: "工作流节点能力",
    description: "开始、代码、HTTP、数据库、大模型和通知节点组合执行",
    openSource: false,
  },
  {
    module: "平台组件中心",
    description: "组件库维护、组件分类、展示菜单与运行配置统一管理",
    openSource: false,
  },
  {
    module: "三维模型组件",
    description: "3D 模型组件配置与数字孪生类场景扩展",
    openSource: false,
  },
  {
    module: "AI 模型管理",
    description: "对话、嵌入和视觉模型的统一配置、默认模型与成本参数管理",
    openSource: false,
  },
  {
    module: "平台级 AI 对话",
    description: "独立 AI 会话、提示词优化、SQL 场景辅助和会话记录导出",
    openSource: false,
  },
  {
    module: "代码仓库管理",
    description: "可复用代码仓库与代码资产维护",
    openSource: false,
  },
  {
    module: "全局变量管理",
    description: "跨大屏复用的全局变量定义与维护",
    openSource: false,
  },
  {
    module: "内置开发调试面板",
    description: "控制台、网络、性能、错误、存储、Cookie 与设备预览辅助调试",
    openSource: false,
  },
  {
    module: "地图资源管理",
    description: "GeoJSON 地图数据创建、上传、下载及资源维护",
    openSource: false,
  },
  {
    module: "账号认证与用户管理",
    description: "登录校验、系统用户创建编辑与密码重置",
    openSource: false,
  },
  {
    module: "分类标签管理",
    description: "对大屏、数据集与数据填报内容进行分类维护",
    openSource: false,
  },
  {
    module: "大屏运营分析",
    description: "统计大屏、数据源、数据集和组件的使用及发布健康度",
    openSource: false,
  },
  {
    module: "短链接分享",
    description: "为大屏提供独立短链接访问入口",
    openSource: false,
  },
  {
    module: "插件生态",
    description: "插件市场、已加载插件库、插件路由与运行时注册机制",
    openSource: false,
  },
];

export default {
  name: "edition",
  data() {
    return {
      featureList,
    };
  },
  computed: {
    summaryList() {
      const openSourceCount = this.featureList.filter(item => item.openSource).length;
      return [
        {
          value: openSourceCount,
          label: "开源版已提供功能",
          desc: "覆盖大屏核心流程",
        },
        {
          value: this.featureList.length,
          label: "Pro 版功能清单",
          desc: "包含平台级扩展能力",
        },
        {
          value: this.featureList.length - openSourceCount,
          label: "Pro 版新增模块",
          desc: "按当前代码路由统计",
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.edition-page {
  min-height: 100%;
  padding: 32px;
  box-sizing: border-box;
  color: var(--text-color-primary);
  background: var(--bg-color-page);
}

.edition-hero {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 32px;
  padding: 36px 40px;
  border: 1px solid color-mix(in srgb, var(--primary-color) 34%, var(--border-color-base));
  border-radius: 18px;
  background:
    radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--primary-color) 25%, transparent), transparent 38%),
    var(--bg-color-primary);
}

.edition-hero__eyebrow,
.edition-section-label {
  display: block;
  margin-bottom: 9px;
  color: var(--primary-color);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.edition-hero h1,
.edition-card h2,
.edition-notes h2 {
  margin: 0;
  color: var(--text-color-primary);
}

.edition-hero h1 {
  font-size: 28px;
  line-height: 1.3;
}

.edition-hero p {
  max-width: 700px;
  margin: 12px 0 0;
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.edition-summary__item span {
  display: block;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.edition-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.edition-summary__item,
.edition-card,
.edition-notes {
  border: 1px solid var(--border-color-lighter);
  border-radius: 14px;
  background: var(--bg-color-primary);
}

.edition-summary__item {
  padding: 22px 24px;
}

.edition-summary__item strong {
  display: block;
  margin-bottom: 4px;
  color: var(--primary-color);
  font-size: 28px;
  line-height: 1.2;
}

.edition-summary__item em {
  display: block;
  margin-top: 12px;
  color: var(--text-color-placeholder);
  font-size: 12px;
  font-style: normal;
}

.edition-card {
  overflow: hidden;
}

.edition-card__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  padding: 26px 28px 20px;
  border-bottom: 1px solid var(--border-color-lighter);
}

.edition-card h2,
.edition-notes h2 {
  font-size: 20px;
}

.edition-card__tip {
  color: var(--text-color-placeholder);
  font-size: 12px;
}

.edition-table-wrap {
  overflow-x: auto;
}

.edition-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  text-align: left;
}

.edition-table th,
.edition-table td {
  padding: 17px 28px;
  border-bottom: 1px solid var(--border-color-extra-light);
  font-size: 14px;
}

.edition-table th {
  color: var(--text-color-secondary);
  font-size: 13px;
  font-weight: 500;
  background: var(--bg-color-secondary);
}

.edition-table td {
  color: var(--text-color-secondary);
  line-height: 1.6;
}

.edition-table td:first-child {
  width: 19%;
  color: var(--text-color-primary);
}

.edition-table td:nth-child(2) {
  width: 51%;
}

.edition-table tr:last-child td {
  border-bottom: 0;
}

.edition-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding: 3px 8px;
  border-radius: 99px;
  font-size: 12px;
}

.edition-status.is-available {
  color: var(--success-color);
  background: color-mix(in srgb, var(--success-color) 12%, transparent);
}

.edition-status.is-unavailable {
  color: var(--text-color-placeholder);
  background: var(--bg-color-secondary);
}

.edition-notes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 20px;
  padding: 28px;
}

.edition-notes p {
  max-width: 760px;
  margin: 10px 0 0;
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.edition-notes__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 10px 16px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  text-decoration: none;
  background: var(--primary-color);
}

.edition-notes__link i {
  font-size: 12px;
}

@media screen and (max-width: 900px) {
  .edition-page {
    padding: 20px;
  }

  .edition-hero,
  .edition-notes {
    align-items: flex-start;
    flex-direction: column;
  }

  .edition-summary {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 600px) {
  .edition-page {
    padding: 14px;
  }

  .edition-hero {
    padding: 24px 20px;
  }

  .edition-hero h1 {
    font-size: 23px;
  }

  .edition-card__header {
    align-items: flex-start;
    flex-direction: column;
    padding: 22px 20px 16px;
  }

  .edition-table th,
  .edition-table td {
    padding: 14px 18px;
  }

  .edition-notes {
    padding: 22px 20px;
  }
}
</style>
