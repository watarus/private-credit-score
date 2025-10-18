# ✅ Deploy Checklist

デプロイ前の完全チェックリスト

## 📋 Phase 1: 準備

### コントラクトデプロイ

- [ ] Zamaテストネットトークン取得完了
- [ ] `.env` ファイルに `PRIVATE_KEY` 設定
- [ ] コントラクトコンパイル成功 (`pnpm compile`)
- [ ] ローカルテスト実行成功 (`pnpm test`)
- [ ] Zamaテストネットにデプロイ完了 (`pnpm deploy --network zama`)
- [ ] コントラクトアドレスをメモ: `0x___________________`
- [ ] `deployment.json` ファイル確認

### GitHubセットアップ

- [ ] GitHubリポジトリ作成
- [ ] `.gitignore` で秘密鍵を除外確認
- [ ] README.md 更新
- [ ] ライセンス追加
- [ ] 全ファイルをコミット
- [ ] GitHubにプッシュ完了

---

## 🚀 Phase 2: Vercelデプロイ

### Vercel設定

- [ ] Vercelアカウント作成/ログイン
- [ ] GitHubとVercel連携完了
- [ ] プロジェクトインポート
- [ ] Root Directory: `frontend` に設定
- [ ] Build Command: `pnpm build` に設定
- [ ] Install Command: `pnpm install` に設定

### 環境変数設定

- [ ] `NEXT_PUBLIC_CONTRACT_ADDRESS` 追加
  - 値: `0x___________________`
- [ ] `NEXT_PUBLIC_CHAIN_ID` 追加
  - 値: `8009`
- [ ] 環境変数保存完了

### デプロイ実行

- [ ] "Deploy" ボタンクリック
- [ ] ビルドログ確認
- [ ] エラーなくデプロイ完了
- [ ] Production URL取得: `https://___________________`

---

## 🧪 Phase 3: 動作確認

### 基本機能テスト

- [ ] サイトにアクセス可能
- [ ] ページが正しく表示される
- [ ] レスポンシブデザイン確認（モバイル）
- [ ] 画像・スタイルが正常

### ウォレット接続テスト

- [ ] MetaMask接続ボタンクリック
- [ ] ウォレット接続成功
- [ ] アドレスが正しく表示
- [ ] Zamaネットワークに切り替え可能

### スマートコントラクト連携

- [ ] 信用データフォーム表示
- [ ] データ入力可能
- [ ] "Submit Encrypted Data" クリック
- [ ] トランザクション送信（デモモード確認）
- [ ] ステータス表示確認
- [ ] "Evaluate" ボタン動作（本番モード時）

### エラーハンドリング

- [ ] ウォレット未接続時の警告表示
- [ ] 不正な入力時のバリデーション
- [ ] トランザクション失敗時のエラー表示

---

## 📱 Phase 4: モバイル確認

### MetaMask Mobile

- [ ] MetaMask Mobileアプリインストール
- [ ] アプリ内ブラウザでサイトアクセス
- [ ] ウォレット接続テスト
- [ ] 基本機能動作確認

### レスポンシブデザイン

- [ ] iPhone/Android表示確認
- [ ] タブレット表示確認
- [ ] 横向き表示確認
- [ ] タッチ操作確認

---

## 🔐 Phase 5: セキュリティチェック

### コード確認

- [ ] `.env` ファイルがGitHubにプッシュされていない
- [ ] 秘密鍵が含まれていない
- [ ] API keyが公開されていない
- [ ] console.log()の機密情報削除

### コントラクト確認

- [ ] オーナーアドレス確認
- [ ] 閾値設定確認
- [ ] アクセス権限確認

---

## 📊 Phase 6: パフォーマンスチェック

### ビルドサイズ

- [ ] Next.js build出力確認
- [ ] First Load JS < 100KB
- [ ] 不要なライブラリ削除

### Lighthouse Score

- [ ] Performance > 90
- [ ] Accessibility = 100
- [ ] Best Practices > 95
- [ ] SEO = 100

### ページ速度

- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1

---

## 📝 Phase 7: ドキュメント更新

### README

- [ ] Live Demo URLを追加
- [ ] スクリーンショット追加
- [ ] デプロイ手順を更新
- [ ] トラブルシューティング追加

### BOUNTY_SUBMISSION

- [ ] Production URL記載
- [ ] デモビデオURL追加
- [ ] スクリーンショット添付
- [ ] チーム情報更新

---

## 🎬 Phase 8: ハッカソン提出準備

### 必須資料

- [ ] GitHub Repository URL
- [ ] Live Demo URL
- [ ] Demo Video (3-5分)
- [ ] Pitch Deck
- [ ] Project Description

### デモビデオ

- [ ] 問題提起（30秒）
- [ ] ソリューション説明（1分）
- [ ] ライブデモ（2分）
- [ ] 技術的特徴（1分）
- [ ] 将来性（30秒）

### プレゼン資料

- [ ] タイトルスライド
- [ ] 問題定義
- [ ] ソリューション
- [ ] 技術スタック
- [ ] デモ画面
- [ ] ビジネスモデル
- [ ] ロードマップ
- [ ] チーム紹介

---

## 🌟 Phase 9: プロモーション

### SNS投稿

- [ ] Twitter投稿準備
- [ ] スクリーンショット添付
- [ ] ハッシュタグ: #Zama #FHE #Web3 #DeFi
- [ ] Live Demo URLリンク

### コミュニティシェア

- [ ] Zama Discord投稿
- [ ] Reddit投稿
- [ ] Dev.to記事作成（オプション）

---

## 🔄 Phase 10: 継続的改善

### モニタリング

- [ ] Vercel Analytics設定
- [ ] エラーログ確認
- [ ] ユーザーフィードバック収集

### アップデート計画

- [ ] Issue作成（改善点）
- [ ] Roadmap更新
- [ ] 次のスプリント計画

---

## 📊 最終確認

### 必須項目

✅ スマートコントラクトがZamaテストネットにデプロイ済み
✅ フロントエンドがVercelにデプロイ済み
✅ 全機能が動作確認済み
✅ セキュリティチェック完了
✅ ドキュメント完備
✅ ハッカソン提出準備完了

### オプション項目

- [ ] カスタムドメイン設定
- [ ] Google Analytics設定
- [ ] SEO最適化
- [ ] PWA対応
- [ ] 多言語対応

---

## 🎉 Complete!

**Congratulations!** 🚀

Your Private Credit Score is now live on Vercel!

**Production URL**: `https://your-site.vercel.app`

**Next Steps**:
1. Share with the world
2. Submit to hackathon
3. Gather feedback
4. Iterate and improve

---

**Deployment Date**: `__/__/____`
**Deployed By**: `____________`
**Contract Address**: `0x____________________`
**Vercel URL**: `https://____________________`

---

**Built with ❤️ using Zama's FHEVM**

*Ready to change the world of private finance!* 🔐

