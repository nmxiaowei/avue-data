<template>
  <el-input
    v-model="value"
    :type="option.type || 'text'"
    :placeholder="option.placeholder"
    :disabled="option.disabled"
    :readonly="option.readonly"
    :clearable="option.clearable"
    :size="option.size"
    :rows="option.rows"
    :resize="option.resize"
    :autosize="option.autosize"
    @click="handleClick(value)"
    @dblclick="handleDblClick(value)"
    @change="handleChange(value)" />
</template>

<script>
export default {
  name: "input",
  props: { option: { type: Object, default: () => ({}) } },
  data: () => ({ value: "" }),
};
</script>
