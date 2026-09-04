<!-- 地图组件配置 -->
<template>
  <div>
    <el-collapse accordion>
      <el-collapse-item title="地图设置">
        <el-form-item label="地图类型">
          <avue-select
            v-model="main.activeOption.mapType"
            :dic="mapTypeList"
            placeholder="请选择类型"></avue-select>
        </el-form-item>
        <el-form-item label="内置地图">
          <avue-select
            v-model="main.activeOption.mapKey"
            :dic="builtinList"
            placeholder="请选择内置地图"></avue-select>
        </el-form-item>
        <template v-if="!main.activeOption.mapKey">
          <el-form-item label="地图名称">
            <avue-input v-model="main.activeOption.mapName" placeholder="注册名"></avue-input>
          </el-form-item>
          <el-form-item label="GeoJSON地址">
            <avue-input v-model="main.activeOption.mapUrl" placeholder="https://.../map.json"></avue-input>
          </el-form-item>
        </template>
        <el-form-item label="系列名称">
          <avue-input v-model="main.activeOption.seriesName" placeholder="图例/提示语名称"></avue-input>
        </el-form-item>
        <el-form-item label="缩放/漫游">
          <avue-switch v-model="main.activeOption.roam"></avue-switch>
        </el-form-item>
        <el-form-item label="初始缩放">
          <avue-input-number v-model="main.activeOption.zoom" :min="0.5" :max="5" :step="0.1">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="区域标签">
          <avue-switch v-model="main.activeOption.labelShow"></avue-switch>
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item title="区域配色">
        <el-form-item label="区域颜色">
          <avue-input-color v-model="main.activeOption.areaColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="边界颜色">
          <avue-input-color v-model="main.activeOption.borderColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="边界宽度">
          <avue-input-number v-model="main.activeOption.borderWidth" :min="0" :max="6">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="高亮颜色">
          <avue-input-color v-model="main.activeOption.emphasizeColor"></avue-input-color>
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item
        v-if="main.activeOption.mapType === 'map'"
        title="数值分段">
        <el-form-item label="显示图例">
          <avue-switch v-model="main.activeOption.visualMapShow"></avue-switch>
        </el-form-item>
        <el-form-item label="起始颜色">
          <avue-input-color v-model="main.activeOption.visualMinColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="中间颜色">
          <avue-input-color v-model="main.activeOption.visualMidColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="最大颜色">
          <avue-input-color v-model="main.activeOption.visualMaxColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="数值下限">
          <avue-input-number v-model="main.activeOption.visualMin"></avue-input-number>
        </el-form-item>
        <el-form-item label="数值上限">
          <avue-input-number v-model="main.activeOption.visualMax"></avue-input-number>
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item
        v-if="main.activeOption.mapType === 'scatter'"
        title="气泡设置">
        <el-form-item label="涟漪特效">
          <avue-switch v-model="main.activeOption.ripple"></avue-switch>
        </el-form-item>
        <el-form-item label="最小大小">
          <avue-input-number v-model="main.activeOption.symbolMin" :min="2" :max="80">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="最大大小">
          <avue-input-number v-model="main.activeOption.symbolMax" :min="2" :max="120">
          </avue-input-number>
        </el-form-item>
        <el-form-item label="点颜色">
          <avue-input-color v-model="main.activeOption.pointColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="显示名称">
          <avue-switch v-model="main.activeOption.pointLabelShow"></avue-switch>
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item
        v-if="main.activeOption.mapType === 'lines'"
        title="飞线设置">
        <el-form-item label="流动特效">
          <avue-switch v-model="main.activeOption.lineEffect"></avue-switch>
        </el-form-item>
        <el-form-item label="线条颜色">
          <avue-input-color v-model="main.activeOption.lineColor"></avue-input-color>
        </el-form-item>
        <el-form-item label="线条宽度">
          <avue-input-number v-model="main.activeOption.lineWidth" :min="1" :max="10">
          </avue-input-number>
        </el-form-item>
      </el-collapse-item>

      <el-collapse-item title="数据格式说明">
        <p class="map-tip">
          数值地图: [{ "name": "广东", "value": 128 }]<br />
          气泡地图: [{ "name": "深圳", "value": [114.06, 22.55, 60] }]<br />
          飞线地图: [{ "name": "线1", "coords": [[116.41, 39.9], [121.47, 31.23]] }]<br />
          <span style="color:#ffb454">未配置数据时自动展示演示数据。</span>
        </p>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { getBuiltinMaps } from "@/echart/packages/map/geo";

export default {
  name: "map",
  data() {
    return {
      mapTypeList: [
        { label: "数值地图", value: "map" },
        { label: "气泡地图", value: "scatter" },
        { label: "飞线地图", value: "lines" },
      ],
      builtinList: getBuiltinMaps().map(item => ({
        label: item.name,
        value: item.key,
      })),
    };
  },
  inject: ["main"],
};
</script>

<style lang="scss" scoped>
.map-tip {
  margin: 0;
  color: #9fb3d1;
  font-size: 12px;
  line-height: 1.8;
  word-break: break-all;
}
</style>
