<!-- 柱状图配置 -->
<template>
  <div>
    <el-collapse accordion>
      <el-collapse-item title="柱体设置">
        <el-form-item label="竖展示">
          <avue-switch type="textarea"
                       v-model="main.activeOption.category"></avue-switch>
        </el-form-item>
        <el-form-item label="堆积展示">
          <avue-switch type="textarea"
                       v-model="main.activeOption.stack"></avue-switch>
        </el-form-item>
        <el-form-item label="最大宽度">
          <avue-slider v-model="main.activeOption.barWidth">
          </avue-slider>
        </el-form-item>
        <el-form-item label="圆角">
          <avue-slider v-model="main.activeOption.barRadius">
          </avue-slider>
        </el-form-item>
        <el-form-item label="最小高度">
          <avue-slider v-model="main.activeOption.barMinHeight">
          </avue-slider>
        </el-form-item>
        <el-form-item label="柱间距(%)">
          <avue-input v-model="main.activeOption.barGap"></avue-input>
        </el-form-item>
        <el-form-item label="类目间距(%)">
          <avue-input v-model="main.activeOption.barCategoryGap"></avue-input>
        </el-form-item>
        <el-form-item label="透明度">
          <avue-slider v-model="main.activeOption.barOpacity"
                       :max="1"
                       :step="0.1">
          </avue-slider>
        </el-form-item>
        <el-form-item label="边框颜色">
          <avue-input-color v-model="main.activeOption.barBorderColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="边框宽度">
          <avue-input-number v-model="main.activeOption.barBorderWidth" :max="10"></avue-input-number>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  name: 'bar',
  inject: ["main"]
}
</script>

<style>
</style>
