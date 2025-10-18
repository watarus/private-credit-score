# ⚡ Quick Deploy Guide

最速でVercelにデプロイする方法

## 🚀 3ステップでデプロイ

### Step 1: コントラクトをデプロイ (5分)

```bash
# 環境変数設定
echo "PRIVATE_KEY=your_key" > .env
echo "ZAMA_RPC_URL=https://devnet.zama.ai/" >> .env

# デプロイ
pnpm compile
pnpm deploy --network zama

# 出力されたアドレスをコピー
# 例: 0x1234567890abcdef1234567890abcdef12345678
```

### Step 2: GitHubにプッシュ (2分)

```bash
# 初回のみ
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/private-credit-score.git
git push -u origin main

# 2回目以降
git add .
git commit -m "Update"
git push
```

### Step 3: Vercelでデプロイ (3分)

1. https://vercel.com にアクセス
2. "Add New Project" → GitHubリポジトリ選択
3. **設定**:
   - Root Directory: `frontend`
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
4. **環境変数**:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: Step1のアドレス
   - `NEXT_PUBLIC_CHAIN_ID`: `8009`
5. "Deploy" クリック！

---

## 🎉 完了！

Production URL: `https://your-project.vercel.app`

---

## 📚 詳細ガイド

完全なガイドは [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) を参照
