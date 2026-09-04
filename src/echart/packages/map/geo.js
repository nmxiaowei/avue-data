/**
 * 地图 GeoJSON 注册器:内置地图 + 自定义地图 URL
 * 内置地图文件位于 public/cdn/map 下,通过 BASE_URL 拼接加载
 */
const BUILTIN_MAPS = [
  {
    key: "china",
    name: "中国地图",
    file: "china-full.json",
  },
];

const registryCache = new Map(); // key -> Promise<mapName>
const featureNamesCache = new Map(); // mapName -> string[]

const getBase = () => {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base : base + "/";
};

export const getBuiltinMaps = () => BUILTIN_MAPS.slice();

export const getBuiltinMap = key => BUILTIN_MAPS.find(item => item.key === key) || null;

/**
 * 注册并返回 echarts 可用的地图名
 * @param {Object} source { key|name, url, name }
 */
export function ensureMapRegistered(source) {
  const mapName = source?.name || source?.key || "customMap";
  if (window.echarts && window.echarts.getMap && window.echarts.getMap(mapName)) {
    return Promise.resolve(mapName);
  }
  const cacheKey = source?.url || source?.key || mapName;
  if (registryCache.has(cacheKey)) return registryCache.get(cacheKey);

  const promise = loadGeoJson(source)
    .then(geoJson => {
      if (!geoJson) throw new Error("地图数据为空");
      window.echarts.registerMap(mapName, geoJson);
      featureNamesCache.set(
        mapName,
        (geoJson.features || []).map(feature => feature?.properties?.name).filter(Boolean),
      );
      return mapName;
    })
    .finally(() => {
      // 失败时移除缓存,允许下次重试
      if (registryCache.get(cacheKey) === promise) {
        registryCache.delete(cacheKey);
      }
    });
  registryCache.set(cacheKey, promise);
  return promise;
}

/**
 * 读取已注册地图的区域官方名称列表(如“广东省”),用于数据名称归一化
 */
export const getGeoFeatureNames = mapName => featureNamesCache.get(mapName) || [];

/**
 * 将常见简写名称(如“广东”)归一化为区域官方名称(如“广东省”)
 */
export function normalizeRegionName(name, mapName) {
  if (!name) return name;
  const featureNames = featureNamesCache.get(mapName);
  if (!featureNames || !featureNames.length) return name;
  if (featureNames.includes(name)) return name;
  const hit = featureNames.find(item => item.startsWith(name));
  return hit || name;
}

function loadGeoJson(source) {
  // 1) 自定义完整 URL
  if (source?.url) return fetchJson(source.url);
  // 2) 内置地图 key
  if (source?.key) {
    const builtin = getBuiltinMap(source.key);
    if (builtin) return fetchJson(getBase() + "cdn/map/" + builtin.file);
  }
  return Promise.reject(new Error("未找到地图数据源"));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`地图数据加载失败:${res.status} ${url}`);
  return res.json();
}
