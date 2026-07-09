import { config as defaultScreenConfig } from "@/option/config";
import componentCategories, { customEchartFormatter } from "@/option/basic-components";

const STORAGE_KEY = "avue-data-open:mock";

const clone = value => JSON.parse(JSON.stringify(value));

const nowText = () => new Date().toLocaleString("zh-CN", { hour12: false });

const createId = prefix => {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const localImage = "/img/bg/bg.png";

const baseDetail = overrides => ({
  ...clone(defaultScreenConfig),
  title: "开源版示例大屏",
  name: "开源版示例大屏",
  width: 1920,
  height: 1080,
  status: 1,
  backgroundUrl: localImage,
  ...overrides,
});

const createScreen = ({ id, title, status, detail, component } = {}) => {
  const screenId = id || createId("screen");
  const screenTitle = title || detail?.title || detail?.name || "未命名大屏";
  const nextDetail = baseDetail({
    ...detail,
    title: screenTitle,
    name: screenTitle,
    status: status ?? detail?.status ?? 1,
    backgroundUrl: detail?.backgroundUrl || localImage,
  });

  return {
    visual: {
      id: screenId,
      title: screenTitle,
      name: screenTitle,
      status: status ?? nextDetail.status ?? 1,
      width: Number(nextDetail.width) || 1920,
      height: Number(nextDetail.height) || 1080,
      backgroundUrl: nextDetail.backgroundUrl || "",
      createTime: nowText(),
      updateTime: nowText(),
    },
    config: {
      id: `config-${screenId}`,
      visualId: screenId,
      detail: JSON.stringify(nextDetail),
      component: JSON.stringify(Array.isArray(component) ? component : []),
    },
  };
};

const seedState = () => ({
  screens: [
    createScreen({
      id: "screen-demo",
      title: "开源版示例大屏",
      status: 1,
    }),
  ],
  files: [],
});

const normalizeScreenThumbnail = screen => {
  const visual = screen?.visual || {};
  const isDemoScreen = visual.id === "screen-demo" || visual.title === "开源版示例大屏";
  if (!isDemoScreen) return screen;

  screen.visual = {
    ...visual,
    backgroundUrl: localImage,
  };

  if (screen.config?.detail) {
    const detail = parseJsonField(screen.config.detail, {});
    screen.config.detail = JSON.stringify({
      ...detail,
      backgroundUrl: localImage,
    });
  }

  return screen;
};

const normalizeState = state => ({
  ...state,
  screens: Array.isArray(state.screens) ? state.screens.map(normalizeScreenThumbnail) : [],
});

const readState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = normalizeState(seedState());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw);
    const seed = seedState();
    return normalizeState({
      ...seed,
      ...parsed,
      screens: Array.isArray(parsed.screens) ? parsed.screens : seed.screens,
      files: Array.isArray(parsed.files) ? parsed.files : seed.files,
    });
  } catch {
    const seed = normalizeState(seedState());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
};

const writeState = state => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const ok = (data, requestConfig) => ({
  data: {
    code: 200,
    error_code: 200,
    msg: "success",
    data,
  },
  status: 200,
  statusText: "OK",
  config: requestConfig,
});

const emptyPage = () => ({
  records: [],
  total: 0,
  current: 1,
  size: 10,
});

const pageResult = (records, params = {}) => {
  const current = Number(params.current || params.page || 1);
  const size = Number(params.size || 10);
  const start = (current - 1) * size;
  return {
    records: records.slice(start, start + size),
    total: records.length,
    current,
    size,
  };
};

const parseJsonField = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  return JSON.parse(value.replace(/^\uFEFF/, ""));
};

const normalizeRequest = requestConfig => {
  const origin = globalThis.location?.origin || "http:" + "//localhost";
  const parsed = new URL(requestConfig.url || "", origin);
  let path = parsed.pathname.replace(/\/+/g, "/");
  if (path.startsWith("/mock/")) path = path.slice("/mock".length);
  const params = {
    ...Object.fromEntries(parsed.searchParams.entries()),
    ...(requestConfig.params || {}),
  };
  return {
    path,
    params,
    data: requestConfig.data || {},
  };
};

const findScreen = (state, id) => state.screens.find(item => `${item.visual.id}` === `${id}`);

const componentTemplates = {
  "local-custom-echart": {
    id: "local-custom-echart",
    name: "自定义EChart示例",
    type: "echart",
    content: customEchartFormatter,
  },
};

const handleComponents = (path, params) => {
  if (path.endsWith("/list")) return componentCategories;
  if (path.endsWith("/detail")) return componentTemplates[params.id] || {};
  return {};
};

const listVisual = (state, params) => {
  const title = String(params.title || "").trim().toLowerCase();
  let records = state.screens.map(item => ({ ...item.visual }));
  if (title) {
    records = records.filter(item => String(item.title || "").toLowerCase().includes(title));
  }
  return pageResult(records, params);
};

