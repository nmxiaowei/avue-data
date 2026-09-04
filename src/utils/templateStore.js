import { getDB, STORE_NAMES } from "./db";

/**
 * 整屏模板仓库(IndexedDB)
 * 模板 = 一块大屏的完整快照(detail + nav),可从编辑器“保存为整屏模板”,也可在模板库一键套用
 */

const parseRecord = record => (record ? record : null);

export async function getTemplates() {
  const db = await getDB();
  const records = await db.getAll(STORE_NAMES.TEMPLATES);
  return (records || [])
    .map(parseRecord)
    .filter(Boolean)
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

export async function getTemplate(id) {
  const db = await getDB();
  return parseRecord(await db.get(STORE_NAMES.TEMPLATES, id));
}

export async function saveTemplate(payload) {
  const db = await getDB();
  const record = {
    name: String(payload?.name || "").trim() || "未命名模板",
    type: payload?.type || "screen",
    width: Number(payload?.width) || 1920,
    height: Number(payload?.height) || 1080,
    detail: payload?.detail || {},
    nav: payload?.nav || [],
    remark: String(payload?.remark || ""),
    updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
  };
  const id = await db.add(STORE_NAMES.TEMPLATES, record);
  return { ...record, id };
}

export async function removeTemplate(id) {
  const db = await getDB();
  await db.delete(STORE_NAMES.TEMPLATES, id);
}
