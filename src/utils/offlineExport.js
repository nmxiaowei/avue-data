/**
 * 离线单文件大屏导出器
 * 生成自包含 HTML:内联 echarts(按需内联地图 GeoJSON),静态数据重放常用组件。
 * 支持:text / img / iframe / video / datetime / flop / kpi / border / table / progress /
 *        bar / line / pie / gauge / rectangle / common(自定义EChart) / map(数值地图)
 * 其它交互/动态组件会以占位提示渲染(离线包面向静态演示)。
 */

const DEFAULT_PALETTE = [
  "#4992ff",
  "#7cffb2",
  "#fddd60",
  "#ff6e76",
  "#58d9f9",
  "#05c091",
];

const htmlEscape = value => {
  const text = String(value == null ? "" : value);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const clone = value => JSON.parse(JSON.stringify(value == null ? [] : value));

const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const px = value => (value == null || value === "" ? undefined : Number(value) + "px");

// 取组件静态数据(dataList[0].data 优先)
const getStaticData = item => {
  const list = item.dataList;
  if (Array.isArray(list) && list.length) {
    const first = list[0];
    if (first && Number(first.dataType) === 0 && first.data !== undefined) return clone(first.data);
  }
  return item.data !== undefined ? clone(item.data) : null;
};

// 展平导航:主屏幕(指定分组)内组件,文件夹子项坐标按父级叠加
const flatten = (nav, targetGroup, result = [], offsetX = 0, offsetY = 0, parent = null) => {
  (Array.isArray(nav) ? nav : []).forEach(item => {
    const inGroup = parent ? parent._inGroup : (item.group || "") === (targetGroup || "");
    const isFolder = Array.isArray(item.children) && item.children.length >= 0 && item.children;
    const render = item.display !== true && inGroup && !(item.type === "folder" && parent);
    if (render && !(Array.isArray(item.children) && item.children.length)) {
      result.push({
        ...item,
        _left: offsetX + num(item.left, 0),
        _top: offsetY + num(item.top, 0),
      });
    }
    if (Array.isArray(item.children) && item.children.length) {
      const childX = offsetX + num(item.left, 0);
      const childY = offsetY + num(item.top, 0);
      const wrapped = item;
      wrapped._inGroup = inGroup;
      flatten(item.children, targetGroup, result, childX, childY, wrapped);
    }
  });
  return result;
};

// ---------- echarts option 片段 ----------
const chartBasic = (item, data, extra = {}) => {
  const option = item.option || {};
  const title = {
    show: Boolean(option.titleShow),
    text: option.title || "",
    subtext: option.subtext || "",
    textStyle: {
      color: option.titleColor || "#333",
      fontSize: num(option.titleFontSize, 16),
    },
    left: option.titlePosition || "auto",
    subtextStyle: { color: option.subTitleColor || "#aaa" },
  };
  const tip = {
    show: option.tipShow !== false,
    trigger: extra.trigger || "axis",
  };
  const legend = {
    show: Boolean(option.legend),
    orient: option.legendOrient || "horizontal",
    textStyle: { color: option.legendColor || "#cbd5e1", fontSize: num(option.legendFontSize, 12) },
    top: option.legendTop,
  };
  const grid = {
    left: num(option.gridX, 50),
    top: num(option.gridY, 60),
    right: num(option.gridX2, 30),
    bottom: num(option.gridY2, 50),
  };
  const axisCommon = (isX, values) => {
    const map = isX
      ? {
          show: option.xAxisShow !== false,
          name: option.xAxisName,
          inverse: Boolean(option.xAxisInverse),
        }
      : {
          show: option.yAxisShow !== false,
          name: option.yAxisName,
          inverse: Boolean(option.yAxisInverse),
        };
    return {
      type: "category",
      data: values,
      axisLabel: {
        color: (isX ? option.xAxisColor : option.yAxisColor) || "#cbd5e1",
        fontSize: num(isX ? option.xAxisFontSize : option.yAxisFontSize, 12),
        rotate: isX ? num(option.xAxisRotate, 0) : 0,
      },
      axisLine: {
        lineStyle: {
          color: (isX ? option.xAxisLineColor : option.yAxisLineColor) || "#94a3b8",
        },
      },
      splitLine: {
        show: isX ? Boolean(option.xAxisSplitLineShow) : option.yAxisSplitLineShow !== false,
        lineStyle: { color: "rgba(148,163,184,.18)" },
      },
      ...map,
    };
  };
  return { title, tooltip: tip, legend, grid, axisCommon };
};

const seriesColor = (index, item) => {
  const custom = (item.option && item.option.barColor) || [];
  if (custom && custom[index] && custom[index].color1) {
    return custom[index].color1;
  }
  return DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
};

const buildChartOption = (item, data, type) => {
  const basic = chartBasic(item, data, { trigger: type === "pie" ? "item" : "axis" });
  const option = item.option || {};
  const series = (data && data.series) || [];
  const categories = (data && data.categories) || [];
  const label = {
    show: option.labelShow,
    color: option.labelColor || "#fff",
    fontSize: num(option.labelFontSize, 12),
  };

  if (type === "bar" || type === "line") {
    const seriesList = series.map((ele, index) => {
      const base = {
        name: ele.name || "指标",
        type,
        data: ele.data || [],
        stack: ele.stack || (type === "bar" ? option.stack : undefined),
        label: type === "line" ? label : { ...label, position: "top" },
        itemStyle: {
          color: seriesColor(index, item),
          opacity: type === "bar" ? num(option.barOpacity, 1) : undefined,
          borderRadius: type === "bar" ? num(option.barRadius, 0) : undefined,
        },
        smooth: type === "line" ? option.smooth : undefined,
        lineStyle: type === "line" ? { width: num(option.lineWidth, 2) } : undefined,
        symbol: type === "line" && !option.symbolShow ? "none" : undefined,
      };
      if (type === "bar") {
        base.barWidth = num(option.barWidth, 16) || undefined;
      }
      return base;
    });
    return {
      title: basic.title,
      tooltip: basic.tooltip,
      grid: basic.grid,
      legend: basic.legend,
      xAxis: { ...basic.axisCommon(true, categories) },
      yAxis: {
        ...basic.axisCommon(false),
        type: "value",
        axisLabel: {
          color: option.yAxisColor || "#cbd5e1",
          fontSize: num(option.yAxisFontSize, 12),
        },
      },
      series: seriesList,
      backgroundColor: "transparent",
    };
  }

  if (type === "pie") {
    return {
      title: basic.title,
      tooltip: { show: option.tipShow !== false, trigger: "item" },
      legend: basic.legend,
      color: DEFAULT_PALETTE,
      series: [
        {
          name: option.seriesName || "占比",
          type: "pie",
          radius: option.radius ? [option.radiusInner || "38%", option.radiusOuter || "62%"] : "62%",
          center: ["50%", "50%"],
          data: (Array.isArray(data) ? data : []).map(row =>
            typeof row === "object" && row !== null
              ? { name: row.name, value: Number(row.value) || 0 }
              : { name: String(row), value: 0 },
          ),
          label: { show: option.labelShow !== false, color: option.labelColor || "#e2e8f0" },
          itemStyle: { borderRadius: 4 },
        },
      ],
      backgroundColor: "transparent",
    };
  }

  if (type === "gauge") {
    const value = data && data.value != null ? Number(data.value) : 0;
    return {
      series: [
        {
          type: "gauge",
          min: num(option.min, 0),
          max: num(option.max, 100),
          radius: option.radius || "75%",
          splitNumber: num(option.splitNumber, 10),
          pointer: { show: option.pointerShow !== false },
          axisLine: { lineStyle: { width: num(option.lineSize, 10) } },
          axisLabel: { show: option.axisLabelShow !== false, color: "#9fb3d1" },
          title: { show: true, offsetCenter: [0, "68%"], color: "#e2e8f0", fontSize: 14 },
          detail: {
            valueAnimation: true,
            formatter: value => `${value}${option.unit || ""}`,
            color: option.color || "#38e1ff",
            fontSize: 24,
          },
          data: [{ value, name: data.name || "" }],
        },
      ],
      backgroundColor: "transparent",
    };
  }

  if (type === "rectangle") {
    return {
      tooltip: { trigger: "item", triggerOn: "mousemove" },
      series: [
        {
          type: "treemap",
          roam: Boolean(option.roam),
          nodeClick: option.breadcrumb === false ? false : "zoomToNode",
          data: Array.isArray(data) ? data : [],
          breadcrumb: { show: option.breadcrumb !== false },
          label: { show: option.labelShow !== false, color: "#fff", fontSize: num(option.labelFontSize, 12) },
          itemStyle: { borderColor: option.borderColor || "#0f172a", borderWidth: num(option.borderWidth, 1), gapWidth: num(option.nodeGap, 2) },
        },
      ],
      backgroundColor: "transparent",
    };
  }

  if (type === "progress") {
    const value = data && data.data != null ? Number(data.data) : 0;
    return {
      series: [
        {
          type: "gauge",
          startAngle: 90,
          endAngle: -270,
          pointer: { show: false },
          progress: { show: true, overlap: false, roundCap: true, clip: false },
          axisLine: { lineStyle: { width: num(option.strokeWidth, 14) } },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: [{ value, name: "" }],
          detail: {
            valueAnimation: true,
            formatter: value => `${value}${option.unit || "%"}`,
            color: option.color || "#fff",
            fontSize: num(option.fontSize, 20),
            offsetCenter: [0, "0%"],
          },
          itemStyle: { color: option.borderColor || "#38bdf8" },
        },
      ],
      backgroundColor: "transparent",
    };
  }

  return null;
};

// ---------- 单组件 html ----------
const buildItemHtml = item => {
  const prop = item.component && item.component.prop;
  const style = item._style || {};
  const data = item._data;
  const option = item.option || {};
  const tag = (inner, addStyle = "") =>
    `<div class="widget" style="left:${style.left}px;top:${style.top}px;width:${style.width}px;height:${style.height}px;${addStyle}">${inner}</div>`;

  switch (prop) {
    case "text": {
      const text = data && typeof data === "object" ? data.value : data;
      return tag(
        `<div class="widget-text" style="color:${option.color || "#fff"};font-size:${px(option.fontSize) || "24px"};font-weight:${option.fontWeight || "normal"};text-align:${option.textAlign || "center"};line-height:${px(option.lineHeight) || "normal"};letter-spacing:${px(option.letterSpacing) || "normal"};font-family:${option.fontFamily || "inherit"}">${htmlEscape(text)}</div>`,
      );
    }
    case "img": {
      const src = data && typeof data === "object" ? data.value || data.url : data;
      return tag(
        `<img class="widget-img" src="${htmlEscape(src)}" style="object-fit:${option.objectFit || "contain"};border-radius:${px(option.borderRadius) || "0"}" onerror="this.style.display='none'"/>`,
      );
    }
    case "datetime": {
      return tag(
        `<div class="widget-datetime" id="clock-${item._idx}" style="color:${option.color || "#fff"};font-size:${px(option.fontSize) || "30px"};text-align:${option.textAlign || "center"};font-weight:${option.fontWeight || "normal"}"></div><script>window.__clocks=window.__clocks||[];window.__clocks.push({el:'clock-${item._idx}',fmt:${JSON.stringify(option.format || "yyyy-MM-dd hh:mm:ss")}})</${"script"}>`,
      );
    }
    case "kpi": {
      const d = data && typeof data === "object" ? data : {};
      const trend = Number(d.trend);
      const trendHtml =
        option.trendShow !== false && Number.isFinite(trend)
          ? `<span class="widget-kpi__trend is-${trend >= 0 ? "up" : "down"}">${trend >= 0 ? "▲" : "▼"} ${Math.abs(trend)}${option.trendMode === "value" ? "" : "%"}</span>`
          : "";
      return tag(
        `<div class="widget-kpi" style="background:${option.backgroundColor || "transparent"};border-radius:${px(option.borderRadius) || "0"}">
          <div class="widget-kpi__title">${htmlEscape(d.title || "")}${trendHtml}</div>
          <div class="widget-kpi__value" style="color:${option.valueColor || "#fff"};font-size:${px(option.valueFontSize) || "36px"};font-weight:bold">
            ${htmlEscape(option.prefix || "")}${Number(d.value).toLocaleString("zh-CN")}${d.unit ? `<span class="widget-kpi__unit" style="color:${option.unitColor || "#9fb3d1"}">${htmlEscape(d.unit)}</span>` : ""}
          </div>
        </div>`,
      );
    }
    case "border": {
      return tag(
        `<div class="border border--t${option.type || 1}" style="--c:${option.color || "#38bdf8"};--c2:${option.color2 || "rgba(56,189,248,.25)"};background:${option.backgroundColor || "transparent"};border-width:${px(option.borderWidth) || "1px"}">${option.titleShow ? `<div class="border__title" style="color:${option.titleColor || option.color || "#38bdf8"}">${htmlEscape(option.title || "")}</div>` : ""}</div>`,
      );
    }
    case "flop": {
      const list = Array.isArray(data) ? data : [data];
      const rows = list
        .map(row => {
          const value = row && row.value != null ? row.value : row;
          return `<div class="widget-flop__row" style="color:${option.color || "#38bdf8"};font-size:${px(option.fontSize) || "36px"}">${htmlEscape(row && row.prefixText ? row.prefixText : "")}<b>${Number(value).toLocaleString("zh-CN")}</b>${htmlEscape(row && row.suffixText ? row.suffixText : "")}</div>`;
        })
        .join("");
      return tag(`<div class="widget-flop">${rows}</div>`);
    }
    case "table": {
      const columns = Array.isArray(option.column) ? option.column : [];
      const rows = Array.isArray(data) ? data : [];
      const header = option.showHeader === false ? "" : `<tr>${columns.map(col => `<th>${htmlEscape(col.label || col.prop)}</th>`).join("")}</tr>`;
      const body = rows
        .slice(0, num(option.count, 20) || rows.length)
        .map(row => `<tr>${columns.map(col => `<td>${htmlEscape(row[col.prop])}</td>`).join("")}</tr>`)
        .join("");
      return tag(
        `<div class="widget-table"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`,
      );
    }
    case "progress": {
      return null; // 进度条使用 gauge 风格图表占位,见 chart 分支
    }
    case "video":
      return tag(
        `<video class="widget-video" src="${htmlEscape(item.src || (data && typeof data === "object" ? data.value : data))}" ${option.autoplay ? "autoplay" : ""} ${option.controls ? "controls" : ""} muted loop playsinline></video>`,
      );
    case "iframe":
      return tag(
        `<iframe class="widget-iframe" src="${htmlEscape(item.src || (data && typeof data === "object" ? data.value : data))}" frameborder="0" ${option.allowFullscreen ? "allowfullscreen" : ""}></iframe>`,
      );
    default:
      return tag(
        `<div class="widget-unsupported"><div class="widget-unsupported__name">${htmlEscape(item.name || prop)}</div><div class="widget-unsupported__tip">该类型组件(${htmlEscape(prop || "未知")})离线包暂不支持动态渲染</div></div>`,
      );
  }
};

const buildChartHtml = (item, type) => {
  const style = item._style || {};
  return `<div class="widget widget-chart" style="left:${style.left}px;top:${style.top}px;width:${style.width}px;height:${style.height}px" data-chart="${type}" data-idx="${item._idx}"></div>`;
};

// ---------- 主生成器 ----------
const CHART_PROPS = new Set([
  "bar",
  "line",
  "pie",
  "gauge",
  "rectangle",
  "map",
  "common",
  "progress",
]);

const getAssetBase = () => {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base : base + "/";
};

export async function buildOfflineHtml(detail, nav, options = {}) {
  const config = detail || {};
  const targetGroup = options.group || "";
  const screenW = num(config.width, 1920);
  const screenH = num(config.height, 1080);
  const title = config.title || config.name || "大屏演示";
  const assetBase = getAssetBase();

  const items = flatten(nav, targetGroup).filter(
    item => item.display !== true && item.component && item.component.prop,
  );

  // 先为每个组件分配稳定索引与渲染样式
  items.forEach((item, index) => {
    item._idx = index;
    item._style = {
      left: num(item._left, item.left || 0),
      top: num(item._top, item.top || 0),
      width: num(item.component.width, 200),
      height: num(item.component.height, 100),
    };
    item._data = getStaticData(item);
  });

  const props = items.map(item => item.component.prop);
  const needEcharts = props.some(prop => CHART_PROPS.has(prop));
  let echartsScript = "";
  if (needEcharts) {
    try {
      const res = await fetch(options.echartsUrl || assetBase + "cdn/echarts/5.4.0/echarts.min.js");
      if (res.ok) echartsScript = await res.text();
    } catch (e) {
      echartsScript = "";
    }
  }
  const needMap = props.includes("map");
  let mapScript = "";
  if (needMap && window.echarts) {
    try {
      const res = await fetch(options.mapUrl || assetBase + "cdn/map/china-full.json");
      if (res.ok) {
        const geoJson = await res.json();
        mapScript = `<script>window.__MAP_GEO=${JSON.stringify(geoJson)}</${"script"}>`;
      }
    } catch (e) {
      mapScript = "";
    }
  }

  // 图表组件清单(common 用存储的 formatter 字符串求值,其余用内置构建器)
  const charts = items
    .filter(item => CHART_PROPS.has(item.component.prop))
    .map(item => {
      const prop = item.component.prop;
      if (prop === "common") {
        return {
          idx: item._idx,
          prop,
          formatter: (item.option && (item.option.echartFormatter || item.echartFormatter)) || "",
          data: item._data || {},
          option: item.option || {},
        };
      }
      return {
        idx: item._idx,
        prop,
        option: item.option || {},
        data: item._data || {},
      };
    });

  const staticHtml = items
    .map(item => {
      const prop = item.component.prop;
      if (CHART_PROPS.has(prop)) return buildChartHtml(item, prop);
      return buildItemHtml(item);
    })
    .join("\n");

  const chartScript = `
  var PALETTE = ${JSON.stringify(DEFAULT_PALETTE)};
  var SCREEN_W=${screenW}, SCREEN_H=${screenH};
  var CHARTS = ${JSON.stringify(charts)};

  function px2num(v){ return parseFloat(v) || 0; }

  function fit(){ var el=document.getElementById('screen'); var r=Math.min(window.innerWidth/SCREEN_W, window.innerHeight/SCREEN_H)*0.98; el.style.transform='scale('+r+')'; el.style.transformOrigin='center center'; el.style.left=(window.innerWidth-SCREEN_W*r)/2+'px'; el.style.top=(window.innerHeight-SCREEN_H*r)/2+'px'; }

  function chartOption(ch){ var o=ch.option||{}, d=ch.data||{}, out;
    function color(i){ var c=(o.barColor||[])[i]; return (c&&c.color1)||PALETTE[i%PALETTE.length]; }
    function num(v,f){ return (v===undefined||v===null||v==='')?f:Number(v); }
    if(ch.prop==='bar'||ch.prop==='line'){
      var series=(d.series||[]).map(function(s,i){ var b={name:s.name||'指标',type:ch.prop,data:s.data||[],stack:ch.prop==='bar'?(s.stack||o.stack):undefined,label:{show:o.labelShow,position:'top',color:o.labelColor||'#fff'},itemStyle:{color:color(i),opacity:ch.prop==='bar'?num(o.barOpacity,1):undefined}}; if(ch.prop==='line'){b.smooth=o.smooth;b.lineStyle={width:num(o.lineWidth,2)};b.symbol=o.symbolShow?'circle':'none';} if(ch.prop==='bar'){b.barWidth=num(o.barWidth,16);b.itemStyle.borderRadius=num(o.barRadius,0);} return b;});
      out={backgroundColor:'transparent',tooltip:{trigger:'axis'},legend:{show:!!o.legend,textStyle:{color:'#cbd5e1'}},grid:{left:num(o.gridX,50),top:num(o.gridY,60),right:num(o.gridX2,30),bottom:num(o.gridY2,50)},xAxis:{type:'category',data:d.categories||[],axisLabel:{color:o.xAxisColor||'#cbd5e1',rotate:num(o.xAxisRotate,0)}},yAxis:{type:'value',axisLabel:{color:o.yAxisColor||'#cbd5e1'},splitLine:{lineStyle:{color:'rgba(148,163,184,.2)'}}},series:series};
    } else if(ch.prop==='pie'){
      out={backgroundColor:'transparent',tooltip:{trigger:'item'},legend:{show:!!o.legend,textStyle:{color:'#cbd5e1'}},color:PALETTE,series:[{type:'pie',radius:o.radius?[o.radiusInner||'38%',o.radiusOuter||'62%']:'62%',data:(Array.isArray(d)?d:[]).map(function(r){return {name:r.name||'',value:Number(r.value)||0};}),label:{show:o.labelShow!==false,color:o.labelColor||'#e2e8f0'}}]};
    } else if(ch.prop==='gauge'){
      var gv=d&&d.value!=null?Number(d.value):0;
      out={series:[{type:'gauge',min:num(o.min,0),max:num(o.max,100),radius:o.radius||'75%',splitNumber:num(o.splitNumber,10),pointer:{show:o.pointerShow!==false},axisLine:{lineStyle:{width:num(o.lineSize,10)}},axisLabel:{color:'#9fb3d1'},detail:{valueAnimation:true,formatter:function(v){return v+(o.unit||'');},color:o.color||'#38e1ff',fontSize:24},data:[{value:gv,name:d.name||''}]}],backgroundColor:'transparent'};
    } else if(ch.prop==='rectangle'){
      out={tooltip:{trigger:'item'},series:[{type:'treemap',roam:!!o.roam,data:Array.isArray(d)?d:[],label:{show:o.labelShow!==false,color:'#fff'},itemStyle:{borderColor:o.borderColor||'#0f172a',borderWidth:num(o.borderWidth,1)}}],backgroundColor:'transparent'};
    } else if(ch.prop==='progress'){
      var pv=d&&d.data!=null?Number(d.data):0;
      out={series:[{type:'gauge',startAngle:90,endAngle:-270,pointer:{show:false},progress:{show:true,overlap:false,roundCap:true},axisLine:{lineStyle:{width:num(o.strokeWidth,14)}},splitLine:{show:false},axisTick:{show:false},axisLabel:{show:false},data:[{value:pv}],detail:{valueAnimation:true,formatter:function(v){return v+(o.unit||'%');},color:o.color||'#fff',fontSize:num(o.fontSize,20),offsetCenter:[0,'0%']},itemStyle:{color:o.borderColor||'#38bdf8'}}],backgroundColor:'transparent'};
    } else if(ch.prop==='common'){
      var fn=null; try{ fn=new Function('return ('+ch.formatter+')')(); }catch(e){ fn=null; }
      out=fn?fn(d,{}):{title:{text:'自定义EChart 配置为空或格式错误',left:'center',top:'middle',textStyle:{color:'#ff5b6a',fontSize:14}}};
      out=out||{};
    } else if(ch.prop==='map'){
      var mapName='map_'+ch.idx;
      if(!window.echarts.getMap(mapName)&&window.__MAP_GEO){ window.echarts.registerMap(mapName,window.__MAP_GEO); }
      var nameFix=function(n){ return n; };
      out={backgroundColor:'transparent',tooltip:{trigger:'item'},visualMap:o.visualMapShow===false?undefined:{show:true,min:num(o.visualMin,0),max:num(o.visualMax,130),inRange:{color:[o.visualMinColor||'#0e4f8f',o.visualMidColor||'#1e88c9',o.visualMaxColor||'#ffd24d']},textStyle:{color:'#9fb3d1'}},series:[{type:'map',map:mapName,roam:!!o.roam,zoom:num(o.zoom,1),label:{show:o.labelShow,color:o.labelColor||'#cbd5e1',fontSize:num(o.labelFontSize,10)},itemStyle:{areaColor:o.areaColor||'rgba(15,82,150,.35)',borderColor:o.borderColor||'#2ea8ff',borderWidth:num(o.borderWidth,1)},emphasis:{label:{color:'#fff'},itemStyle:{areaColor:o.emphasizeColor||'rgba(56,189,248,.55)'}},data:Array.isArray(d)?d:[]}]};
    }
    return out;
  }

  function renderCharts(){
    if(!window.echarts){ document.querySelectorAll('.widget-chart').forEach(function(el){el.innerHTML='<div style="color:#ff5b6a;text-align:center;margin-top:30%">ECharts 未内联成功</div>';}); return; }
    document.querySelectorAll('.widget-chart').forEach(function(el){
      var idx=Number(el.getAttribute('data-idx'));
      var ch=CHARTS.find(function(c){return c.idx===idx;});
      if(!ch) return;
      var opt=chartOption(ch);
      if(!opt){ return; }
      var chart=window.echarts.init(el);
      chart.setOption(opt);
      window.addEventListener('resize',function(){ chart.resize(); });
    });
  }

  function pad(n,l){ n=String(n); while(n.length<(l||2)){n='0'+n;} return n; }
  function fmtClock(fmt,date){ var f=fmt||'yyyy-MM-dd hh:mm:ss'; var d={yyyy:date.getFullYear(),MM:pad(date.getMonth()+1),dd:pad(date.getDate()),hh:pad(date.getHours()),mm:pad(date.getMinutes()),ss:pad(date.getSeconds())}; return f.replace(/yyyy|MM|dd|hh|mm|ss/g,function(k){return d[k];}); }
  function tickClock(){ (window.__clocks||[]).forEach(function(c){ var el=document.getElementById(c.el); if(el){ el.textContent=fmtClock(c.fmt,new Date()); } }); }

  window.addEventListener('resize',fit);
  window.addEventListener('load',function(){ fit(); renderCharts(); tickClock(); setInterval(tickClock,1000); });
`;

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${htmlEscape(title)}</title>
<style>
html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#040a16;font-family:"Microsoft YaHei",sans-serif}
#stage{position:fixed;inset:0;overflow:hidden}
#screen{position:absolute;left:0;top:0;width:${screenW}px;height:${screenH}px;transform-origin:center center;background-color:${config.backgroundColor || "#071228"};background-image:radial-gradient(circle at 50% 30%,rgba(22,78,150,.35),rgba(4,10,22,.0) 70%)}
.widget{position:absolute;overflow:hidden;box-sizing:border-box}
.widget-text{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.widget-img,.widget-video,.widget-iframe{width:100%;height:100%;border:0;display:block}
.widget-datetime{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.widget-kpi{width:100%;height:100%;box-sizing:border-box;padding:10px 16px;display:flex;flex-direction:column;justify-content:center;overflow:hidden}
.widget-kpi__title{display:flex;justify-content:space-between;align-items:center;color:#cbd5e1;font-size:16px}
.widget-kpi__trend{font-size:13px;font-weight:bold}
.widget-kpi__trend.is-up{color:#ff5b6a}.widget-kpi__trend.is-down{color:#2edb8a}
.widget-kpi__value{white-space:nowrap}
.widget-flop{width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px}
.widget-table{width:100%;height:100%;overflow:hidden}
.widget-table table{width:100%;border-collapse:collapse;font-size:14px;color:#e2e8f0}
.widget-table th,.widget-table td{text-align:left;padding:6px 8px;border-bottom:1px solid rgba(148,163,184,.14)}
.widget-table th{color:#38bdf8;background:rgba(15,23,42,.4)}
.border{width:100%;height:100%;box-sizing:border-box;position:relative;overflow:hidden}
.border--t1{background-image:linear-gradient(var(--c),var(--c)),linear-gradient(var(--c),var(--c)),linear-gradient(var(--c),var(--c)),linear-gradient(var(--c),var(--c));background-position:0 0,100% 0,0 100%,100% 100%;background-repeat:no-repeat;background-size:22px 2px,22px 2px,22px 2px,22px 2px}
.border--t2{border:var(--cw,1px) solid var(--c);box-shadow:0 0 18px var(--c2),inset 0 0 18px var(--c2)}
.border--t4{border:1px solid transparent;border-radius:10px;background:linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)) padding-box,linear-gradient(135deg,var(--c2),var(--c),var(--c2)) border-box}
.border--t5{border:1px dashed var(--c)}
.border__title{position:relative;z-index:2;padding:0 10px;font-weight:bold;font-size:18px;letter-spacing:2px;line-height:36px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 0 10px var(--c2)}
.widget-chart{background:transparent}
.widget-unsupported{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#64748b;text-align:center;border:1px dashed rgba(148,163,184,.25);border-radius:6px}
.widget-unsupported__name{color:#94a3b8;font-size:15px;font-weight:bold}
.widget-unsupported__tip{font-size:11px;padding:0 10px}
</style>
</head>
<body>
<div id="stage"><div id="screen">
${staticHtml}
</div></div>
${echartsScript ? `<script>${echartsScript}</${"script"}>` : ""}
${mapScript}
<script>
${chartScript}
</script>
</body>
</html>`;

  const renderedCount = items.length;
  return {
    html,
    meta: {
      title,
      screenW,
      screenH,
      rendered: renderedCount,
    },
  };
}
