import fse from 'fs-extra'
import { mergeWith } from 'lodash-es'
import { VARLET_CONFIG, SITE_CONFIG } from '../shared/constant.js'
import { outputFileSyncOnChange } from '../shared/fsUtils.js'
import { isArray } from '@varlet/shared'
import { pathToFileURL } from 'url'

const { pathExistsSync, statSync } = fse
// statSync 访问文件的元数据，比如文件大小，文件的修改时间
export interface VarletConfig {
  /**
   * @default `Varlet`
   * UI library name.
   */
  name?: string
  /**
   * @default `var`
   * Component name prefix
   */
  namespace?: string
  /**
   * @default `localhost`
   * Local dev server host
   */
  host?: string
  /**
   * @default `8080`
   * Local dev server port
   */
  port?: number
  title?: string
  logo?: string
  themeKey?: string
  defaultLanguage?: 'zh-CN' | 'en-US'
  /**
   * @default `false`
   * Show mobile component on the right.
   */
  useMobile?: boolean
  lightTheme?: Record<string, string>
  darkTheme?: Record<string, string>
  highlight?: { style: string }
  analysis?: { baidu: string }
  pc?: Record<string, any>
  mobile?: Record<string, any>
  moduleCompatible?: Record<string, string>
}

export function defineConfig(config: VarletConfig) {
  return config
}

export function mergeStrategy(value: any, srcValue: any, key: string) {
  if (key === 'features' && isArray(srcValue)) {
    return srcValue
  }
}

// 合并配置项
export async function getVarletConfig(emit = false): Promise<Required<VarletConfig>> {
  // 脚手架默认配置
  const defaultConfig = (await import('./varlet.default.config.js')).default
  // 初始化项目后的 varlet.config.mjs 文件配置
  const config: any = pathExistsSync(VARLET_CONFIG)
    ? (await import(`${pathToFileURL(VARLET_CONFIG).href}?_t=${statSync(VARLET_CONFIG).mtimeMs}`)).default
    : {}
  const mergedConfig = mergeWith(defaultConfig, config, mergeStrategy)

  if (emit) {
    const source = JSON.stringify(mergedConfig, null, 2)
    outputFileSyncOnChange(SITE_CONFIG, source)
  }

  return mergedConfig
}
