/**
 * Abstract Plugins Index — the UI half.
 *
 * Renders as one tab on the host's Plugins page (`plugins.tab`). The page
 * provides the scroll container and the tab panel, so this component must not
 * create its own page shell or scroll area: it draws a column of sections.
 *
 * The host hands the tab an `install(target)` owner prop; the primary action
 * opens the host's own install flow with the exact spec. Everything else is
 * read-only catalog data embedded by `scripts/build-client.mjs`.
 *
 * Plain React only: the host loads this artifact as a classic script and
 * supplies `react` through the module loader.
 */

/* ------------------------------------------------------------------ locale */

const NS = 'dsh-abstract-index'
const TAB_ID = 'dsh-abstract-index'

const DICT_ZH = {
  tab: '抽象',
  title: '抽象插件名录',
  intro: 'DSH 生态里最抽象的一批插件。这不是功能清单，是一份有判断的收录：每条都有评分拆解和一句判词。',
  stats: '收录 {included} 件 · 已审 {audited} 件 · 未收录 {excluded} 件',
  formula: '抽象指数 = 荒诞度×50% + 情绪价值×30% + 完成度×20%',
  updated: '数据更新 {date}',
  upstream: '上游 {commit}',
  search: '搜索名称、作者、包名、判词',
  searchLabel: '搜索名录',
  filterLabel: '按主题筛选',
  sortLabel: '排序',
  sortScore: '抽象指数',
  sortStars: 'Star 数',
  sortNew: '最近收录',
  all: '全部',
  emptyTitle: '没有匹配的条目',
  emptyBody: '换个关键词或主题再试。',
  install: '安装',
  installUnavailable: '子目录插件，请按仓库说明安装',
  installNoHost: '当前宿主不支持页内安装，请使用下面的命令。',
  copy: '复制命令',
  copied: '已复制',
  copyFailed: '复制失败，请手动选择',
  expand: '展开详情',
  collapse: '收起详情',
  repo: '仓库',
  openRepo: '打开仓库',
  theme: '主题',
  package: '安装包',
  version: '版本',
  stars: 'Star',
  added: '收录日期',
  none: '—',
  verdictLabel: '判词',
  scoreLabel: '抽象指数',
  axesLabel: '评分拆解',
  'axis.absurdity': '荒诞度',
  'axis.emotion': '情绪价值',
  'axis.craft': '完成度',
  command: '命令行安装',
  commandHint: '默认 profile 直接执行；指定 profile 时加 `--profile <name>`。',
  aboutTitle: '收录标准与评分口径',
  aboutScope: '范围：上游 awesome 列表「娱乐」分类的全部条目，共 {n} 件，逐条判断。收录不是白名单——它代表这份名录的观点，可以争论。',
  aboutRubric: '评分：荒诞度衡量插件前提离「编码工具」有多远；情绪价值衡量它改变等待与心情的程度；完成度衡量描述里可见的打磨程度。三项各 0–100，按 50 / 30 / 20 加权。',
  aboutContribute: '修改：评分与判词在仓库的 data/curation.json，改完运行 npm run check 再提 PR；也可以先开 issue 争论某一条。',
  excludedTitle: '未收录 {n} 件',
  excludedHint: '这些条目在范围内，但没有通过收录判断。',
  footerNote: '事实数据来自 awesome-dsh-plugin（CC0）· 条目描述版权归各作者 · 本仓代码 MIT',
  lastSync: '快照 {date} · 上游 {commit}',
  adult: '18+',
}

