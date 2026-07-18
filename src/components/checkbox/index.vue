<template>
  <el-checkbox-group v-model="value" :disabled="option.disabled" :size="option.size" @change="handleChange(value)">
    <component
      :is="option.button ? 'el-checkbox-button' : 'el-checkbox'"
      v-for="item in dataChart"
      :key="item.value"
      :label="item.value"
      :disabled="item.disabled">
      {{ item.label }}
    </component>
  </el-checkbox-group>
</template>

<script>
export default {
  name: "checkbox",
  props: { option: { type: Object, default: () => ({}) } },
  data: () => ({ value: [] }),
};
</script>
