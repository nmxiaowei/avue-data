<template>
  <el-dialog v-model="show" title="快捷键帮助" class="shortcut-help-dialog" append-to-body width="680px">
    <div class="shortcut-help">
      <div class="shortcut-help__toolbar">
        <el-input v-model="keyword" clearable placeholder="搜索功能或快捷键，例如：保存、Ctrl、图层">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <span>{{ visibleShortcutCount }} 项</span>
      </div>

      <el-alert
        class="shortcut-help__notice"
        type="info"
        :closable="false"
        show-icon
        title="快捷键在编辑器画布区域内生效；macOS 会自动显示 Command 键。" />

      <div v-if="visibleGroups.length" class="shortcut-help__groups">
        <section v-for="group in visibleGroups" :key="group.name" class="shortcut-help__group">
          <h3>{{ group.name }}</h3>
          <div v-for="item in group.items" :key="item.name" class="shortcut-help__item">
            <div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.description }}</span>
            </div>
            <div class="shortcut-help__keys">
              <kbd v-for="key in getKeys(item)" :key="key">{{ key }}</kbd>
            </div>
          </div>
        </section>
      </div>
      <el-empty v-else description="没有匹配的快捷键" :image-size="68" />
    </div>
  </el-dialog>
</template>

<script>
import { Search } from "@element-plus/icons-vue";

export default {
  name: "ShortcutHelp",
  components: {
    Search,
  },
  data() {
    return {
      show: false,
      keyword: "",
      shortcutGroups: [
        {
          name: "通用",
          items: [
            { name: "打开快捷键帮助", description: "随时查看全部编辑快捷键", keys: ["F1"] },
            { name: "保存大屏", description: "保存当前大屏配置", keys: ["Ctrl", "S"], macKeys: ["⌘", "S"] },
            { name: "撤销", description: "恢复到上一步编辑状态", keys: ["Ctrl", "Z"], macKeys: ["⌘", "Z"] },
            { name: "重做", description: "恢复被撤销的编辑状态", keys: ["Ctrl", "Y"], macKeys: ["⌘", "Y"] },
          ],
        },
        {
          name: "组件编辑",
          items: [
            { name: "复制组件", description: "复制当前选中的组件", keys: ["Ctrl", "C"], macKeys: ["⌘", "C"] },
            { name: "粘贴组件", description: "粘贴已复制的组件", keys: ["Ctrl", "V"], macKeys: ["⌘", "V"] },
            { name: "剪切组件", description: "剪切当前选中的组件", keys: ["Ctrl", "X"], macKeys: ["⌘", "X"] },
            { name: "复制并偏移", description: "复制当前组件并快速创建副本", keys: ["Ctrl", "D"], macKeys: ["⌘", "D"] },
            { name: "删除组件", description: "删除当前选中的组件", keys: ["Delete"] },
            { name: "锁定或解锁", description: "切换当前组件的锁定状态", keys: ["Ctrl", "L"], macKeys: ["⌘", "L"] },
            { name: "显示或隐藏", description: "切换当前组件的显示状态", keys: ["Ctrl", "H"], macKeys: ["⌘", "H"] },
            { name: "组合或解散", description: "组合多个组件或解散文件夹", keys: ["Ctrl", "G"], macKeys: ["⌘", "G"] },
          ],
        },
        {
          name: "层级与显示",
          items: [
            { name: "置顶", description: "将当前组件移动到最上层", keys: ["Ctrl", "↑"], macKeys: ["⌘", "↑"] },
            { name: "置底", description: "将当前组件移动到最下层", keys: ["Ctrl", "↓"], macKeys: ["⌘", "↓"] },
            { name: "上移一层", description: "将当前组件上移一个图层", keys: ["Shift", "↑"] },
            { name: "下移一层", description: "将当前组件下移一个图层", keys: ["Shift", "↓"] },
            { name: "单独显示", description: "隐藏其他组件，仅显示当前组件", keys: ["Ctrl", "Shift", "H"], macKeys: ["⌘", "Shift", "H"] },
            { name: "退出单独显示", description: "恢复所有组件显示", keys: ["Ctrl", "Shift", "E"], macKeys: ["⌘", "Shift", "E"] },
          ],
        },
        {
          name: "选择与视图",
          items: [
            { name: "多选组件", description: "按住修饰键点击组件或图层", keys: ["Ctrl", "单击"], macKeys: ["⌘", "单击"] },
            { name: "框选组件", description: "按住修饰键在画布拖动框选", keys: ["Ctrl", "拖动"], macKeys: ["⌘", "拖动"] },
            { name: "缩放画布", description: "在画布区域缩放视图", keys: ["Ctrl", "滚轮"], macKeys: ["⌘", "滚轮"] },
          ],
        },
      ],
    };
  },
  computed: {
    isMac() {
      return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");
    },
    visibleGroups() {
      const keyword = this.keyword.trim().toLowerCase();
      return this.shortcutGroups
        .map(group => ({
          ...group,
          items: group.items.filter(item => {
            if (!keyword) return true;
            return `${item.name} ${item.description} ${item.keys.join(" ")} ${(item.macKeys || []).join(" ")}`
              .toLowerCase()
              .includes(keyword);
          }),
        }))
        .filter(group => group.items.length);
    },
    visibleShortcutCount() {
      return this.visibleGroups.reduce((count, group) => count + group.items.length, 0);
    },
  },
  methods: {
    getKeys(item) {
      return this.isMac && item.macKeys ? item.macKeys : item.keys;
    },
  },
};
</script>

<style lang="scss" scoped>
.shortcut-help {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__toolbar {
    display: flex;
    align-items: center;
    gap: 10px;

    .el-input {
      flex: 1;
    }

    > span {
      flex: 0 0 auto;
      color: var(--text-color-secondary);
      font-size: 12px;
      white-space: nowrap;
    }
  }

  &__notice :deep(.el-alert__title) {
    font-size: 12px;
    line-height: 1.45;
  }

  &__groups {
    display: flex;
    max-height: min(58vh, 560px);
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
  }

  &__group {
    overflow: hidden;
    border: 1px solid var(--border-color-lighter);
    border-radius: 8px;
    background: var(--bg-color-secondary);

    h3 {
      margin: 0;
      padding: 8px 10px;
      color: var(--text-color-primary);
      font-size: 13px;
      font-weight: 600;
      border-bottom: 1px solid var(--border-color-lighter);
      background: var(--bg-color-tertiary);
    }
  }

  &__item {
    display: flex;
    min-height: 48px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--border-color-lighter);

    &:last-child {
      border-bottom: 0;
    }

    > div:first-child {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 3px;
    }

    strong,
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: var(--text-color-primary);
      font-size: 12px;
      font-weight: 500;
    }

    span {
      color: var(--text-color-placeholder);
      font-size: 11px;
    }
  }

  &__keys {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 3px;
  }

  kbd {
    min-width: 20px;
    padding: 2px 6px;
    color: var(--text-color-primary);
    text-align: center;
    border: 1px solid var(--border-color-base);
    border-bottom-color: var(--border-color-darker);
    border-radius: 4px;
    background: var(--bg-color-primary);
    box-shadow: 0 1px 0 var(--shadow-color);
    font-family: inherit;
    font-size: 11px;
    line-height: 1.35;
  }
}

@media (max-width: 680px) {
  .shortcut-help {
    &__toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    &__item {
      align-items: flex-start;
      flex-direction: column;
      gap: 7px;
    }
  }
}
</style>
