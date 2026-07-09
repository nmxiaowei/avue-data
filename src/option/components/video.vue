<!-- video配置 -->
<template>
  <div>
    <el-form-item label="地址">
      <avue-input type="textarea" v-model="main.activeObj.data.value"></avue-input>
    </el-form-item>
    <el-collapse accordion>
      <el-collapse-item title="播放设置">
        <el-form-item label="自动播放">
          <avue-switch v-model="main.activeOption.autoplay"></avue-switch>
        </el-form-item>
        <el-form-item label="控制台">
          <avue-switch v-model="main.activeOption.controls"></avue-switch>
        </el-form-item>
        <el-form-item label="循环">
          <avue-switch v-model="main.activeOption.loop"></avue-switch>
        </el-form-item>
        <el-form-item label="静音">
          <avue-switch v-model="main.activeOption.muted"></avue-switch>
        </el-form-item>
        <el-form-item label="预加载">
          <avue-select v-model="main.activeOption.preload" :dic="dicOption.preload"> </avue-select>
        </el-form-item>
        <el-form-item label="播放速率">
          <avue-select v-model="main.activeOption.playbackRate" :dic="dicOption.playbackRate">
          </avue-select>
        </el-form-item>
        <el-form-item label="音量">
          <avue-slider v-model="main.activeOption.volume" :max="1" :step="0.1"></avue-slider>
        </el-form-item>
        <el-form-item label="起始时间(s)">
          <avue-input-number v-model="main.activeOption.startTime" :min="0"></avue-input-number>
        </el-form-item>
        <el-form-item label="结束时间(s)">
          <avue-input-number v-model="main.activeOption.endTime" :min="0"></avue-input-number>
        </el-form-item>
        <el-form-item label="结束动作">
          <avue-select v-model="main.activeOption.endedAction" :dic="dicOption.endedAction">
          </avue-select>
        </el-form-item>
        <el-form-item label="画中画">
          <avue-switch v-model="main.activeOption.pip"></avue-switch>
        </el-form-item>
        <el-form-item label="封面">
          <img
            v-if="main.activeOption.poster"
            :src="main.activeOption.poster"
            alt=""
            style="width: 100%" />
          <el-input v-model="main.activeOption.poster">
            <template #append>
              <div @click="main.handleOpenImg('activeOption.poster')">
                <i class="iconfont icon-img"></i>
              </div>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="填充方式">
          <avue-select v-model="main.activeOption.objectFit" :dic="dicOption.objectFit">
          </avue-select>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { dicOption } from "@/option/config";
export default {
  name: "video",
  data() {
    return {
      dicOption: dicOption,
    };
  },
  inject: ["main"],
};
</script>

<style></style>