const saveVisual = (state, payload = {}) => {
  const visual = payload.visual || payload;
  const detail = parseJsonField(payload.config?.detail, {});
  const component = parseJsonField(payload.config?.component, []);
  const screen = createScreen({
    title: visual.title || visual.name || detail.title || detail.name,
    status: visual.status ?? detail.status ?? 1,
    detail: {
      ...detail,
      width: Number(detail.width || visual.width) || 1920,
      height: Number(detail.height || visual.height) || 1080,
    },
    component,
  });
  state.screens.unshift(screen);
  return screen.visual;
};

const updateVisual = (state, payload = {}) => {
  const visual = payload.visual || {};
  const config = payload.config;
  const id = visual.id || config?.visualId;
  const screen = findScreen(state, id);
  if (!screen) return null;

  if (visual.id) {
    screen.visual = {
      ...screen.visual,
      ...visual,
      updateTime: nowText(),
    };
  }

  if (config) {
    const detail = parseJsonField(config.detail, parseJsonField(screen.config.detail, {}));
    const component = parseJsonField(config.component, parseJsonField(screen.config.component, []));
    const nextDetail = {
      ...detail,
      title: detail.title || screen.visual.title,
      name: detail.name || detail.title || screen.visual.title,
      status: screen.visual.status,
      backgroundUrl: screen.visual.backgroundUrl || detail.backgroundUrl,
    };
    screen.config = {
      ...screen.config,
      ...config,
      id: config.id || screen.config.id,
      visualId: id,
      detail: JSON.stringify(nextDetail),
      component: JSON.stringify(Array.isArray(component) ? component : []),
    };
    screen.visual = {
      ...screen.visual,
      title: nextDetail.title,
      name: nextDetail.name,
      width: Number(nextDetail.width) || screen.visual.width,
      height: Number(nextDetail.height) || screen.visual.height,
      backgroundUrl: nextDetail.backgroundUrl || screen.visual.backgroundUrl,
      updateTime: nowText(),
    };
  }

  return screen.visual;
};

const handleVisual = (state, path, params, data) => {
  if (path.endsWith("/list")) return listVisual(state, params);
  if (path.endsWith("/detail")) {
    const screen = findScreen(state, params.id);
    return screen
      ? {
          visual: clone(screen.visual),
          config: clone(screen.config),
        }
      : {};
  }
  if (path.endsWith("/save")) return saveVisual(state, data);
  if (path.endsWith("/update")) return updateVisual(state, data);
  if (path.endsWith("/remove")) {
    const ids = String(params.ids || "")
      .split(",")
      .filter(Boolean);
    state.screens = state.screens.filter(item => !ids.includes(`${item.visual.id}`));
    return true;
  }
  if (path.endsWith("/copy")) {
    const source = findScreen(state, params.id);
    if (!source) return "";
    const copy = clone(source);
    const id = createId("screen");
    copy.visual.id = id;
    copy.visual.title = `${copy.visual.title} 副本`;
    copy.visual.name = copy.visual.title;
    copy.visual.updateTime = nowText();
    copy.config.id = `config-${id}`;
    copy.config.visualId = id;
    state.screens.unshift(copy);
    return id;
  }
  if (path.endsWith("/put-file")) {
    return {
      link: localImage,
      url: localImage,
    };
  }
  return {};
};

const collectionByPath = (state, path) => {
  if (path.includes("/assets/")) return state.files;
  return [];
};

const handleGenericCollection = (state, path, params, data) => {
  const collection = collectionByPath(state, path);
  if (path.endsWith("/list")) {
    let records = collection.slice();
    if (path.includes("/assets/")) {
      const keyword = String(params.assetsName || "").trim().toLowerCase();
      if (keyword) {
        records = records.filter(item =>
          String(item.assetsName || "").toLowerCase().includes(keyword),
        );
      }
      records = records.sort((a, b) =>
        `${b.assetsTime || ""}`.localeCompare(`${a.assetsTime || ""}`),
      );
    }
    return pageResult(records, params);
  }
  if (path.endsWith("/detail")) return collection.find(item => `${item.id}` === `${params.id}`) || {};
  if (path.endsWith("/save") || path.endsWith("/submit")) {
    const item = {
      id: createId("item"),
      ...data,
    };
    collection.push(item);
    return item;
  }
  if (path.endsWith("/update")) {
    const item = collection.find(row => row.id === data.id);
    if (item) Object.assign(item, data);
    return item || data;
  }
  if (path.endsWith("/remove")) {
    const ids = String(params.ids || "")
      .split(",")
      .filter(Boolean);
    if (ids.length) {
      const nextCollection = collection.filter(item => !ids.includes(`${item.id}`));
      if (path.includes("/assets/")) state.files = nextCollection;
    }
    return true;
  }
  return emptyPage();
};

export function mockRequest(requestConfig) {
  const state = readState();
  const { path, params, data } = normalizeRequest(requestConfig);
  let result;

  if (path.includes("/components/")) {
    result = handleComponents(path, params);
  } else if (path.includes("/visual/")) {
    result = handleVisual(state, path, params, data);
  } else {
    result = handleGenericCollection(state, path, params, data);
  }

  writeState(state);

  return new Promise(resolve => {
    window.setTimeout(() => resolve(ok(clone(result), requestConfig)), 120);
  });
}

export function resetMockData() {
  const seed = seedState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}
