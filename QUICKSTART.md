# ⚡ Quick Start Guide

最速でPrivate Credit Scoreを起動するためのガイド

## 🚀 5分でスタート

### Step 1: インストール (2分)

```bash
# プロジェクトのクローン
git clone https://github.com/watarus/private-credit-score.git
cd private-credit-score

# pnpmのインストール（まだの場合）
npm install -g pnpm

# 依存関係のインストール
pnpm install
```

### Step 2: コンパイル (30秒)

```bash
# スマートコントラクトのコンパイル
pnpm compile
```

### Step 3: ローカルデプロイ (1分)

```bash
# Terminal 1: ローカルノード起動
pnpm node

# Terminal 2: デプロイ
pnpm deploy
# 👆 出力されたアドレスをコピー: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Step 4: フロントエンド設定 (30秒)

```bash
cd frontend

# .env.localファイル作成
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3" > .env.local
echo "NEXT_PUBLIC_CHAIN_ID=1337" >> .env.local
```

### Step 5: 起動！ (30秒)

```bash
# フロントエンド起動
pnpm dev
```

🎉 **完了！** http://localhost:3000 を開く

---

## 🔧 よく使うコマンド

```bash
# コントラクト
pnpm compile          # コンパイル
pnpm test            # テスト実行
pnpm node            # ローカルノード
pnpm deploy          # デプロイ

# フロントエンド
cd frontend
pnpm dev             # 開発サーバー
pnpm build           # プロダクションビルド
pnpm lint            # リント実行
```

---

## 🌐 Zamaテストネットへのデプロイ

### 1. 環境設定

```bash
# ルートディレクトリに.envファイル作成
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
ZAMA_RPC_URL=https://devnet.zama.ai/
EOF
```

### 2. テストネットトークン取得

[Zama Faucet](https://faucet.zama.ai/) でトークン取得

### 3. デプロイ

```bash
pnpm deploy --network zama
# 出力されたアドレスをメモ！
```

### 4. フロントエンド更新

```bash
cd frontend
# .env.localを更新
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_ADDRESS" > .env.local
echo "NEXT_PUBLIC_CHAIN_ID=8009" >> .env.local
```

### 5. MetaMask設定

**ネットワーク追加**:
- Network Name: `Zama Devnet`
- RPC URL: `https://devnet.zama.ai/`
- Chain ID: `8009`
- Currency: `ZAMA`

---

## 🎯 トラブルシューティング

### ❌ "Cannot find module 'fhevm'"

```bash
pnpm add fhevm fhevm-core-contracts
```

### ❌ "Error: could not detect network"

```bash
# ローカルノードが起動しているか確認
pnpm node  # 別ターミナルで
```

### ❌ MetaMask接続エラー

1. MetaMaskインストール確認
2. 正しいネットワークに接続
3. ページリロード

### ❌ トランザクション失敗

```bash
# 1. データ送信
#    → CreditScoreFormで送信
#    → トランザクション確認待ち

# 2. ローン評価
#    → StatusCardで"Evaluate"クリック
```

---

## 📂 ファイル構造

```
private-credit-score/
├── contracts/
│   └── PrivateCreditScore.sol    # メインコントラクト
├── frontend/
│   ├── app/page.tsx              # ホームページ
│   ├── components/               # UIコンポーネント
│   └── utils/contract.ts         # コントラクト連携
├── scripts/deploy.js             # デプロイスクリプト
├── test/                         # テスト
└── hardhat.config.js             # Hardhat設定
```

---

## 🎬 デモフロー

### 1. ウォレット接続

- "Connect Wallet"クリック
- MetaMask承認

### 2. データ入力

- **Income**: 75
- **Repayment Rate**: 95
- **Loan History**: 80

### 3. 送信

- "Submit Encrypted Data"クリック
- トランザクション確認

### 4. 評価

- "Evaluate My Loan Application"クリック
- 結果表示（Approved/Rejected）

---

## 📊 スコア計算

```
score = (income × 3) + (repaymentRate × 4) + (loanHistory × 3)

例:
income = 75
repaymentRate = 95
loanHistory = 80

score = (75 × 3) + (95 × 4) + (80 × 3)
      = 225 + 380 + 240
      = 845

閾値: 650
結果: 845 ≥ 650 → ✅ Approved!
```

---

## 🔐 プライバシーのポイント

✅ **すべての計算が暗号化状態で実行**
- ユーザーデータ: 暗号化
- スコア計算: 暗号化
- 閾値比較: 暗号化
- 結果のみ: 復号化（Approved/Rejected）

✅ **誰も生データを見れない**
- コントラクトオーナーでも不可
- マイナーでも不可
- 他のユーザーでも不可

---

## 📚 さらに詳しく

- **完全ドキュメント**: `README.md`
- **セットアップガイド**: `SETUP.md`
- **ピッチ資料**: `PITCH.md`
- **提出フォーマット**: `BOUNTY_SUBMISSION.md`
- **プロジェクトサマリー**: `PROJECT_SUMMARY.md`

---

## 🆘 ヘルプ

- **GitHub Issues**: バグ報告
- **Zama Discord**: コミュニティサポート
- **Documentation**: 詳細ガイド

---

## ✅ チェックリスト

- [ ] 依存関係インストール完了
- [ ] コントラクトコンパイル成功
- [ ] ローカルデプロイ成功
- [ ] フロントエンド起動成功
- [ ] ウォレット接続成功
- [ ] テストトランザクション成功

---

**🎉 準備完了！**

さあ、プライベートクレジットスコアリングを始めましょう！

**Built with ❤️ using Zama's FHEVM**

