<template>
  <div class="build">
    <contentmenu ref="contentmenu"></contentmenu>
    <imglist ref="imglist" @change="handleSetimg"></imglist>
    <headers ref="headers"></headers>
    <div class="app" :class="{ 'app--none': !menuFlag }">
      <!-- 设置菜单 -->
      <menu-list
        ref="menuList"
        :menu-flag="menuFlag && menuShow"
        :settings-width="menuParams.settingsWidth"
        @init-active="onMenuInitActive"
        @drag="handleDrag">
      </menu-list>
      <!-- 图层面板 -->
      <div
        class="menu"
        :style="{ width: setPx(menuParams.menuWidth) }"
        v-show="menuFlag && menuShow"
        @click.stop="handleInitActive">
        <div class="menu__drag" ref="menuDrag" @mousedown="handleDrag($event, 'menu')"></div>
        <div class="menu_header title">
          <div class="title_box">
            <span>
              图层({{ list.length }})
              <el-icon @click="$refs.layer.handleRefresh()">
                <el-icon-caret-top></el-icon-caret-top>
              </el-icon>
            </span>
            <div class="title_menu">
              <div
                class="head_btn"
                :class="{ 'head_btn--active': layerType == 0 }"
                @click="layerType = 0">
                <el-icon>
                  <el-icon-monitor />
                </el-icon>
              </div>
              <div
                class="head_btn"
                :class="{ 'head_btn--active': layerType == 1 }"
                @click="layerType = 1">
                <el-icon>
                  <el-icon-coin />
                </el-icon>
              </div>
            </div>
          </div>
          <el-input
            v-model="layerSearch"
            size="small"
            placeholder="搜索图层名称/类型"
            clearable
            :prefix-icon="ElIconSearch"
            style="margin-top: 5px" />
        </div>
        <el-scrollbar class="menu__scrollbar">
          <layer
            ref="layer"
            :type="layerType"
            :search="layerSearch"
            style="padding: 30px 5px 0 5px"
            :nav="nav"></layer>
        </el-scrollbar>
      </div>
      <!-- 中间区域 -->
      <div
        ref="sectionRef"
        id="section"
        :class="{ 'screens-drag': dragFlag }"
        @mousedown="dragMousedown"
        @mouseup="dragMouseup"
        @mousemove="dragMousemove"
        @mouseenter="isMouseInCanvas = true"
        @mouseleave="isMouseInCanvas = false"
        @contextmenu.prevent="() => {}"
        class="section">
        <sketch-rule
          v-show="isDesignMode"
          :thick="thick"
          :key="themeUpdateTrigger"
          :scale="scale"
          :width="width"
          :height="height"
          :startX="startX"
          :startY="startY"
          :palette="palette"
          :shadow="shadow"
          :horLineArr="lines.h"
          :verLineArr="lines.v" />
        <div
          v-show="isDesignMode"
          ref="screensRef"
          class="screens"
          @wheel="handleWheel"
          @scroll="handleScroll">
          <div ref="containerRef" class="screen-container">
            <div class="canvas" ref="canvasRef" :style="canvasStyle">
              <container ref="container"></container>
            </div>
          </div>
        </div>
        <!-- 底部工具栏 -->
        <footer-toolbar ref="footer"></footer-toolbar>
      </div>
      <div
        class="menu params"
        :style="{ width: setPx(menuParams.paramsWidth) }"
        v-show="showParamsPanel">
        <div
          class="menu__drag"
          ref="paramsDrag"
          @mousedown="handleDrag($event, 'params')"
          :style="{ left: '-4px' }"></div>
        <div class="menu_header">
          <el-tabs v-if="isMain" class="menu__tabs" stretch v-model="menuTabs">
            <el-tab-pane name="0">
              <template #label>
                <el-icon>
                  <el-icon-house />
                </el-icon>
                <span>配置</span>
              </template>
            </el-tab-pane>
            <!-- 数据配置 -->
            <el-tab-pane name="1" v-if="validProp('dataList')">
              <template #label>
                <el-icon>
                  <el-icon-document-copy />
                </el-icon>
                <span>数据</span>
              </template>
            </el-tab-pane>
            <!-- 交互配置 -->
            <el-tab-pane name="2">
              <template #label>
                <el-icon>
                  <el-icon-edit />
                </el-icon>
                <span>交互</span>
              </template>
            </el-tab-pane>
          </el-tabs>
          <p class="title" v-if="isMain">{{ activeObj.title }}（{{ activeObj.name }}）</p>
        </div>
        <el-scrollbar class="menu__scrollbar" :style="scrollStyleName">
          <template v-if="menuTabs == 0">
            <el-form label-width="90px" label-position="left">
              <!-- 多选配置选项 -->
              <template v-if="isSelectActive">
                <el-form-item label="水平对齐">
                  <ul class="menu__button">
                    <li @click="$refs.contentmenu.handlePostionSelect('left')">
                      <el-tooltip content="左对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos1" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handlePostionSelect('center')">
                      <el-tooltip content="水平对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos5" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handlePostionSelect('right')">
                      <el-tooltip content="右对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos3" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handleRotateX">
                      <el-tooltip content="水平翻转" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos8" />
                        </el-button>
                      </el-tooltip>
                    </li>
                  </ul>
                </el-form-item>
                <el-form-item label="垂直对齐">
                  <ul class="menu__button">
                    <li @click="$refs.contentmenu.handlePostionSelect('top')">
                      <el-tooltip content="顶部对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos4" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handlePostionSelect('middle')">
                      <el-tooltip content="垂直对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos2" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handlePostionSelect('bottom')">
                      <el-tooltip content="底部对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos6" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handleRotateY">
                      <el-tooltip content="垂直翻转" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos7" />
                        </el-button>
                      </el-tooltip>
                    </li>
                  </ul>
                </el-form-item>
                <el-form-item label="屏幕">
                  <div class="avue-flex">
                    <avue-select
                      :dic="config.group"
                      v-model="newGroup"
                      :empty-values="[undefined]"
                      :props="{ label: 'name', value: 'id' }"
                      placeholder="请选择目标屏幕"></avue-select>
                    &nbsp;
                    <el-button type="primary" @click="handleMoveGroup">移动</el-button>
                  </div>
                </el-form-item>
                <el-form-item label-width="0">
                  <el-button type="primary" class="block" @click="$refs.contentmenu.handleCompose"
                    >成组</el-button
                  >
                </el-form-item>
                <el-form-item label-width="0">
                  <el-button type="danger" class="block" @click="$refs.contentmenu.handleDel"
                    >删除</el-button
                  >
                </el-form-item>
                <el-form-item label="" label-width="0px">
                  <monaco-editor
                    v-model="activeObjList"
                    disabled
                    :showToolbar="false"
                    @click="handleCopy(JSON.stringify(activeObjList, null, 4))"
                    language="javascript"
                    height="400"></monaco-editor>
                </el-form-item>
              </template>
              <!-- 组件配置 -->
              <template v-else-if="activeIndex">
                <el-form-item label="图层名称">
                  <avue-input v-model="activeObj.name"></avue-input>
                </el-form-item>
                <el-form-item label="隐藏">
                  <el-switch
                    v-model="activeObj.display"
                    @change="value => handleParams('display', null, value)"></el-switch>
                </el-form-item>
                <el-form-item label="锁定">
                  <el-switch
                    v-model="activeObj.lock"
                    @change="value => handleParams('lock', null, value)"></el-switch>
                </el-form-item>
                <el-form-item label="水平对齐">
                  <ul class="menu__button">
                    <li @click="$refs.contentmenu.handlePostionSelect('left')">
                      <el-tooltip content="左对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos1" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handlePostionSelect('middle')">
                      <el-tooltip content="水平对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos2" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handlePostionSelect('right')">
                      <el-tooltip content="右对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos3" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handleRotateX">
                      <el-tooltip content="水平翻转" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos8" />
                        </el-button>
                      </el-tooltip>
                    </li>
                  </ul>
                </el-form-item>
                <el-form-item label="垂直对齐">
                  <ul class="menu__button">
                    <li @click="$refs.contentmenu.handlePostionSelect('top')">
                      <el-tooltip content="顶部对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos4" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handlePostionSelect('center')">
                      <el-tooltip content="垂直对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos5" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handlePostionSelect('bottom')">
                      <el-tooltip content="底部对齐" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos6" />
                        </el-button>
                      </el-tooltip>
                    </li>
                    <li @click="$refs.contentmenu.handleRotateY">
                      <el-tooltip content="垂直翻转" placement="top">
                        <el-button>
                          <svg-icon icon-class="pos7" />
                        </el-button>
                      </el-tooltip>
                    </li>
                  </ul>
                </el-form-item>
                <el-collapse v-if="isFolder">
                  <el-collapse-item title="轮播">
                    <el-form-item label="开启">
                      <el-switch
                        v-model="activeObj.auto"
                        @change="value => handleParams('auto', null, value)"></el-switch>
                    </el-form-item>
                    <template v-if="activeObj.auto">
                      <el-form-item label="初始化序号">
                        <el-input v-model="activeObj.autoInitialIndex" placeholder="默认0">
                        </el-input>
                      </el-form-item>
                      <el-form-item label="时间">
                        <el-input v-model="activeObj.autoInterval" placeholder="3000">
                          <template #append>
                            <span>毫秒</span>
                          </template>
                        </el-input>
                      </el-form-item>
                      <el-form-item label="类型">
                        <avue-select
                          v-model="activeObj.autoType"
                          :dic="[
                            { label: '普通', value: '' },
                            { label: '卡片', value: 'card' },
                          ]"
                          placeholder="请选择类型">
                        </avue-select>
                      </el-form-item>
                      <el-form-item label="自动切换">
                        <avue-select
                          v-model="activeObj.autoAutoplay"
                          :dic="[
                            { label: '是', value: true },
                            { label: '否', value: false },
                          ]"
                          placeholder="请选择自动切换">
                        </avue-select>
                      </el-form-item>
                      <el-form-item label="方向">
                        <avue-select
                          v-model="activeObj.autoDirection"
                          :dic="[
                            { label: '横', value: 'horizontal' },
                            { label: '竖', value: 'vertical' },
                          ]"
                          placeholder="请选择方向">
                        </avue-select>
                      </el-form-item>
                      <el-form-item label="箭头">
                        <avue-select
                          v-model="activeObj.autoArrow"
                          :dic="[
                            { label: '总显示', value: 'always' },
                            { label: '移动显示', value: 'hover' },
                            { label: '不显示', value: 'never' },
                          ]"
                          placeholder="请选择箭头">
                        </avue-select>
                      </el-form-item>
                      <el-form-item label="指示器">
                        <avue-select
                          v-model="activeObj.autoIndicatorPosition"
                          :dic="[
                            { label: '不显示', value: 'none' },
                            { label: '显示', value: 'outside' },
                          ]"
                          placeholder="请选择指示器">
                        </avue-select>
                      </el-form-item>
                    </template>
                  </el-collapse-item>

                  <!-- 新增格栅布局配置 -->
                  <el-collapse-item title="格栅">
                    <el-form-item label="开启格栅">
                      <el-switch
                        v-model="activeObj.grid"
                        @change="value => handleParams('grid', null, value)"></el-switch>
                    </el-form-item>
                    <template v-if="activeObj.grid">
                      <el-form-item label="宽度">
                        <el-input-number
                          v-model="activeObj.gridWidth"
                          :min="0"
                          :max="2000"
                          placeholder="请输入宽度"></el-input-number>
                      </el-form-item>
                      <el-form-item label="行数">
                        <el-input-number
                          v-model="activeObj.gridSpan"
                          :min="1"
                          :max="24"
                          placeholder="请输入行数"></el-input-number>
                      </el-form-item>
                      <el-form-item label="间距">
                        <el-input-number
                          v-model="activeObj.gridGutter"
                          :min="0"
                          :max="50"
                          placeholder="元素间距"></el-input-number>
                      </el-form-item>
                    </template>
                  </el-collapse-item>

                  <el-form-item label-width="0">
                    <el-button type="primary" class="block" @click="$refs.contentmenu.handleLogout"
                      >解散</el-button
                    >
                  </el-form-item>
                  <el-form-item label-width="0">
                    <el-button type="danger" class="block" @click="$refs.contentmenu.handleLogout"
                      >删除</el-button
                    >
                  </el-form-item>
                </el-collapse>
                <component :is="activeComponent.prop + 'Option'"></component>
                <mains-option></mains-option>
              </template>
              <!-- 主屏的配置项 -->
              <template v-else>
                <div class="menu_header">
                  <el-tabs class="menu__tabs" stretch v-model="mainTabs">
                    <el-tab-pane label="配置" name="0"> </el-tab-pane>
                  </el-tabs>
                </div>
                <div class="menu__scrollbar" style="padding-top: 50px">
                  <screen v-if="mainTabs == 0"></screen>
                </div>
              </template>
            </el-form>
          </template>
          <template v-else-if="menuTabs == 1">
            <dataindex ref="dataindex"></dataindex>
          </template>
          <template v-else-if="menuTabs == 2">
            <transfer ref="transfer"></transfer>
          </template>
        </el-scrollbar>
      </div>
    </div>

    <codeedit
      @submit="closeCode"
      v-if="code.box"
      :title="code.title"
      :type="code.type"
      :is-object="code.isObject"
      :codeType="code.codeType"
      v-model="code.obj"
      v-model:visible="code.box"></codeedit>
  </div>
