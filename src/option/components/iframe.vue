<!-- iframe配置 -->
<template>
  <div>
    <el-form-item label="地址">
      <avue-input type="textarea"
                  v-model="main.activeObj.data.value"></avue-input>
    </el-form-item>
    <el-collapse accordion>
      <el-collapse-item title="加载策略">
        <el-form-item label="滚动条">
          <avue-select v-model="main.activeOption.scrolling"
                       :dic="scrollingDic">
          </avue-select>
        </el-form-item>
        <el-form-item label="内容缩放">
          <avue-slider v-model="main.activeOption.contentScale" :min="0.1" :max="2" :step="0.05"></avue-slider>
        </el-form-item>
        <el-form-item label="加载方式">
          <avue-select v-model="main.activeOption.loading"
                       :dic="dicOption.iframeLoading">
          </avue-select>
        </el-form-item>
        <el-form-item label="来源策略">
          <avue-select v-model="main.activeOption.referrerPolicy"
                       :dic="dicOption.referrerPolicy">
          </avue-select>
        </el-form-item>
        <el-form-item label="iframe名称">
          <avue-input v-model="main.activeOption.iframeName" placeholder="用于 target 定位"></avue-input>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="刷新设置">
        <el-form-item label="自动刷新(s)">
          <avue-input-number v-model="main.activeOption.autoRefreshInterval" :min="0" :max="3600"></avue-input-number>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="权限设置">
        <el-form-item label="允许全屏">
          <avue-switch v-model="main.activeOption.allowFullscreen"></avue-switch>
        </el-form-item>
        <el-form-item label="自定义allow">
          <avue-input v-model="main.activeOption.allow" placeholder="如: camera; microphone"></avue-input>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item title="沙箱安全">
        <el-form-item label="启用沙箱">
          <avue-switch v-model="main.activeOption.sandbox"></avue-switch>
        </el-form-item>
        <template v-if="main.activeOption.sandbox">
          <el-form-item label="沙箱权限">
            <avue-checkbox v-model="main.activeOption.sandboxPermissions"
                           :dic="sandboxDic">
            </avue-checkbox>
          </el-form-item>
        </template>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { dicOption } from '@/option/config'
export default {
  name: 'iframe',
  inject: ["main"],
  data () {
    return {
      dicOption: dicOption,
      scrollingDic: [
        { label: '自动', value: 'auto' },
        { label: '显示', value: 'yes' },
        { label: '隐藏', value: 'no' },
      ],
      sandboxDic: [
        { label: '允许脚本', value: 'allow-scripts' },
        { label: '允许同源', value: 'allow-same-origin' },
        { label: '允许弹窗', value: 'allow-popups' },
        { label: '允许表单', value: 'allow-forms' },
        { label: '允许模态框', value: 'allow-modals' },
        { label: '允许顶部导航', value: 'allow-top-navigation' },
        { label: '允许下载', value: 'allow-downloads' },
      ],
    }
  }
}
</script>

<style>
</style>
