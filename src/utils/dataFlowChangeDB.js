import { getDB, STORE_NAMES } from "./db";

const STORE_NAME = STORE_NAMES.DATA_FLOW_CHANGES;
const MAX_STRING_LENGTH = 5000;
const MAX_ARRAY_LENGTH = 20;
const MAX_OBJECT_KEYS = 30;

export function getVisualIdFromUrl() {
  if (typeof window === "undefined") return null;

  const pathname = window.location.pathname;
  const search = window.location.search;

  const urlParams = new URLSearchParams(search);
  const queryId = urlParams.get("id");
  if (queryId) return queryId;

  const pathMatch = pathname.match(/\/(view|build|report\/view|report\/build)\/([^/]+)/);
  if (pathMatch && pathMatch[2]) return pathMatch[2];

  return null;
}

function safeSerialize(value, level = 0) {
  if (value == null) return value;
  if (level > 3) return "[MaxDepth]";

  if (typeof value === "string") {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}...(truncated)`
      : value;
  }

  if (typeof value === "function") {
    return `[Function ${value.name || "anonymous"}]`;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    const result = value.slice(0, MAX_ARRAY_LENGTH).map(item => safeSerialize(item, level + 1));
    if (value.length > MAX_ARRAY_LENGTH) {
      result.push(`[+${value.length - MAX_ARRAY_LENGTH} items]`);
    }
    return result;
  }

  if (typeof value === "object") {
    const keys = Object.keys(value);
    const result = {};

    keys.slice(0, MAX_OBJECT_KEYS).forEach(key => {
      result[key] = safeSerialize(value[key], level + 1);
    });

    if (keys.length > MAX_OBJECT_KEYS) {
      result.__truncated__ = `+${keys.length - MAX_OBJECT_KEYS} keys`;
    }

    return result;
  }

  return value;
}

export async function saveDataFlowChangeLog({
  visualId = null,
  source = "unknown",
  action = "unknown",
  triggerComponentId = null,
  triggerComponentName = null,
  componentId = null,
  componentName = null,
  targetId = null,
  targetName = null,
  summary = "",
  before = null,
  after = null,
  payload = null,
  meta = null,
}) {
  const db = await getDB();
  const currentVisualId = visualId || getVisualIdFromUrl() || "unknown";

  return db.add(STORE_NAME, {
    visualId: String(currentVisualId),
    source,
    action,
    triggerComponentId: triggerComponentId || componentId || "unknown",
    triggerComponentName: triggerComponentName || componentName || "",
    componentId: componentId || "unknown",
    componentName: componentName || "",
    targetId: targetId || "",
    targetName: targetName || "",
    summary,
    before: safeSerialize(before),
    after: safeSerialize(after),
    payload: safeSerialize(payload),
    meta: safeSerialize(meta),
    url: typeof window !== "undefined" ? window.location.href : "",
    timestamp: Date.now(),
  });
}

export async function getAllDataFlowChangeLogs(visualId = null) {
  const db = await getDB();
  let records;

  if (visualId) {
    records = await db.getAllFromIndex(STORE_NAME, "visualId", String(visualId));
  } else {
    records = await db.getAllFromIndex(STORE_NAME, "timestamp");
  }

  return records.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteDataFlowChangeLog(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function clearAllDataFlowChangeLogs() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export async function getDataFlowChangeStats() {
  const db = await getDB();
  const records = await db.getAll(STORE_NAME);
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  const stats = {
    total: records.length,
    recent24h: 0,
    bySource: {},
    byAction: {},
    byVisualId: {},
  };

  records.forEach(record => {
    stats.bySource[record.source] = (stats.bySource[record.source] || 0) + 1;
    stats.byAction[record.action] = (stats.byAction[record.action] || 0) + 1;
    stats.byVisualId[record.visualId] = (stats.byVisualId[record.visualId] || 0) + 1;

    if (record.timestamp > oneDayAgo) {
      stats.recent24h++;
    }
  });

  return stats;
}