</template>
<script>
import { dicOption } from "@/option/config";
import init from "@/mixins/";
import components from "@/option/components";
import { SketchRule } from "vue3-sketch-ruler";
import "vue3-sketch-ruler/lib/style.css";
import _get from "lodash/get";
import _set from "lodash/set";
import debounce from "lodash/debounce";
import { onThemeChange } from "@/utils/theme";
import { createFile } from "@/utils/utils";
import { createAsyncComponent } from "./utils/asyncComponent";
import { Search as ElIconSearch } from "@element-plus/icons-vue";
import contentmenu from "@/page/setup/contentmenu.vue";
// 异步组件导入
const layer = createAsyncComponent(() => import("./group/layer.vue"));
const transfer = createAsyncComponent(() => import("@/page/setup/transfer.vue"));
const headers = createAsyncComponent(() => import("./group/header.vue"));
const imglist = createAsyncComponent(() => import("@/page/setup/imglist.vue"));
const dataindex = createAsyncComponent(() => import("@/page/setup/dataindex.vue"));
const screen = createAsyncComponent(() => import("@/page/setup/screen.vue"));
const codeedit = createAsyncComponent(() => import("./group/code.vue"));
const footerToolbar = createAsyncComponent(() => import("./group/footer.vue"));
const menuList = createAsyncComponent(() => import("./group/menu.vue"));

