<template>
  <div v-if="nav.length === 0 && count === 1" style="padding-top: 100px">
    <el-empty description="暂无组件" :image-size="50" />
  </div>
  <draggable
    v-else
    ghost-class="menu__ghost"
    class="menu__ul"
    :class="{ 'menu__ul--simple': type == 1 }"
    :group="{ name: 'layer' }"
    :list="nav"
    item-key="index">
    <template #item="{ element }">
      <div
        :key="'folder-' + element.index"
        v-show="validGroup(element) && validSearch(element)"
        class="menu__folder"
        :ref="common.NAME + element.index"
        @click.stop="handleSetActive(element, false, $event)"
        @mouseover.stop="mouseOver(element)"
        @mouseout.stop="mouseOut(element)"
        v-if="element.children">
        <div
          @contextmenu.prevent.stop="contain.handleContextMenu($event, element)"
          :class="[
            'menu__item--folder',
            {
              'is-active': handleGetActive(element),
              'is-over': contain.activeOverIndex === element.index,
            },
          ]">
          <i
            class="iconfont icon-fold"
            @click.stop="openFolder(element)"
            :class="{ 'is-active': element.menu }"></i>
          <i class="iconfont icon-folder" @click.stop="handleSetActive(element, true, $event)"></i>
          <span class="menu__label" v-if="element.isname">
            <input
              type="text"
              @keyup.enter="element.isname = false"
              v-if="element.isname"
              v-model="element.name" />
          </span>
          <span v-else @dblclick="handleChangeName(element)" class="menu__name">{{
            element.name
          }}</span>
          <span
            v-if="getCursorUser(element.index)"
            class="menu__cursor-dot"
            :style="{ background: getCursorUser(element.index).color }">
          </span>
          <span class="menu__menu">
            <el-icon
              :class="{ 'is-active': element.auto == true }"
              @click.stop="contain.handleParams('auto', element)">
              <el-icon-video-play></el-icon-video-play>
            </el-icon>
            <el-icon
              :class="{ 'is-active': element.grid == true }"
              @click.stop="contain.handleParams('grid', element)">
              <el-icon-grid></el-icon-grid>
            </el-icon>
            <i
              class="iconfont icon-buxianshi"
              :class="{ 'is-active': element.display == true }"
              @click.stop="contain.handleParams('display', element)"></i>
            <el-icon
              :class="{ 'is-active': element.lock === true }"
              @click.stop="contain.handleParams('lock', element)">
              <el-icon-lock />
            </el-icon>
          </span>
        </div>
        <div :key="'list' + element.index" class="menu__list" v-show="element.menu">
          <layer
            :count="count + 1"
            :type="type"
            :key="element.index"
            :nav="element.children"
            :search="search"></layer>
        </div>
      </div>
      <div
        v-else
        v-show="validGroup(element) && validSearch(element)"
        :key="'item-' + element.index"
        @contextmenu.prevent.stop="contain.handleContextMenu($event, element)"
        @click.stop="handleSetActive(element, true, $event)"
        :class="[
          'menu__item',
          {
            'is-active': handleGetActive(element),
            'is-over': contain.activeOverIndex === element.index,
          },
        ]"
        @mouseover.stop="mouseOver(element)"
        @mouseout.stop="mouseOut(element)">
        <span class="menu__icon">
          <i :class="'iconfont ' + element.icon"></i>
        </span>
        <span class="menu__label" v-if="element.isname">
          <input
            type="text"
            @keyup.enter="element.isname = false"
            v-if="element.isname"
            v-model="element.name" />
        </span>
        <span v-else @dblclick="handleChangeName(element)" class="menu__label">{{
          element.name
        }}</span>
        <span
          v-if="getCursorUser(element.index)"
          class="menu__cursor-dot"
          :style="{ background: getCursorUser(element.index).color }">
        </span>
        <span
          v-if="getLockUser(element.index)"
          class="menu__lock-badge"
          :style="{ borderColor: getLockUser(element.index).color }">
          {{ getLockUser(element.index).name && getLockUser(element.index).name[0] }}
        </span>
        <span class="menu__menu">
          <i
            class="iconfont icon-buxianshi"
            :class="{ 'is-active': element.display == true }"
            @click.stop="contain.handleParams('display', element)"></i>
          <el-icon
            :class="{ 'is-active': element.lock === true }"
            @click.stop="contain.handleParams('lock', element)">
            <el-icon-lock />
          </el-icon>
        </span>
      </div>
    </template>
  </draggable>
</template>

<script>
import vuedraggable from "vuedraggable";
import common from "@/config";
export default {
  name: "layer",
  inject: ["contain"],
  components: {
    draggable: vuedraggable,
  },
  props: {
    type: {
      type: Number,
      default: 1,
    },
    count: {
      type: Number,
      default: 1,
    },
    nav: {
      type: Array,
      default: () => {
        return [];
      },
    },
    search: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      common,
    };
  },
  methods: {
    validSearch(item) {
      if (!this.search) return true;
      const keyword = this.search.toLowerCase();
      const name = (item.name || "").toLowerCase();
      const prop = ((item.component || {}).prop || "").toLowerCase();
      // 搜索名称或类型
      if (name.includes(keyword) || prop.includes(keyword)) return true;
      // 如果是文件夹，检查子元素是否匹配
      if (item.children) {
        return item.children.some(child => this.validSearch(child));
      }
      return false;
    },
    validGroup(item) {
      if (this.validatenull(item.group)) return true;
      return item.group == this.contain.group;
    },
    mouseOver(item) {
      this.contain.activeOverIndex = item.index;
    },
    mouseOut(item) {
      this.contain.activeOverIndex = undefined;
    },
    handleGetActive(item) {
      return this.contain.active.includes(item.index);
    },
    handleSetActive(item, type = true, event = null) {
      const isCtrlPressed = event && (event.ctrlKey || event.metaKey);

      // 获取要操作的索引列表
      let indexes = [];
      if (item.children && type) {
        const deepList = list => {
          list.forEach(ele => {
            if (ele.children) deepList(ele.children);
            else indexes.push(ele.index);
          });
        };
        deepList(item.children);
      } else {
        indexes = [item.index];
      }

      if (!isCtrlPressed) {
        // 普通点击：替换选中
        this.contain.selectNav(indexes);
      } else {
        // Ctrl 模式：已全选则取消，否则追加
        const allSelected = indexes.every(i => this.contain.active.includes(i));
        if (allSelected) {
          this.contain.unselectNav(indexes);
        } else {
          this.contain.keys.ctrl = true;
          this.contain.selectNav(indexes);
          this.contain.keys.ctrl = false;
        }
      }
    },
    handleChangeName(item) {
      item.isname = !item.isname;
    },
    openFolder(item) {
      item.menu = !item.menu;
      item.isname = false;
    },
    handleRefresh() {
      const deepList = list => {
        list.forEach(ele => {
          if (ele.children) {
            ele.menu = false;
            deepList(ele.children);
          }
        });
      };
      deepList(this.nav);
    },
    getCursorUser(index) {
      if (!this.contain.syncUserList) return null;
      return this.contain.syncUserList.find(u => !u.isSelf && u.activeIndex === index) || null;
    },
    getLockUser(index) {
      return this.contain.lockedComponents?.[index] || null;
    },
  },
};
</script>

<style scoped>
.menu__cursor-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 2px;
  animation: cursor-pulse 1.5s infinite;
}
@keyframes cursor-pulse {
  50% {
    opacity: 0.3;
  }
}
.menu__lock-badge {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  flex-shrink: 0;
  margin-right: 2px;
  color: var(--text-color-primary);
}
</style>
