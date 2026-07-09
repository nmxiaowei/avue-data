<!-- 矩形图配置 -->
<template>
  <div>
    <el-collapse accordion>
      <el-collapse-item title="树图设置">
        <el-form-item label="漫游">
          <avue-switch v-model="main.activeOption.roam"></avue-switch>
        </el-form-item>
        <el-form-item label="面包屑导航">
          <avue-switch v-model="main.activeOption.breadcrumb"></avue-switch>
        </el-form-item>
        <el-form-item label="节点间距">
          <avue-input-number v-model="main.activeOption.nodeGap" :min="0" :max="20"></avue-input-number>
        </el-form-item>
        <el-form-item label="边框宽度">
          <avue-input-number v-model="main.activeOption.borderWidth" :min="0" :max="10"></avue-input-number>
        </el-form-item>
        <el-form-item label="边框颜色">
          <avue-input-color v-model="main.activeOption.borderColor"></avue-input-color>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  name: 'rectangle',
  inject: ["main"]
}
</script>

<style>
</style>
