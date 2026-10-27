# Contributing · 贡献

Thanks for helping make this index better. There are three kinds of changes, and each has a clear home.

## 1. Argue about an entry (issue)

Open an issue with the **Challenge a score / 挑战一条评分** template. Say which entry, which axis (absurdity, emotional value, craft), what number you would give, and why. Verdicts and inclusion decisions can be challenged the same way.

Nothing here is a vote count: a maintainer reads the argument and decides. The point of publishing the rubric is that disagreement can be specific.

## 2. Change the editorial layer (pull request)

The editorial layer is [`data/curation.json`](data/curation.json). It contains one decision per upstream entry:

```json
"eric-song-dev__dsh-ikun-pet": {
  "include": true,
  "theme": "pet",
  "absurdity": 88,
  "emotion": 96,
  "craft": 92,
  "adult": false,
  "verdict": { "zh": "……", "en": "……" }
}
```

- `include` — does it belong in a curated index of the *abstract*? Ordinary entertainment and utilities without an absurd premise are excluded (`"include": false` plus a `reason` in both languages).
- `theme` — one of `pet | game | meme | market | media | growth | other`.
- `absurdity` / `emotion` / `craft` — integers 0–100. The displayed score is computed, never written by hand:
  `round(absurdity×0.5 + emotion×0.3 + craft×0.2)`.
- `verdict` — one sentence, `zh` ≤ 40 characters and `en` ≤ 110 characters. Say why the thing is abstract in the curator's voice; do not restate the feature list, and do not praise.
- Keep Chinese and English in sync: English is a translation of the same claim, not a different one.

After editing, run:

```sh
npm install          # once, for js-yaml (sync only)
npm run check        # validate data → rebuild client.js → syntax check
```

Commit both `data/curation.json` and the rebuilt `client.js`. CI fails when the committed artifact does not match a fresh build.

Do not attack authors, their work, or their users in a verdict. Write about the premise, not the person.

## 3. Add or correct a fact (upstream first)

Facts — URL, name, bilingual description, npm package, stars, added date — come from the [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) repository (CC0). This index only reads them.

To fix a fact:

1. Fix the entry in the upstream repository (its `data/plugins/*.yml`, `data/npm-map.json` or probe data).
2. In this repository, regenerate the snapshot and commit it together with the rebuilt artifact:

```sh
npm run sync -- --upstream /path/to/awesome-dsh-plugin
npm run check
```

A brand-new plugin also needs a curation decision; otherwise `npm run validate` fails with `curation: missing decision for <slug>`.

## Local development

Requirements: Node.js 22 or newer.

```sh
npm install
npm run sync -- --upstream ../liuwenji007-awesome-dsh-plugin   # regenerates data/snapshot.json
npm run check
```

To see the tab in a running Harness, install this directory through the host's plugin manager:

```text
plugin_manager → action: install_bundle → target: /absolute/path/to/dsh-abstract-index
```

Then refresh the page and open **Plugins → Abstract**. While iterating on the UI, edit `src/client.js` and run `npm run build` (or `npm run check`); the host reads the rebuilt `client.js` after a refresh.

## Pull request checklist

- [ ] `npm run check` passes locally
- [ ] `client.js` is rebuilt and committed (no diff after a fresh build)
- [ ] Only `data/curation.json` (and `data/snapshot.json` when syncing) changed for data PRs
- [ ] Verdict/reason lengths respect the limits, both languages filled
- [ ] The claim is checkable from the upstream description
- [ ] No author-directed criticism

## Language

Chinese is the primary editorial voice; English is required and kept equivalent. Documentation changes should update both `README.zh.md` and `README.md` when the fact is user-facing.
