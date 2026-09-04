<!-- 科技边框配置 -->
<template>
  <div>
    <el-collapse accordion>
      <el-collapse-item title="边框样式">
        <el-form-item label="边框类型">
          <avue-select v-model="main.activeOption.type" :dic="typeList" placeholder="请选择类型">
          </avue-select>
        </el-form-item>
        <el-form-item label="主色">
          <avue-input-color v-model="main.activeOption.color"></avue-input-color>
        </el-form-item>
        <el-form-item label="辅色(发光/渐变)">
          <avue-input-color v-model="main.activeOption.color2"></avue-input-color>
        </el-form-item>
        <el-form-item label="背景颜色">
          <avue-input-color v-model="main.activeOption.backgroundColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="边框宽度">
          <avue-input-number v-model="main.activeOption.borderWidth" :min="1" :max="8">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="发光效果">
          <avue-switch v-model="main.activeOption.glow"></avue-switch>
        </el-form-item>
        <el-form-item label="角落装饰">
          <avue-switch v-model="main.activeOption.decor"></avue-switch>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="标题设置">
        <el-form-item label="显示标题">
          <avue-switch v-model="main.activeOption.titleShow"></avue-switch>
        </el-form-item>
        <template v-if="main.activeOption.titleShow">
          <el-form-item label="标题内容">
            <avue-input v-model="main.activeOption.title" placeholder="或读取数据 title"></avue-input>
          </el-form-item>
          <el-form-item label="标题颜色">
            <avue-input-color v-model="main.activeOption.titleColor"></avue-input-color>
          </el-form-item>
          <el-form-item label="标题大小">
            <avue-input-number v-model="main.activeOption.titleFontSize" :min="10" :max="80">
            </avue-input-number>
          </el-form-item>
          <el-form-item label="标题位置">
            <avue-select v-model="main.activeOption.titlePosition" :dic="dicOption.textAlign">
            </avue-select>
          </el-form-item>
        </template>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { dicOption } from "@/option/config";

export default {
  name: "border",
  data() {
    return {
      dicOption,
      typeList: [
        { label: "四角科技框", value: 1 },
        { label: "发光描边", value: 2 },
        { label: "角标扫描线", value: 3 },
        { label: "圆角渐变", value: 4 },
        { label: "虚线科技框", value: 5 },
        { label: "上下双线装饰", value: 6 },
        { label: "内外双层", value: 7 },
      ],
    };
  },
  inject: ["main"],
};
</script>

<style lang="scss" scoped></style>
