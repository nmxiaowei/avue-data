export default {
  data() {
    return {
      timeFn: null,
    };
  },
  methods: {
    bindEvent() {
      if (this.myChart) {
        [
          {
            name: "click",
            event: "handleClick",
            event1: "handleEventClick",
          },
          {
            name: "dblclick",
            event: "handleDblClick",
            event1: "handleEventDblClick",
          },
          {
            name: "mouseover",
            event: "handleMouseEnter",
          },
          {
            name: "mouseout",
            event: "handleMouseLeave",
          },
        ].forEach(ele => {
          this.myChart.off(ele.name);
          this.myChart.on(ele.name, e => {
            const callback = () => {
              this[ele.event](e, e.dataIndex);
              if (this[ele.event1]) this[ele.event1] && this[ele.event1](e);
            };
            if (ele.name == "click") {
              clearTimeout(this.timeFn);
              this.timeFn = setTimeout(() => {
                callback();
              }, 250);
            } else if (ele.name == "dblclick") {
              clearTimeout(this.timeFn);
              callback();
            } else {
              callback();
            }
          });
        });
      }
      if (typeof this.stylesFormatter === "function") {
        this.styles =
          this.stylesFormatter(this.dataChart, this.dataParams, this.getItemRefs()) || {};
      }
    },
    updateClick(params, type) {
      let refList = this.getItemRefs();
      let paramList = this.child.paramList || [];
      const basicEvents = [
        "clickFormatter",
        "dblClickFormatter",
        "mouseEnterFormatter",
        "mouseLeaveFormatter",
        "changeFormatter",
      ];
      if (!basicEvents.includes(type)) return;
      paramList = paramList.filter(ele => (ele.event || "clickFormatter") == type);
      if (paramList.length != 0) this.transfer && this.transfer(paramList, refList, params, this);
    },
    handleCommonBind(item, index, type) {
      const bindItem = item == null || typeof item === "object" ? item : { value: item };
      this.updateClick(item == null ? this.dataChart : bindItem, type);
      let params = {};
      if (!this.validatenull(index)) {
        params = {
          item: bindItem,
          index,
          data: this.dataChart,
        };
        if (bindItem && Object.prototype.hasOwnProperty.call(bindItem, "value")) {
          params.value = bindItem.value;
        }
      } else {
        params = item == null ? this.dataChart : bindItem;
      }
    },
    // 通用事件处理器工厂方法
    createEventHandler(formatterType) {
      return (item = {}, index) => {
        if (item.pointerType == "mouse" || item.isTrusted) item = this.dataChart;
        this.handleCommonBind(item, index, formatterType);
      };
    },
    handleDataAfterFormatter(item = {}, index) {
      return item;
    },
    handleDataBeforeFormatter(item = {}, index) {
      return item;
    },
    handleClick(item = {}, index) {
      this.createEventHandler("clickFormatter").call(this, item, index);
    },
    handleChange(item = {}, index) {
      this.createEventHandler("changeFormatter").call(this, item, index);
    },
    handleDblClick(item = {}, index) {
      this.createEventHandler("dblClickFormatter").call(this, item, index);
    },
    handleMouseEnter(item = {}, index) {
      this.createEventHandler("mouseEnterFormatter").call(this, item, index);
    },
    handleMouseLeave(item = {}, index) {
      this.createEventHandler("mouseLeaveFormatter").call(this, item, index);
    },
  },
  beforeUnmount() {
    if (this.timeFn) {
      clearTimeout(this.timeFn);
      this.timeFn = null;
    }
  },
};
