// 获取url中的参数
export const addParam = (url,params) => {
  // 如果参数为空直接返回
  if (!params || Object.keys(params).length === 0) return '';

  // 将参数转换为数组
  let result = [];
  for (let key in params) {
    result.push(`${key}=${params[key]}`);
  }

  // 判断url中是否已经包含参数
  const hasParams = url.includes('?');
  
  // 如果已经有参数使用&连接,否则使用?开头
  // 根据url是否已有参数,使用&或?拼接参数
  return `${hasParams ? '&' : '?'}${result.join('&')}`;
};
export const getUrlParams = (url) => {
  let result = {
    url: '',
    params: {}
  };
  let list = url.split('?');
  result.url = list[0];
  let params = list[1];
  if (params) {
    let list = params.split('&');
    list.forEach(ele => {
      let dic = ele.split('=');
      let label = dic[0];
      let value = dic[1];
      result.params[label] = value;
    });
  }
  return result;
};
export const getObjType = obj => {
  var toString = Object.prototype.toString;
  var map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  };
  if (obj instanceof Element) {
    return 'element';
  }
  return map[toString.call(obj)];
};
export const deepClone = data => {
  var type = getObjType(data);
  var obj;
  if (type === 'array') obj = [];
  else if (type === 'object') obj = {};
  else return data;
  if (type === 'array') {
    for (var i = 0, len = data.length; i < len; i++) {
      data[i] = (() => {
        if (data[i] === 0) {
          return data[i];
        }
        return data[i];
      })();
      if (data[i]) {
        delete data[i].$parent;
      }
      obj.push(deepClone(data[i]));
    }
  } else if (type === 'object') {
    for (var key in data) {
      if (data) {
        delete data.$parent;
      }
      obj[key] = deepClone(data[key]);
    }
  }
  return obj;
};
export function validatenull (val) {
  // 特殊判断
  if (val && parseInt(val) === 0) return false;
  const list = ['$parent'];
  if (val instanceof Date || typeof val === 'boolean' || typeof val === 'number') return false;
  if (val instanceof Array) {
    if (val.length === 0) return true;
  } else if (val instanceof Object) {
    val = deepClone(val);
    list.forEach(ele => {
      delete val[ele];
    });
    for (var o in val) {
      return false;
    }
    return true;
  } else {
    if (
      val === 'null' ||
      val == null ||
      val === 'undefined' ||
      val === undefined ||
      val === ''
    ) {
      return true;
    }
    return false;
  }
  return false;
}


export const setPx = (val, defval = '') => {
  if (validatenull(val)) val = defval;
  if (validatenull(val)) return '';
  val = val + '';
  if (val.indexOf('%') === -1) {
    val = val + 'px';
  }
  return val;
};

export const loadFont = (path = '') => {
  function checkFont (name) {
    const values = document.fonts.values();
    let isHave = false;
    let item = values.next();
    while (!item.done && !isHave) {
      let fontFace = item.value;
      if (fontFace.family === name) {
        isHave = true;
      }
      return isHave;
    }
  }
  const key = ".ttf"
  if (path.indexOf(key) == -1) return
  let name = path.substr(path.lastIndexOf('/') + 1).replace(key, '')
  if (document.fonts && !checkFont(name)) {
    const fontFace = new FontFace(name, `local('${name}'),url('${path}')`);
    fontFace.load().then(font => document.fonts.add(font));
  }
  return name
}