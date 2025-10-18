# 🚀 Vercel Deployment Guide

Private Credit Score Frontend を Vercel に公開するための最新手順です。  
（FHEVM の本番ネットワークはまだ一般公開されていないため、UI のみを公開し、バックエンドはローカルや将来の FHE 対応チェーンで動かす想定です。）

---

## ✅ 前提

- GitHub リポジトリと Vercel アカウントを用意済み
- `frontend/` ディレクトリで `pnpm build` が成功する状態（`pnpm test` も通ることを確認済み）
- コントラクトはローカル / あるいは対応済みチェーンにデプロイ済みで、アドレスを把握している

---

## 1. ローカルで最終チェック

```bash
# 依存関係のインストール
pnpm install
cd frontend && pnpm install && cd ..

# コントラクトテスト
pnpm test

# Next.js 本番ビルド
cd frontend
pnpm build
```

どちらも成功したら、Vercel にアップする準備完了です。

---

## 2. Vercel プロジェクトの作成

1. [Vercel ダッシュボード](https://vercel.com) にログイン  
2. **Add New Project** → GitHub 上のリポジトリ（例: `private-credit-score`）を選択  
3. **Root Directory** を `frontend` に設定（必ず変更）
4. Build 設定はデフォルトで OK （Next.js 14 のプリセットが自動検出されます）
5. **Environment Variables** に以下を登録

   | NAME | VALUE | 備考 |
   |------|-------|------|
   | `NEXT_PUBLIC_CONTRACT_ADDRESS` | デプロイ済みコントラクトのアドレス | 後から変更可 |
   | `NEXT_PUBLIC_RPC_URL` | フロントが接続する RPC URL | Hardhat ローカル等でも OK |
   | `NEXT_PUBLIC_GATEWAY_URL` | ゲートウェイが必要な場合のみ | 任意 |

   ※ FHEVM 本番ネットが未公開の場合、`NEXT_PUBLIC_RPC_URL` には一時的にローカルノード等を指定し、デモ用に構成します。

6. **Deploy** をクリックし、ビルド完了まで待機  
   - 途中で 404 になる場合は Root Directory が `frontend` になっているか再確認  
   - `/` が表示されれば完了

---

## 3. デプロイ後の確認

- `https://<project-name>.vercel.app` をブラウザで開いて UI をチェック  
- ウォレット接続やコントラクトとの通信は、`NEXT_PUBLIC_*` 環境変数で指した RPC アドレスに接続されます  
- 必要に応じて Vercel の **Project Settings → Environment Variables** で値を更新し、**Redeploy** すると即時反映されます

---

## 4. よくあるハマりどころ

| 症状 | 対処 |
|------|------|
| 404 が返る | Root Directory が `frontend` になっていない / 古いリライト設定が残っていないか確認 |
| ビルドが失敗する | `pnpm build` のログを確認。`node_modules` キャッシュが壊れている場合は「Clear Build Cache」で再実行 |
| フロントからの RPC 呼び出しが失敗する | `NEXT_PUBLIC_RPC_URL` が正しいか、CORS など制限がないか確認 |
| FHE 関連の wasm が見つからない | `frontend/next.config.js` の wasm エイリアス設定および `public/fhevm/tfhe_bg.wasm` の存在を確認 |

---

## 5. 将来の FHEVM ネットワーク対応について

- Zama の FHEVM が正式リリースされたら、実際の RPC / Gateway URL を環境変数に設定し、`NEXT_PUBLIC_CONTRACT_ADDRESS` を更新するだけでフロントはそのまま利用できます
- コントラクト側は既に FHEVM 対応の Solidity で実装済み（`contracts/PrivateCreditScore.sol`）なので、実ネットワークに合わせて `_isLocalEnvironment()` の分岐を調整するだけで本番に移行可能です

---

## 6. 参考リンク

- [Vercel Documentation – Deploy a Next.js App](https://vercel.com/docs/deployments/overview)
- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)（ネットワーク公開時に最新情報を確認）
- `frontend/next.config.js`（wasm エイリアスなどデプロイ時に必要な設定を記述）

---

これで Vercel に安全にデプロイできるはずです。  
環境変数を書き換えたら忘れずに再デプロイを実行してください。***

---

## 🔄 自動デプロイ設定

Vercelは自動的に以下を実行：

✅ **Production**: `main` ブランチへのpushで本番デプロイ
✅ **Preview**: PRやブランチpushでプレビューデプロイ
✅ **Rollback**: 簡単にロールバック可能

### プレビューデプロイの活用

```bash
# 新機能開発
git checkout -b feature/new-scoring-model
# 変更を加える
git add .
git commit -m "Add new scoring model"
git push origin feature/new-scoring-model

# GitHubでPR作成
# → Vercelが自動的にプレビューURLを生成！
```

---

## 🔐 環境変数の更新

### コントラクトアドレスを変更する場合

1. Vercelダッシュボード → プロジェクト選択
2. **"Settings"** → **"Environment Variables"**
3. `NEXT_PUBLIC_CONTRACT_ADDRESS` の **"Edit"** をクリック
4. 新しいアドレスを入力
5. **"Save"**
6. **"Redeploy"** をクリックして再デプロイ

または、コマンドラインから：

```bash
# Vercel CLIをインストール
pnpm add -g vercel

# ログイン
vercel login

# プロジェクトディレクトリで
cd frontend
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS production
# 値を入力: 0x新しいアドレス

# 再デプロイ
vercel --prod
```

---

## 🐛 トラブルシューティング

### ❌ Build Failed: "Cannot find module 'fhevm'"

**解決策**:
```bash
# frontend/package.json に追加
{
  "dependencies": {
    "fhevm": "^0.5.0",
    "fhevmjs": "^0.5.0"
  }
}
```

コミット＆プッシュして再デプロイ。

### ❌ "pnpm: command not found"

**解決策**:

Vercel Project Settings → General → Build & Development Settings:

```
Install Command: npm install -g pnpm && pnpm install
```

### ❌ "Root Directory not found"

**解決策**:

Settings → General → Root Directory を `frontend` に設定。

### ❌ 環境変数が反映されない

**解決策**:
1. 環境変数は `NEXT_PUBLIC_` プレフィックス必須
2. 保存後、必ず **Redeploy** 実行
3. キャッシュクリア: Settings → Clear Cache

### ❌ "window is not defined" エラー

**解決策**:

コンポーネントで `"use client"` ディレクティブ追加済み。
それでもエラーが出る場合：

```typescript
// 動的インポート使用
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('./Component'), {
  ssr: false
});
```

---

## 📊 パフォーマンス最適化

### ビルドサイズの確認

```bash
cd frontend
pnpm build

# 出力例:
# Route (app)                              Size     First Load JS
# ┌ ○ /                                    5.2 kB          87 kB
```

### 最適化のヒント

1. **画像最適化**: Next.js Image コンポーネント使用
2. **コード分割**: Dynamic imports
3. **フォント最適化**: next/font 使用
4. **キャッシング**: Vercel Edge Network活用

---

## 🔍 デプロイ後の確認

### ✅ チェックリスト

1. **サイトアクセス**: Production URLを開く
2. **ウォレット接続**: MetaMaskで接続テスト
3. **ネットワーク**: Zama Devnet (Chain ID: 8009) に切り替え
4. **コントラクト**: データ送信＆評価をテスト
5. **レスポンシブ**: モバイルでも確認

### 📱 モバイルテスト

- MetaMask Mobile アプリをインストール
- アプリ内ブラウザでサイトを開く
- ウォレット接続＆機能テスト

---

## 📈 アナリティクス設定（オプション）

### Vercel Analytics

```bash
cd frontend
pnpm add @vercel/analytics

# app/layout.tsx に追加
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Google Analytics 4

```bash
# 環境変数に追加
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 🚀 本番デプロイのベストプラクティス

### 1. デプロイ前チェック

```bash
# ローカルでビルドテスト
cd frontend
pnpm build
pnpm start

# 本番環境変数でテスト
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x実際のアドレス" > .env.local
echo "NEXT_PUBLIC_CHAIN_ID=8009" >> .env.local
pnpm dev
```

### 2. セキュリティチェック

- [ ] 環境変数に秘密鍵を含めない
- [ ] `NEXT_PUBLIC_` 以外の機密情報は含めない
- [ ] コントラクトのセキュリティ監査完了
- [ ] テストネットで十分なテスト実施

### 3. パフォーマンスチェック

```bash
# Lighthouse でスコア確認
npx lighthouse https://your-site.vercel.app --view
```

目標:
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

---

## 🔗 便利なリンク

- **Vercelダッシュボード**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel CLI**: https://vercel.com/docs/cli

---

## 📞 サポート

### Vercelサポート

- Discord: https://vercel.com/discord
- GitHub: https://github.com/vercel/vercel/discussions

### プロジェクトサポート

- GitHub Issues: https://github.com/YOUR_USERNAME/private-credit-score/issues
- Zama Discord: https://discord.com/invite/zama

---

## ✅ 完了！

これで、Private Credit Score が Vercel にデプロイされました！🎉

**次のステップ**:
1. ✅ Production URLをシェア
2. ✅ ハッカソンに提出
3. ✅ SNSで宣伝
4. ✅ フィードバック収集
5. ✅ 継続的改善

**Your Live Site**: `https://private-credit-score.vercel.app`

---

**Built with ❤️ using Zama's FHEVM**

*Now live on Vercel!* 🚀
