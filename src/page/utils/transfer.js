import { saveDataFlowChangeLog } from "@/utils/dataFlowChangeDB";

export default function (list, refList, params, safe) {
  const componentId = safe?.index || safe?.id || safe?.componentInfo?.id || "unknown";
  const componentName = safe?.name || safe?.component?.label || safe?.componentInfo?.name || "";
  const canLog = typeof window !== "undefined" && window.$glob?.transferDebug;

  const logChange = payload => {
    if (!canLog) return;
    saveDataFlowChangeLog({
      triggerComponentId: componentId,
      triggerComponentName: componentName,
      componentId,
      componentName,
      ...payload,
    }).catch(() => {});
  };

  const getTargetSnapshot = index => {
    const ref = refList[index];
    return {
      index,
      dataChart: ref?.dataChart,
      object: ref?.object,
    };
  };

  const arrayTree = (list, fn) => {
    list.forEach(ele => {
      if (ele.children) arrayTree(ele.children, fn);
      else fn(ele);
    });
  };

  const typeHandlers = {
    params: ele => {
      let p = {};
      let updateData = { query: {}, body: {}, headers: {} };

      ele.child.forEach(item => {
        if (!item.position) {
          p[item.name] = params[item.value];
        } else {
          updateData[item.position][item.name] = params[item.value];
        }
      });

      ele.index.forEach(index => {
        let { item } = this.contain.findnav(index);
        if (!item) return;

        const updateTarget = targetIndex => {
          const before = getTargetSnapshot(targetIndex);
          refList[targetIndex].updateData(p, updateData);
          logChange({
            source: "transfer",
            action: "params",
            targetId: targetIndex,
            targetName: item?.name || "",
            summary: "通过传输动作触发组件数据更新",
            before,
            after: getTargetSnapshot(targetIndex),
            payload: { params: p, updateData, transfer: ele },
          });
        };

        if (item.children) {
          arrayTree(item.children, child => {
            updateTarget(child.index);
          });
        } else {
          updateTarget(index);
        }
      });
    },

    data: ele => {
      typeHandlers.params(ele);
    },

    sendApi: ele => {
      let queryData = {};
      let bodyData = {};
      let headersData = {};

      if (ele.child) {
        ele.child.forEach(item => {
          const value = params[item.value];
          if (item.position === "query") {
            queryData[item.name] = value;
          } else if (item.position === "headers") {
            headersData[item.name] = value;
          } else {
            bodyData[item.name] = value;
          }
        });
      }

      const method = ele.method || "post";
      const url = ele.url;

      if (!url) {
        console.warn("API请求地址不能为空");
        return;
      }

      const config = {
        method,
        url,
        headers: headersData,
      };

      if (method === "get" || method === "delete") {
        config.params = { ...queryData, ...bodyData };
      } else {
        config.params = queryData;
        config.data = bodyData;
      }

      window.axios(config)
        .then(res => {
          console.log("API请求成功:", res);
          logChange({
            source: "transfer",
            action: "sendApi",
            summary: "触发 API 发送",
            payload: {
              request: config,
              response: res?.data,
              transfer: ele,
            },
          });
        })
        .catch(err => {
          console.error("API请求失败:", err);
          logChange({
            source: "transfer",
            action: "sendApi",
            summary: "触发 API 发送失败",
            payload: {
              request: config,
              error: err?.message || err,
              transfer: ele,
            },
          });
        });
    },

    group: ele => {
      const before = { group: window.$glob.group };
      window.$glob.group = ele.group;
      logChange({
        source: "transfer",
        action: "group",
        summary: "切换分组上下文",
        before,
        after: { group: window.$glob.group },
        payload: { transfer: ele },
      });
    },

    href: ele => {
      let p = {};
      if (ele.child) {
        ele.child.forEach(item => {
          p[item.name] = params[item.value];
        });
      }
      const url = new URL(ele.src, window.location.origin);
      Object.keys(p).forEach(key => {
        url.searchParams.set(key, p[key]);
      });
      const urlWithParams = url.toString();

      logChange({
        source: "transfer",
        action: "href",
        summary: "触发页面跳转",
        payload: { url: urlWithParams, targetBlank: !!ele.target, params: p, transfer: ele },
      });

      ele.target ? window.open(urlWithParams) : (location.href = urlWithParams);
    },

    dialog: ele => {
      const oldGroup = window.$glob.group;
      let dialogList = document.getElementsByClassName("dialog");
      let dialog = document.createElement("div");
      const zIndex = 10000 + dialogList.length;
      dialog.className = "dialog";
      dialog.style.zIndex = zIndex;
      dialog.innerHTML = `<div class="dialog__title">${ele.title}</div>`;
      document.getElementById("container").append(dialog);

      dialog.addEventListener("click", () => {
        const showCallback = index => {
          let refObj = this.container.getItemRef(index);
          if (refObj) refObj.object.display = true;
        };
        ele.index.forEach(index => {
          let { item } = this.contain.findnav(index);
          if (item.children) {
            arrayTree(item.children, child => {
              showCallback(child.index);
            });
          } else {
            showCallback(index);
          }
        });
        window.$glob.group = oldGroup;
        dialog.remove();
      });

      const hideCallback = list => {
        list.forEach(index => {
          let { item } = this.contain.findnav(index);
          if (!item) return;
          const hideItemCallback = index => {
            let styleObj = this.container.getListRef(index);
            let refObj = this.container.getItemRef(index);
            if (styleObj && refObj) {
              refObj.object.display = false;
              setTimeout(() => {
                styleObj = styleObj.$el.style;
                styleObj.zIndex = zIndex + 1;
              }, 0);
            }
          };
          if (item.children) {
            arrayTree(item.children, child => {
              hideItemCallback(child.index);
            });
          } else {
            hideItemCallback(index);
          }
        });
      };

      hideCallback(ele.index);
      if (ele.group) {
        window.$glob.group = ele.group;
        setTimeout(() => {
          let list = this.contain.allList
            .filter(item => item.group == ele.group)
            .map(item => item.index);
          hideCallback(list);
        });
      }

      logChange({
        source: "transfer",
        action: "dialog",
        summary: "触发对话框控制",
        payload: { transfer: ele },
      });
    },

    display: ele => {
      ele.index.forEach(index => {
        let { item } = this.contain.findnav(index);
        if (!item) return;
        const displayCallback = index => {
          let refObj = this.container.getItemRef(index);
          if (refObj) {
            const before = { display: refObj.object.display };
            if (ele.displayType === "") {
              refObj.object.display = !refObj.object.display;
            } else {
              refObj.object.display = ele.displayType;
            }
            logChange({
              source: "transfer",
              action: "display",
              targetId: index,
              targetName: item.name || "",
              summary: "修改组件显示状态",
              before,
              after: { display: refObj.object.display },
              payload: { transfer: ele },
            });
          }
        };
        if (item.children) {
          arrayTree(item.children, child => {
            displayCallback(child.index);
          });
        } else {
          displayCallback(index);
        }
      });
    },

    move: ele => {
      ele.index.forEach(index => {
        let { item } = this.contain.findnav(index);
        if (!item) return;
        const moveCallback = index => {
          let refObj = this.container.getItemRef(index);
          if (refObj) {
            const before = {
              left: refObj.object.left,
              top: refObj.object.top,
            };
            refObj.object.left = Number(ele.left);
            refObj.object.top = Number(ele.top);
            logChange({
              source: "transfer",
              action: "move",
              targetId: index,
              targetName: item.name || "",
              summary: "修改组件位置",
              before,
              after: {
                left: refObj.object.left,
                top: refObj.object.top,
              },
              payload: { transfer: ele },
            });
          }
        };
        if (item.children) {
          arrayTree(item.children, child => {
            moveCallback(child.index);
          });
        } else {
          moveCallback(index);
        }
      });
    },

    refresh: ele => {
      ele.index.forEach(index => {
        let { item } = this.contain.findnav(index);
        if (!item) return;
        const refreshCallback = index => {
          let ref = refList[index];
          if (ref && typeof ref.updateData === "function") {
            ref.updateData();
            logChange({
              source: "transfer",
              action: "refresh",
              targetId: index,
              targetName: item.name || "",
              summary: "主动刷新组件数据",
              payload: { transfer: ele },
            });
          }
        };
        if (item.children) {
          arrayTree(item.children, child => {
            refreshCallback(child.index);
          });
        } else {
          refreshCallback(index);
        }
      });
    },

    style: ele => {
      let styleObj = {};
      if (ele.child) {
        ele.child.forEach(item => {
          styleObj[item.name] = item.value;
        });
      }
      ele.index.forEach(index => {
        let { item } = this.contain.findnav(index);
        if (!item) return;
        const applyStyle = index => {
          let ref = this.container.getListRef(index);
          if (ref && ref.$el) {
            const before = {};
            Object.keys(styleObj).forEach(prop => {
              before[prop] = ref.$el.style[prop];
              ref.$el.style[prop] = styleObj[prop];
            });
            logChange({
              source: "transfer",
              action: "style",
              targetId: index,
              targetName: item.name || "",
              summary: "修改组件样式",
              before,
              after: styleObj,
              payload: { transfer: ele },
            });
          }
        };
        if (item.children) {
          arrayTree(item.children, child => {
            applyStyle(child.index);
          });
        } else {
          applyStyle(index);
        }
      });
    },

  };

  const basicActions = new Set([
    "params",
    "href",
    "group",
    "display",
    "dialog",
    "move",
    "refresh",
    "sendApi",
    "style",
  ]);

  list.forEach(ele => {
    if (!basicActions.has(ele.type)) return;
    const handler = typeHandlers[ele.type];
    if (handler) {
      handler(ele);
    }
  });
}
