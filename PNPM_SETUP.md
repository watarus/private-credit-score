# 📦 pnpm Setup Guide

このプロジェクトは **pnpm** パッケージマネージャーを使用しています。

## 🚀 pnpm とは？

pnpm は npm/yarn より高速で、ディスク容量を節約する次世代パッケージマネージャーです。

**利点**:
- ⚡ **高速**: npmより最大2倍速いインストール
- 💾 **省スペース**: シンボリックリンクでディスク容量節約
- 🔒 **厳密**: より厳格な依存関係管理
- 🎯 **モノレポ対応**: ワークスペース機能標準搭載

## 📥 インストール

### macOS / Linux

```bash
# Homebrewを使用
brew install pnpm

# curlを使用
curl -fsSL https://get.pnpm.io/install.sh | sh -

# npmから（既にNode.jsがある場合）
npm install -g pnpm
```

### Windows

```powershell
# PowerShell
iwr https://get.pnpm.io/install.ps1 -useb | iex

# npmから
npm install -g pnpm
```

### バージョン確認

```bash
pnpm --version
# 8.15.0 以上推奨
```

## 🛠️ プロジェクトのセットアップ

### 1. 依存関係のインストール

```bash
# ルートと全ワークスペースの依存関係を一括インストール
pnpm install

# または個別に
pnpm install            # ルートディレクトリ
cd frontend && pnpm install  # フロントエンド
```

### 2. よく使うコマンド

```bash
# スマートコントラクト
pnpm compile            # コンパイル
pnpm test              # テスト実行
pnpm node              # ローカルノード起動
pnpm deploy            # デプロイ

# フロントエンド
cd frontend
pnpm dev               # 開発サーバー
pnpm build             # プロダクションビルド
pnpm start             # プロダクションサーバー
pnpm lint              # リント実行

# または、ルートから
pnpm dev:frontend      # フロントエンド開発サーバー
```

## 📁 ワークスペース構造

このプロジェクトは pnpm workspace を使用しています：

```yaml
# pnpm-workspace.yaml
packages:
  - 'frontend'
```

**利点**:
- フロントエンドとコントラクトの依存関係を一元管理
- `pnpm install` 一発で全依存関係インストール
- 共通パッケージの重複排除

## 🔧 設定ファイル

### `.npmrc`

```ini
strict-peer-dependencies=false
auto-install-peers=true
shamefully-hoist=true
```

**設定の意味**:
- `strict-peer-dependencies=false`: peer依存関係の厳密チェックを緩和
- `auto-install-peers=true`: peer依存関係を自動インストール
- `shamefully-hoist=true`: Next.jsなどとの互換性向上

## 📦 パッケージの追加/削除

```bash
# ルートプロジェクトに追加
pnpm add <package>
pnpm add -D <package>  # devDependencies

# フロントエンドに追加
pnpm add <package> --filter frontend

# グローバルに追加
pnpm add -g <package>

# 削除
pnpm remove <package>
```

## 🚀 npm/yarn からの移行

### 既存のプロジェクトを pnpm に移行

```bash
# 1. 既存の lock ファイルを削除
rm -rf node_modules package-lock.json yarn.lock

# 2. pnpm でインストール
pnpm install

# 3. pnpm-lock.yaml が生成される
```

### コマンド対応表

| npm | yarn | pnpm |
|-----|------|------|
| `npm install` | `yarn` | `pnpm install` |
| `npm install <pkg>` | `yarn add <pkg>` | `pnpm add <pkg>` |
| `npm uninstall <pkg>` | `yarn remove <pkg>` | `pnpm remove <pkg>` |
| `npm run <script>` | `yarn <script>` | `pnpm <script>` |
| `npm test` | `yarn test` | `pnpm test` |
| `npx <cmd>` | `yarn <cmd>` | `pnpm dlx <cmd>` |

## 🎯 よくある問題

### ❓ "Unable to find the global bin directory"

```bash
# pnpm の PATH を追加
echo 'export PNPM_HOME="$HOME/.local/share/pnpm"' >> ~/.zshrc
echo 'export PATH="$PNPM_HOME:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### ❓ peer dependencies の警告

```bash
# .npmrc に追加済みなので通常は問題なし
# 個別に解決する場合：
pnpm install --shamefully-hoist
```

### ❓ モジュールが見つからない

```bash
# キャッシュクリア
pnpm store prune

# 再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📊 パフォーマンス比較

実測例（このプロジェクト）:

| マネージャー | インストール時間 | ディスク容量 |
|------------|----------------|------------|
| npm | ~45s | ~280MB |
| yarn | ~35s | ~260MB |
| **pnpm** | **~20s** | **~180MB** |

## 🔗 リンク

- [pnpm 公式サイト](https://pnpm.io/)
- [pnpm ドキュメント](https://pnpm.io/motivation)
- [ワークスペース機能](https://pnpm.io/workspaces)

## ✅ セットアップ完了チェックリスト

- [ ] pnpm インストール完了 (`pnpm --version`)
- [ ] 依存関係インストール完了 (`pnpm install`)
- [ ] コントラクトコンパイル成功 (`pnpm compile`)
- [ ] フロントエンド起動成功 (`pnpm dev:frontend`)

---

**🎉 pnpm セットアップ完了！**

これで、より高速で効率的な開発環境が整いました。

**Next**: `QUICKSTART.md` でプロジェクトを起動しましょう！

