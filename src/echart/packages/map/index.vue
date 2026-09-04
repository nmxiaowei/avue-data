<template>
  <div :class="[b(), className]" :style="styleSizeName">
    <div :ref="id" :style="styleChartName"></div>
  </div>
</template>

<script>
import create from "../../create";
import { ensureMapRegistered, getBuiltinMap, normalizeRegionName } from "./geo";

// 内置常用城市坐标(气泡/飞线演示兜底数据)
const CITY_COORDS = {
  北京: [116.41, 39.9],
  上海: [121.47, 31.23],
  广州: [113.26, 23.13],
  深圳: [114.06, 22.55],
  成都: [104.07, 30.67],
  重庆: [106.55, 29.56],
  武汉: [114.3, 30.59],
  西安: [108.94, 34.34],
  杭州: [120.15, 30.27],
  南京: [118.8, 32.06],
  郑州: [113.63, 34.75],
  长沙: [112.94, 28.23],
  青岛: [120.38, 36.07],
  昆明: [102.83, 24.88],
  乌鲁木齐: [87.62, 43.83],
  哈尔滨: [126.63, 45.75],
};

const PROVINCE_DEMO = [
  { name: "广东", value: 128 },
  { name: "江苏", value: 116 },
  { name: "山东", value: 105 },
  { name: "浙江", value: 96 },
  { name: "河南", value: 88 },
  { name: "四川", value: 82 },
  { name: "湖北", value: 76 },
  { name: "湖南", value: 71 },
  { name: "河北", value: 65 },
  { name: "福建", value: 62 },
];