const DICT_EN = {
  tab: 'Abstract',
  title: 'Abstract Plugins Index',
  intro: 'The most gloriously absurd plugins in the DSH ecosystem. Not a feature dump — a curated index where every entry has a score breakdown and a verdict.',
  stats: '{included} indexed · {audited} reviewed · {excluded} excluded',
  formula: 'Index = absurdity×50% + emotion×30% + craft×20%',
  updated: 'Data updated {date}',
  upstream: 'Upstream {commit}',
  search: 'Search names, authors, packages, verdicts',
  searchLabel: 'Search the index',
  filterLabel: 'Filter by theme',
  sortLabel: 'Sort',
  sortScore: 'Absurdity index',
  sortStars: 'Stars',
  sortNew: 'Recently added',
  all: 'All',
  emptyTitle: 'Nothing matches',
  emptyBody: 'Try another keyword or theme.',
  install: 'Install',
  installUnavailable: 'Subdirectory plugin: follow the repo instructions',
  installNoHost: 'This host cannot install from here; use the command below.',
  copy: 'Copy command',
  copied: 'Copied',
  copyFailed: 'Copy failed — select it manually',
  expand: 'Show details',
  collapse: 'Hide details',
  repo: 'Repository',
  openRepo: 'Open repository',
  theme: 'Theme',
  package: 'Package',
  version: 'Version',
  stars: 'Stars',
  added: 'Added',
  none: '—',
  verdictLabel: 'Verdict',
  scoreLabel: 'Absurdity index',
  axesLabel: 'Score breakdown',
  'axis.absurdity': 'Absurdity',
  'axis.emotion': 'Emotional value',
  'axis.craft': 'Craft',
  command: 'Install from the CLI',
  commandHint: 'Runs against the default profile; add `--profile <name>` for another one.',
  aboutTitle: 'Scope and rubric',
  aboutScope: 'Scope: every entry in the upstream fun category ({n} of them), judged one by one. Inclusion is an opinion, and it can be argued with.',
  aboutRubric: 'Scoring: absurdity measures how far the premise sits from a coding tool; emotional value measures how much it changes the waiting and the mood; craft measures visible product polish. Each is 0–100, weighted 50 / 30 / 20.',
  aboutContribute: 'Changing scores or verdicts: edit data/curation.json in the repository, run npm run check, and open a PR — or open an issue to argue about one entry first.',
  excludedTitle: '{n} excluded',
  excludedHint: 'In scope, but they did not make the cut.',
  footerNote: 'Facts from awesome-dsh-plugin (CC0) · descriptions belong to their authors · this repository is MIT',
  lastSync: 'Snapshot {date} · upstream {commit}',
  adult: '18+',
}

const THEME_LABELS = {
  pet: { zh: '桌宠', en: 'Pets' },
  game: { zh: '游戏', en: 'Games' },
  meme: { zh: '整活', en: 'Absurd' },
  market: { zh: '行情', en: 'Markets' },
  media: { zh: '音影', en: 'Media' },
  growth: { zh: '成长', en: 'Growth' },
  other: { zh: '其他', en: 'Other' },
}

const THEME_ORDER = ['pet', 'game', 'meme', 'market', 'media', 'growth', 'other']
const AXES = ['absurdity', 'emotion', 'craft']

/* ----------------------------------------------------------------- helpers */

function interpolate(template, params) {
  if (typeof template !== 'string') return String(template)
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name) => (
    params[name] === undefined ? match : String(params[name])
  ))
}

function dateOnly(iso) {
  if (typeof iso !== 'string' || iso.length < 10) return ''
  return iso.slice(0, 10)
}

function shortCommit(upstream) {
  if (!upstream) return ''
  return upstream.commitShort || (typeof upstream.commit === 'string' ? upstream.commit.slice(0, 7) : '')
}

function displayName(entry) {
  const name = typeof entry.name === 'string' ? entry.name : ''
  const tail = name.split('/').pop()
  return tail || name || entry.slug
}

function themeLabel(theme, lang) {
  const labels = THEME_LABELS[theme]
  if (!labels) return theme
  return lang === 'zh' ? labels.zh : labels.en
}

function formatStars(stars) {
  if (typeof stars !== 'number') return null
  if (stars >= 10000) return `${Math.round(stars / 1000)}k`
  if (stars >= 1000) return `${(stars / 1000).toFixed(1)}k`
  return String(stars)
}

/** The exact spec the host installer receives, or null when only the repo can install it. */
function installTarget(entry) {
  if (entry.npm && typeof entry.npm.name === 'string' && entry.npm.name !== '') {
    return { spec: entry.npm.name, version: entry.npm.version || undefined }
  }
  if (entry.repoPath) return null
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/.exec(entry.repo || '')
  return match ? { spec: `github:${match[1]}/${match[2]}` } : null
}

function commandFor(entry) {
  const target = installTarget(entry)
  return target ? `dsh plugin add ${target.spec}` : null
}

function copyText(text) {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined
  if (!clipboard || typeof clipboard.writeText !== 'function') return Promise.reject(new Error('no clipboard'))
  return clipboard.writeText(text)
}

/* ------------------------------------------------------------------- styles */

