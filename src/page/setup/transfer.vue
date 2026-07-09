<template>
  <el-form class="transfer-panel" label-width="80px" label-position="left">
    <div class="transfer-toolbar">
      <el-button type="primary" icon="el-icon-plus" @click="open()">新增</el-button>
    </div>

    <draggable
      ghost-class="ghost"
      class="transfer-list"
      :group="{ name: 'event' }"
      v-if="activeParamList.length"
      v-model="contain.activeObj.child.paramList"
      item-key="name"
      :animation="300">
      <template #item="{ element, index }">
        <div class="transfer-card" @click="open(index)">
          <div class="transfer-card__main">
            <el-tooltip effect="dark" content="激活" placement="top">
              <el-checkbox v-model="element.switch" size="small" @click.stop></el-checkbox>
            </el-tooltip>
            <span class="transfer-card__index">{{ index + 1 }}</span>
            <input
              class="transfer-card__name"
              type="text"
              @click.stop="() => {}"
              :disabled="!element.switch"
              v-model="element.name" />
            <el-tag size="small" effect="plain">{{ getEventLabel(element) }}</el-tag>
            <el-tag size="small" effect="plain" type="success">{{ getTypeLabel(element) }}</el-tag>
          </div>
          <div class="transfer-card__actions">
            <el-tooltip content="删除" placement="top">
              <el-button type="danger" link @click.stop="handleDel(element, index)">
                <el-icon><el-icon-delete /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </template>
    </draggable>

    <div v-else class="empty-tip">
      <el-icon size="32"><el-icon-connection /></el-icon>
      <p>暂无交互事件</p>
      <p class="sub-tip">点击“新增”添加基础交互</p>
    </div>

    <el-drawer
      v-model="box"
      :close-on-click-modal="false"
      class="avue-dialog transfer-drawer"
      size="50%">
      <template #header>
        <div class="transfer-drawer__title">
          <span>交互编辑器</span>
          <el-tag v-if="list.length" size="small">{{ list.length }}</el-tag>
        </div>
      </template>

      <div class="transfer-drawer__toolbar">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd()">新增交互事件</el-button>
      </div>

      <el-form class="transfer-form" label-width="86px" label-position="left">
        <template v-if="list.length">
          <el-collapse class="avue-collapse transfer-collapse" v-model="activeName">
            <el-collapse-item :name="index" v-for="(item, index) in list" :key="index">
              <template #title>
                <div class="avue-collapse__header transfer-source-title">
                  <div class="transfer-source-title__main" @click.stop>
                    <el-tooltip effect="dark" content="激活" placement="top">
                      <el-checkbox v-model="item.switch" size="small"></el-checkbox>
                    </el-tooltip>
                    <span class="transfer-source-title__index">{{ index + 1 }}</span>
                    <span
                      class="transfer-source-title__toggle-icon"
                      :class="{ 'is-active': isTransferExpanded(index) }"
                      @click.stop="toggleTransfer(index)">
                      <el-icon><el-icon-arrow-right /></el-icon>
                    </span>
                    <avue-input
                      v-model="item.name"
                      placeholder="交互名称"
                      :disabled="!item.switch"></avue-input>
                    <avue-select
                      :dic="basicTransferEvents"
                      v-model="item.event"
                      :disabled="!item.switch"
                      placeholder="事件"></avue-select>
                  </div>
                  <el-tooltip content="删除" placement="top">
                    <el-button type="danger" link @click.stop="handleDel(item, index, true)">
                      <el-icon><el-icon-delete /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </template>

              <div class="transfer__box">
                <div class="transfer__box-header">
                  <span>动作</span>
                  <avue-select
                    :dic="basicTransferActions"
                    class="transfer__type-select"
                    v-model="item.type"
                    placeholder="请选择动作"></avue-select>
                </div>
                <event-temp :item="item"></event-temp>
              </div>
            </el-collapse-item>
          </el-collapse>
        </template>

        <div v-else class="empty-tip">
          <el-icon size="32"><el-icon-connection /></el-icon>
          <p>暂无交互事件</p>
          <p class="sub-tip">点击“新增交互事件”添加基础交互</p>
          <el-button
            style="margin-top: 10px"
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="handleAdd()">
            新增交互事件
          </el-button>
        </div>
      </el-form>

      <span class="avue-dialog__footer avue-dialog__footer--right transfer-footer">
        <el-button @click="close()">取消</el-button>
        <el-button type="primary" @click="submit()">确定</el-button>
      </span>
    </el-drawer>
  </el-form>
</template>

<script>
import vuedraggable from "vuedraggable";
import { dicOption } from "@/option/config";
import eventTemp from "@/page/setup/event-temp.vue";

const BASIC_EVENTS = [
  "clickFormatter",
  "dblClickFormatter",
  "mouseEnterFormatter",
  "mouseLeaveFormatter",
  "changeFormatter",
];

