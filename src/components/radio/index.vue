<template>
  <el-radio-group v-model="value" :disabled="option.disabled" :size="option.size" @change="handleChange(value)">
    <component
      :is="option.button ? 'el-radio-button' : 'el-radio'"
      v-for="item in dataChart"
      :key="item.value"
      :label="item.value"
      :disabled="item.disabled">
      {{ item.label }}
    </component>
  </el-radio-group>
</template>

<script>
export default {
  name: "radio",
  props: { option: { type: Object, default: () => ({}) } },
  data: () => ({ value: "" }),
};
</script>
