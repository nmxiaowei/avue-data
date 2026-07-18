<template>
  <el-switch
    v-model="value"
    :disabled="option.disabled"
    :loading="option.loading"
    :inline-prompt="option.inlinePrompt"
    :size="option.size"
    :width="option.width"
    :active-text="option.activeText"
    :inactive-text="option.inactiveText"
    @change="handleChange(value)" />
</template>

<script>
export default {
  name: "switch",
  props: { option: { type: Object, default: () => ({}) } },
  data: () => ({ value: false }),
};
</script>
