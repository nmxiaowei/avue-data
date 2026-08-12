import { getDB, STORE_NAMES } from "./db";

const MAX_FAVORITES = 100;

const serialize = value => JSON.stringify(value ?? null);

const deserialize = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeName = value => String(value || "").trim() || "未命名组件";

const normalizeSourceKey = value => String(value || "").trim();

const parseFavorite = record => {
  if (!record) return null;

  return {
    ...record,
    option: deserialize(record.option, null),
  };
};

export async function getComponentFavorites() {
  const db = await getDB();
  const records = await db.getAll(STORE_NAMES.COMPONENT_FAVORITES);
  return records
    .map(parseFavorite)
    .filter(item => item?.option)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getComponentFavoriteBySourceKey(sourceKey) {
  const key = normalizeSourceKey(sourceKey);
  if (!key) return null;

  const db = await getDB();
  const records = await db.getAllFromIndex(STORE_NAMES.COMPONENT_FAVORITES, "sourceKey", key);
  return parseFavorite(records.sort((a, b) => b.updatedAt - a.updatedAt)[0]);
}

export async function saveComponentFavorite({ name, option, sourceKey = "", icon = "" }) {
  if (!option || typeof option !== "object") {
    throw new Error("缺少可收藏的组件配置");
  }

  const db = await getDB();
  const timestamp = Date.now();
  const record = {
    name: normalizeName(name),
    option: serialize(option),
    sourceKey: normalizeSourceKey(sourceKey),
    icon: String(icon || ""),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const id = await db.add(STORE_NAMES.COMPONENT_FAVORITES, record);

  const favorites = await db.getAll(STORE_NAMES.COMPONENT_FAVORITES);
  const overflow = favorites
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(MAX_FAVORITES);
  await Promise.all(overflow.map(item => db.delete(STORE_NAMES.COMPONENT_FAVORITES, item.id)));

  return id;
}

export async function deleteComponentFavorite(id) {
  if (id == null) return;

  const db = await getDB();
  await db.delete(STORE_NAMES.COMPONENT_FAVORITES, id);
}
