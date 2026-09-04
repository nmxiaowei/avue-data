<template>
  <div v-if="visible" class="demo-cruise" @click.stop>
    <div class="demo-cruise__body">
      <div class="demo-cruise__scenes" v-if="scenes.length > 1">
        <span
          v-for="(scene, index) in scenes"
          :key="scene.id || 'main'"
          class="demo-cruise__scene"
          :class="{ 'demo-cruise__scene--active': (contain.group || '') === (scene.id || '') }"
          @click="handleGo(index)">
          {{ scene.name || '未命名' }}
        </span>
      </div>
      <div class="demo-cruise__tools">
        <div
          class="demo-cruise__btn"
          title="全屏切换"
          @click="toggleFullscreen">
          <i class="iconfont icon-fullscreen"></i>
        </div>
        <div
          class="demo-cruise__btn"
          :class="{ 'demo-cruise__btn--primary': playing }"
          :title="playing ? '暂停巡航' : '开始巡航'"
          @click="togglePlay">
          <el-icon>
            <VideoPlay v-if="!playing" />
            <VideoPause v-else />
          </el-icon>
        </div>
        <div class="demo-cruise__interval">
          <span>间隔</span>
          <el-input-number
            v-model="intervalSeconds"
            :min="2"
            :max="600"
            :controls="false"
            size="small"
            :step="1" />
          <span>秒</span>
        </div>
        <div class="demo-cruise__btn" title="刷新组件数据" @click="handleRefresh">
          <el-icon>
            <Refresh />
          </el-icon>
        </div>
        <div class="demo-cruise__btn" title="隐藏控制条" @click="handleHide">
          <el-icon>
            <Close />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Close, Refresh, VideoPause, VideoPlay } from "@element-plus/icons-vue";

const HIDE_KEY = "avue-data-open:demo-cruise-hide";

export default {
  name: "demo-cruise",
  components: {
    Close,
    Refresh,
    VideoPause,
    VideoPlay,
  },
  inject: ["contain"],
  data() {
    return {
      playing: false,
      intervalSeconds: 6,
      cruiseTimer: null,
      isFullscreen: false,
      visible: true,
    };
  },
  computed: {
    scenes() {
      const list = this.contain?.config?.group;
      if (!Array.isArray(list)) return [];
      return list.filter(item => item && typeof item.id === "string" && item.name != null);
    },
  },
  watch: {
    "contain.config.group"(list) {
      if (Array.isArray(list) && list.length) {
        this.syncIntervalFromConfig();
      }
    },
  },
  created() {
    try {
      this.visible = localStorage.getItem(HIDE_KEY) !== "1";
    } catch (e) {
      this.visible = true;
    }
    this.syncIntervalFromConfig();
  },
  beforeUnmount() {
    this.stopCruise();
  },
  methods: {
    syncIntervalFromConfig() {
      const groupTime = Number(this.contain?.config?.groupTime);
      if (groupTime > 1000) {
        this.intervalSeconds = Math.max(2, Math.round(groupTime / 1000));
      }
    },
    currentIndex() {
      const current = this.contain.group || "";
      const index = this.scenes.findIndex(item => (item.id || "") === current);
      return index >= 0 ? index : 0;
    },
    goTo(index) {
      const scene = this.scenes[index];
      if (!scene) return;
      // 通过 $glob.group 赋值以同时驱动 contain.group 与相关 watcher
      window.$glob.group = scene.id || "";
    },
    handleGo(index) {
      this.goTo(index);
    },
    prev() {
      const len = this.scenes.length;
      if (!len) return;
      this.goTo((this.currentIndex() + len - 1) % len);
    },
    next() {
      const len = this.scenes.length;
      if (!len) return;
      this.goTo((this.currentIndex() + 1) % len);
    },
    togglePlay() {
      if (this.playing) {
        this.stopCruise();
      } else {
        this.startCruise();
      }
    },
    startCruise() {
      if (this.playing) return;
      if (this.scenes.length < 2) {
        this.$message && this.$message.warning("当前大屏只有 1 个屏幕,无需巡航");
        return;
      }
      this.playing = true;
      const tick = () => {
        this.next();
        this.cruiseTimer = setTimeout(tick, Math.max(1000, Number(this.intervalSeconds) * 1000));
      };
      tick();
    },
    stopCruise() {
      this.playing = false;
      if (this.cruiseTimer) {
        clearTimeout(this.cruiseTimer);
        this.cruiseTimer = null;
      }
    },
    handleRefresh() {
      const contain = this.contain;
      const refresh = typeof contain?.handleRefresh === "function" ? contain.handleRefresh : null;
      if (!refresh) return;
      const runner = refresh();
      if (runner && typeof runner.then === "function") {
        runner
          .then(() => this.$message && this.$message.success("组件数据已刷新"))
          .catch(() => this.$message && this.$message.error("组件数据刷新失败"));
      }
    },
    toggleFullscreen() {
      if (this.isFullscreen) {
        document.exitFullscreen && document.exitFullscreen();
        this.isFullscreen = false;
      } else {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          el.requestFullscreen().then(() => {
            this.isFullscreen = true;
          });
        } else {
          this.$message && this.$message.warning("当前浏览器不支持全屏");
        }
      }
    },
    handleHide() {
      this.stopCruise();
      this.visible = false;
      try {
        localStorage.setItem(HIDE_KEY, "1");
      } catch (e) {}
    },
  },
};
</script>

<style lang="scss" scoped>
.demo-cruise {
  position: fixed;
  z-index: 9999;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  box-sizing: border-box;
  max-width: calc(100vw - 24px);
  padding: 5px 8px;
  color: #cbd5e1;
  font-size: 12px;
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 8px;
  background: rgba(8, 16, 34, 0.78);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  user-select: none;

  &__body {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  &__scenes {
    display: flex;
    align-items: center;
    gap: 4px;
    max-width: 45vw;
    overflow-x: auto;
  }

  &__scene {
    flex-shrink: 0;
    padding: 2px 8px;
    cursor: pointer;
    border-radius: 4px;
    color: #9fb3d1;
    transition: all 0.2s ease;

    &:hover {
      color: #e2e8f0;
      background: rgba(56, 189, 248, 0.16);
    }

    &--active {
      color: #0f172a;
      background: #38bdf8;
      font-weight: 600;
    }
  }

  &__tools {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    cursor: pointer;
    color: #cbd5e1;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      color: #fff;
      background: rgba(56, 189, 248, 0.22);
    }

    &--primary {
      color: #38bdf8;

      &:hover {
        color: #0f172a;
        background: #38bdf8;
      }
    }
  }

  &__interval {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: 2px;
    color: #9fb3d1;

    :deep(.el-input-number) {
      width: 52px;
    }
  }

  :deep(.el-input__wrapper) {
    background: rgba(15, 23, 42, 0.6);
    box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.3) inset;
  }

  :deep(.el-input__inner) {
    color: #e2e8f0;
    font-size: 12px;
  }
}
</style>
