import { url } from "@/config";
import request from "../axios";

const baseUrl = url + "/components";
const COMPONENT_CACHE_KEY = "avue-data-open:component-catalog";

const normalizeCatalog = data => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  return [];
};

export const getList = params =>
  request({
    url: baseUrl + "/list",
    method: "get",
    params,
  });

export const getObj = id =>
  request({
    url: baseUrl + "/detail",
    method: "get",
    params: {
      id,
    },
  });

export const readLocalComponentCatalog = () => {
  try {
    return normalizeCatalog(JSON.parse(localStorage.getItem(COMPONENT_CACHE_KEY) || "[]"));
  } catch {
    return [];
  }
};

export const writeLocalComponentCatalog = list => {
  const catalog = normalizeCatalog(list);
  localStorage.setItem(COMPONENT_CACHE_KEY, JSON.stringify(catalog));
  return catalog;
};

export const downloadComponentCatalog = async params => {
  const res = await getList(params);
  const catalog = normalizeCatalog(res.data?.data);
  return writeLocalComponentCatalog(catalog);
};
