# Abstract Plugins Index

[![check](https://github.com/liuwenji007/dsh-abstract-store/actions/workflows/ci.yml/badge.svg)](https://github.com/liuwenji007/dsh-abstract-store/actions/workflows/ci.yml)

English | [中文](README.zh.md) · [Repository](https://github.com/liuwenji007/dsh-abstract-store)

An **open-source** curated index that lives inside DeepSeek Harness: the most absurd plugins in the DSH ecosystem, each with a published score breakdown, one editorial verdict, and native install.

It is not another plugin market — the host already has Discover and the market to answer "what exists and can it be installed". This answers a different question: **which plugins are the most unhinged, and why**.

## What it looks like

After installing, the **Plugins** page gains an **Abstract** tab:

- **A ranked list** of entries showing theme, package, stars, and date added
- **An expandable score breakdown**: absurdity / emotional value / craft, each 0–100, weighted 50 / 30 / 20 — the number is reproducible
- **One verdict per entry**: why it counts as abstract, not a feature recap
- **Native install**: the Install button opens the host's own install flow; the CLI command is copyable too
- **A published standard**: scope, formula, and the excluded entries with reasons — in the tab footer and in this repository
- **Provenance**: facts come from [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) (CC0), and the tab shows the upstream commit

## Install

After the npm release:

```sh
dsh plugin --profile <profile> add dsh-abstract-index
```

To develop locally, install this directory through the host's plugin manager (absolute path):

```text
plugin_manager → action: install_bundle → target: /absolute/path/dsh-abstract-index
```

Then refresh the page and open **Plugins → Abstract**. On hosts without the `plugins.tab` slot (older versions) the tab does not appear and nothing fails.

## Curation and scoring

- **Scope**: every entry in the upstream `fun` category — 58 today — judged one by one.
- **Inclusion**: some entries are excluded (a plain music player, a skin, a vocabulary app…) and the reasons are shown. Inclusion is an opinion, open to argument.
- **Three axes** (0–100 each):

  | Axis | Meaning |
  |---|---|
  | absurdity | how far the premise sits from a coding tool |
  | emotion | how much it changes the waiting and the mood |
  | craft | visible product polish in the description |

- **Formula**: `score = round(absurdity×0.5 + emotion×0.3 + craft×0.2)`
- Scores are computed at build time from the three factors in `data/curation.json`; they are never hand-written, so they stay reproducible.

## Contributing

Scores, verdicts and inclusion decisions live in `data/curation.json`; the workflow and PR checklist are in [CONTRIBUTING.md](CONTRIBUTING.md). To argue about a score, a verdict, or an exclusion, open an [issue](https://github.com/liuwenji007/dsh-abstract-store/issues/new/choose) with a specific reason.

## Where the data comes from

Two committed inputs:

| File | Contents | Owned by |
|---|---|---|
| `data/snapshot.json` | Upstream facts: URL, name, bilingual description, npm package, stars, added date, upstream commit | `npm run sync` (generated; do not edit) |
| `data/curation.json` | Editorial layer: inclusion, theme, three-factor scores, verdicts, exclusion reasons | humans / pull requests |

The build joins them into the browser artifact:

```sh
npm install                      # js-yaml, needed only by sync
npm run sync -- --upstream /path/to/awesome-dsh-plugin
npm run check                    # validate → build → node --check
```

`client.js` is a committed build artifact so the bundle can be installed from git; CI proves that rebuilding produces no diff.

## Repository layout

```text
dsh-abstract-index/
  package.json            # bundle manifest + dsh.client section
  cordis.patch.yml        # inserts the abstract-index row
  index.js                # Host half: no behaviour, inventory entry only
  client.js               # built artifact (do not edit)
  src/client.js           # the Abstract tab UI
  data/snapshot.json      # upstream facts (generated)
  data/curation.json      # editorial layer (human)
  scripts/sync.mjs        # snapshot generator
  scripts/build-client.mjs# data + UI -> client.js
  scripts/validate.mjs    # data checks
  scripts/lib/data.mjs    # shared model: merge, scoring
  locale/{zh,en}.json     # display title/description for the plugin manager
  icon.svg
```

## Boundaries

- No network, no session reads, no tools, no billing; the catalog is static data baked into the artifact.
- It does not install for the host: the button calls the host's own install flow.
- It is not a security review. Read the repository README before installing anything.
- Entry text belongs to its authors; facts are CC0; this repository's code is MIT.

## License

- Code: MIT, see [LICENSE](LICENSE)
- Data and editorial text: CC0-1.0, see [LICENSE-DATA](LICENSE-DATA)
