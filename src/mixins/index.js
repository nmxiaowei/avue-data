// 查看页面和编辑页面公用的参数和方法
import common from "@/config";
import { config } from "@/option/config";
import container from "@/page/group/container.vue";
import { getObj } from "@/api/visual";
import _cloneDeep from "lodash/cloneDeep";
export default {
  components: {
    container,
  },
  provide() {
    return {
      main: this,
      contain: this,
    };
  },
  data() {
    return {
      id: "",
      visualId: "",
      render: false,
      canvasWidth: 0,
      canvasHeight: 0,
      width: 0,
      height: 0,
      config: config,
      group: "",
      nav: [],
      component: [],
      screenComponents: {}, // 存储各个屏幕拉取的大屏配置组件
      common: common,
      active: [],
      activeIndex: null,
      activeOverIndex: null,
      lockedComponents: {},
      configData: [],
    };
  },
  watch: {
    config: {
      handler(val) {
        this.setGlobParams(val);
      },
      deep: true,
      immediate: true,
    },
    group: {
      handler(newGroupId) {
        if (newGroupId) {
          this.handleLoadScreen(newGroupId).catch(error => {
            console.error("加载大屏配置失败:", error);
          });
        }
      },
      immediate: true,
    },
  },
  computed: {
    allList() {
      let result = [];
      const detail = list => {
        list.forEach(item => {
          result.push(item);
          if (item.children) detail(item.children);
        });
      };
      detail(this.nav);
      const len = result.length - 1;
      result.forEach((ele, index) => (ele.zIndex = len - index));
      return result;
    },
    list() {
      let list = this.allList;
      list = list.filter(ele => {
        if (this.validatenull(ele.group)) return true;
        return ele.group == this.group;
      });

      // 如果当前屏幕有拉取的大屏配置组件，拼接到列表中
      if (this.screenComponents[this.group]) {
        list = list.concat(this.screenComponents[this.group]);
      }
      return list;
    },
  },
  created() {
    this.init();
  },
  methods: {
    //初始化字典
    init() {
      Object.defineProperty(window.$glob, "group", {
        set: val => {
          this.group = val;
        },
        get: () => {
          return this.group;
        },
      });
      Object.defineProperty(window.$glob, "themeId", {
        set: val => {
          this.themeId = val;
          this.$refs.container.refresh(this.themeId);
        },
        get: () => {
          return this.themeId;
        },
      });
    },
    findnav(id) {
      let result = {};
      const detail = (list, parent, parentIndex, deep) => {
        list.forEach((item, index) => {
          if (id === item.index) {
            result = {
              index: item.index,
              deep: deep,
              item: item,
              itemIndex: index,
              itemLen: list.length - 1,
              itemList: list,
              parent: parent,
              parentIndex: parentIndex,
            };
          } else if (item.children) {
            detail(item.children, item, index, deep + 1);
          }
        });
      };
      detail(this.nav, this.nav, 0, 0);
      return result;
    },
    findList(index) {
      return this.list.find(ele => ele.index == index) || {};
    },
    handleInitActive() {
      this.keys.ctrl = false;
      this.active = [];
      this.activeIndex = null;
    },
    setGlobParams() {
      this.render = true;
    },
    async handleLoadScreen(target) {
      function normalizeScreenComponents(list = [], groupId) {
        const result = [];
        const loop = items => {
          (items || []).forEach(item => {
            const current = {
              ...item,
              group: groupId,
              lock: true,
            };
            delete current.children;
            result.push(current);
            if (item.children) {
              loop(item.children);
            }
          });
        };
        loop(Array.isArray(list) ? list : []);
        return result;
      }

      const item =
        typeof target === "string"
          ? this.config.group?.find(groupItem => groupItem.id === target)
          : target;

      if (!item) {
        return [];
      }

      if (!item.screenId) {
        return [];
      }

      if (typeof target === "string" && this.screenComponents[item.id]) {
        return this.screenComponents[item.id];
      }

      const res = await getObj(item.screenId);
      const data = res.data?.data;
      const config = data?.config;

      if (!config) {
        throw new Error("未找到有效的大屏配置数据");
      }

      const componentStr = config.component || "[]";
      let components = [];

      try {
        components = JSON.parse(componentStr);
      } catch (parseError) {
        console.error("解析组件配置失败:", parseError);
        throw new Error("组件配置格式错误");
      }

      const remoteGroupId = item.screenGroupId;
      if (remoteGroupId) {
        components = components.filter(component => {
          if (this.validatenull(component.group)) {
            return remoteGroupId === "";
          }
          return component.group == remoteGroupId;
        });
      }

      const screenComponents = normalizeScreenComponents(components, item.id);
      this.screenComponents[item.id] = _cloneDeep(screenComponents);
      return screenComponents;
    },
  },
};
