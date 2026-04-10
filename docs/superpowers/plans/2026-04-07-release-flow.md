# Release Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up CI, release-please, npm publish, and cross-platform binary builds as GitHub Actions workflows.

**Architecture:** Three GitHub Actions workflows: (1) CI runs test + lint on every push/PR, (2) release-please creates Release PRs from conventional commits and publishes to npm on merge, (3) binary build triggers on GitHub Release creation, compiles single executables for 5 platforms via `bun build --compile`, and uploads them as release assets. Also add LICENSE, update package.json metadata, and update .gitignore.

**Tech Stack:** GitHub Actions, release-please, `bun build --compile`, npm registry

---

## File Structure

```
(create) LICENSE                                  — MIT license text
(create) .github/workflows/ci.yml                — test + lint on push/PR
(create) .github/workflows/release.yml           — release-please + npm publish
(create) .github/workflows/binary.yml            — cross-platform binary build on release
(modify) package.json                            — add metadata (repository, keywords, engines, files, publishConfig)
(modify) .gitignore                              — add dist/
(modify) README.md                               — add binary download instructions
(modify) README_ja.md                            — add binary download instructions (Japanese)
```

---

### Task 1: LICENSE file

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: Create MIT LICENSE file**

```
MIT License

Copyright (c) 2025 Mitsuki Ogasahara

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Commit**

```bash
git add LICENSE
git commit -m "chore: add MIT license"
```

---

### Task 2: Update package.json metadata

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add npm publishing metadata to package.json**

Add/modify these fields in `package.json`:

```json
{
  "name": "sladm",
  "version": "0.1.0",
  "description": "Slack Admin CLI for humans and AI agents — manage Enterprise Grid via admin.* APIs",
  "type": "module",
  "bin": {
    "sladm": "./src/index.ts"
  },
  "files": [
    "src/**/*.ts",
    "skills/**/*",
    ".claude-plugin/**/*",
    "LICENSE",
    "README.md"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yamitzky/slack-admin-cli.git"
  },
  "keywords": [
    "slack",
    "slack-admin",
    "enterprise-grid",
    "cli",
    "agent-skill"
  ],
  "author": "Mitsuki Ogasahara",
  "license": "MIT",
  "engines": {
    "bun": ">=1.0"
  },
  "scripts": {
    "dev": "bun run src/index.ts",
    "test": "bun test",
    "lint": "bunx tsc --noEmit"
  },
  "dependencies": {
    "@optique/core": "latest",
    "@optique/run": "latest",
    "@slack/web-api": "latest"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "latest"
  }
}
```

The key additions are: `description`, `files`, `repository`, `keywords`, `author`, `license`, `engines`.

- [ ] **Step 2: Verify lint still passes**

Run: `bun run lint`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add npm publishing metadata to package.json"
```

---

### Task 3: Update .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Update .gitignore**

Replace current content with:

```
node_modules/
dist/
.DS_Store
*.tgz
```

`*.tgz` is added because `npm pack` creates tarball files in the project root.

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: update .gitignore"
```

---

### Task 4: CI workflow (test + lint)

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun test
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add test and lint workflow"
```

---

### Task 5: Release workflow (release-please + npm publish)

**Files:**
- Create: `.github/workflows/release.yml`

release-please detects conventional commits (`feat:`, `fix:`, etc.) on main, opens a Release PR that bumps version in `package.json` and updates `CHANGELOG.md`. When merged, it creates a GitHub Release. The npm publish job runs after the release is created.

- [ ] **Step 1: Create release workflow**

```yaml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      release_created: ${{ steps.release.outputs.release_created }}
      tag_name: ${{ steps.release.outputs.tag_name }}
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          release-type: node

  npm-publish:
    needs: release-please
    if: ${{ needs.release-please.outputs.release_created }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun test
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          registry-url: "https://registry.npmjs.org"
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Note: `npm publish` is used instead of `bun publish` because npm provenance requires Node.js. The `NPM_TOKEN` secret must be configured in the repository settings.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add release-please and npm publish workflow"
```

---

