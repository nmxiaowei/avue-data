import debounce from "lodash/debounce";

const MAX_HISTORY = 100;

const serialize = value => JSON.stringify(value || []);

const createSnapshot = (nav, clone) => ({
  nav: clone(nav),
  timestamp: Date.now(),
});

export function createEditorHistoryController({
  getNav,
  setNav,
  getHistory,
  setHistory,
  getCurrentIndex,
  setCurrentIndex,
  getSerializedNav,
  setSerializedNav,
  clone,
  message,
}) {
  let debouncedRecorder;

  const restore = () => {
    const snapshot = getHistory()[getCurrentIndex()];
    if (!snapshot?.nav) return false;
    const nav = clone(snapshot.nav);
    setNav(nav);
    setSerializedNav(serialize(nav));
    return true;
  };

  const addSnapshot = nav => {
    const history = getHistory().slice(0, getCurrentIndex() + 1);
    history.push(createSnapshot(nav, clone));

    const overflow = Math.max(0, history.length - MAX_HISTORY);
    if (overflow) history.splice(0, overflow);

    setHistory(history);
    setCurrentIndex(history.length - 1);
  };

  const record = () => {
    try {
      const serialized = serialize(getNav());
      if (serialized === getSerializedNav()) return false;
      setSerializedNav(serialized);
      addSnapshot(getNav());
      return true;
    } catch {
      return false;
    }
  };

  const undo = () => {
    if (getCurrentIndex() <= 0) {
      message?.warning?.("暂无可撤销操作");
      return false;
    }
    setCurrentIndex(getCurrentIndex() - 1);
    return restore();
  };

  const redo = () => {
    if (getCurrentIndex() + 1 >= getHistory().length) {
      message?.warning?.("暂无可重做操作");
      return false;
    }
    setCurrentIndex(getCurrentIndex() + 1);
    return restore();
  };

  const goTo = index => {
    if (!Number.isInteger(index) || index < 0 || index >= getHistory().length) return false;
    if (index === getCurrentIndex()) return true;
    setCurrentIndex(index);
    return restore();
  };

  const clear = () => {
    const nav = getNav();
    setHistory([createSnapshot(nav, clone)]);
    setCurrentIndex(0);
    setSerializedNav(serialize(nav));
  };

  return {
    addSnapshot,
    clear,
    createDebouncedRecorder(wait = 300) {
      debouncedRecorder?.cancel?.();
      debouncedRecorder = debounce(record, wait);
      return debouncedRecorder;
    },
    dispose() {
      debouncedRecorder?.cancel?.();
    },
    goTo,
    record,
    redo,
    restore,
    undo,
  };
}
