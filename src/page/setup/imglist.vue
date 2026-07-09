<template>
  <el-dialog
    title="图库"
    width="80%"
    class="imgList avue-dialog"
    :close-on-click-modal="false"
    v-model="imgVisible">
    <el-tabs class="imgList__header menu__tabs" v-model="imgActive">
      <el-tab-pane
        :label="item.name"
        v-for="(item, index) in imgList"
        :key="index"
        :name="index"></el-tab-pane>
    </el-tabs>
    <div class="imgList__content">
      <file :menu="false" @submit="handleSubmit" v-if="imgActive === 4"></file>
      <template v-else>
        <div
          class="imgList__border"
          :style="getStyle()"
          :key="index"
          v-for="(item, index) in imgList[imgActive].list">
          <img :src="item.value" @click="handleSetimg(item.value)" />
        </div>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import file from "../list/file.vue";

export default {
  components: {
    file,
  },
  data() {
    return {
      loading: false,
      imgVisible: false,
      imgObj: "",
      type: "",
      imgActive: 0,
      imgList: [],
    };
  },
  watch: {
    type: {
      handler() {
        if (this.type === "background") {
          this.imgActive = 0;
        } else if (this.type === "border") {
          this.imgActive = 2;
        } else {
          this.imgActive = 1;
        }
      },
      immediate: true,
    },
  },
  created() {
    this.imgList = this.getImgList();
  },
  methods: {
    getStyle() {
      if ([1, 2].includes(this.imgActive)) {
        return {
          height: "30px",
        };
      }
      return undefined;
    },
    handleSubmit(href) {
      this.handleSetimg(href);
    },
    getImgList() {
      const safe = this;
      function concat(prop, count, type, extend = [], defaults) {
        const list = [];
        for (let i = 1; i <= count; i += 1) {
          list.push({
            label: prop + i,
            value: `${safe.$router.options.base}img/${prop}/${prop}${i}.${extend.includes(i) ? defaults : type}`,
          });
        }
        return list;
      }
      return [
        {
          name: "背景图",
          list: concat("bg", 18, "jpg", [1, 2, 3], "png"),
        },
        {
          name: "主标题框",
          list: concat("title", 11, "png"),
        },
        {
          name: "副标题框",
          list: concat("subtitle", 22, "png"),
        },
        {
          name: "边框",
          list: concat("border", 44, "png"),
        },
        {
          name: "静态资源",
        },
      ];
    },
    openImg(item, type) {
      this.type = type;
      this.imgObj = item;
      this.imgVisible = true;
    },
    handleSetimg(item) {
      if (!this.imgObj) return;
      this.imgVisible = false;
      this.$emit("change", item, this.imgObj);
    },
  },
};
</script>

<style lang="scss">
.imgList {
  .el-dialog__body {
    position: relative;
  }

  &__header {
    width: 100%;

    .el-tabs__item {
      min-width: 100px;
      text-align: center;
    }
  }

  &__content {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  &__border {
    width: 200px;
    height: 100px;
    margin-top: 10px;
    margin-right: 10px;
    padding: 5px;
    text-align: center;
    border-radius: 5px;
    background-color: var(--bg-color-tertiary);

    img {
      width: 100%;
      height: 100%;
    }

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
