# 🌐 Network Information

## ⚠️ 重要: Zamaのネットワークについて

### 現状（2025年10月時点）

Zamaは**独自のブロックチェーンネットワークを持っていません**。

FHEVMは既存のブロックチェーンに統合される形で提供されます：

```
Zama = FHE技術
FHEVM = 既存チェーン + FHEレイヤー
```

---

## 🎯 デプロイオプション

### Option 1: ローカル開発（推奨） ✅

**Hardhatのローカルノードを使用**

```bash
# Terminal 1: ローカルノード起動
pnpm node

# Terminal 2: デプロイ
pnpm deploy --network localhost
```

**利点**:
- ✅ 完全にローカルでテスト可能
- ✅ 無料（Gasなし）
- ✅ 高速
- ✅ FHEVMモックで動作確認

**制限**:
- ⚠️ 実際のFHE演算ではなくモック
- ⚠️ ローカル環境のみ

---

### Option 2: Sepolia Testnet（将来対応予定）

**Ethereum Sepoliaテストネット**

Zamaは2025 Q4にEthereumメインネットにローンチ予定。
その前にSepoliaなどのテストネットで試験運用される可能性があります。

```bash
# Sepoliaにデプロイ（FHEVMサポート後）
pnpm deploy --network sepolia
```

**必要なもの**:
- Sepolia ETH（[faucet](https://sepoliafaucet.com/)から取得）
- Infura/Alchemy API Key

**設定**:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
INFURA_API_KEY=your_api_key
PRIVATE_KEY=your_private_key
```

---

### Option 3: Ethereum Mainnet（2025 Q4以降）

**本番環境**

2025年第4四半期にEthereumメインネットでFHEVMがローンチ予定。

```bash
# Mainnetにデプロイ（ローンチ後）
pnpm deploy --network mainnet
```

**注意**:
- ⚠️ 実際のETHが必要
- ⚠️ セキュリティ監査必須
- ⚠️ 本番環境での十分なテスト

---

## 🏗️ 現在のプロジェクト設定

このプロジェクトは**ローカルHardhat環境**を前提に設計されています。

### デプロイ手順

```bash
# 1. 依存関係インストール
pnpm install

# 2. コントラクトコンパイル
pnpm compile

# 3. ローカルノード起動
pnpm node

# 4. ローカルにデプロイ
pnpm deploy --network localhost

# 5. フロントエンド設定
cd frontend
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3" > .env.local
echo "NEXT_PUBLIC_CHAIN_ID=1337" >> .env.local

# 6. フロントエンド起動
pnpm dev
```

---

## 🔐 FHEVMの動作環境

### ローカル開発

```typescript
// Hardhatではfhevmのモックが使われる
import { initFhevm, createInstance } from "fhevmjs";

// ローカルテスト用の設定
const instance = await createInstance({
  chainId: 1337,
  networkUrl: "http://localhost:8545",
  // Gateway URLは不要（ローカル）
});
```

### テストネット/メインネット（将来）

```typescript
// 実際のFHEVM環境
const instance = await createInstance({
  chainId: 11155111, // Sepolia
  networkUrl: "https://sepolia.infura.io/v3/...",
  gatewayUrl: "https://gateway.fhevm.io/", // FHEVMゲートウェイ
});
```

---

## 📊 ネットワーク比較

| ネットワーク | 状態 | Chain ID | 用途 |
|------------|------|----------|-----|
| Hardhat Local | ✅ 利用可能 | 1337 | 開発・テスト |
| Sepolia | 🔮 将来対応 | 11155111 | テストネット |
| Ethereum | 🔮 2025 Q4 | 1 | 本番環境 |
| Arbitrum | 🔮 将来 | TBD | L2展開 |
| Solana | 🔮 将来 | TBD | 他チェーン |

---

## 🚀 Zamaのロードマップ

### 2025年

- **Q4**: Ethereum メインネットローンチ
  - FHEVMを機密性レイヤーとして統合
  - Solidityで暗号化データ型使用可能

### 2026年以降

- Arbitrumなど他のL1/L2への展開
- Solanaなど他ブロックチェーンへの対応
- HTTPZ（FHE版HTTP）の推進

---

## 🎯 ハッカソン・デモ向けの推奨

### 現時点での最適な方法

1. **ローカルHardhatでデモ** ✅
   - 完全に動作する
   - FHEのコンセプト証明として十分
   - 審査員に技術を理解してもらえる

2. **Vercelにフロントエンドデプロイ** ✅
   - UIは公開可能
   - スマートコントラクトはローカル
   - デモビデオで動作を見せる

3. **技術説明を充実** ✅
   - FHEの仕組みを説明
   - 本番環境での動作イメージ
   - ロードマップを提示

---

## 📝 ドキュメント更新

プロジェクト内の以下のドキュメントを更新しました：

- ✅ `hardhat.config.js` - Sepoliaネットワーク設定
- ✅ `env.example` - 正しい環境変数
- ✅ `NETWORK_INFO.md` (このファイル) - 詳細説明
- 🔄 `README.md` - デプロイ手順更新中
- 🔄 `VERCEL_DEPLOY.md` - ネットワーク情報更新中

---

## 🔗 参考リンク

- [Zama 公式サイト](https://www.zama.ai/)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai)
- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)

---

## ❓ よくある質問

### Q: Zamaのテストネットはどこ？
**A**: Zamaは独自のネットワークを持っていません。ローカルHardhatまたは将来的にEthereumテストネットで使用します。

### Q: デモはどうやって見せる？
**A**: ローカル環境で動作させ、デモビデオを撮影します。フロントエンドはVercelで公開可能です。

### Q: 本番環境はいつ？
**A**: 2025年Q4にEthereumメインネットでローンチ予定です。

### Q: Gasコストは？
**A**: ローカル開発では無料。本番環境ではFHE演算のためGasコストが高めになる可能性があります。

---

**Built with 🔐 using Zama's FHEVM**

*Deployed locally, secured globally.* 🌐

