<template>
  <div class="wrapper" :style="wrapperStyle">
    <div
      class="container"
      :style="containerStyle"
      id="container"
      @mousedown="dragMousedown"
      @mouseup="dragMouseup"
      @mousemove="dragMousemove"
      ref="container">
      <div class="refer-select" :style="selectStyle"></div>
      <div class="grade" v-if="gradeFlag || contain.config.gradeShow" :style="gradeLenStyle"></div>
      <subgroup ref="subgroup" :key="reload" :nav="contain.list"></subgroup>
    </div>
    <loading ref="loading"></loading>
    <element-zoom ref="zoom"></element-zoom>
  </div>
</template>

<script>
import loading from "@/page/group/loading.vue";
import subgroup from "@/page/block/subgroup.vue";
import elementZoom from "@/page/setup/zoom.vue";
import { getObj } from "@/api/visual";
import initControl from "@/page/utils/control";
import initDraw from "@/page/utils/draw";
import store2 from "store2";
import COMMON from "@/config";
export default {
  name: "contents",
  inject: ["contain"],
  props: {
    target: String,
    option: Object,
    id: [String, Number],
  },
  provide() {
    return {
      container: this,
    };
  },
  components: {
    subgroup,
    loading,
    elementZoom,
  },
  data() {
    return {
      reload: Math.random(),
      select: {
        startX: "",
        startY: "",
        endX: "",
        endY: "",
        show: false,
      },
      wrapperStyle: {},
      gradeFlag: false,
      autoRefreshTimer: null,
      controlCleanup: null,
      resizeHandler: null,
      groupCarouselTimer: null,
    };
  },
  computed: {
    selectStyle() {
      let x = this.select.endX - this.select.startX;
      let y = this.select.endY - this.select.startY;
      return {
        top: this.setPx(y > 0 ? this.select.startY : this.select.endY),
        left: this.setPx(x > 0 ? this.select.startX : this.select.endX),
        width: this.setPx(Math.abs(x)),
        height: this.setPx(Math.abs(y)),
        display: this.select.show ? "block" : "none",
      };
    },
    stepScale() {
      let result = Number(100 / (this.contain.scale * 100));
      return result;
    },
    //计算中央可视化大屏比例
    containerStyle() {
      const widthVal = this.contain.width / this.contain.config.width;
      const heightVal = this.contain.height / this.contain.config.height;
      let scaleX = widthVal,
        scaleY = widthVal;
      if (!this.isBuild) {
        let screen = this.contain.config.screen;
        if (screen == "x") {
          this.contain.viewStyle = {
            "overflow-y": "auto",
          };
        } else if (screen == "y") {
          scaleX = heightVal;
          scaleY = heightVal;
          this.contain.viewStyle = {
            "overflow-x": "auto",
          };
        } else if (screen == "xy") {
          scaleX = widthVal;
          scaleY = heightVal;
        }
      } else {
        scaleX = 1;
        scaleY = 1;
      }
      const styles = this.contain.config.styles;
      this.wrapperStyle = {
        filter: styles.show
          ? `contrast(${styles.contrast || 100}%) saturate(${styles.saturate || 100}%) brightness(${
              styles.brightness || 100
            }%) opacity(${styles.opacity || 100}%) grayscale(${
              styles.grayscale || 0
            }%) hue-rotate(${styles.hueRotate || 0}deg) invert(${styles.invert || 0}%) blur(${
              styles.blur
            }px)`
          : "",
        width: this.setPx(this.contain.config.width * scaleX),
        height: this.setPx(this.contain.config.height * scaleY),
      };
      return Object.assign(
        {
          transform: `scale(${scaleX}, ${scaleY})`,
          width: this.setPx(this.contain.config.width),
          height: this.setPx(this.contain.config.height),
          backgroundColor: this.contain.config.backgroundColor,
        },
        (() => {
          if (this.contain.config.backgroundImage) {
            return {
              background: `url(${this.contain.config.backgroundImage}) 0% 0% / 100% 100% rgb(3, 12, 59)`,
            };
          }
          return;
        })(),
      );
    },
    gradeLenStyle() {
      return {
        backgroundSize: `${this.setPx(this.contain.config.gradeLen)} ${this.setPx(
          this.contain.config.gradeLen,
        )},${this.setPx(this.contain.config.gradeLen)} ${this.setPx(this.contain.config.gradeLen)}`,
      };
    },
    isBuild() {
      return this.$route ? this.$route.name === "build" : false;
    },
  },
  created() {
    this.init();
  },
  mounted() {
    this.initData();
    this.initFun();
  },
  methods: {
    dragMousedown(e) {
      if (this.contain.isKeysCtrl) {
        this.contain.handleInitActive();
        let rect = e.currentTarget.getBoundingClientRect();
        let offsetX = (e.clientX - rect.left) * this.stepScale;
        let offsetY = (e.clientY - rect.top) * this.stepScale;
        this.select.startX = offsetX;
        this.select.startY = offsetY;
        this.select.endX = this.select.startX;
        this.select.endY = this.select.startY;
        this.select.show = true;
        e.stopPropagation();
      }
    },
    dragMousemove(e) {
      if (!this.select.show) return;
      let rect = e.currentTarget.getBoundingClientRect();
      let offsetX = (e.clientX - rect.left) * this.stepScale;
      let offsetY = (e.clientY - rect.top) * this.stepScale;
      this.select.endX = offsetX;
      this.select.endY = offsetY;
    },
    dragMouseup(e) {
      if (this.select.show) {
        let selectIndex = [];
        this.contain.list.forEach(ele => {
          let x = ele.left >= this.select.startX && ele.left <= this.select.endX;
          let y = ele.top >= this.select.startY && ele.top <= this.select.endY;
          if (x && y) selectIndex.push(ele.index);
        });
        this.contain.selectNav(selectIndex);
      }
      this.select.show = false;
    },
    getTargetDom() {
      let target = this.target || (this.isBuild ? "#section" : "body");
      return document.querySelector(target);
    },
    initFun() {
      ["handleRefresh", "getListRef", "getItemRef"].forEach(ele => {
        this[ele] = this.$refs.subgroup[ele];
      });
    },
    init() {
      $glob.isBuild = this.isBuild;
      this.resizeHandler = () => {
        this.setScale();
      };
      window.addEventListener("resize", this.resizeHandler);
    },
    refresh(themeId) {
      if (themeId) {
        let theme = this.contain.config.theme[themeId];
        if (!theme) return;
        theme.data.forEach(ele => {
          theme[ele.key] = ele.value;
        });
        window.$glob.theme = theme;
        this.reload = Math.random();
        this.$nextTick(() => {
          this.initFun();
        });
      }
    },
    //初始化数据
    initData() {
      this.setScale();
      this.$refs.loading.show();
      const query = (this.$route && this.$route.query) || {};
      let temp = query.temp;
      let id = this.id || query.id || (this.$route && this.$route.params.id);
      this.controlCleanup = initControl(id);
      this.contain.id = id;
      //大屏绘制逻辑
      const callback = (config = {}) => {
        this.component = config.component || [];
        const detail = config.detail || {};
        // 确保 width 和 height 是数字类型
        if (detail.width !== undefined) {
          detail.width = Number(detail.width);
        }
        if (detail.height !== undefined) {
          detail.height = Number(detail.height);
        }
        this.contain.config = {
          ...this.contain.config,
          ...detail,
        };
        this.setScale();
        document.title = this.$website.title + "-" + this.contain.config.title;
        if (this.isBuild) return initDraw(this);
        this.$refs.loading.hide();
        initDraw(this);
        this.startAutoRefresh();
      };
      if (temp) {
        const option = JSON.parse(store2.get("generator_config"));
        callback(option);
      } else if (id) {
        getObj(id).then(res => {
          const data = res.data.data || {};
          const config = data.config || {};
          let visual = data.visual;
          visual.visualId = config.id;
          visual.id = id;
          this.contain.visualId = config.id;
          this.contain.id = id;
          const done = () => {
            callback({
              detail: {
                ...JSON.parse(config.detail),
                ...visual,
              },
              component: JSON.parse(config.component),
            });
          };
          done();
        });
      } else if (this.option) {
        callback(this.option);
      } else {
        this.setScale();
      }
    },
    //计算比例
    setScale(width) {
      const thick = this.contain.thick || 0;
      this.contain.canvasWidth = this.contain.config.width;
      this.contain.canvasHeight = this.contain.config.height;
      this.contain.width = this.getTargetDom().offsetWidth - thick;
      this.contain.height = this.getTargetDom().offsetHeight - thick;
      this.contain.scale = this.contain.width / this.contain.config.width - 0.02;
      this.$nextTick(() => {
        this.contain.initSize && this.contain.initSize();
      });
    },
    // 启动定时刷新
    startAutoRefresh() {
      // 仅在预览模式下生效
      if (this.isBuild) return;

      const autoRefresh = this.contain.config.autoRefresh;
      if (!autoRefresh?.enabled || !autoRefresh?.interval) return;

      // 清除已有定时器
      this.stopAutoRefresh();

      const intervalMs = autoRefresh.interval * 1000;

      this.autoRefreshTimer = setInterval(() => {
        window.location.reload();
      }, intervalMs);
    },
    // 停止定时刷新
    stopAutoRefresh() {
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
        this.autoRefreshTimer = null;
      }
    },
    // 获取组件引用列表
    getItemRefs() {
      let refList = this.$refs.subgroup.$refs;
      let result = {};
      Object.keys(refList).forEach(ele => {
        if (ele.indexOf(COMMON.NAME) !== -1) {
          let obj = refList[ele][0];
          if (obj) result[ele.replace(COMMON.NAME, "")] = obj.$refs.temp;
        } else if ((refList[ele][0] || {}).type === "folder") {
          let obj = refList[ele][0];
          if (obj) result[ele.replace(COMMON.DEAFNAME, "")] = obj;
        }
      });
      return result;
    },
  },
  beforeUnmount() {
    this.stopAutoRefresh();
    if (this.groupCarouselTimer) {
      clearInterval(this.groupCarouselTimer);
      this.groupCarouselTimer = null;
    }
    if (this.controlCleanup) {
      this.controlCleanup();
      this.controlCleanup = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
  },
};
</script>

<style lang="scss">
@use "@/styles/echart.scss";
@use "@/styles/style.scss";
</style>
