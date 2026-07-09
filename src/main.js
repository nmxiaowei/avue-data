import { createApp } from 'vue';
import axios from './axios';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import Avue from '@smallwei/avue';
import * as VUE from 'vue';
window.VUE = VUE;
import '@smallwei/avue/lib/index.css';
// 导入主题样式系统
import '@/styles/index.scss';
import App from './App.vue';
import registerConfig from './registerConfig';
const app = createApp(App);

app.use(ElementPlus, {
  locale: zhCn
});
app.use(Avue, {
  axios
});

registerConfig({
  app,
  router,
  axios,
  config: {}
});
app.mount('#app');
