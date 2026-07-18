<template>
  <el-date-picker
    v-model="value"
    :type="option.type || 'date'"
    :placeholder="option.placeholder"
    :disabled="option.disabled"
    :clearable="option.clearable"
    :size="option.size"
    :format="option.format"
    :value-format="option.valueFormat"
    @change="handleChange(value)" />
</template>

<script>
export default {
  name: "datetimes",
  props: { option: { type: Object, default: () => ({}) } },
  data: () => ({ value: "" }),
};
</script>
