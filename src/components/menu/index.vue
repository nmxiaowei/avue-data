<template>
  <el-menu
    :default-active="active"
    :mode="option.mode || 'vertical'"
    :collapse="option.collapse"
    :background-color="option.backgroundColor"
    :text-color="option.textColor"
    :active-text-color="option.activeTextColor"
    @select="handleSelect">
    <el-menu-item v-for="item in dataChart" :key="item.index" :index="item.index">
      <span>{{ item.title }}</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {
  name: "menu",
  props: { option: { type: Object, default: () => ({}) } },
  data: () => ({ active: "" }),
  methods: {
    handleSelect(index) {
      this.active = index;
      this.handleClick(index);
    },
  },
};
</script>
