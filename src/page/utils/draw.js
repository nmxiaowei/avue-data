import { getFunction, loadFont, loadScript } from "@/utils/utils";
export default function (safe) {
  const next = () => {
    safe.contain.setGlobParams();
    safe.contain.nav = safe.component;
    safe.$refs.loading.hide();
  };
  const callback = () => {
    let before = safe.contain.config.before;
    if (safe.validatenull(before)) return next();
    let beforeFun = getFunction(before)(safe.contain.config);
    beforeFun.then(() => next());
  };
  if (safe.validatenull(safe.contain.config.group)) {
    safe.contain.config.group = [
      {
        name: "主屏幕",
        id: "",
        isname: false,
      },
    ];
  }
  if (!safe.validatenull(safe.contain.config.glob)) {
    let list = safe.contain.config.glob;
    list.forEach(ele => {
      if (ele.type === "url") {
        window.$glob[ele.key] = window.$glob.params[ele.value];
      } else {
        window.$glob[ele.key] = ele.value;
      }
    });
  }
  if (!safe.validatenull(safe.contain.config.funcs)) {
    let list = safe.contain.config.funcs;
    list = Object.keys(list).map(key => list[key]);
    list.forEach(ele => {
      try {
        window.$glob.func[ele.name] = getFunction(ele.func);
      } catch { }
    });
  }
  if (!safe.validatenull(safe.contain.config.fonts)) {
    let list = safe.contain.config.fonts;
    list.forEach(ele => {
      loadFont(ele.name, ele.value);
    });
  }
  let themeId = safe.contain.config.themeId;
  if (!safe.validatenull(themeId)) {
    window.$glob.themeId = themeId;
  }
  let mark = safe.contain.config.mark;
  if (mark.show && !safe.isBuild) {
    safe.$Watermark(
      Object.assign(mark, {
        fontSize: mark.fontSize + "px",
      })
    );
  }
  if (!safe.validatenull(safe.contain.config.groupId)) {
    window.$glob.group = safe.contain.config.groupId;
  }
  if (safe.contain.config.groupCarousel && !safe.isBuild) {
    window.$glob.groupLen = 0;
    if (safe.groupCarouselTimer) clearInterval(safe.groupCarouselTimer);
    safe.groupCarouselTimer = setInterval(() => {
      const groupList = safe.contain.config.groupList || [];
      const groupLen = groupList.length;
      if (!groupLen) return;
      if (window.$glob.groupLen >= groupLen) window.$glob.groupLen = 0;
      window.$glob.group = groupList[window.$glob.groupLen].id;
      window.$glob.groupLen++;
    }, safe.contain.config.groupTime);
  }
  let links = safe.contain.config.links;
  if (!safe.validatenull(links)) {
    try {
      const linksAll = links.map(url => {
        const ext = new URL(url).pathname.split(".").pop(); // 获取文件扩展名
        return loadScript(ext, url);
      });

      Promise.all(linksAll).then(callback).catch(callback);
    } catch {
      callback();
    }
  } else {
    callback();
  }
}
