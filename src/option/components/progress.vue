<!-- 进度条配置 -->
<template>
  <div>
    <el-collapse accordion>
      <el-collapse-item title="进度条设置">
        <el-form-item label="类型">
          <avue-radio v-model="main.activeOption.type"
                      :dic="dicOption.line">
          </avue-radio>
        </el-form-item>
        <el-form-item label="线帽样式">
          <avue-radio v-model="main.activeOption.strokeLinecap"
                      :dic="dicOption.strokeLinecap">
          </avue-radio>
        </el-form-item>
        <el-form-item label="宽度">
          <avue-input-number v-model="main.activeOption.strokeWidth"></avue-input-number>
        </el-form-item>
        <el-form-item label="颜色">
          <avue-input-color v-model="main.activeOption.borderColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="轨道颜色">
          <avue-input-color v-model="main.activeOption.trackColor"></avue-input-color>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="渐变设置">
        <el-form-item label="开启渐变">
          <avue-switch v-model="main.activeOption.gradient"></avue-switch>
        </el-form-item>
        <template v-if="main.activeOption.gradient">
          <el-form-item label="起始颜色">
            <avue-input-color v-model="main.activeOption.gradientStart"></avue-input-color>
          </el-form-item>
          <el-form-item label="结束颜色">
            <avue-input-color v-model="main.activeOption.gradientEnd"></avue-input-color>
          </el-form-item>
        </template>
      </el-collapse-item>
      <el-collapse-item title="文本设置">
        <el-form-item label="显示文本">
          <avue-switch v-model="main.activeOption.showText"></avue-switch>
        </el-form-item>
        <el-form-item label="文字内部" v-if="main.activeOption.type=='line' && main.activeOption.showText">
          <avue-switch v-model="main.activeOption.textInside"></avue-switch>
        </el-form-item>
        <el-form-item label="字体大小" v-if="main.activeOption.showText">
          <avue-input-number v-model="main.activeOption.fontSize"></avue-input-number>
        </el-form-item>
        <el-form-item label="字体颜色" v-if="main.activeOption.showText">
          <avue-input-color v-model="main.activeOption.color"></avue-input-color>
        </el-form-item>
        <el-form-item label="文字粗细" v-if="main.activeOption.showText">
          <avue-select v-model="main.activeOption.fontWeight"
                       :dic="dicOption.fontWeight">
          </avue-select>
        </el-form-item>
        <el-form-item label="自定义格式" v-if="main.activeOption.showText">
          <avue-input v-model="main.activeOption.textFormat" placeholder="如: {percentage}%"></avue-input>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="动画效果">
        <el-form-item label="条纹">
          <avue-switch v-model="main.activeOption.striped"></avue-switch>
        </el-form-item>
        <el-form-item label="流动">
          <avue-switch v-model="main.activeOption.stripedFlow"></avue-switch>
        </el-form-item>
        <el-form-item label="动画时长(s)">
          <avue-input-number v-model="main.activeOption.animationDuration" :min="0.1" :max="10" :step="0.1"></avue-input-number>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { dicOption } from '@/option/config'
export default {
  name: 'progress',
  data () {
    return {
      dicOption: dicOption
    }
  },
  inject: ["main"]
}
</script>

<style>
</style>
