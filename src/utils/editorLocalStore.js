import { getDB, STORE_NAMES } from "./db";

const MAX_LOCAL_VERSIONS = 20;

const serialize = value => JSON.stringify(value ?? null);

const deserialize = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeVisualId = visualId => String(visualId || "").trim();

const createPayload = ({ visualId, title = "", config, nav, name = "" }) => ({
  visualId: normalizeVisualId(visualId),
  title: title || "未命名大屏",
  name: name || "未命名版本",
  config: serialize(config),
  nav: serialize(nav),
  timestamp: Date.now(),
});

const parsePayload = record => {
  if (!record) return null;

  return {
    ...record,
    config: deserialize(record.config, {}),
    nav: deserialize(record.nav, []),
  };
};

export async function getEditorDraft(visualId) {
  const key = normalizeVisualId(visualId);
  if (!key) return null;

  const db = await getDB();
  return parsePayload(await db.get(STORE_NAMES.EDITOR_DRAFTS, key));
}

export async function saveEditorDraft(payload) {
  const record = createPayload(payload);
  if (!record.visualId) return false;

  const db = await getDB();
  await db.put(STORE_NAMES.EDITOR_DRAFTS, record);
  return true;
}

export async function deleteEditorDraft(visualId) {
  const key = normalizeVisualId(visualId);
  if (!key) return;

  const db = await getDB();
  await db.delete(STORE_NAMES.EDITOR_DRAFTS, key);
}

export async function getEditorVersions(visualId) {
  const key = normalizeVisualId(visualId);
  if (!key) return [];

  const db = await getDB();
  const records = await db.getAllFromIndex(STORE_NAMES.EDITOR_VERSIONS, "visualId", key);
  return records.map(parsePayload).sort((a, b) => b.timestamp - a.timestamp);
}

export async function saveEditorVersion(payload) {
  const record = createPayload(payload);
  if (!record.visualId) return null;

  const db = await getDB();
  const id = await db.add(STORE_NAMES.EDITOR_VERSIONS, record);
  const versions = await db.getAllFromIndex(STORE_NAMES.EDITOR_VERSIONS, "visualId", record.visualId);
  const overflow = versions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(MAX_LOCAL_VERSIONS);

  await Promise.all(overflow.map(item => db.delete(STORE_NAMES.EDITOR_VERSIONS, item.id)));
  return id;
}

export async function deleteEditorVersion(id) {
  if (id == null) return;

  const db = await getDB();
  await db.delete(STORE_NAMES.EDITOR_VERSIONS, id);
}
