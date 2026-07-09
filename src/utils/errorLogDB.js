import { getDB, STORE_NAMES } from "./db";

const STORE_NAME = STORE_NAMES.ERROR_LOGS;

/**
 * 从URL中获取id参数
 * 支持两种格式：
 * 1. /xxx/:id 路由参数格式
 * 2. xx.html?id=xx 查询参数格式
 * @returns {String|null} id值
 */
export function getIdFromUrl() {
  const pathname = window.location.pathname;
  const search = window.location.search;

  // 尝试从查询参数获取 ?id=xx
  const urlParams = new URLSearchParams(search);
  const queryId = urlParams.get("id");
  if (queryId) {
    return queryId;
  }

  // 尝试从路由路径获取 /view/:id 或 /build/:id
  const pathMatch = pathname.match(/\/(view|build|report\/view|report\/build)\/([^/]+)/);
  if (pathMatch && pathMatch[2]) {
    return pathMatch[2];
  }

  return null;
}

/**
 * 保存错误日志
 * @param {Object} options - 错误信息
 * @param {String} options.componentId - 组件标识符
 * @param {String} options.type - 错误类型
 * @param {Error|String} options.error - 错误对象或错误信息
 * @param {String} options.visualId - 大屏ID（可选，自动从URL获取）
 * @returns {Promise<Number>} 返回记录ID
 */
export async function saveErrorLog({ componentId, type, fun, error, visualId = null }) {
  const db = await getDB();

  // 自动从URL获取visualId
  const id = visualId || getIdFromUrl() || "unknown";

  const record = {
    componentId: componentId || "unknown",
    type: type || "未知错误",
    fun: fun,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : null,
    visualId: id,
    url: window.location.href,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  };

  const recordId = await db.add(STORE_NAME, record);
  return recordId;
}

/**
 * 获取所有错误日志
 * @param {String|Number} visualId - 大屏ID（可选）
 * @returns {Promise<Array>} 返回错误日志列表
 */
export async function getAllErrorLogs(visualId = null) {
  const db = await getDB();

  let records;
  if (visualId) {
    records = await db.getAllFromIndex(STORE_NAME, "visualId", String(visualId));
  } else {
    records = await db.getAllFromIndex(STORE_NAME, "timestamp");
  }

  return records.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * 根据ID获取错误日志
 * @param {Number} id - 记录ID
 * @returns {Promise<Object>} 返回错误日志
 */
export async function getErrorLogById(id) {
  const db = await getDB();
  return await db.get(STORE_NAME, id);
}

/**
 * 删除错误日志
 * @param {Number} id - 记录ID
 * @returns {Promise<void>}
 */
export async function deleteErrorLog(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

/**
 * 清空所有错误日志
 * @returns {Promise<void>}
 */
export async function clearAllErrorLogs() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

/**
 * 根据大屏ID清空错误日志
 * @param {String} visualId - 大屏ID
 * @returns {Promise<void>}
 */
export async function clearErrorLogsByVisualId(visualId) {
  const db = await getDB();
  const records = await db.getAllFromIndex(STORE_NAME, "visualId", String(visualId));
  const tx = db.transaction(STORE_NAME, "readwrite");
  for (const record of records) {
    await tx.store.delete(record.id);
  }
  await tx.done;
}

/**
 * 获取错误日志统计
 * @returns {Promise<Object>} 返回统计信息
 */
export async function getErrorLogStats() {
  const db = await getDB();
  const records = await db.getAll(STORE_NAME);

  const stats = {
    total: records.length,
    byVisualId: {},
    byType: {},
    recent24h: 0,
  };

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  records.forEach(record => {
    // 按大屏ID统计
    if (!stats.byVisualId[record.visualId]) {
      stats.byVisualId[record.visualId] = 0;
    }
    stats.byVisualId[record.visualId]++;

    // 按错误类型统计
    if (!stats.byType[record.type]) {
      stats.byType[record.type] = 0;
    }
    stats.byType[record.type]++;

    // 最近24小时统计
    if (record.timestamp > oneDayAgo) {
      stats.recent24h++;
    }
  });

  return stats;
}

export default {
  getIdFromUrl,
  saveErrorLog,
  getAllErrorLogs,
  getErrorLogById,
  deleteErrorLog,
  clearAllErrorLogs,
  clearErrorLogsByVisualId,
  getErrorLogStats,
};
