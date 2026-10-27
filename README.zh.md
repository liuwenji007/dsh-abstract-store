# 抽象插件名录 · Abstract Plugins Index

[![check](https://github.com/liuwenji007/dsh-abstract-store/actions/workflows/ci.yml/badge.svg)](https://github.com/liuwenji007/dsh-abstract-store/actions/workflows/ci.yml)

[English](README.md) | 中文 · [仓库](https://github.com/liuwenji007/dsh-abstract-store)

一个装在 DeepSeek Harness 里的、**开源**的策展索引：收录 DSH 生态里最抽象的一批插件，每条都有公开的评分拆解、一句编辑判词，以及一键原生安装。

它不是又一个插件市场——宿主已经有 Discover 和市场负责"有什么、能不能装"。这里只回答一个问题：**哪些插件最离谱，以及为什么**。

## 它长什么样

装好后，**Plugins** 页的标签栏多出一个「抽象」页：

- **按抽象指数排序的名单**：每条显示主题、安装包、Star 数和收录日期
- **展开即评分拆解**：荒诞度 / 情绪价值 / 完成度三项 0–100，按 50 / 30 / 20 加权，分数可复算
- **一句判词**：为什么它算抽象，而不是功能复述
- **原生安装**：点「安装」走宿主自己的安装向导；也可以复制 `dsh plugin add <spec>` 命令
- **公开口径**：收录标准、评分公式、未收录条目和理由，都在页面底部和本仓库里
- **数据有来源**：事实字段来自 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)（CC0），页面标注上游提交号

## 安装

发布到 npm 后：

```sh
dsh plugin --profile <你的 profile> add dsh-abstract-index
```

本地开发时，在 DSH 里用插件管理器安装本目录（绝对路径）：

```text
plugin_manager → action: install_bundle → target: /绝对路径/dsh-abstract-index
```

装完刷新页面，**Plugins → 抽象**。宿主没有 `plugins.tab` 槽位时（旧版本），页签不会出现，插件也不报错。

## 收录与评分

- **范围**：上游 awesome 列表 `fun`（娱乐）分类的全部条目，当前 58 件，逐条判断。
- **收录决定**：一部分条目不收录（例如普通音乐播放器、皮肤、背单词），理由公开显示。收录是一种观点，可以争论。
- **三轴**（各 0–100）：

  | 轴 | 含义 |
  |---|---|
  | 荒诞度 absurdity | 前提离"编码工具"有多远 |
  | 情绪价值 emotion | 它改变等待与心情的程度 |
  | 完成度 craft | 描述里可见的打磨程度 |

- **公式**：`score = round(absurdity×0.5 + emotion×0.3 + craft×0.2)`
- 所有分数由 `data/curation.json` 里的三轴数字在构建时算出，不改写进数据文件，因此永远可复算。

## 参与

评分、判词、收录决定都在 `data/curation.json`，改法和 PR 清单见 [CONTRIBUTING.md](CONTRIBUTING.md)。对某条评分、判词或未收录理由有异议，直接开 [issue](https://github.com/liuwenji007/dsh-abstract-store/issues/new/choose)——把理由说具体就行。

## 数据怎么来

两个提交进仓库的输入：

| 文件 | 内容 | 谁维护 |
|---|---|---|
| `data/snapshot.json` | 上游事实：URL、名称、双语描述、npm 包、Star、收录日期、上游 commit | `npm run sync`（自动生成，勿手改） |
| `data/curation.json` | 编辑层：是否收录、主题、三轴分数、判词、未收录理由 | 人工 / PR |

构建把两者合并进浏览器产物：

```sh
npm install                      # 只为 sync 提供 js-yaml
npm run sync -- --upstream /path/to/awesome-dsh-plugin
npm run check                    # validate → build → node --check
```

`client.js` 是构建产物，随仓库提交，方便直接从 git 安装；CI 会验证重新构建没有 diff。

## 仓库结构

```text
dsh-abstract-index/
  package.json            # bundle manifest + dsh.client 段
  cordis.patch.yml        # 插入 abstract-index 这一行
  index.js                # Host 半：无行为，只提供清单条目
  client.js               # 构建产物（勿手改）
  src/client.js           # Plugins 页「抽象」标签的 UI
  data/snapshot.json      # 上游事实快照（生成）
  data/curation.json      # 策展层（人工）
  scripts/sync.mjs        # 从上游生成快照
  scripts/build-client.mjs# 合并数据 + UI → client.js
  scripts/validate.mjs    # 数据校验
  scripts/lib/data.mjs    # 共享模型：合并、计分
  locale/{zh,en}.json     # 插件管理页显示用的标题/描述
  icon.svg
```

## 边界

- 不联网、不读会话、不调用工具、不产生费用；目录是打包进产物的静态数据。
- 不代替宿主安装：安装按钮调用宿主自己的安装流程。
- 不评价安全性。是否安装请读仓库 README 自行判断。
- 条目版权归各作者；事实数据 CC0；本仓代码 MIT。

## 许可

- 代码：MIT，见 [LICENSE](LICENSE)
- 数据与策展文本：CC0-1.0，见 [LICENSE-DATA](LICENSE-DATA)