const CSS = `
.dai {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  color: var(--dsw-alias-label-primary, #1f2328);
  container-type: inline-size;
}
.dai-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px 24px;
  flex-wrap: wrap;
}
.dai-headMain { min-width: 0; flex: 1 1 420px; }
.dai-title { margin: 0; font-size: 15px; line-height: 22px; font-weight: 600; }
.dai-intro { margin: 4px 0 0; max-width: 72ch; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary, #5c6570); }
.dai-stats { margin: 8px 0 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #8b93a1); font-variant-numeric: tabular-nums; }
.dai-formula { margin: 2px 0 0; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-caption, #9ca3af); }
.dai-provenance { display: flex; flex-direction: column; gap: 2px; text-align: right; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #8b93a1); font-variant-numeric: tabular-nums; flex: none; }

.dai-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dai-search {
  display: flex; align-items: center; gap: 7px; flex: 1 1 240px; min-width: 180px;
  height: 36px; padding: 0 12px; box-sizing: border-box;
  border: .5px solid var(--dsw-alias-border-l4, rgba(0, 0, 0, 0.16));
  border-radius: var(--dsw-radius-md, 12px);
  background: var(--dsw-alias-bg-layer-3, #fff);
}
.dai-search:focus-within { border-color: var(--dsw-alias-state-business-primary, #4f6ef7); }
.dai-search input { flex: 1; min-width: 0; border: 0; outline: none; background: transparent; color: var(--dsw-alias-label-primary, #1f2328); font: inherit; font-size: 13px; }
.dai-search input::placeholder { color: var(--dsw-alias-label-tertiary, #9ca3af); }
.dai-searchIcon { flex: none; display: inline-flex; color: var(--dsw-alias-label-tertiary, #9ca3af); }
.dai-sort {
  height: 36px; padding: 0 8px; box-sizing: border-box; cursor: pointer;
  border: .5px solid var(--dsw-alias-border-l4, rgba(0, 0, 0, 0.16));
  border-radius: var(--dsw-radius-md, 12px);
  background: var(--dsw-alias-bg-layer-3, #fff);
  color: var(--dsw-alias-label-primary, #1f2328); font: inherit; font-size: 12.5px;
}
.dai-sort:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7); outline-offset: 1px; }
.dai-chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.dai-chip {
  display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px;
  border: 0; border-radius: var(--dsw-radius-sm, 8px); background: transparent;
  color: var(--dsw-alias-label-secondary, #5c6570); font: inherit; font-size: 12.5px; cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;
}
.dai-chip:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.08)); color: var(--dsw-alias-label-primary, #1f2328); }
.dai-chip[data-on="true"] { background: var(--dsw-alias-bg-layer-2, #f3f4f6); color: var(--dsw-alias-label-primary, #1f2328); font-weight: 600; }
.dai-chip:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7); outline-offset: 1px; }
.dai-chipNum { font-size: 10.5px; color: var(--dsw-alias-label-tertiary, #9ca3af); font-variant-numeric: tabular-nums; }

.dai-list { display: flex; flex-direction: column; gap: 2px; margin: 0 -8px; padding: 0; list-style: none; }
.dai-item {
  border-radius: var(--dsw-radius-xl, 20px);
  transition: background-image 120ms ease;
}
.dai-item:hover { background-image: linear-gradient(var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.08)), var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.08))); }
.dai-item[data-open="true"] { background-image: linear-gradient(var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.06)), var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.06))); }
.dai-row { display: flex; align-items: flex-start; gap: 12px; padding: 10px 8px; }
.dai-score {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  width: 48px; height: 48px; flex: none; box-sizing: border-box;
  border: .5px solid var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.12));
  border-radius: var(--dsw-radius-lg, 16px);
  background: var(--dsw-alias-bg-layer-1, #fff);
}
.dai-scoreValue { font-size: 16px; line-height: 18px; font-weight: 600; font-variant-numeric: tabular-nums; }
.dai-scoreTrack { width: 26px; height: 3px; border-radius: 2px; background: var(--dsw-alias-bg-layer-2, #f3f4f6); overflow: hidden; }
.dai-scoreFill { display: block; height: 100%; border-radius: 2px; background: var(--dsw-alias-state-business-primary, #4f6ef7); }
.dai-main {
  display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0;
  margin: 0; padding: 0; border: 0; background: transparent; text-align: left;
  color: inherit; font: inherit; cursor: pointer;
}
.dai-main:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7); outline-offset: 3px; border-radius: var(--dsw-radius-sm, 8px); }
.dai-nameRow { display: flex; align-items: baseline; gap: 8px; min-width: 0; flex-wrap: wrap; }
.dai-name { font-size: 14px; line-height: 20px; font-weight: 500; color: var(--dsw-alias-label-primary, #1f2328); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.dai-owner { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #8b93a1); }
.dai-tag { flex: none; height: 18px; padding: 0 6px; border-radius: var(--dsw-radius-sm, 8px); background: var(--dsw-alias-bg-layer-2, #f3f4f6); color: var(--dsw-alias-label-secondary, #5c6570); font-size: 10px; line-height: 18px; font-weight: 600; }
.dai-tagAdult { color: var(--dsw-alias-state-error-primary, #dc2626); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc2626) 10%, transparent); }
.dai-desc {
  margin: 0; font-size: 13px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #8b93a1);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.dai-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; margin-top: 2px; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #9ca3af); font-variant-numeric: tabular-nums; }
.dai-meta code { font-family: var(--ds-font-family-code, ui-monospace, Menlo, monospace); font-size: 11px; }
.dai-sep { opacity: 0.55; }
.dai-end { display: flex; align-items: center; gap: 4px; flex: none; align-self: center; }
.dai-install {
  height: 30px; padding: 0 12px; border: 1px solid transparent; border-radius: var(--dsw-radius-md, 12px);
  background: var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary, #0f1115));
  color: var(--dsw-alias-label-primary-foreground, #fff);
  font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap;
  transition: opacity 120ms ease;
}
.dai-install:hover:not(:disabled) { opacity: 0.88; }
.dai-install:disabled { cursor: default; opacity: 0.45; }
.dai-install:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7); outline-offset: 2px; }
.dai-toggle {
  width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
  border: 0; border-radius: var(--dsw-radius-sm, 8px); background: transparent;
  color: var(--dsw-alias-label-tertiary, #9ca3af); cursor: pointer; padding: 0;
}
.dai-toggle:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.1)); color: var(--dsw-alias-label-primary, #1f2328); }
.dai-toggle:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7); outline-offset: 1px; }
.dai-chevron { display: inline-flex; transition: transform 140ms ease; }
.dai-item[data-open="true"] .dai-chevron { transform: rotate(180deg); }

.dai-detail { display: flex; flex-direction: column; gap: 14px; padding: 2px 8px 16px 68px; }
.dai-detailTop { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.dai-about { margin: 0; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary, #5c6570); }
.dai-verdict {
  margin: 0; padding: 9px 12px; border-left: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7);
  border-radius: 0 var(--dsw-radius-md, 12px) var(--dsw-radius-md, 12px) 0;
  background: var(--dsw-alias-bg-layer-2, #f3f4f6);
  font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-primary, #1f2328);
}
.dai-verdictTag { display: block; margin-bottom: 2px; font-size: 10px; line-height: 14px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--dsw-alias-label-tertiary, #9ca3af); }
.dai-axes { display: flex; flex-direction: column; gap: 6px; }
.dai-axesHead { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #9ca3af); }
.dai-axis { display: grid; grid-template-columns: 64px 30px minmax(0, 1fr); align-items: center; gap: 8px; font-size: 11.5px; line-height: 16px; color: var(--dsw-alias-label-secondary, #5c6570); }
.dai-axisValue { text-align: right; font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-primary, #1f2328); font-weight: 600; }
.dai-axisTrack { height: 4px; border-radius: 2px; background: var(--dsw-alias-bg-layer-2, #f3f4f6); overflow: hidden; }
.dai-axisFill { display: block; height: 100%; border-radius: 2px; background: var(--dsw-alias-state-business-primary, #4f6ef7); }
.dai-commandRow { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dai-command {
  flex: 1; min-width: 0; overflow-x: auto; padding: 8px 10px; border-radius: var(--dsw-radius-md, 12px);
  background: var(--dsw-alias-bg-layer-2, #f3f4f6); color: var(--dsw-alias-label-primary, #1f2328);
  font-family: var(--ds-font-family-code, ui-monospace, Menlo, monospace); font-size: 12px; line-height: 16px; white-space: nowrap;
}
.dai-copy {
  height: 30px; padding: 0 10px; flex: none; cursor: pointer;
  border: .5px solid var(--dsw-alias-border-l4, rgba(0, 0, 0, 0.16));
  border-radius: var(--dsw-radius-md, 12px); background: transparent;
  color: var(--dsw-alias-label-secondary, #5c6570); font: inherit; font-size: 12px;
}
.dai-copy:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.08)); color: var(--dsw-alias-label-primary, #1f2328); }
.dai-copy:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7); outline-offset: 1px; }
.dai-hint { margin: 0; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #9ca3af); }
.dai-facts { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 6px 12px; margin: 0; font-size: 12px; line-height: 18px; }
.dai-facts dt { color: var(--dsw-alias-label-tertiary, #9ca3af); }
.dai-facts dd { margin: 0; color: var(--dsw-alias-label-primary, #1f2328); overflow-wrap: anywhere; }
.dai-facts a { color: inherit; text-decoration: none; }
.dai-facts a:hover { text-decoration: underline; }
.dai-facts code { font-family: var(--ds-font-family-code, ui-monospace, Menlo, monospace); font-size: 11.5px; }

.dai-foot { display: flex; flex-direction: column; gap: 12px; border-top: .5px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08)); padding-top: 14px; }
.dai-aboutBlock { border: 0; padding: 0; }
.dai-aboutBlock summary {
  cursor: pointer; font-size: 13px; line-height: 20px; font-weight: 500; color: var(--dsw-alias-label-primary, #1f2328);
  border-radius: var(--dsw-radius-sm, 8px);
}
.dai-aboutBlock summary:hover { color: var(--dsw-alias-label-primary, #1f2328); }
.dai-aboutBlock summary:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7); outline-offset: 2px; }
.dai-aboutBody { display: flex; flex-direction: column; gap: 8px; padding: 10px 2px 2px; }
.dai-aboutBody p { margin: 0; font-size: 12.5px; line-height: 19px; color: var(--dsw-alias-label-secondary, #5c6570); }
.dai-muted { margin: 0; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #9ca3af); }
.dai-excluded { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 10px 2px 2px; list-style: none; }
.dai-excludedRow { display: flex; gap: 4px 12px; flex-wrap: wrap; font-size: 12.5px; line-height: 19px; }
.dai-excludedName { flex: none; min-width: 180px; color: var(--dsw-alias-label-primary, #1f2328); font-weight: 500; }
.dai-excludedReason { flex: 1 1 320px; min-width: 0; color: var(--dsw-alias-label-tertiary, #8b93a1); }

.dai-empty { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 36px 16px; border: .5px dashed var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.14)); border-radius: var(--dsw-radius-xl, 20px); text-align: center; }
.dai-emptyGlyph { font-size: 22px; line-height: 1; color: var(--dsw-alias-label-tertiary, #9ca3af); }
.dai-emptyTitle { margin: 0; font-size: 13.5px; font-weight: 600; }
.dai-emptyBody { margin: 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #8b93a1); }

.dai-toast {
  position: fixed; z-index: 60; left: 50%; bottom: 32px; transform: translateX(-50%);
  padding: 8px 14px; border-radius: 999px; background: var(--dsw-alias-label-primary, #1f2328);
  color: var(--dsw-alias-label-primary-foreground, #fff); font-size: 12px; font-weight: 600; white-space: nowrap;
  pointer-events: none;
}

@container (max-width: 640px) {
  .dai-row { flex-wrap: wrap; }
  .dai-end { width: 100%; justify-content: flex-end; align-self: auto; }
  .dai-detail { padding-left: 8px; }
  .dai-provenance { text-align: left; }
}
@media (prefers-reduced-motion: reduce) {
  .dai-item, .dai-chip, .dai-install, .dai-chevron, .dai-toggle { transition: none; }
}
@keyframes dai-fade { from { opacity: 0; } to { opacity: 1; } }
`

