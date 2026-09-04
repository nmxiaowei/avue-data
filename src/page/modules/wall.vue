<template>
  <el-container class="list">
    <el-header class="content__header">
      <div class="content__box content__nav">
        <div class="content__add">
          <img :src="`${$router.options.base}img/project.png`" height="40" alt="" />
          <div>
            <p>演示墙</p>
            <span>所有大屏小屏预览,可全屏循环轮播</span>
          </div>
        </div>
        <div class="content__page">
          <div class="list-search">
            <el-input v-model="search.name" @keyup.enter="load" placeholder="请输入名称">
              <template #suffix>
                <el-icon @click="load" class="el-input__icon">
                  <el-icon-search />
                </el-icon>
              </template>
            </el-input>
          </div>
          <el-button type="primary" :disabled="!list.length" @click="startWall">全屏轮播</el-button>
        </div>
      </div>
    </el-header>
    <el-main class="content" v-loading="loading">
      <div class="wall-grid" v-if="list.length">
        <div class="wall-card" v-for="item in list" :key="item.id" @click="open(item)">
          <div class="wall-card__cover">
            <img :src="getCover(item)" @error="onCoverError" alt="" />
            <div class="wall-card__status" :class="item.status == 1 ? 'is-on' : ''">
              {{ item.status == 1 ? "已发布" : "未发布" }}
            </div>
          </div>
          <div class="wall-card__main">
            <div class="wall-card__title">{{ item.title }}</div>
            <div class="wall-card__size">{{ item.width }} × {{ item.height }}</div>
          </div>
          <div class="wall-card__btns">
            <el-button link type="primary" size="small" @click.stop="open(item)">预览</el-button>
            <el-button link size="small" @click.stop="edit(item)">编辑</el-button>
          </div>
        </div>
      </div>
      <el-empty v-else class="content__empty" description="暂无大屏">
        <template #image>
          <svg-icon icon-class="empty" />
        </template>
      </el-empty>
    </el-main>

    <el-dialog v-model="wallVisible" title="全屏轮播" width="96%" top="2vh" append-to-body>
      <div class="wall-player">
        <div class="wall-player__stage">
          <iframe :src="playingUrl" class="wall-player__frame"></iframe>
        </div>
        <div class="wall-player__controls">
          <el-button size="small" @click="prev">上一屏</el-button>
          <el-button size="small" type="primary" @click="togglePlay">
            {{ playing ? "暂停" : "播放" }}
          </el-button>
          <span class="wall-player__meta">{{ playingIndex + 1 }} / {{ wallList.length }}</span>
          <el-button size="small" @click="next">下一屏</el-button>
          <el-button size="small" @click="toggleFullscreen">全屏</el-button>
        </div>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import { getList } from "@/api/visual";

export default {
  name: "wallModule",
  data() {
    return {
      loading: false,
      list: [],
      search: { name: "" },
      wallVisible: false,
      wallList: [],
      playingIndex: 0,
      playing: false,
      playTimer: null,
    };
  },
  computed: {
    mainPath() {
      return (window.$website && window.$website.routers && window.$website.routers.mainPath) || "/";
    },
    playingUrl() {
      const item = this.wallList[this.playingIndex];
      if (!item) return "about:blank";
      return `${this.mainPath}view/${item.id}`;
    },
  },
  created() {
    this.load();
  },
  beforeUnmount() {
    this.stopPlay();
  },
  methods: {
    async load() {
      this.loading = true;
      try {
        const res = await getList({ current: 1, size: 999, title: this.search.name });
        const data = res.data?.data || {};
        this.list = data.records || [];
      } catch (error) {
        console.warn("读取大屏列表失败", error);
        this.$message.error("读取大屏列表失败");
      } finally {
        this.loading = false;
      }
    },
    getCover(item) {
      return item.backgroundUrl || `${this.$router.options.base}img/bg-default.png`;
    },
    onCoverError(event) {
      event.target.src = `${this.$router.options.base}img/bg-default.png`;
    },
    open(item) {
      this.$router.push({ path: `${this.mainPath}view/${item.id}` });
    },
    edit(item) {
      this.$router.push({ path: `${this.mainPath}build/${item.id}` });
    },
    startWall() {
      this.wallList = this.list.slice();
      if (!this.wallList.length) return;
      this.playingIndex = 0;
      this.wallVisible = true;
      this.playing = true;
      this.startPlay();
    },
    togglePlay() {
      if (this.playing) {
        this.stopPlay();
      } else {
        this.playing = true;
        this.startPlay();
      }
    },
    startPlay() {
      this.stopPlay();
      this.playTimer = setInterval(() => {
        this.next();
      }, 8000);
    },
    stopPlay() {
      this.playing = false;
      if (this.playTimer) {
        clearInterval(this.playTimer);
        this.playTimer = null;
      }
    },
    prev() {
      const len = this.wallList.length;
      this.playingIndex = (this.playingIndex + len - 1) % len;
    },
    next() {
      const len = this.wallList.length;
      this.playingIndex = (this.playingIndex + 1) % len;
    },
    toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen && document.exitFullscreen();
      } else {
        const el = document.querySelector(".wall-player") || document.documentElement;
        el.requestFullscreen && el.requestFullscreen();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.wall-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.wall-card {
  border: 1px solid var(--border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: var(--bg-color-secondary);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-3px);
    box-shadow: 0 6px 16px var(--shadow-color);
  }

  &__cover {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__status {
    position: absolute;
    left: 8px;
    top: 8px;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 11px;
    color: #fff;
    background: rgba(120, 120, 120, 0.7);

    &.is-on {
      background: rgba(46, 219, 138, 0.8);
    }
  }

  &__main {
    padding: 10px 12px;
  }

  &__title {
    color: var(--text-color-primary);
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__size {
    margin-top: 4px;
    color: var(--text-color-placeholder);
    font-size: 12px;
  }

  &__btns {
    display: flex;
    justify-content: flex-end;
    padding: 0 8px 8px;
  }
}

.wall-player {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__stage {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
  }

  &__frame {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }

  &__controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &__meta {
    color: var(--text-color-regular);
    font-size: 13px;
  }
}
</style>
