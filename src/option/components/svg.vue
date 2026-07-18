<template>
  <el-collapse accordion>
    <el-collapse-item title="图标样式">
      <el-form-item label="主色">
        <avue-input-color v-model="main.activeOption.color" />
      </el-form-item>
      <el-form-item label="填充色">
        <avue-input-color v-model="main.activeOption.fillColor" />
      </el-form-item>
      <el-form-item label="透明度">
        <el-slider v-model="main.activeOption.opacity" :min="0" :max="1" :step="0.1" />
      </el-form-item>
    </el-collapse-item>
    <el-collapse-item title="SVG 内容">
      <el-form-item label-width="0">
        <el-input v-model="main.activeOption.content" type="textarea" :rows="12" />
      </el-form-item>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
export default { name: "svg", inject: ["main"] };
</script>
