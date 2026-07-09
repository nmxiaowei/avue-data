import { aiBaseUrl, aiDefaultModel, aiKey } from "@/config";

const defaultConfig = {
  temperature: 0.7,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
};

const normalizeBaseUrl = value => String(value || "").replace(/\/+$/, "");

export const sendMessage = (messages, model = aiDefaultModel, config = {}) => {
  if (!aiBaseUrl) {
    return Promise.reject(new Error("未配置 AI baseUrl"));
  }
  if (!aiKey) {
    return Promise.reject(new Error("未配置 AI key"));
  }

  const payload = {
    ...defaultConfig,
    ...config,
    messages,
    model,
  };

  return fetch(`${normalizeBaseUrl(aiBaseUrl)}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiKey}`,
    },
    body: JSON.stringify(payload),
  });
};

export const chatCompletion = async (messages, config = {}) => {
  const response = await sendMessage(messages, config.model || aiDefaultModel, {
    ...config,
    stream: false,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `AI 请求失败：${response.status}`);
  }
  return { data };
};