/* -------------------------------------------------------------------- icons */

function SearchIcon() {
  const h = React.createElement
  return h('span', { className: 'dai-searchIcon', 'aria-hidden': 'true' },
    h('svg', { viewBox: '0 0 16 16', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' },
      h('circle', { cx: 7, cy: 7, r: 4.4 }),
      h('path', { d: 'M10.4 10.4 13.6 13.6' })))
}

function ChevronIcon() {
  const h = React.createElement
  return h('span', { className: 'dai-chevron', 'aria-hidden': 'true' },
    h('svg', { viewBox: '0 0 12 12', width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('path', { d: 'M3 4.5 6 7.5 9 4.5' })))
}

/* --------------------------------------------------------------------- tab */

function makeIndexTab(ctx) {
  const h = React.createElement

  return function AbstractIndexTab(props) {
    const install = props && typeof props.install === 'function' ? props.install : null

    const activeLocale = React.useSyncExternalStore(
      React.useCallback((notify) => ctx.locale.subscribe(notify), []),
      React.useCallback(() => ctx.locale.getSnapshot().active, []),
      React.useCallback(() => ctx.locale.getSnapshot().active, []),
    )
    const lang = String(activeLocale || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en'
    const t = React.useCallback((key, params) => {
      const raw = ctx.locale.bind(NS)(key)
      return interpolate(raw, params)
    }, [])

    const [query, setQuery] = React.useState('')
    const [theme, setTheme] = React.useState('all')
    const [sort, setSort] = React.useState('score')
    const [openSlug, setOpenSlug] = React.useState(null)
    const [toast, setToast] = React.useState(null)
    const toastId = React.useRef(0)

    React.useEffect(() => {
      if (!toast) return undefined
      const timer = window.setTimeout(() => setToast(null), 1600)
      return () => window.clearTimeout(timer)
    }, [toast])

    const showToast = React.useCallback((message) => {
      toastId.current += 1
      setToast({ id: toastId.current, message })
    }, [])

    const copy = React.useCallback((textValue) => {
      copyText(textValue).then(
        () => showToast(t('copied')),
        () => showToast(t('copyFailed')),
      )
    }, [showToast, t])

    const all = React.useMemo(() => DATA.entries || [], [])
    const included = React.useMemo(() => all.filter((entry) => entry.include), [all])
    const excluded = React.useMemo(() => all.filter((entry) => !entry.include), [all])

    const themeCounts = React.useMemo(() => {
      const counts = {}
      for (const entry of included) counts[entry.theme] = (counts[entry.theme] || 0) + 1
      return counts
    }, [included])

    const rows = React.useMemo(() => {
      const needle = query.trim().toLowerCase()
      const filtered = included.filter((entry) => {
        if (theme !== 'all' && entry.theme !== theme) return false
        if (!needle) return true
        const verdict = entry.verdict || {}
        const haystack = [
          entry.name, entry.owner, displayName(entry), entry.description?.zh, entry.description?.en,
          entry.npm && entry.npm.name, verdict.zh, verdict.en,
          themeLabel(entry.theme, 'zh'), themeLabel(entry.theme, 'en'),
        ]
        for (const value of haystack) {
          if (String(value || '').toLowerCase().indexOf(needle) !== -1) return true
        }
        return false
      })

      const sorted = filtered.slice()
      if (sort === 'stars') {
        sorted.sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1) || b.score - a.score)
      } else if (sort === 'new') {
        sorted.sort((a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')) || b.score - a.score)
      } else {
        sorted.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
      }
      return sorted
    }, [included, query, theme, sort])

    const doInstall = (entry) => {
      const target = installTarget(entry)
      if (!target) {
        showToast(t('installUnavailable'))
        return
      }
      if (!install) {
        showToast(t('installNoHost'))
        return
      }
      install({ spec: target.spec, title: displayName(entry), version: target.version })
    }

    const toggle = (slug) => setOpenSlug((current) => (current === slug ? null : slug))

    const renderAxes = (entry) => {
      const head = h('div', { className: 'dai-axesHead' },
        h('span', null, t('axesLabel')),
        h('span', null, t('formula')))
      const axisRows = AXES.map((axis) => h('div', { className: 'dai-axis', key: axis },
        h('span', null, t(`axis.${axis}`)),
        h('span', { className: 'dai-axisValue' }, String(entry[axis])),
        h('div', { className: 'dai-axisTrack', role: 'img', 'aria-label': `${t(`axis.${axis}`)} ${entry[axis]}/100` },
          h('span', { className: 'dai-axisFill', style: { width: `${entry[axis]}%` } }))))
      return h('div', { className: 'dai-axes' }, head, axisRows)
    }

    const renderFacts = (entry) => {
      const stars = formatStars(entry.stars) ?? t('none')
      const facts = [
        ['repo', h('a', { href: entry.repo, target: '_blank', rel: 'noreferrer noopener' },
          `${entry.owner}/${entry.repo.split('/').pop()}`,
          entry.repoPath ? h('div', { className: 'dai-muted' }, entry.repoPath) : null)],
        ['package', entry.npm ? h('code', null, entry.npm.name) : h('span', null, t('none'))],
        ['version', entry.npm && entry.npm.version ? h('code', null, entry.npm.version) : h('span', null, t('none'))],
        ['stars', h('span', null, stars)],
        ['added', h('span', null, entry.addedAt || t('none'))],
        ['theme', h('span', null, themeLabel(entry.theme, lang))],
      ]
      return h('dl', { className: 'dai-facts' }, facts.map(([key, value]) => h(React.Fragment, { key },
        h('dt', null, t(key)),
        h('dd', null, value))))
    }

    const renderCommand = (entry) => {
      const command = commandFor(entry)
      if (!command) {
        return h('p', { className: 'dai-hint' }, t('installUnavailable'))
      }
      return h(React.Fragment, null,
        h('div', { className: 'dai-commandRow' },
          h('code', { className: 'dai-command' }, command),
          h('button', { type: 'button', className: 'dai-copy', onClick: () => copy(command) }, t('copy'))),
        h('p', { className: 'dai-hint' }, t('commandHint')))
    }

    const renderDetail = (entry) => h('div', { className: 'dai-detail' },
      h('div', { className: 'dai-detailTop' },
        h('p', { className: 'dai-about' }, lang === 'zh' ? entry.description?.zh : entry.description?.en),
        h('blockquote', { className: 'dai-verdict' },
          h('span', { className: 'dai-verdictTag' }, t('verdictLabel')),
          lang === 'zh' ? entry.verdict?.zh : entry.verdict?.en),
        renderAxes(entry)),
      h('div', null,
        h('p', { className: 'dai-about', style: { marginBottom: 6, fontWeight: 600 } }, t('command')),
        renderCommand(entry)),
      renderFacts(entry))

    const renderRow = (entry) => {
      const open = openSlug === entry.slug
      const score = entry.score ?? 0
      const stars = formatStars(entry.stars)
      const metaParts = [
        h('span', { key: 'theme' }, themeLabel(entry.theme, lang)),
        h('span', { key: 'age', className: 'dai-sep' }, '·'),
        h('span', { key: 'pkg' }, h('code', null, entry.npm ? entry.npm.name : `github:${entry.owner}/${entry.repo.split('/').pop()}`)),
      ]
      if (stars) {
        metaParts.push(h('span', { key: 'sepStars', className: 'dai-sep' }, '·'))
        metaParts.push(h('span', { key: 'stars' }, `★ ${stars}`))
      }
      if (entry.addedAt) {
        metaParts.push(h('span', { key: 'sepAdded', className: 'dai-sep' }, '·'))
        metaParts.push(h('span', { key: 'added' }, entry.addedAt))
      }

      const scoreTile = h('span', { className: 'dai-score', title: `${t('scoreLabel')} ${score}/100` },
        h('span', { className: 'dai-scoreValue' }, String(score)),
        h('span', { className: 'dai-scoreTrack' },
          h('span', { className: 'dai-scoreFill', style: { width: `${score}%` } })))

      const nameRow = h('span', { className: 'dai-nameRow' },
        h('span', { className: 'dai-name' }, displayName(entry)),
        h('span', { className: 'dai-owner' }, entry.owner),
        entry.adult ? h('span', { className: 'dai-tag dai-tagAdult' }, t('adult')) : null)

      const main = h('button', {
        type: 'button',
        className: 'dai-main',
        'aria-expanded': open ? 'true' : 'false',
        'aria-label': `${displayName(entry)} — ${open ? t('collapse') : t('expand')}`,
        onClick: () => toggle(entry.slug),
      },
      nameRow,
      h('span', { className: 'dai-desc' }, lang === 'zh' ? entry.description?.zh : entry.description?.en),
      h('span', { className: 'dai-meta' }, metaParts))

      const installDisabled = !installTarget(entry)
      const end = h('div', { className: 'dai-end' },
        h('button', {
          type: 'button',
          className: 'dai-install',
          disabled: installDisabled,
          title: installDisabled ? t('installUnavailable') : t('install'),
          onClick: () => doInstall(entry),
        }, t('install')),
        h('button', {
          type: 'button',
          className: 'dai-toggle',
          'aria-label': open ? t('collapse') : t('expand'),
          onClick: () => toggle(entry.slug),
        }, h(ChevronIcon)))

      return h('li', { className: 'dai-item', key: entry.slug, 'data-open': open ? 'true' : 'false' },
        h('div', { className: 'dai-row' }, scoreTile, main, end),
        open ? renderDetail(entry) : null)
    }

    const head = h('section', { className: 'dai-head' },
      h('div', { className: 'dai-headMain' },
        h('h2', { className: 'dai-title' }, t('title')),
        h('p', { className: 'dai-intro' }, t('intro')),
        h('p', { className: 'dai-stats' }, t('stats', DATA.counts)),
        h('p', { className: 'dai-formula' }, t('formula'))),
      h('div', { className: 'dai-provenance' },
        h('span', null, t('updated', { date: dateOnly(DATA.generatedAt) })),
        shortCommit(DATA.upstream) ? h('span', null, t('upstream', { commit: shortCommit(DATA.upstream) })) : null))

    const searchField = h('label', { className: 'dai-search' },
      h(SearchIcon),
      h('input', {
        type: 'search',
        value: query,
        placeholder: t('search'),
        'aria-label': t('searchLabel'),
        onChange: (event) => setQuery(event.target.value),
      }))

    const sortSelect = h('select', {
      className: 'dai-sort',
      value: sort,
      'aria-label': t('sortLabel'),
      onChange: (event) => setSort(event.target.value),
    },
    h('option', { value: 'score' }, t('sortScore')),
    h('option', { value: 'stars' }, t('sortStars')),
    h('option', { value: 'new' }, t('sortNew')))

    const themeChips = [{ id: 'all', label: t('all'), count: included.length }].concat(
      THEME_ORDER.filter((id) => (themeCounts[id] || 0) > 0).map((id) => ({
        id, label: themeLabel(id, lang), count: themeCounts[id] || 0,
      })),
    )
    const chipButtons = themeChips.map((chip) => h('button', {
      key: chip.id,
      type: 'button',
      className: 'dai-chip',
      'data-on': theme === chip.id ? 'true' : 'false',
      'aria-pressed': theme === chip.id ? 'true' : 'false',
      onClick: () => setTheme(chip.id),
    }, chip.label, h('span', { className: 'dai-chipNum' }, String(chip.count))))
    const toolbar = h('section', { className: 'dai-toolbar' },
      h('div', { className: 'dai-tools' }, searchField, sortSelect),
      h('div', { className: 'dai-chips', role: 'group', 'aria-label': t('filterLabel') }, chipButtons))

    const listContent = rows.length > 0
      ? h('ul', { className: 'dai-list' }, rows.map(renderRow))
      : h('div', { className: 'dai-empty' },
        h('span', { className: 'dai-emptyGlyph', 'aria-hidden': 'true' }, '∅'),
        h('h3', { className: 'dai-emptyTitle' }, t('emptyTitle')),
        h('p', { className: 'dai-emptyBody' }, t('emptyBody')))
    const list = h('section', { className: 'dai-listWrap' }, listContent)

    const standards = h('details', { className: 'dai-aboutBlock' },
      h('summary', null, t('aboutTitle')),
      h('div', { className: 'dai-aboutBody' },
        h('p', null, t('aboutScope', { n: DATA.counts.audited })),
        h('p', null, t('aboutRubric')),
        h('p', null, t('aboutContribute'))))

    const excludedBlock = excluded.length > 0
      ? h('details', { className: 'dai-aboutBlock' },
        h('summary', null, t('excludedTitle', { n: excluded.length })),
        h('div', { className: 'dai-aboutBody' },
          h('p', null, t('excludedHint')),
          h('ul', { className: 'dai-excluded' },
            excluded.map((entry) => h('li', { className: 'dai-excludedRow', key: entry.slug },
              h('span', { className: 'dai-excludedName' }, `${displayName(entry)} · ${entry.owner}`),
              h('span', { className: 'dai-excludedReason' }, lang === 'zh' ? entry.reason?.zh : entry.reason?.en))))))
      : null

    const foot = h('footer', { className: 'dai-foot' },
      standards,
      excludedBlock,
      h('p', { className: 'dai-muted' }, t('lastSync', {
        date: dateOnly(DATA.generatedAt),
        commit: shortCommit(DATA.upstream) || t('none'),
      })),
      h('p', { className: 'dai-muted' }, t('footerNote')))

    const toastEl = toast
      ? h('div', { className: 'dai-toast', key: `toast-${toast.id}`, role: 'status' }, toast.message)
      : null

    return h('div', { className: 'dai' }, h('style', { key: 'dai-styles' }, CSS), head, toolbar, list, foot, toastEl)
  }
}

/* ------------------------------------------------------------- plugin entry */

function applyIndex(ctx) {
  ctx.effect(
    () => ctx.locale.register(NS, { zh: DICT_ZH, en: DICT_EN }),
    'dsh-abstract-index: dictionaries',
  )

  const t = ctx.locale.bind(NS)
  const Tab = makeIndexTab(ctx)

  // The tab only exists on hosts that publish `plugins.tab`; the inject waits
  // for the declaration, so an older host simply shows no tab.
  ctx.slots.inject('plugins.tab', () => ctx.slots.register(
    { name: 'plugins.tab', id: TAB_ID, order: 5, label: () => t('tab') },
    Tab,
  ))
}

const plugin = {
  inject: ['slots', 'locale'],
  apply: applyIndex,
}
