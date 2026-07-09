import { openDB } from "idb";

export const DB_NAME = "avue-data";
export const DB_VERSION = 4;

export const STORE_NAMES = {
  ERROR_LOGS: "error-logs",
  DATA_FLOW_CHANGES: "data-flow-changes",
};

let dbInstance = null;

export async function initDB() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAMES.ERROR_LOGS)) {
        const errorStore = db.createObjectStore(STORE_NAMES.ERROR_LOGS, {
          keyPath: "id",
          autoIncrement: true,
        });
        errorStore.createIndex("timestamp", "timestamp", { unique: false });
        errorStore.createIndex("visualId", "visualId", { unique: false });
        errorStore.createIndex("type", "type", { unique: false });
        errorStore.createIndex("componentId", "componentId", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.DATA_FLOW_CHANGES)) {
        const changeStore = db.createObjectStore(STORE_NAMES.DATA_FLOW_CHANGES, {
          keyPath: "id",
          autoIncrement: true,
        });
        changeStore.createIndex("timestamp", "timestamp", { unique: false });
        changeStore.createIndex("visualId", "visualId", { unique: false });
        changeStore.createIndex("source", "source", { unique: false });
        changeStore.createIndex("action", "action", { unique: false });
        changeStore.createIndex("componentId", "componentId", { unique: false });
      }
    },
  });

  return dbInstance;
}

export async function getDB() {
  return initDB();
}

export default {
  DB_NAME,
  DB_VERSION,
  STORE_NAMES,
  initDB,
  getDB,
};
