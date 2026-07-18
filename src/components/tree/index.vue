<template>
  <el-tree
    :data="dataChart"
    node-key="value"
    :show-checkbox="option.showCheckbox"
    :default-expand-all="option.defaultExpandAll"
    :expand-on-click-node="option.expandOnClickNode"
    :accordion="option.accordion"
    @node-click="handleClick" />
</template>

<script>
export default {
  name: "tree",
  props: { option: { type: Object, default: () => ({}) } },
};
</script>
