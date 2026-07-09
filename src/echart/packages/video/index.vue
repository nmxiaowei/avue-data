<template>
  <div
    :class="[b(), className]"
    :style="styleSizeName"
    ref="main"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @dblclick="handleDblClick"
    @click="handleClick">
    <video
      :style="[styleChartName, videoStyle, ruleStyle]"
      :class="ruleClassList"
      :muted="option.muted !== false"
      :width="width"
      :height="height"
      :src="mappingValue"
      :poster="option.poster || undefined"
      :preload="option.preload || 'auto'"
      v-bind="params"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      ref="videoEl">
    </video>
  </div>
</template>

<script>
import create from "../../create";

export default create({
  name: "video",
  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      videoHidden: false,
    };
  },
  computed: {
    params() {
      const result = {};
      if (this.option.controls) result.controls = "controls";
      if (this.option.loop && !this.option.endedAction) result.loop = "loop";
      if (this.option.autoplay) result.autoplay = "autoplay";
      if (this.option.pip) result.disablePictureInPicture = false;
      return result;
    },
    videoStyle() {
      return {
        objectFit: this.option.objectFit || "fill",
        borderRadius: this.setPx(this.option.borderRadius || 0),
        opacity: this.option.opacity != null ? this.option.opacity : 1,
        backgroundColor: this.option.backgroundColor || "transparent",
        borderWidth: this.setPx(this.option.borderWidth || 0),
        borderColor: this.option.borderColor || "transparent",
        borderStyle: this.option.borderStyle || "solid",
        boxShadow: this.option.boxShadow || "none",
        visibility: this.videoHidden ? "hidden" : "visible",
      };
    },
  },
  watch: {
    "option.playbackRate": {
      handler(val) {
        this.setPlaybackRate(val);
      },
    },
    "option.volume": {
      handler(val) {
        this.setVolume(val);
      },
    },
    "option.startTime": {
      handler(val) {
        const video = this.$refs.videoEl;
        if (video && val != null) video.currentTime = val;
      },
    },
    mappingValue() {
      this.videoHidden = false;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.setPlaybackRate(this.option.playbackRate);
      this.setVolume(this.option.volume);
    });
  },
  beforeUnmount() {
    this.cleanupVideo();
  },
  methods: {
    setPlaybackRate(rate) {
      const video = this.$refs.videoEl;
      if (video && rate) video.playbackRate = rate;
    },
    setVolume(vol) {
      const video = this.$refs.videoEl;
      if (video && vol != null) video.volume = vol;
    },
    onLoadedMetadata() {
      const video = this.$refs.videoEl;
      if (video && this.option.startTime) video.currentTime = this.option.startTime;
    },
    onTimeUpdate() {
      const video = this.$refs.videoEl;
      if (!video || !this.option.endTime || video.currentTime < this.option.endTime) return;

      const action = this.option.endedAction;
      if (action === "replay") {
        video.currentTime = this.option.startTime || 0;
        return;
      }
      video.pause();
      if (action === "hide") this.videoHidden = true;
    },
    onEnded() {
      const video = this.$refs.videoEl;
      if (!video) return;

      const action = this.option.endedAction;
      if (action === "replay") {
        video.currentTime = this.option.startTime || 0;
        video.play();
      } else if (action === "hide") {
        this.videoHidden = true;
      }
    },
    cleanupVideo() {
      const video = this.$refs.videoEl;
      if (!video) return;
      video.pause();
      video.removeAttribute("src");
      video.load();
    },
  },
});
</script>
