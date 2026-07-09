<!-- 文字配置 -->
<template>
  <div>
    <el-form-item label="文本内容">
      <avue-input
        v-model="main.activeObj.data.value"
        type="textarea"
      />
    </el-form-item>
    <el-collapse accordion>
      <el-collapse-item title="字体设置">
        <el-form-item label="字体大小">
          <avue-input-number
            v-model="main.activeOption.fontSize"
            :max="200"
          />
        </el-form-item>
        <el-form-item label="字体颜色">
          <avue-input-color v-model="main.activeOption.color" />
        </el-form-item>
        <el-form-item label="字体家族">
          <avue-select
            v-model="main.activeOption.fontFamily"
            :dic="dicOption.fontFamily"
          />
        </el-form-item>
        <el-form-item label="字体样式">
          <avue-select
            v-model="main.activeOption.fontStyle"
            :dic="dicOption.fontStyle"
          />
        </el-form-item>
        <el-form-item label="字体间距">
          <avue-input-number v-model="main.activeOption.split" />
        </el-form-item>
        <el-form-item label="词间距">
          <avue-input-number v-model="main.activeOption.wordSpacing" />
        </el-form-item>
        <el-form-item label="字体行高">
          <avue-input-number v-model="main.activeOption.lineHeight" />
        </el-form-item>
        <el-form-item label="字体背景">
          <avue-input-color v-model="main.activeOption.backgroundColor" />
        </el-form-item>
        <el-form-item label="文字粗细">
          <avue-select
            v-model="main.activeOption.fontWeight"
            :dic="dicOption.fontWeight"
          />
        </el-form-item>
        <el-form-item label="对齐方式">
          <avue-select
            v-model="main.activeOption.textAlign"
            :dic="dicOption.textAlign"
          />
        </el-form-item>
        <el-form-item label="文字装饰">
          <avue-select
            v-model="main.activeOption.textDecoration"
            :dic="dicOption.textDecoration"
          />
        </el-form-item>
        <el-form-item label="文字转换">
          <avue-select
            v-model="main.activeOption.textTransform"
            :dic="dicOption.textTransform"
          />
        </el-form-item>
        <el-form-item label="书写模式">
          <avue-select
            v-model="main.activeOption.writingMode"
            :dic="dicOption.writingMode"
          />
        </el-form-item>
        <el-form-item label="文字阴影">
          <avue-input
            v-model="main.activeOption.textShadow"
            placeholder="如: 2px 2px 4px #000"
          />
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item title="文字描边">
        <el-form-item label="描边宽度">
          <avue-input-number
            v-model="main.activeOption.textStrokeWidth"
            :min="0"
            :max="20"
          />
        </el-form-item>
        <el-form-item label="描边颜色">
          <avue-input-color v-model="main.activeOption.textStrokeColor" />
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item title="渐变设置">
        <el-form-item label="开启渐变">
          <avue-switch v-model="main.activeOption.gradientColor" />
        </el-form-item>
        <template v-if="main.activeOption.gradientColor">
          <el-form-item label="起始颜色">
            <avue-input-color v-model="main.activeOption.gradientFrom" />
          </el-form-item>
          <el-form-item label="结束颜色">
            <avue-input-color v-model="main.activeOption.gradientTo" />
          </el-form-item>
          <el-form-item label="渐变方向">
            <avue-select
              v-model="main.activeOption.gradientDirection"
              :dic="dicOption.gradientDirection"
            />
          </el-form-item>
        </template>
      </el-collapse-item>

      <el-collapse-item title="显示设置">
        <el-form-item label="内边距">
          <avue-input-number
            v-model="main.activeOption.padding"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="垂直对齐">
          <avue-select
            v-model="main.activeOption.verticalAlign"
            :dic="dicOption.verticalAlign"
          />
        </el-form-item>
        <el-form-item label="换行规则">
          <avue-select
            v-model="main.activeOption.wordBreak"
            :dic="dicOption.wordBreak"
          />
        </el-form-item>
        <el-form-item label="空白处理">
          <avue-select
            v-model="main.activeOption.whiteSpace"
            :dic="dicOption.whiteSpace"
          />
        </el-form-item>
        <el-form-item label="溢出处理">
          <avue-select
            v-model="main.activeOption.overflowType"
            :dic="dicOption.overflowType"
          />
        </el-form-item>
        <el-form-item
          v-if="main.activeOption.overflowType === 'ellipsis'"
          label="最大行数"
        >
          <avue-input-number
            v-model="main.activeOption.maxLines"
            :min="1"
            :max="100"
          />
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item title="文字边框">
        <el-form-item label="边框宽度">
          <avue-input-number
            v-model="main.activeOption.textBorderWidth"
            :min="0"
            :max="20"
          />
        </el-form-item>
        <el-form-item label="边框颜色">
          <avue-input-color v-model="main.activeOption.textBorderColor" />
        </el-form-item>
        <el-form-item label="边框样式">
          <avue-select
            v-model="main.activeOption.textBorderStyle"
            :dic="dicOption.borderStyle"
          />
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item title="数据格式化">
        <el-form-item label="开启数字转换">
          <avue-switch v-model="main.activeOption.numberTransform" />
        </el-form-item>
        <template v-if="main.activeOption.numberTransform">
          <el-form-item label="千分位">
            <avue-switch v-model="main.activeOption.thousandSeparator" />
          </el-form-item>
          <el-form-item label="小数位数">
            <avue-input-number
              v-model="main.activeOption.decimalPlaces"
              :min="0"
              :max="10"
            />
          </el-form-item>
        </template>
        <el-form-item label="前缀">
          <avue-input
            v-model="main.activeOption.textPrefix"
            placeholder="如: ¥"
          />
        </el-form-item>
        <el-form-item label="后缀">
          <avue-input
            v-model="main.activeOption.textSuffix"
            placeholder="如: %"
          />
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item title="跑马灯设置">
        <el-form-item label="开启">
          <avue-switch v-model="main.activeOption.scroll" />
        </el-form-item>
        <template v-if="main.activeOption.scroll">
          <el-form-item label="滚动方向">
            <avue-select
              v-model="main.activeOption.scrollDirection"
              :dic="dicOption.scrollDirection"
            />
          </el-form-item>
          <el-form-item label="滚动速度">
            <avue-input v-model="main.activeOption.speed" />
          </el-form-item>
          <el-form-item label="步长">
            <avue-input-number
              v-model="main.activeOption.step"
              :min="1"
              :max="50"
            />
          </el-form-item>
          <el-form-item label="悬停暂停">
            <avue-switch v-model="main.activeOption.scrollPauseOnHover" />
          </el-form-item>
        </template>
      </el-collapse-item>

      <el-collapse-item title="动画效果">
        <el-form-item label="打字机效果">
          <avue-switch v-model="main.activeOption.typewriter" />
        </el-form-item>
        <el-form-item
          v-if="main.activeOption.typewriter"
          label="打字速度(ms)"
        >
          <avue-input-number
            v-model="main.activeOption.typewriterSpeed"
            :min="10"
            :max="1000"
          />
        </el-form-item>
        <el-form-item label="闪烁效果">
          <avue-switch v-model="main.activeOption.blinkEnabled" />
        </el-form-item>
        <el-form-item
          v-if="main.activeOption.blinkEnabled"
          label="闪烁速度(s)"
        >
          <avue-input-number
            v-model="main.activeOption.blinkSpeed"
            :min="0.1"
            :max="10"
            :step="0.1"
          />
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item title="超链设置">
        <el-form-item label="开启">
          <avue-switch v-model="main.activeOption.link" />
        </el-form-item>
        <template v-if="main.activeOption.link">
          <el-form-item label="打开方式">
            <avue-radio
              v-model="main.activeOption.linkTarget"
              :dic="dicOption.target"
            />
          </el-form-item>
          <el-form-item label="超链地址">
            <avue-input v-model="main.activeOption.linkHref" />
          </el-form-item>
        </template>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { dicOption } from '@/option/config'

export default {
  name: 'text',
  data () {
    return {
      dicOption
    }
  },
  inject: ['main']
}
</script>

<style>
</style>
