import { getGlobValue, getFunction, uuid } from "@/utils/utils";
import debuggerManager from "@/utils/debugger";
import _cloneDeep from "lodash/cloneDeep";

export default {
  data() {
    return {
      checkChart: null,
      dataOldChart: [],
      dataResChart: [],
      dataChart: [],
      dataAxios: {},
      dataParams: {},
      messageBus: window.avueMessageBus,
      isDataUnmounted: false,
    };
  },
  watch: {
    dataList: {
      handler(val) {
        const list = Array.isArray(val) ? val : [];
        this.object.data = list[0] ? list[0].data : void 0;
        this.clearDisabledDataSourceCache(list);
        this.updateData();
      },
      deep: true,
    },
    data: {
      handler(val) {
        if (this.dataList && this.dataList[0]) {
          this.dataList[0].data = val;
          this.updateData();
        }
      },
      deep: true,
    },
  },
  computed: {
    dataFormatter() {
      let fun = this.dataFormatterStr;
      if (this.dataFormatterId && this.filterList?.[this.dataFormatterId]) {
        fun = this.filterList[this.dataFormatterId].dataFormatter;
      }
      return typeof fun === "function" ? fun : getFunction(fun, null, this.index);
    },
  },
  methods: {
    getEnabledDataSourceIndexes(dataList = this.dataList) {
      const firstItem = Array.isArray(dataList) ? dataList[0] : null;
      return firstItem ? [0] : [];
    },
    clearDisabledDataSourceCache(dataList = this.dataList) {
      const enabledIndexSet = new Set(this.getEnabledDataSourceIndexes(dataList));
      if (!Array.isArray(this.dataResChart)) {
        this.dataResChart = [];
      }
      this.dataResChart.length = 1;
      if (!enabledIndexSet.has(0)) {
        this.dataResChart[0] = void 0;
      }
    },
    refreshDataChart(p = {}, options = {}, enabledIndexes = this.getEnabledDataSourceIndexes()) {
      if (this.isDataUnmounted) return;

      this.dataOldChart =
        enabledIndexes.length === 1 ? _cloneDeep(this.dataResChart[enabledIndexes[0]]) || {} : {};

      if (typeof this.dataFormatter === "function" || typeof getFunction(options.dataFormatter) === "function") {
        try {
          const fn = getFunction(options.dataFormatter, null, this.index) || this.dataFormatter;
          this.dataChart = this.executeDataFormatter(
            fn,
            this.dataOldChart,
            this.dataParams,
            this.getItemRefs(),
          );
        } catch (err) {
          console.log(new Error(err));
          this.dataChart = err + "";
        }
      } else {
        this.dataChart = this.dataOldChart;
      }

      if (this.component.prop === "data" && this.messageBus) {
        this.messageBus.publish(this.index, this.dataChart);
      }
      if (typeof this.stylesFormatter === "function") {
        this.styles =
          this.stylesFormatter(this.dataChart, this.dataParams, this.getItemRefs()) || {};
      }
      this.$refs.main?.updateData?.(p);
      this.handleDataAfterFormatter(this.dataChart, -1);
    },
    initDataList() {
      if (Array.isArray(this.dataList)) {
        if (this.dataList.length > 0) {
          this.dataList[0].switch = true;
          this.object.dataList = [this.dataList[0]];
          return;
        }
      }

      const obj = {
        id: uuid(),
        name: "数据源",
        switch: true,
      };
      [
        "dataType",
        "dataMethod",
        "dataHeader",
        "url",
        "data",
        "dataQuery",
        "dataBody",
        "dataParams",
        "dataQueryType",
      ].forEach(key => {
        obj[key] = this.object[key];
      });
      this.object.dataList = [obj];
    },
    executeDataFormatter(fn, data, params, refs, ...args) {
      return typeof fn === "function" ? fn(data, params, refs, ...args) : data;
    },
    getDataSourceParams(dataObj = {}) {
      const dataParams = dataObj.dataParams;
      if (Array.isArray(dataParams)) {
        return dataParams.reduce((result, item = {}) => {
          if (item.switch === false || !item.name) return result;
          const value = item.value;
          result[item.name] = typeof value === "string" ? getGlobValue(value) : value;
          return result;
        }, {});
      }
      if (dataParams && typeof dataParams === "object") {
        return Object.keys(dataParams).reduce((result, key) => {
          const value = dataParams[key];
          result[key] = typeof value === "string" ? getGlobValue(value) : value;
          return result;
        }, {});
      }
      return {};
    },
    async loadApiData(safe, updateParams = {}) {
      const refList = this.getItemRefs();
      const url = getGlobValue(safe.url);
      const method = safe.dataMethod || "get";
      if (this.validatenull(url)) return _cloneDeep(safe.data);

      let dataQuery = getFunction(safe.dataQuery, null, this.index);
      dataQuery = (typeof dataQuery === "function" && dataQuery(refList, this.dataParams)) || {};
      dataQuery = { ...dataQuery, ...updateParams.query };

      let dataHeader = getFunction(safe.dataHeader, null, this.index);
      dataHeader = (typeof dataHeader === "function" && dataHeader(refList, this.dataParams)) || {};
      dataHeader = { ...dataHeader, ...updateParams.headers };

      let dataBody = getFunction(safe.dataBody, null, this.index);
      dataBody = (typeof dataBody === "function" && dataBody(refList, this.dataParams)) || {};
      dataBody = { ...dataBody, ...updateParams.body };

      this.dataParams = {
        ...this.dataParams,
        ...dataQuery,
        ...dataBody,
        ...dataHeader,
      };

      const axiosOption = {
        method,
        url,
        headers: dataHeader,
        params: dataQuery,
      };

      if (["post", "put"].includes(method)) {
        axiosOption.data = dataBody;
        if (safe.dataQueryType === "form") {
          axiosOption.data = Object.keys(dataBody)
            .map(key => `${key}=${dataBody[key]}`)
            .join("&");
        }
      }

      const startTime = Date.now();
      try {
        const res = await this.$axios(axiosOption);
        const duration = Date.now() - startTime;
        this.dataAxios = res;
        debuggerManager.logApiRequest(
          url,
          method,
          { params: dataQuery, body: dataBody, headers: dataHeader },
          res.data,
          null,
          duration,
          this.componentInfo,
        );
        return res.data;
      } catch (err) {
        const duration = Date.now() - startTime;
        debuggerManager.logApiRequest(
          url,
          method,
          { params: dataQuery, body: dataBody, headers: dataHeader },
          null,
          err,
          duration,
          this.componentInfo,
        );
        return err;
      }
    },
    async resolveDataSource(dataObj, updateParams = {}) {
      const dataType = Number(dataObj.dataType || 0);
      if (dataType === 1) return this.loadApiData(dataObj, updateParams);
      return _cloneDeep(dataObj.data);
    },
    updateData(p = {}, updateParams = {}, options = {}) {
      if (this.isDataUnmounted) {
        return Promise.resolve({
          news: this.dataChart,
          old: this.dataOldChart,
        });
      }

      this.closeClient();
      this.clearDisabledDataSourceCache();
      const enabledIndexes = this.getEnabledDataSourceIndexes();
      const runOnce = collectPromise => {
        const dataObj = Array.isArray(this.dataList) ? this.dataList[0] : null;
        if (!dataObj) return [];
        dataObj.switch = true;
        this.dataParams = {
          ...this.getDataSourceParams(dataObj),
          ...p,
        };
        const task = this.resolveDataSource(dataObj, updateParams).then(result => {
          if (this.isDataUnmounted) return result;
          this.dataResChart[0] = result;
          this.refreshDataChart(p, options, enabledIndexes);
          return result;
        });
        return collectPromise ? [task] : [];
      };

      const allPromise = runOnce(true);
      if (enabledIndexes.length === 0) {
        this.refreshDataChart(p, options, enabledIndexes);
      }

      if (this.checkChart) clearInterval(this.checkChart);
      if (this.time !== 0 && !this.validatenull(this.time) && !this.initialize) {
        this.checkChart = setInterval(() => {
          if (this.isDataUnmounted) {
            clearInterval(this.checkChart);
            this.checkChart = null;
            return;
          }
          this.handleDataBeforeFormatter({}, -1);
          runOnce(false);
        }, this.time);
      }

      return Promise.all(allPromise).then(() => ({
        news: this.dataChart,
        old: this.dataOldChart,
      }));
    },
    closeClient() {
      if (this.checkChart) {
        clearInterval(this.checkChart);
        this.checkChart = null;
      }
    },
  },
  beforeUnmount() {
    this.isDataUnmounted = true;
    this.closeClient();
  },
};
