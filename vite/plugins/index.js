import vue from '@vitejs/plugin-vue'

import createAutoImport from './auto-import'
import createSvgImport from './svg-import'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import createCssCompat from './css-compat'
export default function createVitePlugins (viteEnv, isBuild = false) {
  const vitePlugins = [createCssCompat(), vue()]
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createSvgImport())
  vitePlugins.push(createSetupExtend())
  isBuild && vitePlugins.push(...createCompression(viteEnv))
  return vitePlugins
}
