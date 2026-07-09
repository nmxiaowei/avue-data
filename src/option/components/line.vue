<!--折线图配置 -->
<template>
  <div>
    <el-collapse accordion>
      <el-collapse-item title="折线设置">
        <el-form-item label="平滑曲线">
          <avue-switch v-model="main.activeOption.smooth">
          </avue-switch>
        </el-form-item>
        <el-form-item label="面积堆积">
          <avue-switch v-model="main.activeOption.areaStyle"></avue-switch>
        </el-form-item>
        <el-form-item label="面积透明度" v-if="main.activeOption.areaStyle">
          <avue-slider v-model="main.activeOption.areaOpacity"
                       :max="1"
                       :step="0.1">
          </avue-slider>
        </el-form-item>
        <el-form-item label="线条宽度">
          <avue-slider v-model="main.activeOption.lineWidth">
          </avue-slider>
        </el-form-item>
        <el-form-item label="线条类型">
          <avue-select v-model="main.activeOption.lineType"
                       :dic="dicOption.echartLineType">
          </avue-select>
        </el-form-item>
        <el-form-item label="阶梯线">
          <avue-select v-model="main.activeOption.stepType"
                       :dic="dicOption.stepType">
          </avue-select>
        </el-form-item>
        <el-form-item label="圆点">
          <avue-switch v-model="main.activeOption.symbolShow">
          </avue-switch>
        </el-form-item>
        <template v-if="main.activeOption.symbolShow">
          <el-form-item label="点的大小">
            <avue-slider v-model="main.activeOption.symbolSize">
            </avue-slider>
          </el-form-item>
          <el-form-item label="点的形状">
            <avue-select v-model="main.activeOption.symbolType"
                         :dic="dicOption.symbolType">
            </avue-select>
          </el-form-item>
        </template>
        <el-form-item label="堆叠">
          <avue-switch v-model="main.activeOption.stack"></avue-switch>
        </el-form-item>
        <el-form-item label="空值断开">
          <avue-switch v-model="main.activeOption.connectNulls"></avue-switch>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { dicOption } from '@/option/config'
export default {
  name: 'line',
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