export default {
  mixins: [init, components],
  data() {
    return {
      navBaseList: [],
      newGroup: "",
      layerType: 0,
      layerSearch: "",
      currentHistoryIndex: -1,
      menuShow: true,
      paramsShow: true,
      cacheList: {
        timer: null,
        nav: null,
        copy: null,
        data: null,
        history: [],
      },
      keys: {
        ctrl: false,
        space: false,
        shift: false,
      },
      isMouseInCanvas: false, // 鼠标是否在画布中
      nav: [],
      loading: "",
      key: "",
      menuParams: {
        menuWidth: 230,
        paramsWidth: 330,
        settingsWidth: 300,
      },
      menuFlag: true,
      code: {
        codeType: "",
        title: "",
        box: false,
        type: "",
        obj: "",
      },
      form: {},
      dicOption: dicOption,
      mainTabs: "0",
      menuTabs: "0",
      //拖拽
      dragFlag: false,
      dragEvent: null,
      dragStartX: null,
      dragStartY: null,
      // 标尺
      width: document.body.clientWidth,
      height: document.body.clientHeight,
      scale: 1,
      startX: 0,
      startY: 0,
      // 主题更新触发器，用于强制 palette 计算属性重新计算
      themeUpdateTrigger: 0,
      lines: {
        h: [],
        v: [],
      },
      thick: 20,
    };
  },
  components: {
    imglist,
    layer,
    transfer,
    codeedit,
    top,
    headers,
    dataindex,
    contentmenu,
    footerToolbar,
    screen,
    SketchRule,
    menuList,
    ElIconSearch,
  },
  computed: {
    isDesignMode() {
      return true;
    },
    showParamsPanel() {
      return this.menuFlag && this.paramsShow && (this.isDesignMode || this.isActive);
    },
    activeObjList() {
      let list = [];
      this.active.forEach(index => {
        let item = this.findnav(index);
        list.push(item.item);
      });
      return list;
    },
    isMain() {
      return this.isActive && !this.isSelectActive;
    },
    scrollStyleName() {
      let calc = this.setPx(!this.isMain ? 2 : 85);
      return { paddingTop: calc };
    },
    shadow() {
      return {
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
      };
    },
    // 标尺颜色配置 - 使用主题颜色
    palette() {
      // 强制响应式更新，通过监听主题变化
      this.themeUpdateTrigger; // 触发重新计算

      const getThemeColor = (varName, fallback) => {
        return (
          getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback
        );
      };

      const palette = {
        bgColor: getThemeColor("--bg-color-secondary", "#202023"),
        longfgColor: getThemeColor("--text-color-primary", "#BABBBC"),
        shortfgColor: getThemeColor("--text-color-secondary", "#9C9C9C"),
        fontColor: getThemeColor("--text-color-regular", "#919398"),
        shadowColor: getThemeColor("--shadow-color", "#18181c"),
        lineColor: getThemeColor("--primary-color", "#2681ff"),
        borderColor: getThemeColor("--border-color-base", "#B5B5B5"),
        cornerActiveColor: getThemeColor("--color-white", "#fff"),
      };

      return palette;
    },
    canUndo() {
      return this.currentHistoryIndex > 0;
    },
    canRedo() {
      return this.cacheList.history.length > this.currentHistoryIndex + 1;
    },
    isKeysCtrl() {
      return this.keys.ctrl == true;
    },
    isKeysShift() {
      return this.keys.shift == true;
    },

    isFolder() {
      return this.activeObj.children;
    },
    isActive() {
      return this.activeIndex;
    },
    isSelectActive() {
      return this.active.length > 1;
    },
    activeComponent() {
      return this.activeObj.component || {};
    },
    activeOption() {
      return this.activeObj.option || {};
    },
    activeObj() {
      let item = this.findList(this.activeIndex) || {};
      item.child = item.child || {};
      return item;
    },
    activeList() {
      let result = [];
      this.active.forEach(ele => {
        let item = this.findnav(ele);
        result.push(item.item);
      });
      return result;
    },
    publicList() {
      return this.list
        .filter(ele => {
          return (ele.component || {}).prop == "data";
        })
        .map(ele => {
          return {
            label: ele.name,
            value: ele.index,
          };
        });
    },
    canvasStyle() {
      return {
        width: this.setPx(this.canvasWidth),
        height: this.setPx(this.canvasHeight),
        transform: `scale(${this.scale})`,
        overflow: this.config.overflow ? "hidden" : "",
      };
    },
  },
  watch: {
    nav: {
      handler() {
        this.debouncedRecordHistory();
      },
      deep: true,
    },
    activeObj: {
      handler() {
        this.newGroup = this.activeObj.group;
      },
      deep: true,
    },
    activeOverIndex(n, o) {
      [o, n].forEach((ele, index) => {
        if (!ele) return;
        this.setActive(ele, index === 1, "setOverActive");
      });
    },
    active(n, o) {
      [o, n].forEach((ele, index) => {
        ele.forEach(item => {
          this.setActive(item, index === 1, "setActive");
        });
      });
      // 初始化选项卡
      this.menuTabs = "0";
    },
  },
  created() {
    this.debouncedRecordHistory = debounce(this.doRecordHistory, 300);
  },
  mounted() {
    setTimeout(() => {
      this.initFun();
      this.initSize();
      this.listenKey();
      this.initThemeWatcher();
      this.initPageLeaveWarning();
    });
  },
  beforeUnmount() {
    // 清理主题变化监听器
    if (this.$themeUnsubscribe) {
      this.$themeUnsubscribe();
    }
    // 清理页面离开警告事件
    this.removePageLeaveWarning();
  },
  methods: {
    // 菜单初始化激活状态的处理方法
    onMenuInitActive() {
      if (!this.isDesignMode || !this.$refs.screensRef) return;
      this.handleInitActive();
      const screensRect = this.$refs.screensRef.getBoundingClientRect();
      this.setScale(screensRect.width);
    },
    openMenuTab(tabName = "components") {
      this.menuFlag = true;
      this.menuShow = true;
      this.$nextTick(() => {
        this.$refs.menuList?.showTab?.(tabName);
      });
    },
    // 初始化主题变化监听器
    initThemeWatcher() {
      // 监听主题变化事件
      this.$themeUnsubscribe = onThemeChange(() => {
        // 当主题改变时，触发 palette 重新计算
        this.themeUpdateTrigger++;
      });
    },
    // 初始化页面离开警告
    initPageLeaveWarning() {
      this.handleBeforeUnload = event => {
        // 检查是否有未保存的更改
        if (this.hasUnsavedChanges()) {
          const message = "您有未保存的更改，确定要离开页面吗？";
          event.preventDefault();
          event.returnValue = message;
          return message;
        }
      };
      window.addEventListener("beforeunload", this.handleBeforeUnload);
    },
    // 移除页面离开警告
    removePageLeaveWarning() {
      if (this.handleBeforeUnload) {
        window.removeEventListener("beforeunload", this.handleBeforeUnload);
      }
    },
    // 检查是否有未保存的更改
    hasUnsavedChanges() {
      return this.cacheList.history.length > 1 || this.currentHistoryIndex > 0;
    },
    setGroupByTree(item, groupId) {
      if (!item) return;
      item.group = groupId;
      if (item.children && item.children.length > 0) {
        item.children.forEach(child => {
          this.setGroupByTree(child, groupId);
        });
      }
    },
    moveActiveToGroup(groupId) {
      if (this.validatenull(groupId)) {
        this.$message.warning("请选择目标屏幕");
        return [];
      }
      const activeList =
        Array.isArray(this.active) && this.active.length > 0
          ? this.active
          : this.activeIndex
            ? [this.activeIndex]
            : [];
      if (activeList.length === 0) {
        this.$message.warning("请先选择图层");
        return [];
      }

      const activeSet = new Set(activeList);
      const items = activeList
        .map((index, sortIndex) => {
          const detail = this.findnav(index);
          return {
            ...detail,
            sortIndex,
          };
        })
        .filter(item => item.item && item.itemList && item.itemIndex > -1)
        .filter(item => {
          let parent = item.parent;
          while (parent && parent.index) {
            if (activeSet.has(parent.index)) return false;
            const parentDetail = this.findnav(parent.index);
            parent = parentDetail.parent;
          }
          return true;
        });

      if (items.length === 0) {
        return [];
      }

      const groupedByList = new Map();
      items.forEach(item => {
        const list = item.itemList;
        if (!groupedByList.has(list)) {
          groupedByList.set(list, []);
        }
        groupedByList.get(list).push(item);
      });

      const movedList = [];
      groupedByList.forEach(list => {
        list
          .sort((a, b) => b.itemIndex - a.itemIndex)
          .forEach(({ itemList, itemIndex, sortIndex }) => {
            const current = itemList.splice(itemIndex, 1)[0];
            this.setGroupByTree(current, groupId);
            movedList.push({
              item: current,
              sortIndex,
            });
          });
      });

      movedList
        .sort((a, b) => b.sortIndex - a.sortIndex)
        .forEach(({ item }) => {
          this.nav.unshift(item);
        });

      this.handleInitActive();
      return movedList.map(({ item }) => item);
    },
    handleMoveGroup() {
      this.$confirm(`是否移动到对应屏幕?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const movedList = this.moveActiveToGroup(this.newGroup);
        if (movedList.length > 0) {
          this.$message.success("移动分组成功");
          this.mainTabs = "1";
        }
      });
    },
    dragMousedown(e) {
      if (!this.isDesignMode) return;
      this.handleInitActive();
      this.dragFlag = true;
      this.dragEvent = e;
      this.dragStartX = this.$refs.screensRef.scrollLeft;
      this.dragStartY = this.$refs.screensRef.scrollTop;
    },
    dragMouseup() {
      this.dragFlag = false;
    },
    dragMousemove(e) {
      if (!this.isDesignMode) return;
      if (this.dragFlag) {
        let x = e.clientX - this.dragEvent.clientX;
        let y = e.clientY - this.dragEvent.clientY;
        this.$refs.screensRef.scrollLeft = this.dragStartX - x;
        this.$refs.screensRef.scrollTop = this.dragStartY - y;
      }
    },
    handleDrag(e, name, ref) {
      let resize = ref || this.$refs[name + "Drag"];
      let startX = e.clientX;
      document.onmousemove = e => {
        let endX = e.clientX;
        let moveLen = endX - startX;
        startX = endX;
        // params 从右侧拖动，settings 和 menu 从左侧拖动
        let newWidth = this.menuParams[name + "Width"] + (name == "params" ? -moveLen : moveLen);
        // 限制最小宽度为 200
        if (newWidth >= 200) {
          this.menuParams[name + "Width"] = newWidth;
        }
        this.$refs.headers.handleSet(false);
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
      return false;
    },
    handleCopy(data) {
      this.$Clipboard({
        text: data,
      })
        .then(() => {
          this.$message.success("复制成功");
        })
        .catch(() => {
          this.$message.error("复制失败");
        });
    },
    handleRefresh(options) {
      return this.$refs.container.handleRefresh(options);
    },
    handleParams(type, obj, val) {
      const deepList = (list, flag) => {
        list.forEach(ele => {
          ele[type] = flag;
          if (ele.children) deepList(ele.children, flag);
        });
      };
      if (obj) {
        let value = this.validatenull(val) ? !obj[type] : val;
        obj[type] = value;
        deepList([obj], value);
      } else {
        this.active.forEach(ele => {
          let { item } = this.findnav(ele);
          let value = this.validatenull(val) ? !item[type] : val;
          item[type] = value;
          deepList([item], value);
        });
      }
    },
    closeCode(value) {
      if (this.configData.includes(this.code.type)) {
        this.config[this.code.type] = value;
      } else {
        const targetPath = this.code.parent
          ? `${this.code.parent}.${this.code.index}.${this.code.type}`
          : this.code.type;
        _set(this.activeObj, targetPath, value);
      }
      setTimeout(() => {
        if (this.code.type === "dataFormatter") {
          this.handleRes(false);
        }
      });
    },
    handleRes(tip) {
      this.$refs.dataindex.handleRes(tip);
    },
    openDataEditor(item) {
      if (!item?.index) return;
      if (!Array.isArray(item.dataList)) item.dataList = [];
      this.selectNav(item.index);
      this.paramsShow = true;

      const openData = (retry = 0) => {
        this.menuTabs = "1";
        this.$nextTick(() => {
          const dataindexRef = this.$refs.dataindex;
          if (dataindexRef?.handleSetting) {
            dataindexRef.handleSetting(0);
            return;
          }
          if (retry >= 20) return;
          setTimeout(() => openData(retry + 1), 50);
        });
      };

      this.$nextTick(() => openData());
    },
    openTransferEditor(item) {
      if (!item?.index) return;
      item.child = item.child || {};
      item.child.paramList = item.child.paramList || [];
      this.selectNav(item.index);
      this.paramsShow = true;

      const openTransfer = (retry = 0) => {
        this.menuTabs = "2";
        this.$nextTick(() => {
          const transferRef = this.$refs.transfer;
          if (transferRef?.open) {
            transferRef.open();
            return;
          }
          if (retry < 20) setTimeout(() => openTransfer(retry + 1), 50);
        });
      };

      this.$nextTick(() => openTransfer());
    },
    openCode({ type, title, parent, index, id, isObject }) {
      this.code.codeType = type === "data" ? "mock" : "";
      this.code = {
        ...this.code,
        parent,
        index,
        type,
        title,
        id,
        isObject,
      };
      if (this.configData.includes(type)) {
        this.code.obj = this.config[type];
      } else {
        const targetPath = parent ? `${parent}.${index}.${type}` : type;
        this.code.obj = _get(this.activeObj, targetPath);
      }
      this.code.box = true;
    },
    initFun() {
      ["setScale"].forEach(ele => {
        this[ele] = this.$refs.container[ele];
      });
    },
    // 右键菜单
    handleContextMenu(event, item = {}) {
      if (!item.index || this.isKeysCtrl) return;
      const isSelected = this.active.includes(item.index);
      if (!isSelected || !this.isSelectActive) {
        this.active = [item.index];
        this.activeIndex = item.index;
      }
      const contentmenuRef = this.$refs.contentmenu;
      contentmenuRef.beforeOpen && contentmenuRef.beforeOpen();
      contentmenuRef.openMenu && contentmenuRef.openMenu(event);
    },
    /**
     * 监听键盘事件，处理各种快捷键操作
     * 包括组件操作、图层管理、编辑功能等
     */
    listenKey() {
      // 键盘按键码定义
      const KEYS = {
        BACKSPACE: 8,
        SHIFT: 16,
        CTRL: 17,
        SPACE: 32,
        UP: 38,
        DOWN: 40,
        DELETE: 46,
        C: 67,
        D: 68,
        E: 69,
        G: 71,
        H: 72,
        L: 76,
        S: 83,
        V: 86,
        X: 88,
        Y: 89,
        Z: 90,
        CMD: 91, // Mac Command键
      };

      /**
       * 统一的全局按键按下事件处理
       * 处理修饰键状态管理、组件快捷键和全局快捷键
       */
      document.onkeydown = e => {
        const keyCode = e.keyCode;
        const hasActiveObj = !!this.activeObj;

        if (!this.menuFlag) return;
        if (!this.isDesignMode) return;

        // 检查鼠标是否在画布中，不在画布中则不处理快捷键
        if (!this.isMouseInCanvas) {
          return;
        }

        // 修饰键状态管理
        if (keyCode === KEYS.SPACE) {
          // 空格键状态
          this.keys.space = true;
          e.preventDefault();
        } else if (keyCode === KEYS.CTRL || keyCode === KEYS.CMD) {
          // Ctrl/Cmd键状态
          this.keys.ctrl = true;
        } else if (keyCode === KEYS.SHIFT) {
          // Shift键状态
          this.keys.shift = true;
        }

        // Ctrl+Shift 组合键处理（优先级最高）
        if (this.isKeysCtrl && this.isKeysShift) {
          switch (keyCode) {
            case KEYS.H: // Ctrl + Shift + H: 单独显示
              if (!hasActiveObj) return;
              this.$refs.contentmenu.handleSoloDisplay();
              e.preventDefault();
              break;

            case KEYS.E: // Ctrl + Shift + E: 退出单独显示
              this.$refs.contentmenu.handleExitSoloDisplay();
              e.preventDefault();
              break;
          }
        }
        // 组件相关的Ctrl组合键处理
        else if (this.isKeysCtrl) {
          switch (keyCode) {
            case KEYS.S: // Ctrl + S: 保存/构建
              this.$refs.headers.handleBuild();
              e.preventDefault();
              break;

            case KEYS.Z: // Ctrl + Z: 后退
              this.editorUndo();
              e.preventDefault();
              break;

            case KEYS.Y: // Ctrl + Y: 前进
              this.editorRedo();
              e.preventDefault();
              break;
            case KEYS.L: // Ctrl + L: 锁定/解锁
              if (!hasActiveObj) return;
              this.handleParams("lock");
              e.preventDefault();
              break;

            case KEYS.D: // Ctrl + D: 拷贝组件
              if (!hasActiveObj) return;
              this.$refs.contentmenu.handleCopy();
              e.preventDefault();
              break;

            case KEYS.C: // Ctrl + C: 复制组件
              if (!hasActiveObj) return;
              this.$refs.contentmenu.handleRplica();
              e.preventDefault();
              break;

            case KEYS.V: // Ctrl + V: 粘贴组件
              this.$refs.contentmenu.handlePaste();
              e.preventDefault();
              break;

            case KEYS.X: // Ctrl + X: 剪切组件
              if (!hasActiveObj) return;
              this.$refs.contentmenu.handleShear();
              e.preventDefault();
              break;

            case KEYS.UP: // Ctrl + ↑: 置顶
              if (!hasActiveObj) return;
              this.$refs.contentmenu.handleTop();
              e.preventDefault();
              break;

            case KEYS.DOWN: // Ctrl + ↓: 置底
              if (!hasActiveObj) return;
              this.$refs.contentmenu.handleBottom();
              e.preventDefault();
              break;

            case KEYS.H: // Ctrl + H: 显示/隐藏
              if (!hasActiveObj) return;
              this.handleParams("display");
              e.preventDefault();
              break;

            case KEYS.G: // Ctrl + G: 组合/解散
              if (!hasActiveObj) return;
              if (this.isFolder) {
                this.$refs.contentmenu.handleLogout();
              } else {
                this.$refs.contentmenu.handleCompose();
              }
              e.preventDefault();
              break;
          }
        }
        // Shift组合键处理
        else if (this.isKeysShift) {
          switch (keyCode) {
            case KEYS.UP: // Shift + ↑: 上移一层
              if (!hasActiveObj) return;
              this.$refs.contentmenu.handleStepTop();
              e.preventDefault();
              break;

            case KEYS.DOWN: // Shift + ↓: 下移一层
              if (!hasActiveObj) return;
              this.$refs.contentmenu.handleStepBottom();
              e.preventDefault();
              break;
          }
        }

        // 单键处理
        else if (keyCode === KEYS.BACKSPACE || keyCode === KEYS.DELETE) {
          // Backspace 或 Delete: 删除组件
          this.$refs.contentmenu.handleDel();
          e.preventDefault();
        }
      };

      /**
       * 全局按键释放事件处理
       * 管理修饰键状态的释放
       */
      document.onkeyup = e => {
        const keyCode = e.keyCode;

        // 释放修饰键状态
        switch (keyCode) {
          case KEYS.SPACE:
            this.keys.space = false;
            break;

          case KEYS.CTRL:
          case KEYS.CMD:
            this.keys.ctrl = false;
            break;

          case KEYS.SHIFT:
            this.keys.shift = false;
            break;
        }
      };
    },
    setActive(val, result, fun) {
      const obj = this.$refs.container.getListRef(val);
      if (obj) obj[fun](result, true);
    },
    validProp(name) {
      return this.dicOption[name].includes(this.activeComponent.prop);
    },
    formatTooltip(val) {
      return parseInt(val);
    },
    //打开图库
    handleOpenImg(item, type) {
      this.$refs.imglist.openImg(item, type);
    },
    //图库框回调赋值
    handleSetimg(val, type) {
      let params = type.split(".")[1];
      if (type.includes("config")) {
        this.config[params] = val;
      } else if (type.includes("activeObj.data.value")) {
        this.activeObj.data.value = val;
      } else if (type.includes("activeObj.data")) {
        this.activeObj.data = val;
      } else if (type.includes("activeObj")) {
        this.activeObj[params] = val;
      } else if (type.includes("activeOption")) {
        this.activeOption[params] = val;
      }
    },
    handleScroll() {
      if (!this.isDesignMode || !this.$refs.screensRef || !this.$refs.canvasRef) return;
      this.$nextTick(() => {
        const screensRect = this.$refs.screensRef.getBoundingClientRect();
        const canvasRect = this.$refs.canvasRef.getBoundingClientRect();
        // 标尺开始的刻度
        const startX = (screensRect.left + this.thick - canvasRect.left) / this.scale;
        const startY = (screensRect.top + this.thick - canvasRect.top) / this.scale;
        this.startX = startX >> 0;
        this.startY = startY >> 0;
      });
    },
    // 控制缩放值
    updateScrollByZoom(clientX, clientY, prevScale, nextScale) {
      const screensRef = this.$refs.screensRef;
      const canvasRef = this.$refs.canvasRef;
      if (!screensRef || !canvasRef) return;

      const canvasRect = canvasRef.getBoundingClientRect();
      const canvasX = (clientX - canvasRect.left) / prevScale;
      const canvasY = (clientY - canvasRect.top) / prevScale;

      screensRef.scrollLeft += canvasX * (nextScale - prevScale);
      screensRef.scrollTop += canvasY * (nextScale - prevScale);
    },
    handleWheel(e) {
      if (!this.isDesignMode) return;
      if (!(e.ctrlKey || e.metaKey)) return;

      e.preventDefault();
      const prevScale = this.scale;
      const nextScale = parseFloat(Math.max(0.2, prevScale - e.deltaY / 500).toFixed(2));
      if (nextScale === prevScale) return;

      this.scale = nextScale;
      this.$nextTick(() => {
        this.updateScrollByZoom(e.clientX, e.clientY, prevScale, nextScale);
        this.handleScroll();
      });
    },
    // 初始化标尺数值
    initSize() {
      if (!this.$refs.containerRef || !this.$refs.screensRef) return;
      // 滚动居中
      let containerRect = this.$refs.containerRef.getBoundingClientRect();
      this.$refs.screensRef.scrollLeft = containerRect.width / 2 - this.thick * 2;
      this.$refs.screensRef.scrollTop = containerRect.height / 2 - this.thick * 2;
      this.$nextTick(() => {
        this.handleScroll();
      });
    },
    selectNav(item) {
      const items = Array.isArray(item) ? item : [item];

      if (this.isKeysCtrl) {
        // Ctrl 多选模式：追加到已选列表
        this.active = [...new Set([...this.active, ...items])];
      } else {
        // 普通模式：替换选中列表
        this.active = items;
      }
      this.activeIndex = item;
    },
    // 取消选中指定的图层
    unselectNav(item) {
      const items = Array.isArray(item) ? item : [item];
      // 从已选列表中移除指定项
      this.active = this.active.filter(index => !items.includes(index));
      // 更新 activeIndex 为剩余选中项的最后一个，若无则清空
      this.activeIndex = this.active.length > 0 ? this.active[this.active.length - 1] : "";
    },
    doRecordHistory() {
      try {
        const nav = JSON.stringify(this.nav);
        if (nav !== this.cacheList.nav) {
          this.cacheList.nav = nav;
          this.addHistoryCache(this.nav);
        }
      } catch {}
    },
    addHistoryCache(val) {
      if (this.currentHistoryIndex + 1 < this.cacheList.history.length) {
        this.cacheList.history.splice(this.currentHistoryIndex + 1);
      }
      this.cacheList.history.push({
        nav: this.deepClone(val),
        timestamp: Date.now(),
      });
      this.cacheList.history.splice(100);
      this.currentHistoryIndex++;
    },
    editorUndo() {
      if (!this.canUndo) {
        this.$message.warning("暂无可后退操作");
        return;
      }
      this.currentHistoryIndex--;
      this.recoveryHistoryCache();
    },
    editorRedo() {
      if (!this.canRedo) {
        this.$message.warning("暂无可前进操作");
        return;
      }
      this.currentHistoryIndex++;
      this.recoveryHistoryCache();
    },
    recoveryHistoryCache() {
      const prevState = this.cacheList.history[this.currentHistoryIndex];
      if (!prevState) return;
      this.nav = this.deepClone(prevState.nav);
      this.cacheList.nav = JSON.stringify(prevState.nav);
    },
  },
};
</script>
<style lang="scss">
@use "@/styles/style.scss";
@use "@/styles/list.scss";

// 构建页面布局调整，为底部工具栏留出空间
.build {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .app {
    flex: 1;
    min-height: 0; // 防止 flex 子元素溢出
  }
}
</style>