const BASIC_ACTIONS = [
  "params",
  "href",
  "group",
  "display",
  "dialog",
  "move",
  "refresh",
  "sendApi",
  "style",
];

export default {
  inject: ["contain"],
  components: {
    eventTemp,
    draggable: vuedraggable,
  },
  data() {
    return {
      list: [],
      box: false,
      activeName: 0,
    };
  },
  computed: {
    activeParamList() {
      return this.contain.activeObj.child?.paramList || [];
    },
    basicTransferEvents() {
      return dicOption.transferEvent.filter(item => BASIC_EVENTS.includes(item.value));
    },
    basicTransferActions() {
      return dicOption.transfer.filter(item => BASIC_ACTIONS.includes(item.value));
    },
  },
  methods: {
    getEventLabel(item) {
      return this.basicTransferEvents.find(ele => ele.value === item.event)?.label || "事件";
    },
    getTypeLabel(item) {
      return this.basicTransferActions.find(ele => ele.value === item.type)?.label || "动作";
    },
    isTransferExpanded(index) {
      const activeName = this.activeName;
      if (Array.isArray(activeName)) {
        return activeName.map(String).includes(String(index));
      }
      return String(activeName) === String(index);
    },
    toggleTransfer(index) {
      if (Array.isArray(this.activeName)) {
        this.activeName = this.isTransferExpanded(index)
          ? this.activeName.filter(item => String(item) !== String(index))
          : this.activeName.concat(index);
        return;
      }
      this.activeName = this.isTransferExpanded(index) ? "" : index;
    },
    normalizeItem(item = {}) {
      const next = {
        ...item,
        child: Array.isArray(item.child) ? item.child : [],
      };
      if (!BASIC_EVENTS.includes(next.event)) next.event = "clickFormatter";
      if (!BASIC_ACTIONS.includes(next.type)) next.type = "params";
      delete next.condition;
      delete next.fun;
      return next;
    },
    open(index = 0) {
      this.list = this.deepClone(this.activeParamList).map(item => this.normalizeItem(item));
      this.activeName = index;
      this.box = true;
    },
    submit() {
      this.contain.activeObj.child.paramList = this.list.map(item => this.normalizeItem(item));
      this.close();
    },
    close() {
      this.box = false;
    },
    handleDel(item, index, flag) {
      this.$confirm(`是否删除【${item.name}】交互?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const targetList = flag ? this.list : this.contain.activeObj.child.paramList;
        targetList.splice(index, 1);
      });
    },
    handleAdd() {
      this.list.push({
        name: "新增交互",
        switch: true,
        event: "clickFormatter",
        index: [],
        type: "params",
        child: [],
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@use "../../styles/setup-panel.scss" as setup;

.transfer-panel {
  @include setup.panel-root;
}

.transfer-toolbar,
.transfer-drawer__toolbar {
  @include setup.toolbar;
}

.transfer-list {
  @include setup.card-list;
}

.transfer-card {
  @include setup.card;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
    background: var(--bg-color-hover);
  }

  &__main {
    min-width: 0;
    display: grid;
    grid-template-columns: auto 24px minmax(70px, 1fr) auto auto;
    align-items: center;
    gap: 8px;
  }

  &__index {
    @include setup.index-badge;
  }

  &__name {
    min-width: 0;
    height: 26px;
    padding: 0 8px;
    color: var(--text-color-primary);
    border: 1px solid var(--border-color-lighter);
    border-radius: 6px;
    outline: none;
    background: var(--bg-color-primary);
  }

  &__actions {
    @include setup.action-row;
  }
}

@include setup.drawer-shell("transfer-drawer");

.transfer-drawer__title {
  @include setup.drawer-title;
}

.transfer-form {
  @include setup.compact-form;
}

.transfer-collapse {
  @include setup.collapse-card;
}

.transfer-source-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  &__main {
    min-width: 0;
    display: grid;
    grid-template-columns: auto 24px 24px minmax(0, 1fr) minmax(110px, 140px);
    align-items: center;
    gap: 8px;
  }

  &__index {
    @include setup.index-badge;
  }

  &__toggle-icon {
    @include setup.toggle-icon;
  }
}

.transfer__box {
  margin-bottom: 12px;
  border: 1px solid var(--border-color-lighter);
  border-radius: 8px;
  background: var(--bg-color-primary);
  overflow: hidden;
}

.transfer__box-header {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  color: var(--text-color-primary);
  border-bottom: 1px solid var(--border-color-lighter);
  font-size: 13px;
  font-weight: 600;
}

.transfer__type-select {
  width: 200px;
  flex: 0 0 200px;
}

.transfer-footer {
  @include setup.fixed-footer;
}

.empty-tip {
  @include setup.empty-tip;
}
</style>
