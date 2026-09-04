import { getDB, STORE_NAMES } from "./db";

/**
 * 本地数据集仓库(IndexedDB)
 * 数据集 = 可复用的静态数据(数组或对象),支持从 JSON/CSV/XLSX 导入
 */

const parseRecord = record => {
  if (!record) return null;
  return {
    ...record,
    // 兼容历史存储为字符串的数据
    data: typeof record.data === "string" ? safeParse(record.data, []) : record.data,
  };
};

const safeParse = (text, fallback) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
};

export async function getDatasets() {
  const db = await getDB();
  const records = await db.getAll(STORE_NAMES.DATASETS);
  return (records || [])
    .map(parseRecord)
    .filter(Boolean)
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

export async function getDataset(id) {
  const db = await getDB();
  return parseRecord(await db.get(STORE_NAMES.DATASETS, id));
}

export async function saveDataset(payload) {
  const db = await getDB();
  const record = {
    name: String(payload?.name || "").trim() || "未命名数据集",
    data: payload?.data ?? [],
    remark: String(payload?.remark || ""),
    kind: payload?.kind || (Array.isArray(payload?.data) ? "table" : "object"),
    updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
  };
  const id = await db.add(STORE_NAMES.DATASETS, record);
  return { ...record, id };
}

export async function updateDataset(id, payload = {}) {
  const db = await getDB();
  const current = await db.get(STORE_NAMES.DATASETS, id);
  if (!current) return null;
  const next = {
    ...current,
    ...payload,
    data: payload.data !== undefined ? payload.data : current.data,
    kind:
      payload.kind ||
      (Array.isArray(payload.data !== undefined ? payload.data : current.data)
        ? "table"
        : "object"),
    updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
  };
  await db.put(STORE_NAMES.DATASETS, next);
  return parseRecord(next);
}

export async function removeDataset(id) {
  const db = await getDB();
  await db.delete(STORE_NAMES.DATASETS, id);
}

export function describeDataset(dataset) {
  const data = dataset?.data;
  if (Array.isArray(data)) {
    return { type: "数组", count: data.length, summary: `数组 · ${data.length} 条记录` };
  }
  if (data && typeof data === "object") {
    return { type: "对象", count: 1, summary: "对象 · 单条配置" };
  }
  return { type: "原始", count: data == null ? 0 : 1, summary: "原始值" };
}

// ---------- CSV 解析/导出 ----------
const trimQuoted = value => {
  const text = String(value == null ? "" : value).trim();
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1);
  }
  return text;
};

const coerceCell = value => {
  const text = trimQuoted(value);
  if (text === "") return text;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
};

const splitCsvLine = line => {
  const result = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

export function parseCsvText(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .filter(line => line.trim() !== "");
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]).map(header => trimQuoted(header.trim()));
  return lines.slice(1).map(line => {
    const cells = splitCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header || `列${index + 1}`] = coerceCell(cells[index]);
    });
    return row;
  });
}

export const csvCell = value => {
  const text = String(value == null ? "" : value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function rowsToCsv(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) return "";
  const headers = [];
  list.forEach(row => {
    (row && typeof row === "object" ? Object.keys(row) : []).forEach(key => {
      if (!headers.includes(key)) headers.push(key);
    });
  });
  const headLine = headers.map(csvCell).join(",");
  const bodyLines = list.map(row => {
    if (row && typeof row === "object") {
      return headers.map(key => csvCell(row[key])).join(",");
    }
    return csvCell(row);
  });
  return [headLine, ...bodyLines].join("\n");
}

export function downloadText(filename, text, type = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
}
