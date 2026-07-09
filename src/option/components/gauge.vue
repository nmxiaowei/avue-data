<!-- 刻度盘配置 -->
<template>
  <div>
    <el-collapse accordion>
      <el-collapse-item title="刻度设置">
        <el-form-item label="刻度值">
          <avue-switch v-model="main.activeOption.axisLabelShow"></avue-switch>
        </el-form-item>
        <el-form-item label="刻度字号大小" v-if="main.activeOption.axisLabelShow">
          <avue-input-number v-model="main.activeOption.axisLabelFontSize"></avue-input-number>
        </el-form-item>
        <el-form-item label="刻度粗度">
          <avue-input-number v-model="main.activeOption.lineSize"></avue-input-number>
        </el-form-item>
        <el-form-item label="刻度颜色">
          <avue-input-color v-model="main.activeOption.lineColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="分割段数">
          <avue-input-number v-model="main.activeOption.splitNumber" :min="1" :max="20"></avue-input-number>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="指标设置">
        <el-form-item label="指标字体大小">
          <avue-input-number v-model="main.activeOption.nameFontSize"></avue-input-number>
        </el-form-item>
        <el-form-item label="指标颜色">
          <avue-input-color v-model="main.activeOption.nameColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="指标单位">
          <avue-input v-model="main.activeOption.unit"></avue-input>
        </el-form-item>
        <el-form-item label="最小值">
          <avue-input-number v-model="main.activeOption.min"></avue-input-number>
        </el-form-item>
        <el-form-item label="最大值">
          <avue-input-number v-model="main.activeOption.max"></avue-input-number>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="角度和方向">
        <el-form-item label="起始角度">
          <avue-input-number v-model="main.activeOption.startAngle" :min="0" :max="360"></avue-input-number>
        </el-form-item>
        <el-form-item label="结束角度">
          <avue-input-number v-model="main.activeOption.endAngle" :min="-360" :max="360"></avue-input-number>
        </el-form-item>
        <el-form-item label="顺时针">
          <avue-switch v-model="main.activeOption.clockwise"></avue-switch>
        </el-form-item>
        <el-form-item label="半径(%)">
          <avue-input v-model="main.activeOption.radius"></avue-input>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="指针设置">
        <el-form-item label="显示指针">
          <avue-switch v-model="main.activeOption.pointerShow"></avue-switch>
        </el-form-item>
        <el-form-item label="指针长度(%)" v-if="main.activeOption.pointerShow !== false">
          <avue-input v-model="main.activeOption.pointerLength"></avue-input>
        </el-form-item>
        <el-form-item label="指针宽度" v-if="main.activeOption.pointerShow !== false">
          <avue-input-number v-model="main.activeOption.pointerWidth"></avue-input-number>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  name: 'gauge',
  inject: ['main']
};
</script>

<style></style>
