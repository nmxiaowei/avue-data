class DataFlowDebuggerManager {
  constructor() {
    this.debuggerInstances = [];
    this.logBuffer = [];
    this.logBufferMax = 200;
    this.currentComponent = null;
    this.screenId = null;
  }

  setDebugger(instance) {
    if (!this.debuggerInstances.includes(instance)) {
      this.debuggerInstances.push(instance);
      this.logBuffer.forEach(({ method, args }) => {
        if (typeof instance[method] === "function") instance[method](...args);
      });
    }
  }

  removeDebugger(instance) {
    const index = this.debuggerInstances.indexOf(instance);
    if (index > -1) this.debuggerInstances.splice(index, 1);
  }

  getDebugger() {
    return this.debuggerInstances[0] || null;
  }

  setCurrentComponent(componentInfo) {
    this.currentComponent = componentInfo;
  }

  getCurrentComponent() {
    return this.currentComponent;
  }

  setScreenId(id) {
    this.screenId = id;
  }

  enableMqtt() {}

  connectMqtt() {}

  disconnectMqtt() {}

  sendLogViaMqtt() {}

  emit(method, args) {
    this.logBuffer.push({ method, args });
    if (this.logBuffer.length > this.logBufferMax) this.logBuffer.shift();
    this.debuggerInstances.forEach(instance => {
      if (typeof instance[method] === "function") instance[method](...args);
    });
  }

  logApiRequest(...args) {
    this.emit("logApiRequest", args);
  }

  logWebSocket(...args) {
    this.emit("logWebSocket", args);
  }

  logSSE(...args) {
    this.emit("logSSE", args);
  }

  logMQTT(...args) {
    this.emit("logMQTT", args);
  }

  logPublic(...args) {
    this.emit("logPublic", args);
  }

  logFill(...args) {
    this.emit("logFill", args);
  }

  logFlow(...args) {
    this.emit("logFlow", args);
  }
}

export default new DataFlowDebuggerManager();
