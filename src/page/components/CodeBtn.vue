<template>
  <div class="code-btn">
    <quick-insert />
    <div class="spacer"></div>
  </div>
</template>

<script>
import quickInsert from "@/page/components/QuickInsert.vue";

export default {
  name: "CodeLib",
  components: {
    quickInsert,
  },
};
</script>

<style lang="scss" scoped>
.code-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;

  .spacer {
    flex: 1;
  }
}
</style>
