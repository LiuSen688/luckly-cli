import globSync from 'glob'
import fse from 'fs-extra'
import { extname, resolve } from 'path'
import { CLI_PACKAGE_JSON, PUBLIC_DIR_INDEXES, SCRIPTS_EXTENSIONS, SRC_DIR, UI_PACKAGE_JSON } from './constant.js'
import { fileURLToPath } from 'url'

const {
  appendFileSync,
  ensureFileSync,
  lstatSync,
  outputFileSync,
  pathExistsSync,
  readdir,
  readFileSync,
  readJSONSync,
} = fse

export async function getPublicDirs(): Promise<string[]> {
  // 获取当前node运行所在目录的src文件夹下所有第一层文件名数组
  const srcDir: string[] = await readdir(SRC_DIR)
  // 过滤得到index文件名数组
  return srcDir.filter((filename: string) => isPublicDir(resolve(SRC_DIR, filename)))
}

// path.extname(path) -> 返回路径中文件的扩展名(包含.)
// pathExistsSync -> 此方法将通过检查文件系统来测试给定路径是否存在。如果路径不存在，它会在回调中抛出错误
// readdir() 该方法将返回一个包含“指定目录下所有文件名称”的数组对象，因此readdir方法只读一层
export const isMD = (file: string): boolean => pathExistsSync(file) && extname(file) === '.md'

export const isDir = (file: string): boolean => pathExistsSync(file) && lstatSync(file).isDirectory()

export const isSFC = (file: string): boolean => pathExistsSync(file) && extname(file) === '.vue'

export const isDTS = (file: string): boolean => pathExistsSync(file) && file.endsWith('.d.ts')

export const isScript = (file: string): boolean => pathExistsSync(file) && SCRIPTS_EXTENSIONS.includes(extname(file))

export const isLess = (file: string): boolean => pathExistsSync(file) && extname(file) === '.less'

export const isPublicDir = (dir: string): boolean =>
  PUBLIC_DIR_INDEXES.some((index) => pathExistsSync(resolve(dir, index)))

export const replaceExt = (file: string, ext: string): string => file.replace(extname(file), ext)

export function smartAppendFileSync(file: string, code: string) {
  if (pathExistsSync(file)) {
    const content = readFileSync(file, 'utf-8')

    if (!content.includes(code)) {
      appendFileSync(file, code)
    }
  }
}

export function outputFileSyncOnChange(path: string, code: string) {
  ensureFileSync(path)
  const content = readFileSync(path, 'utf-8')
  if (content !== code) {
    outputFileSync(path, code)
  }
}

export function glob(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    globSync(pattern, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}

export function getDirname(url: string) {
  return fileURLToPath(new URL('.', url))
}

export function getVersion() {
  return readJSONSync(UI_PACKAGE_JSON).version
}

export function getCliVersion() {
  return readJSONSync(CLI_PACKAGE_JSON).version
}
