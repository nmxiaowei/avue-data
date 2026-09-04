<!-- KPI 指标卡配置 -->
<template>
  <div>
    <el-collapse accordion>
      <el-collapse-item title="指标数据">
        <el-form-item label="指标标题">
          <avue-input v-model="main.activeObj.data.title" placeholder="标题"></avue-input>
        </el-form-item>
        <el-form-item label="数值">
          <avue-input-number v-model="main.activeObj.data.value">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="单位">
          <avue-input v-model="main.activeObj.data.unit" placeholder="如:万/元/%"></avue-input>
        </el-form-item>
        <el-form-item label="变化趋势">
          <avue-input-number
            v-model="main.activeObj.data.trend"
            placeholder="如 12.5 或 -3"></avue-input-number>
        </el-form-item>
        <el-form-item label="辅助说明">
          <avue-input v-model="main.activeObj.data.subtitle" placeholder="如:环比上月"></avue-input>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="数值样式">
        <el-form-item label="数值颜色">
          <avue-input-color v-model="main.activeOption.valueColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="数值大小">
          <avue-input-number v-model="main.activeOption.valueFontSize" :min="10" :max="200">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="小数位">
          <avue-input-number v-model="main.activeOption.decimals" :min="0" :max="6">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="千分位">
          <avue-switch v-model="main.activeOption.thousands"></avue-switch>
        </el-form-item>
        <el-form-item label="单位大小">
          <avue-input-number v-model="main.activeOption.unitFontSize" :min="8" :max="100">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="前缀">
          <avue-input v-model="main.activeOption.prefix" placeholder="如:¥"></avue-input>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="标题与趋势">
        <el-form-item label="标题颜色">
          <avue-input-color v-model="main.activeOption.titleColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="标题大小">
          <avue-input-number v-model="main.activeOption.titleFontSize" :min="8" :max="100">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="显示趋势">
          <avue-switch v-model="main.activeOption.trendShow"></avue-switch>
        </el-form-item>
        <template v-if="main.activeOption.trendShow">
          <el-form-item label="趋势模式">
            <avue-select
              v-model="main.activeOption.trendMode"
              :dic="[
                { label: '百分比', value: 'percent' },
                { label: '绝对值', value: 'value' },
              ]"></avue-select>
          </el-form-item>
          <el-form-item label="涨跌取反">
            <avue-switch v-model="main.activeOption.trendInvert"></avue-switch>
          </el-form-item>
          <el-form-item label="趋势字号">
            <avue-input-number v-model="main.activeOption.trendFontSize" :min="8" :max="80">
            </avue-input-number>
          </el-form-item>
        </template>
      </el-collapse-item>
      <el-collapse-item title="卡片外观">
        <el-form-item label="背景颜色">
          <avue-input-color v-model="main.activeOption.backgroundColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="圆角">
          <avue-input-number v-model="main.activeOption.borderRadius" :min="0" :max="50">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="角标装饰">
          <avue-switch v-model="main.activeOption.decor"></avue-switch>
        </el-form-item>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  name: "kpi",
  inject: ["main"],
};
</script>

<style lang="scss" scoped></style>
