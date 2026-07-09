<!-- 饼图的配置 -->
<template>
  <div>
    <el-collapse accordion>
      <el-collapse-item title="饼图设置">
        <el-form-item label="设置为环形">
          <avue-switch v-model="main.activeOption.radius"></avue-switch>
        </el-form-item>
        <el-form-item label="南丁格尔玫瑰">
          <avue-switch v-model="main.activeOption.roseType"></avue-switch>
        </el-form-item>
        <el-form-item label="自动排序">
          <avue-switch v-model="main.activeOption.sort"></avue-switch>
        </el-form-item>
        <el-form-item label="不展示零">
          <avue-switch v-model="main.activeOption.notCount"></avue-switch>
        </el-form-item>
        <el-form-item label="起始角度">
          <avue-input-number v-model="main.activeOption.startAngle" :min="0" :max="360"></avue-input-number>
        </el-form-item>
        <el-form-item label="最小扇区角度">
          <avue-input-number v-model="main.activeOption.minAngle" :min="0" :max="90"></avue-input-number>
        </el-form-item>
        <el-form-item label="顺时针">
          <avue-switch v-model="main.activeOption.clockwise"></avue-switch>
        </el-form-item>
        <el-form-item label="选中偏移">
          <avue-input-number v-model="main.activeOption.selectedOffset" :min="0" :max="50"></avue-input-number>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="半径设置" v-if="main.activeOption.radius">
        <el-form-item label="内半径(%)">
          <avue-input v-model="main.activeOption.radiusInner"></avue-input>
        </el-form-item>
        <el-form-item label="外半径(%)">
          <avue-input v-model="main.activeOption.radiusOuter"></avue-input>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="引导线设置">
        <el-form-item label="显示引导线">
          <avue-switch v-model="main.activeOption.labelLineShow"></avue-switch>
        </el-form-item>
        <el-form-item label="引导线长度" v-if="main.activeOption.labelLineShow">
          <avue-input-number v-model="main.activeOption.labelLineLength"></avue-input-number>
        </el-form-item>
        <el-form-item label="引导线长度2" v-if="main.activeOption.labelLineShow">
          <avue-input-number v-model="main.activeOption.labelLineLength2"></avue-input-number>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  name: 'pie',
  inject: ["main"]
}
</script>

<style>
</style>
