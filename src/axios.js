import { mockRequest } from "@/mock/api";

window.$glob = {
  url: "",
  group: "",
  themeId: "",
  theme: {},
  params: {},
  query: {},
  header: {},
  func: {},
};

const query = window.location.search.substring(1);
if (query !== "") {
  query.split("&").forEach(item => {
    const pair = item.split("=");
    window.$glob.params[pair[0]] = pair[1];
  });
}

const request = config => mockRequest(config);

request.get = (url, config = {}) =>
  mockRequest({
    ...config,
    url,
    method: "get",
  });

request.post = (url, data, config = {}) =>
  mockRequest({
    ...config,
    url,
    data,
    method: "post",
  });

request.defaults = {
  timeout: 0,
  validateStatus: status => status >= 200 && status <= 500,
};

request.interceptors = {
  request: {
    use: () => {},
  },
  response: {
    use: () => {},
  },
};

export default request;