export default create({
  name: "map",
  data() {
    return {
      mapLoading: false,
      mapError: "",
      mapRenderKey: "",
    };
  },
  methods: {
    // 统一的数据形态:{values[] / points[] / lines[]}
    normalizeData(raw) {
      const source = Array.isArray(raw) ? { values: raw } : raw || {};
      const values = Array.isArray(source.values)
        ? source.values
        : Array.isArray(raw)
          ? raw
          : [];
      const points = Array.isArray(source.points) ? source.points : [];
      const lines = Array.isArray(source.lines) ? source.lines : [];
      return { values, points, lines };
    },
    getMapSource() {
      const option = this.option || {};
      if (option.mapKey) {
        const builtin = getBuiltinMap(option.mapKey);
        if (builtin) {
          return { key: option.mapKey, name: builtin.name };
        }
      }
      if (option.mapUrl) {
        return {
          name: option.mapName || "自定义地图",
          url: option.mapUrl,
        };
      }
      const fallback = getBuiltinMap("china");
      return fallback ? { key: fallback.key, name: fallback.name } : null;
    },
    buildMapOption() {
      const option = this.option || {};
      const { values, points, lines } = this.normalizeData(this.dataChart);
      const result = {
        title: this.getOptionTitle(),
        tooltip: this.getOptionTip({
          trigger: "item",
          formatter: params => {
            const value = Array.isArray(params.value)
              ? params.value[params.value.length - 1]
              : params.value;
            return `${params.name}<br/>数值:${value == null ? "-" : value}`;
          },
        }),
        backgroundColor: "transparent",
      };

      const commonGeo = {
        map: this.registeredMapName,
        roam: option.roam,
        zoom: option.zoom || 1,
        label: {
          show: option.labelShow,
          color: option.labelColor || "#cbd5e1",
          fontSize: option.labelFontSize || 10,
        },
        itemStyle: {
          areaColor: option.areaColor || "rgba(15, 82, 150, 0.35)",
          borderColor: option.borderColor || "#2ea8ff",
          borderWidth: option.borderWidth || 1,
        },
        emphasis: {
          label: { color: "#fff" },
          itemStyle: {
            areaColor: option.emphasizeColor || "rgba(56, 189, 248, 0.55)",
          },
        },
        select: {
          disabled: true,
        },
      };

      if (option.mapType === "scatter" || option.mapType === "lines") {
        result.geo = commonGeo;
        if (option.mapType === "scatter") {
          const pts = points.length ? points : this.buildDemoPoints(values);
          result.series = [
            {
              name: option.seriesName || "数据点",
              type: option.ripple ? "effectScatter" : "scatter",
              coordinateSystem: "geo",
              data: pts.map(item => ({
                name: item.name || "",
                value: item.value || (item.coords ? item.coords : [0, 0]),
              })),
              symbolSize: val => (Array.isArray(val) ? val[2] || 12 : 12),
              rippleEffect: {
                brushType: "stroke",
                scale: 3,
              },
              label: {
                show: option.pointLabelShow,
                color: "#fff",
                fontSize: 11,
                formatter: "{b}",
              },
              itemStyle: {
                color: option.pointColor || "#38e1ff",
                shadowBlur: 10,
                shadowColor: option.pointColor || "#38e1ff",
              },
            },
          ];
        } else {
          const ls = lines.length ? lines : this.buildDemoLines(values);
          result.series = [
            {
              name: option.seriesName || "飞线",
              type: "lines",
              coordinateSystem: "geo",
              zlevel: 2,
              effect: {
                show: option.lineEffect !== false,
                period: 4,
                trailLength: 0.3,
                symbol: "arrow",
                symbolSize: 6,
              },
              lineStyle: {
                color: option.lineColor || "#38e1ff",
                width: option.lineWidth || 1,
                opacity: 0.7,
                curveness: 0.3,
              },
              data: ls.map(item => ({
                name: item.name || "",
                coords: item.coords || [],
              })),
            },
          ];
        }
      } else {
        // 数值地图
        result.series = [
          {
            name: option.seriesName || "数值",
            type: "map",
            map: this.registeredMapName,
            roam: option.roam,
            zoom: option.zoom || 1,
            label: {
              show: option.labelShow,
              color: option.labelColor || "#cbd5e1",
              fontSize: option.labelFontSize || 10,
            },
            itemStyle: {
              areaColor: option.areaColor || "rgba(15, 82, 150, 0.35)",
              borderColor: option.borderColor || "#2ea8ff",
              borderWidth: option.borderWidth || 1,
            },
            emphasis: {
              label: { color: "#fff" },
              itemStyle: {
                areaColor: option.emphasizeColor || "rgba(56, 189, 248, 0.55)",
              },
            },
            select: { disabled: true },
            data: values.length
              ? values.map(item => ({
                  ...item,
                  name: normalizeRegionName(item.name, this.registeredMapName),
                }))
              : PROVINCE_DEMO.map(item => ({
                  ...item,
                  name: normalizeRegionName(item.name, this.registeredMapName),
                })),
          },
        ];
        if (option.visualMapShow !== false) {
          result.visualMap = {
            show: true,
            type: "continuous",
            left: option.visualMapPosition || "left",
            bottom: 8,
            min: option.visualMin || 0,
            max: option.visualMax || 130,
            calculable: true,
            textStyle: { color: "#9fb3d1", fontSize: 10 },
            inRange: {
              color: [
                option.visualMinColor || "#0e4f8f",
                option.visualMidColor || "#1e88c9",
                option.visualMaxColor || "#ffd24d",
              ],
            },
          };
        }
      }
      return result;
    },
    buildDemoPoints(values) {
      // 用省份数据映射到省会城市,生成演示气泡
      const fallbackCity = Object.keys(CITY_COORDS).slice(0, 10);
      return values.length
        ? values.slice(0, 10).map((item, index) => ({
            name: item.name,
            value: [...(CITY_COORDS[item.name] || CITY_COORDS[fallbackCity[index]] || [0, 0]), item.value],
          }))
        : fallbackCity.slice(0, 8).map((name, index) => ({
            name,
            value: [...CITY_COORDS[name], 12 + index * 3],
          }));
    },
    buildDemoLines(values) {
      const source = values.length
        ? values.map(item => item.name).filter(name => CITY_COORDS[name])
        : ["北京", "上海", "广州", "深圳", "成都"];
      const target = source.length > 1 ? source[1] : "上海";
      const pairs = [];
      const pairsMap = {};
      source.slice(0, 8).forEach((name, index) => {
        if (index === 0) return;
        const key = `${source[0]}-${name}`;
        if (pairsMap[key] || !CITY_COORDS[source[0]] || !CITY_COORDS[name]) return;
        pairsMap[key] = true;
        pairs.push({
          name: `${source[0]} → ${name}`,
          coords: [CITY_COORDS[source[0]], CITY_COORDS[name]],
        });
      });
      return pairs.length
        ? pairs
        : [
            {
              name: "北京 → 上海",
              coords: [CITY_COORDS.北京, CITY_COORDS.上海],
            },
          ];
    },
    async updateChart() {
      if (!this.myChart) return;
      const source = this.getMapSource();
      if (!source) {
        this.myChart.clear();
        return;
      }
      this.mapLoading = true;
      try {
        this.registeredMapName = await ensureMapRegistered(source);
        if (this.isChartUnmounted || !this.myChart) return;
        const option = this.buildMapOption();
        this.myChart.resize();
        this.myChart.setOption(option, this.initialize);
        this.bindEvent();
      } catch (err) {
        console.warn("地图加载失败", err);
        this.mapError = String(err && err.message ? err.message : err);
        if (this.myChart) {
          this.myChart.clear();
          this.myChart.setOption({
            title: {
              text: "地图数据加载失败\n请检查网络或地图文件",
              left: "center",
              top: "middle",
              textStyle: { color: "#ff5b6a", fontSize: 14, lineHeight: 22 },
            },
          });
        }
      } finally {
        this.mapLoading = false;
      }
    },
  },
});
</script>
