import logger from '../shared/logger.js'
import fse from 'fs-extra'
import inquirer from 'inquirer'
import { resolve } from 'path'
import { CLI_PACKAGE_JSON, CWD, GENERATORS_DIR } from '../shared/constant.js'

const { copy, pathExistsSync, readFileSync, writeFileSync, rename } = fse
const { prompt } = inquirer

type CodeStyle = 'tsx' | 'sfc'

interface GenCommandOptions {
  name?: string
  i18n?: boolean
  sfc?: boolean
  tsx?: boolean
}

function syncVersion(name: string) {
  const file = resolve(CWD, name, 'package.json')
  const pkg = JSON.parse(readFileSync(file, 'utf-8'))
  const cliPkg = JSON.parse(readFileSync(CLI_PACKAGE_JSON, 'utf-8'))

  pkg.files = ['es', 'lib', 'umd', 'highlight', 'types']
  writeFileSync(file, JSON.stringify(pkg, null, 2))
}

export async function gen(options: GenCommandOptions) {
  logger.title('\n📦📦 Luckly-cli 已经启动 ! \n')

  const { name } = options.name
    ? options
    : await prompt({
        name: 'name',
        message: '为你的组件库起一个名称吧~ ',
        default: 'Luckly-cli-app',
      })
  const dest = resolve(CWD, name)

  if (pathExistsSync(dest)) {
    logger.error(`${name} 已经存在，不能重复创建哦~~~`)
    return
  }

  let codeStyle: CodeStyle

  // Determine whether the parameter carries a coding style
  if (options.sfc || options.tsx) {
    codeStyle = options.sfc ? 'sfc' : 'tsx'
  } else {
    const { style } = await prompt({
      name: 'style',
      type: 'list',
      message: '请选择你喜欢的组件库编程格式~',
      choices: ['sfc', 'tsx'],
    })

    codeStyle = style
  }

  const { i18n } = options.i18n
    ? options
    : await prompt({
        name: 'i18n',
        type: 'confirm',
        message: '是否想要支持国际化?',
        default: false,
      })

  const dirName = i18n ? 'i18n' : 'default'
  // 获取 template/generators 文件夹下的模版文件
  const base = resolve(GENERATORS_DIR, 'base')
  // 获取 template/generators/config/default/base 文件夹下的模版内容
  const configBase = resolve(GENERATORS_DIR, 'config', dirName, 'base')
  // 根据用户选择的开发模式 codeStyle 获取 template/generators/config/default/base 的编码开发模版文件
  const code = resolve(GENERATORS_DIR, 'config', dirName, codeStyle)
  // copy 此方法将文件或目录从一个位置复制到另一个位置。目录可以有子目录和文件。
  // 第二个参数是目标位置
  await copy(base, dest)
  await copy(configBase, dest)
  await copy(code, dest)
  // rename 重命名
  await rename(resolve(dest, '_gitignore'), resolve(dest, '.gitignore'))
  syncVersion(name)

  logger.success('✨ 项目已成功创建!!!')
  logger.info(`\
  cd ${name}
  git init ( 生成.git文件夹初始化git钩子 )
  pnpm install
  pnpm dev`)
  logger.success(`\
=======================
  Good luck have fun
=======================\
      `)
}
