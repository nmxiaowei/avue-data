import { validatenull } from "@/echart/util";
import { saveErrorLog } from "./errorLogDB";

export const uuid = () => {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
};

export const loadStyle = (id, styles) => {
  const styleId = "style-" + id;
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) existingStyle.remove();
  const style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = styles;
  document.head.appendChild(style);
};

export const createFile = () => {
  return {
    title: "文件夹",
    name: "文件夹",
    index: uuid(),
    menu: true,
    display: false,
    auto: false,
    lock: false,
    children: [],
  };
};

export const compare = propertyName => {
  return function (object1, object2) {
    var value1 = object1[propertyName];
    var value2 = object2[propertyName];
    if (value2 < value1) {
      return -1;
    } else if (value2 > value1) {
      return 1;
    } else {
      return 0;
    }
  };
};

const emptyFunction = () => {};

const logFunctionError = (id, type, fun, error) => {
  if (typeof window !== "undefined" && window.$glob?.errorDebugr) {
    saveErrorLog({
      componentId: id,
      type,
      fun,
      error,
    });
  }

  const tagStyle =
    "color:#fff;background:#1677ff;padding:2px 6px;border-radius:4px;font-weight:600;";
  const labelStyle = "color:#1677ff;font-weight:600;";
  const valueStyle = "color:#d14;font-weight:500;";

  console.groupCollapsed(`%c[${id}]%c ${type}`, tagStyle, labelStyle);
  console.log("%cfun:%c %s", labelStyle, valueStyle, fun);
  console.log("%cerror:%c", labelStyle, valueStyle, error);
  console.groupEnd();
};

const parseFunction = fun => new Function(`return ${fun};`)();

/**
 * 将字符串解析为函数或普通值。
 * 如果解析结果是函数，会额外包一层，统一捕获执行阶段的错误。
 * @param {string} fun - 要解析的函数字符串
 * @param {boolean} def - 当 fun 为空时，是否返回空函数
 * @param {string} id - 组件或函数标识，用于错误日志
 * @returns {*}
 */
export const getFunction = (fun, def, id) => {
  if (validatenull(fun)) {
    return def ? emptyFunction : undefined;
  }

  try {
    const result = parseFunction(fun);

    if (typeof result !== "function") {
      return result;
    }

    return function (...args) {
      try {
        return result.call(this, ...args);
      } catch (error) {
        logFunctionError(id, "函数执行错误", fun, error);
        return emptyFunction;
      }
    };
  } catch (error) {
    logFunctionError(id, "函数解析错误", fun, error);
    return emptyFunction;
  }
};

export const getJson = str => {
  if (validatenull(str)) return {};
  else if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  } else {
    return str;
  }
};

export const checkUrl = url => {
  var reg = /http(s)?:\/\/([\w-.]+)+(:[0-9]+)?.*$/;
  if (!reg.test(url)) {
    return false;
  } else {
    return true;
  }
};

export const loadScript = (type = "js", url, dom = "body") => {
  let flag = false;
  return new Promise(resolve => {
    const head = dom == "head" ? document.getElementsByTagName("head")[0] : document.body;
    for (let i = 0; i < head.children.length; i++) {
      let ele = head.children[i];
      if ((ele.src || "").indexOf(url) !== -1) {
        flag = true;
        resolve();
      }
    }
    if (flag) return;
    let script;
    if (type === "js") {
      script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
    } else if (type === "css") {
      script = document.createElement("link");
      script.rel = "stylesheet";
      script.type = "text/css";
      script.href = url;
    }
    head.appendChild(script);
    script.onload = function () {
      resolve();
    };
    script.onerror = err => {
      resolve();
    };
  });
};

export const dataURLtoFile = (base64, filename) => {
  var arr = base64.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const loadFont = (name, path) => {
  const font = new FontFace(name, `url(${path})`);
  font
    .load()
    .then(() => {
      document.fonts.add(font);
    })
    .catch(error => {
      console.error("Font loading failed:", error);
    });
};

export const getComparisonFunction = operator => {
  switch (operator) {
    case "=":
      return (a, b) => a == b;
    case "!=":
      return (a, b) => a != b;
    case "<":
      return (a, b) => a < b;
    case ">":
      return (a, b) => a > b;
    case "<=":
      return (a, b) => a <= b;
    case ">=":
      return (a, b) => a >= b;
    default:
      throw new Error("不支持的比较操作");
  }
};

export const convertValue = (value, type) => {
  function customBoolean(value) {
    if (typeof value === "string") {
      value = value.toLowerCase();
      return value === "true" || value === "1";
    }
    return Boolean(value);
  }
  switch (type) {
    case "string":
      return String(value);
    case "int":
      return parseInt(value, 10);
    case "float":
      return parseFloat(value);
    case "boolean":
      return customBoolean(value);
    default:
      return value;
  }
};

export const getGlobValue = (str = "") => {
  return str.replace(/\$\{(.+?)\}/g, (match, key) => {
    return window.$glob[key] || "";
  });
};

export const fullScreen = el => {
  function requestFullscreen(el) {
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  if (window.$glob.isFullScreen) {
    window.$glob.isFullScreen = false;
    exitFullscreen();
  } else {
    window.$glob.isFullScreen = true;
    requestFullscreen(el);
  }
};

function _onFullScreenChange() {
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  ) {
    window.$glob.isFullScreen = true;
  } else {
    window.$glob.isFullScreen = false;
  }
}

(function () {
  document.addEventListener("fullscreenchange", _onFullScreenChange);
  document.addEventListener("webkitfullscreenchange", _onFullScreenChange);
  document.addEventListener("mozfullscreenchange", _onFullScreenChange);
  document.addEventListener("MSFullscreenChange", _onFullScreenChange);
})();
