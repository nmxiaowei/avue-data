<!-- 图片配置 -->
<template>
  <div>
    <el-form-item label="图片地址">
      <img
        v-if="main.activeObj.data.value"
        :src="main.activeObj.data.value"
        alt=""
        style="width: 100%" />
      <el-input v-model="main.activeObj.data.value">
        <template #append>
          <div @click="main.handleOpenImg('activeObj.data.value')">
            <i class="iconfont icon-img"></i>
          </div>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item label="填充方式">
      <avue-select v-model="main.activeOption.objectFit" :dic="dicOption.objectFit"> </avue-select>
    </el-form-item>
    <el-collapse accordion>
      <el-collapse-item title="变换效果">
        <el-form-item label="翻转">
          <avue-select v-model="main.activeOption.flip" :dic="dicOption.flipDirection">
          </avue-select>
        </el-form-item>
        <el-form-item label="裁剪形状">
          <avue-select v-model="main.activeOption.clipPath" :dic="dicOption.clipPath">
          </avue-select>
        </el-form-item>
        <el-form-item label="混合模式">
          <avue-select v-model="main.activeOption.mixBlendMode" :dic="dicOption.blendMode">
          </avue-select>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="旋转动画">
        <el-form-item label="开启旋转">
          <avue-switch v-model="main.activeOption.rotate"></avue-switch>
        </el-form-item>
        <template v-if="main.activeOption.rotate">
          <el-form-item label="旋转时间">
            <avue-input-number v-model="main.activeOption.duration"></avue-input-number>
          </el-form-item>
        </template>
      </el-collapse-item>
      <el-collapse-item title="过渡效果">
        <el-form-item label="过渡时长(ms)">
          <avue-input-number
            v-model="main.activeOption.transitionDuration"
            :min="0"
            :max="5000"
            :step="100"></avue-input-number>
        </el-form-item>
        <el-form-item label="悬停透明度">
          <avue-slider v-model="main.activeOption.hoverOpacity" :max="1" :step="0.1"></avue-slider>
        </el-form-item>
        <el-form-item label="悬停缩放">
          <avue-slider
            v-model="main.activeOption.hoverScale"
            :min="0.5"
            :max="2"
            :step="0.05"></avue-slider>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { dicOption } from "@/option/config";
export default {
  name: "img",
  data() {
    return {
      dicOption: dicOption,
    };
  },
  inject: ["main"],
};
</script>

<style></style>
