<template>
  <router-view />
</template>

<script>
import { onMounted } from "vue";
import { initTheme } from "@/utils/theme";

export default {
  setup() {
    onMounted(() => {
      initTheme();
    });
  },
};
</script>
