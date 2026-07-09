<template>
  <el-collapse accordion>
    <el-form-item label="大屏大小">
      <div class="flex">
        <avue-input-number style="width: 100px" v-model="contain.config.width"></avue-input-number>
        &nbsp;x&nbsp;
        <avue-input-number style="width: 100px" v-model="contain.config.height"></avue-input-number>
      </div>
    </el-form-item>
    <el-form-item label="大屏简介">
      <avue-input v-model="contain.config.info" type="textarea" :min-rows="4"></avue-input>
    </el-form-item>
    <el-form-item label="背景颜色">
      <avue-input-color v-model="contain.config.backgroundColor"></avue-input-color>
    </el-form-item>
    <el-form-item label="背景图片">
      <img
        :src="contain.config.backgroundImage"
        @click="contain.handleOpenImg('config.backgroundImage', 'background')"
        alt=""
        style="width: 100%" />
      <el-input clearable v-model="contain.config.backgroundImage">
        <template #append>
          <div @click="contain.handleOpenImg('config.backgroundImage', 'background')">
            <i class="iconfont icon-img"></i>
          </div>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item label="适配方式">
      <el-radio-group v-model="contain.config.screen">
        <el-radio-button value="x">
          <svg-icon icon-class="fix2" />
        </el-radio-button>
        <el-radio-button value="y">
          <svg-icon icon-class="fix3" />
        </el-radio-button>
        <el-radio-button value="xy">
          <svg-icon icon-class="fix4" />
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-collapse-item title="画布">
      <el-form-item label="文件夹穿透">
        <avue-switch v-model="contain.config.folderDeep"></avue-switch>
      </el-form-item>
      <el-form-item label="超出隐藏">
        <avue-switch v-model="contain.config.overflow"></avue-switch>
      </el-form-item>
      <el-form-item label="辅助网格">
        <avue-switch v-model="contain.config.gradeShow"></avue-switch>
      </el-form-item>
      <el-form-item label="辅助线">
        <avue-switch v-model="contain.config.toolShow"></avue-switch>
      </el-form-item>
    </el-collapse-item>
    <el-collapse-item title="滤镜">
      <el-form-item label="开启">
        <avue-switch size="small" v-model="contain.config.styles.show"></avue-switch>
      </el-form-item>
      <template v-if="contain.config.styles.show">
        <el-form-item label="对比度">
          <avue-slider v-model="contain.config.styles.contrast" :max="400"></avue-slider>
        </el-form-item>
        <el-form-item label="饱和度">
          <avue-slider v-model="contain.config.styles.saturate" :max="400"></avue-slider>
        </el-form-item>
        <el-form-item label="亮度">
          <avue-slider v-model="contain.config.styles.brightness" :max="400"></avue-slider>
        </el-form-item>
        <el-form-item label="透明度">
          <avue-slider v-model="contain.config.styles.opacity" :max="100"></avue-slider>
        </el-form-item>
        <el-form-item label="灰度">
          <avue-slider v-model="contain.config.styles.grayscale" :max="400"></avue-slider>
        </el-form-item>
        <el-form-item label="色相">
          <avue-slider v-model="contain.config.styles.hueRotate" :max="1000"></avue-slider>
        </el-form-item>
        <el-form-item label="反转">
          <avue-slider v-model="contain.config.styles.invert" :max="400"></avue-slider>
        </el-form-item>
        <el-form-item label="模糊">
          <avue-slider v-model="contain.config.styles.blur" :max="100"></avue-slider>
        </el-form-item>
      </template>
    </el-collapse-item>
    <el-collapse-item title="水印">
      <el-form-item label="开启">
        <avue-switch v-model="contain.config.mark.show"></avue-switch>
      </el-form-item>
      <template v-if="contain.config.mark.show">
        <el-form-item label="内容">
          <avue-input v-model="contain.config.mark.text" placeholder="请输入水印内容"></avue-input>
        </el-form-item>
        <el-form-item label="大小">
          <avue-input-number v-model="contain.config.mark.fontSize"></avue-input-number>
        </el-form-item>
        <el-form-item label="颜色">
          <avue-input-color v-model="contain.config.mark.color"></avue-input-color>
        </el-form-item>
        <el-form-item label="角度">
          <avue-input-number v-model="contain.config.mark.degree"></avue-input-number>
        </el-form-item>
      </template>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
export default {
  name: "screen",
  inject: ["contain"],
};
</script>