### Task 6: Binary build workflow

**Files:**
- Create: `.github/workflows/binary.yml`

This workflow triggers when a GitHub Release is published (by release-please). It builds single executables for 5 platforms using `bun build --compile` and uploads them as release assets.

- [ ] **Step 1: Create binary build workflow**

```yaml
name: Build Binaries

on:
  release:
    types: [published]

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - target: bun-darwin-arm64
            artifact: sladm-darwin-arm64
          - target: bun-darwin-x64
            artifact: sladm-darwin-x64
          - target: bun-linux-x64
            artifact: sladm-linux-x64
          - target: bun-linux-arm64
            artifact: sladm-linux-arm64
          - target: bun-windows-x64
            artifact: sladm-windows-x64.exe
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - name: Build binary
        run: bun build --compile --minify --sourcemap --bytecode --target ${{ matrix.target }} ./src/index.ts --outfile ${{ matrix.artifact }}
      - name: Upload release asset
        uses: softprops/action-gh-release@v2
        with:
          files: ${{ matrix.artifact }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/binary.yml
git commit -m "ci: add cross-platform binary build workflow"
```

---

### Task 7: Update READMEs with binary download instructions

**Files:**
- Modify: `README.md`
- Modify: `README_ja.md`

- [ ] **Step 1: Add binary download section to README.md**

Add the following after the existing Installation section's `npx sladm --help` block, before the `## Agent Skill` section:

```markdown
### Pre-built Binaries

Standalone binaries (no runtime required) are available on the [Releases](https://github.com/yamitzky/slack-admin-cli/releases) page:

| Platform | File |
|----------|------|
| macOS (Apple Silicon) | `sladm-darwin-arm64` |
| macOS (Intel) | `sladm-darwin-x64` |
| Linux (x64) | `sladm-linux-x64` |
| Linux (arm64) | `sladm-linux-arm64` |
| Windows (x64) | `sladm-windows-x64.exe` |

```bash
# Example: download and install on macOS (Apple Silicon)
curl -L https://github.com/yamitzky/slack-admin-cli/releases/latest/download/sladm-darwin-arm64 -o sladm
chmod +x sladm
sudo mv sladm /usr/local/bin/
```

- [ ] **Step 2: Add binary download section to README_ja.md**

Add the following after the existing Installation section's `npx sladm --help` block, before the `## Agent Skill` section:

```markdown
### ビルド済みバイナリ

ランタイム不要のスタンドアロンバイナリを [Releases](https://github.com/yamitzky/slack-admin-cli/releases) ページからダウンロードできます:

| プラットフォーム | ファイル |
|----------------|---------|
| macOS (Apple Silicon) | `sladm-darwin-arm64` |
| macOS (Intel) | `sladm-darwin-x64` |
| Linux (x64) | `sladm-linux-x64` |
| Linux (arm64) | `sladm-linux-arm64` |
| Windows (x64) | `sladm-windows-x64.exe` |

```bash
# 例: macOS (Apple Silicon) でダウンロード・インストール
curl -L https://github.com/yamitzky/slack-admin-cli/releases/latest/download/sladm-darwin-arm64 -o sladm
chmod +x sladm
sudo mv sladm /usr/local/bin/
```

- [ ] **Step 3: Commit**

```bash
git add README.md README_ja.md
git commit -m "docs: add binary download instructions to READMEs"
```

---

## Post-Implementation Checklist

After all tasks are complete, the following manual steps are needed:

1. **NPM_TOKEN secret**: Go to GitHub repo Settings > Secrets and variables > Actions > New repository secret. Add `NPM_TOKEN` with an npm access token (create at https://www.npmjs.com/settings/~/tokens with "Automation" type).
2. **Push to main**: Push all commits. release-please will create the first Release PR based on existing conventional commits.
3. **Verify CI**: Confirm the CI workflow runs on push and passes.
4. **Merge Release PR**: When ready, merge the release-please PR. This triggers npm publish + binary build.
5. **GitHub repo description**: Update to `sladm — Slack Admin CLI for humans and AI agents`.
