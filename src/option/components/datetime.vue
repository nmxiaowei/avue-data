<template>
  <el-collapse accordion>
    <el-collapse-item title="时间格式">
      <el-form-item label="显示格式">
        <el-input v-model="main.activeOption.format" placeholder="yyyy-MM-dd hh:mm:ss" />
      </el-form-item>
      <el-form-item label="前缀">
        <el-input v-model="main.activeOption.prefix" />
      </el-form-item>
      <el-form-item label="后缀">
        <el-input v-model="main.activeOption.suffix" />
      </el-form-item>
      <el-form-item label="文字大小">
        <el-input-number v-model="main.activeOption.fontSize" :min="12" :max="200" />
      </el-form-item>
      <el-form-item label="文字颜色">
        <avue-input-color v-model="main.activeOption.color" />
      </el-form-item>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
export default { name: "datetime", inject: ["main"] };
</script>
