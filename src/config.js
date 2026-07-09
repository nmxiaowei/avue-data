export default {
  COMPNAME: "avue-echart-",
  NAME: "list",
  DEAFNAME: "item",
};
export const website = window.$website;
export const url = website.url;
export const aiKey = website.ai?.key || "";
export const aiBaseUrl = website.ai?.baseUrl || "";
export const aiProvider = website.ai?.provider || false;
export const aiDefaultModel = website.ai?.defaultModel || "deepseek-ai/DeepSeek-V3.2";
