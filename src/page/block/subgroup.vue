<template>
  <div
    v-for="item in nav"
    :key="item.index"
    @contextmenu.prevent.stop="contain.handleContextMenu($event, item)">
    <template v-if="!item.children">
      <simple-draggable
        v-bind="item"
        :range="!contain.isSelectActive"
        :line="!contain.isSelectActive"
        :tool="contain.config.toolShow"
        :scale="container.stepScale"
        :disabled="!contain.menuFlag"
        :step="container.stepScale"
        :width="item.component.width"
        :height="item.component.height"
        :ref="common.DEAFNAME + item.index"
        :id="common.DEAFNAME + item.index"
        :active-flag="contain.active.includes(item.index)"
        v-show="getShow(item) && getHide(item) && !getComnponentName(item)"
        @move="handleMove"
        @out="handleOut"
        @over="handleOver"
        @focus="handleFocus"
        @blur="handleBlur">
        <temp :item="item" :ref="common.NAME + item.index"></temp>
      </simple-draggable>
      <subgroup :nav="item.children"></subgroup>
    </template>
    <folder
      v-else
      @move="handleMove"
      @out="handleOut"
      @over="handleOver"
      @focus="handleFocus"
      @blur="handleBlur"
      :key="item.index"
      :item="item"
      v-bind="item"
      :style="{ width: item.grid ? item.gridWidth : '' }"
      :deep="contain.config.folderDeep"
      :tool="contain.config.toolShow"
      :step="container.stepScale"
      :scale="container.stepScale"
      :disabled="!contain.menuFlag"
      :id="common.DEAFNAME + item.index"
      :ref="common.DEAFNAME + item.index">
      <component
        class="carousel"
        :is="getComnponentName(item, true)"
        :interval="item.autoInterval"
        :indicator-position="item.autoIndicatorPosition || 'none'"
        :arrow="item.autoArrow || 'never'"
        :direction="item.autoDirection"
        :autoplay="item.autoAutoplay"
        :type="item.autoType"
        :initial-index="item.autoInitialIndex"
        :span="24"
        :gutter="item.gridGutter"
        v-if="getComnponentName(item)"
        style="height: 100%">
        <template v-for="citem in item.children">
          <component
            :is="getComnponentName(item, false)"
            :span="24 / item.gridSpan"
            :key="citem.index"
            v-if="getDisplay(citem)">
            <temp
              v-if="!citem.children"
              :parent="item"
              :style="getItemStyle(item)"
              :ref="common.NAME + citem.index"
              :item="citem"></temp>
            <subgroup v-else :nav="citem.children"></subgroup>
          </component>
        </template>
      </component>
    </folder>
  </div>
</template>

<script>
import folder from "./folder.vue";
import SimpleDraggable from "./simple-draggable.vue";
import temp from "./temp.vue";
import common from "@/config";
export default {
  name: "subgroup",
  inject: ["contain", "container"],
  provide() {
    return {
      subgroup: this,
    };
  },
  components: {
    folder,
    SimpleDraggable,
    temp,
  },
  props: {
    nav: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      common: common,
    };
  },
  methods: {
    getItemStyle(item) {
      return item.grid ? { position: "relative", top: 0, left: 0 } : {};
    },
    getComnponentName(item, parent) {
      if (item.grid) {
        return parent ? "elRow" : "elCol";
      } else if (item.auto) {
        return parent ? "elCarousel" : "elCarouselItem";
      }
    },
    //刷新数据
    handleRefresh(options) {
      let result = this.getItemRef();
      if (result) return result.updateData(undefined, undefined, options);
      return Promise.resolve();
    },
    getItemRef(index) {
      index = index || this.contain.activeIndex;
      let ref = this.$refs[`${this.common.NAME}${index}`] || [];
      if (ref[0]) {
        return ref[0].$refs.temp;
      } else {
        return {};
      }
    },
    getListRef(index) {
      let ref = this.$refs[`${this.common.DEAFNAME}${index}`] || [];
      return ref[0];
    },
    getDisplay(item) {
      return !item.display;
    },
    getHide(item) {
      return !item.hidden;
    },
    getShow(item) {
      if (!this.container.isBuild && ["time", "data", "notice"].includes(item.component.prop)) {
        return false;
      }
      return true;
    },
    handleMove({ index, left, top }) {
      if (this.contain.activeIndex !== index) return;
      this.contain.activeList.forEach(item => {
        if (this.contain.activeIndex === item.index) return;
        item.left = item.left + left;
        item.top = item.top + top;
      });
    },
    handleOut() {
      this.contain.activeOverIndex = null;
    },
    handleOver({ index }) {
      this.contain.activeOverIndex = index;
    },
    handleFocus({ index }) {
      // 如果组件已在选中列表中，只更新主选中索引，不重置选中列表
      if (this.contain.active.includes(index)) {
        this.contain.activeIndex = index;
      } else {
        this.contain.selectNav(index);
      }
    },
    handleBlur({ index, left, top, width, height, type, rotate }) {
      this.container.gradeFlag = false;
      if (index !== this.contain.activeIndex || type === "folder") return;
      this.contain.activeObj.component.width = width;
      this.contain.activeObj.component.height = height;
      this.contain.activeObj.left = left;
      this.contain.activeObj.top = top;
      this.contain.activeObj.rotate = rotate;
    },
  },
};
</script>
<style>
.carousel .el-carousel__container {
  height: 100%;
}
</style>
