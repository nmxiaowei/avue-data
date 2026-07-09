# Avue Data

Avue Data 是一个基于 Vue 3、Vite、Element Plus 和 Avue 的大屏可视化开源项目，提供大屏列表、可视化编辑、页面预览、配置导入导出和本地数据模拟等能力，适合用于数据可视化页面搭建、二次开发和前端工程学习。

## 在线演示

- [datav.avuejs.com](https://datav.avuejs.com)

## 项目截图

<table>
  <tr>
    <td width="33.33%"><img src="https://raw.giteeusercontent.com/smallweigit/avue-data/raw/master/public/img/exam/0.png" alt="项目截图 0" /></td>
    <td width="33.33%"><img src="https://raw.giteeusercontent.com/smallweigit/avue-data/raw/master/public/img/exam/1.png" alt="项目截图 1" /></td>
    <td width="33.33%"><img src="https://raw.giteeusercontent.com/smallweigit/avue-data/raw/master/public/img/exam/2.png" alt="项目截图 2" /></td>
  </tr>
  <tr>
    <td width="33.33%"><img src="https://raw.giteeusercontent.com/smallweigit/avue-data/raw/master/public/img/exam/3.png" alt="项目截图 3" /></td>
    <td width="33.33%"><img src="https://raw.giteeusercontent.com/smallweigit/avue-data/raw/master/public/img/exam/4.png" alt="项目截图 4" /></td>
    <td width="33.33%"></td>
  </tr>
</table>

## 功能特性

- 大屏项目列表管理
- 大屏创建、复制、删除、导入和导出
- 可视化大屏编辑器
- 大屏预览页面
- 主题切换和基础布局
- 本地 mock 数据与浏览器 `localStorage` 持久化

## 技术栈

- Vue 3
- Vite
- Vue Router
- Element Plus
- Avue
- Axios
- MockJS
- Monaco Editor
- ExcelJS / xlsx / jsPDF

## 快速开始

### 环境准备

请先准备 Node.js 和 pnpm 环境。

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm dev
```

开发服务默认使用 `8081` 端口，实际访问地址以终端输出为准。

### 生产构建

```bash
pnpm build
```

构建产物输出到 `dist/` 目录。

### 本地预览

```bash
pnpm serve
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm install` | 安装项目依赖 |
| `pnpm dev` | 启动本地开发服务 |
| `pnpm build` | 构建生产环境产物 |
| `pnpm build:hash` | 使用 hash 模式构建 |
| `pnpm serve` | 本地预览构建产物 |

## 目录结构

```text
src/
  api/        接口请求模块
  echart/     可视化组件与图表能力
  icons/      图标资源
  mock/       本地 mock 数据
  option/     组件配置项
  page/       页面模块
  styles/     全局样式
  utils/      工具函数
  axios.js    请求适配封装
  main.js     应用入口
  router.js   路由配置
public/       静态资源与运行时配置
vite/         Vite 插件配置
docker/       Docker 相关配置
```

## 数据说明

项目使用本地 mock 数据模拟接口响应。接口调用方式仍集中在 `src/api/`，请求适配逻辑位于 `src/axios.js`，mock 数据位于 `src/mock/api.js`，运行数据会写入浏览器 `localStorage`。

如需接入真实后端，可在保持 `src/api/` 调用方式不变的前提下，替换请求适配逻辑和接口地址配置。

## 部署说明

执行 `pnpm build` 后，将 `dist/` 目录部署到静态资源服务器即可。部署前请确认 `public/config.js`、路由模式、接口地址和静态资源路径与目标环境一致。

## 贡献

欢迎提交 issue 和 pull request。建议在提交前完成本地启动验证，并说明变更内容、影响范围和验证方式。

## 协议

本项目基于 AGPL-3.0 协议开源，详情请查看 [LICENSE](./LICENSE)。

## 客服微信

<img src="https://avuejs.com/images/wechat.jpg" alt="客服微信" width="180" />
