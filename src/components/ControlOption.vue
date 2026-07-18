<template>
  <el-collapse accordion>
    <el-collapse-item title="基础设置">
      <template v-if="isInputLike">
        <el-form-item label="占位文本">
          <el-input v-model="main.activeOption.placeholder" />
        </el-form-item>
        <el-form-item label="尺寸">
          <el-select v-model="main.activeOption.size">
            <el-option label="默认" value="default" />
            <el-option label="小" value="small" />
            <el-option label="大" value="large" />
          </el-select>
        </el-form-item>
        <el-form-item label="禁用">
          <el-switch v-model="main.activeOption.disabled" />
        </el-form-item>
      </template>

      <template v-if="type === 'input'">
        <el-form-item label="输入类型">
          <el-select v-model="main.activeOption.type">
            <el-option label="文本" value="text" />
            <el-option label="多行文本" value="textarea" />
            <el-option label="密码" value="password" />
          </el-select>
        </el-form-item>
        <el-form-item label="可清空">
          <el-switch v-model="main.activeOption.clearable" />
        </el-form-item>
      </template>

      <template v-if="type === 'select'">
        <el-form-item label="多选">
          <el-switch v-model="main.activeOption.multiple" />
        </el-form-item>
        <el-form-item label="可搜索">
          <el-switch v-model="main.activeOption.filterable" />
        </el-form-item>
      </template>

      <template v-if="type === 'radio' || type === 'checkbox'">
        <el-form-item label="按钮样式">
          <el-switch v-model="main.activeOption.button" />
        </el-form-item>
        <el-form-item label="禁用">
          <el-switch v-model="main.activeOption.disabled" />
        </el-form-item>
      </template>

      <template v-if="type === 'switch'">
        <el-form-item label="加载状态">
          <el-switch v-model="main.activeOption.loading" />
        </el-form-item>
        <el-form-item label="内嵌文字">
          <el-switch v-model="main.activeOption.inlinePrompt" />
        </el-form-item>
      </template>

      <template v-if="type === 'datetimes'">
        <el-form-item label="选择类型">
          <el-select v-model="main.activeOption.type">
            <el-option label="日期" value="date" />
            <el-option label="日期时间" value="datetime" />
            <el-option label="日期范围" value="daterange" />
          </el-select>
        </el-form-item>
        <el-form-item label="可清空">
          <el-switch v-model="main.activeOption.clearable" />
        </el-form-item>
      </template>

      <template v-if="type === 'menu'">
        <el-form-item label="菜单方向">
          <el-select v-model="main.activeOption.mode">
            <el-option label="垂直" value="vertical" />
            <el-option label="水平" value="horizontal" />
          </el-select>
        </el-form-item>
        <el-form-item label="折叠">
          <el-switch v-model="main.activeOption.collapse" />
        </el-form-item>
      </template>

      <template v-if="type === 'tree'">
        <el-form-item label="显示复选框">
          <el-switch v-model="main.activeOption.showCheckbox" />
        </el-form-item>
        <el-form-item label="默认展开">
          <el-switch v-model="main.activeOption.defaultExpandAll" />
        </el-form-item>
      </template>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
export default {
  inject: ["main"],
  computed: {
    type() {
      return this.main.activeObj?.component?.prop || "";
    },
    isInputLike() {
      return ["input", "select", "datetimes"].includes(this.type);
    },
  },
};
</script>
