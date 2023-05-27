# luckly-cli

开箱即用的 `Vue3组件库` 快速成型工具，提供了一系列命令和工具去解决组件库开发上的问题
本项目是阅读 varlet/cli 脚手架源码后的仿写学习，根据自己的开发需求简化了很多内容，但是大部分的配置字段依然仿照 varlet/cli 脚手架的功能与配置

### 特性
- 📦 &nbsp;开箱即用的组件库开发环境
- 🛠️ &nbsp;基于配置文件的组件库文档站点
- 🛠️ &nbsp;支持 `sfc` 和 `tsx` 两种风格的组件库编写风格
- 📦 &nbsp;开箱即用的代码检查工具
- 📦 &nbsp;开箱即用的代码发布工具
- 💪 &nbsp;支持 `Typescript`
- 🌍 &nbsp;支持 `国际化`
- 🚀 &nbsp;基于 `pnpm`

### 快速开始

`luckly-cli` 内置了 `sfc` 和 `tsx` 两种风格的组件库项目模板，可以通过 `gen` 命令直接生成。
方便您直接进入组件库开发。

```shell
# 安装命令行工具
pnpm add luckly-cli -g
luckly-cli gen
```

然后通过简单修改一些组件库模板的基础信息，就可以开始组件库的开发了

### 配置文件

项目根目录下的 `varlet.config.mjs` 用来管理整个组件库项目的具体细节。
默认配置可查阅 [varlet.default.config.ts](https://github.com/varletjs/varlet/blob/dev/packages/varlet-cli/src/node/config/varlet.default.config.ts)。
也可以参考 `@varlet/ui` 的 [varlet.config.mjs](https://github.com/varletjs/varlet/blob/dev/packages/varlet-ui/varlet.config.mjs)

| 参数 | 说明 | 类型 | 默认值 |
| ----- | -------------- | -------- | ---------- |
| `name` | 组件库全名，会作为包名 | _string_ | `Varlet` |
| `namespace` | 组件库命名空间, 会作为组件前缀 | _string_ | `luckly` |
| `host` | 开发服务器主机 | _string_ | `localhost` |
| `port` | 开发服务器端口 | _number_ | `8080` |
| `title` | 文档中组件库的标题 | _string_ | `VARLET` |
| `logo` | 文档中组件库的logo | _string_ | `-` |
| `defaultLanguage` | 文档默认语言 | _string_ | `zh-CN` |
| `lightTheme` | 亮色模式文档主题 | _Record<string, any>_ | `-` |
| `darkTheme` | 暗黑模式文档主题 | _Record<string, any>_ | `-` |
| `highlight` | 文档代码片段样式相关 | _{ style: string }_ | `-` |
| `pc` | pc端文档结构配置 | _Record<string, any>_ | `-` |


### 命令相关

#### 启动开发服务器

#### 生成一个项目模板

```shell
luckly-cli gen

```shell
luckly-cli dev
```

#### 构建文档站点

```shell
luckly-cli build
```


#### 构建组件库代码

```shell
luckly-cli compile
```

#### 发布组件库

```shell
luckly-cli release
```

# Options
-n
--name
  项目名
-s
--sfc
  生成 sfc 风格的项目模板
-t
--tsx
  生成 tsx 格式项目
-l
--locale
  需要支持国际化
```

#### 创建组件模板文件

```shell
luckly-cli create

# Options
-n
--name
  组件名
-s
--sfc
  生成 sfc 风格的组件
-t
--tsx
  生成 tsx 风格的文件
-l
--locale
  需要支持国际化
```

### 发布前注意

1. `npm` 的仓库源必须指向 `npm` 官方镜像
2. 执行 `npm login` 进行登录
