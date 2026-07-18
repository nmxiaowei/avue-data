<template>
  <el-select
    v-model="value"
    :placeholder="option.placeholder"
    :disabled="option.disabled"
    :clearable="option.clearable"
    :multiple="option.multiple"
    :filterable="option.filterable"
    :size="option.size"
    @change="handleChange(value)">
    <el-option v-for="item in dataChart" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>

<script>
export default {
  name: "select",
  props: { option: { type: Object, default: () => ({}) } },
  data() {
    return { value: this.option.multiple ? [] : "" };
  },
};
</script>
