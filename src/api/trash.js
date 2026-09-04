import { url } from "@/config";
import request from "../axios";

const baseUrl = url + "/trash";

export const getList = params =>
  request({
    url: baseUrl + "/list",
    method: "get",
    params,
  });

export const restoreObj = id =>
  request({
    url: baseUrl + "/restore",
    method: "post",
    params: { id },
  });

export const delObj = ids =>
  request({
    url: baseUrl + "/remove",
    method: "post",
    params: { ids },
  });
