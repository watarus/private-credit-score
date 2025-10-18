# 🔄 Recent Changes

## ✅ pnpm 対応 + 型エラー修正 (2025-10-11)

### 🆕 追加されたファイル

1. **pnpm-workspace.yaml** - モノレポ構成
2. **.npmrc** - pnpm設定
3. **PNPM_SETUP.md** - pnpm完全ガイド
4. **frontend/types/window.d.ts** - window.ethereum型定義
5. **frontend/.eslintrc.json** - ESLint設定

### 🔧 修正されたファイル

1. **package.json**
   - `packageManager: "pnpm@8.15.0"` 追加
   - スクリプトを pnpm 用に更新

2. **frontend/components/StatusCard.tsx**
   - 未使用の `loading` ステート削除
   - `useEffect` の依存配列警告を修正
   - `checkStatus` 関数を useEffect の前に移動

3. **.gitignore**
   - pnpm-lock.yaml 追加
   - .pnpm-store 追加

4. **README.md, QUICKSTART.md**
   - 全コマンドを `npm` → `pnpm` に更新

### ✅ 修正された問題

1. ✅ **React Hook警告**: `useEffect` 依存配列の問題解決
2. ✅ **未使用変数**: `loading` ステート削除
3. ✅ **型エラー**: window.ethereum の型定義追加
4. ✅ **パッケージマネージャー**: pnpm完全対応

### 📦 pnpm のメリット

- ⚡ **2倍速い**: インストールが npm より高速
- 💾 **省スペース**: ディスク容量 35% 削減
- 🔒 **厳密**: より安全な依存関係管理
- 🎯 **モノレポ**: ワークスペース標準サポート

### 🚀 使い方

```bash
# インストール
npm install -g pnpm

# プロジェクトセットアップ
pnpm install

# 開発開始
pnpm compile
pnpm node  # Terminal 1
pnpm deploy  # Terminal 2
cd frontend && pnpm dev  # Terminal 3
```

### 📚 詳細ドキュメント

- **PNPM_SETUP.md** - pnpm完全ガイド
- **QUICKSTART.md** - 5分で起動
- **README.md** - 完全なドキュメント

---

**すべての型エラーとlintエラーが解消されました！✨**
