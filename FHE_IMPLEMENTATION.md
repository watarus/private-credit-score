# 🔐 FHE Implementation Details

このドキュメントは、Private Credit ScoreでのFHEVM（Fully Homomorphic Encryption Virtual Machine）の実装について説明します。

## 📋 概要

このプロジェクトは、Zamaの **FHEVM** を使用して、ユーザーの信用データを完全に暗号化した状態で処理します。

### 🎯 FHEの役割

1. **クライアント側**: ユーザーデータをFHEで暗号化
2. **ブロックチェーン**: 暗号化されたデータをストレージ
3. **スマートコントラクト**: 暗号化状態のまま計算
4. **復号化**: 最終結果（承認/拒否）のみ復号化

---

## 🏗️ アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React/TypeScript)                                 │
│                                                             │
│  1. User Input (income, repayment, history)                │
│  2. ↓ fhevmjs で暗号化                                      │
│  3. Encrypted Data + Input Proof 生成                       │
│  4. ↓ ブロックチェーンに送信                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Smart Contract (Solidity + TFHE)                           │
│                                                             │
│  1. 暗号化データ受信 (euint32)                              │
│  2. ↓ TFHE.mul(), TFHE.add() で暗号化計算                  │
│  3. Score = (income×3) + (repayment×4) + (history×3)       │
│  4. ↓ TFHE.ge() で閾値と比較（暗号化状態）                  │
│  5. ↓ TFHE.decrypt() で結果のみ復号化                      │
│  6. 承認/拒否の判定                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 実装詳細

### 1. フロントエンド（fhevmjs）

#### ファイル: `frontend/utils/contract.ts`

```typescript
import { initFhevm, createInstance, FhevmInstance } from "fhevmjs";

// FHEVMインスタンス初期化
export async function initializeFhevm(provider: ethers.providers.Provider) {
  await initFhevm();
  
  const network = await provider.getNetwork();
  const instance = await createInstance({
    chainId: Number(network.chainId),
    networkUrl: "https://devnet.zama.ai/",
    gatewayUrl: "https://gateway.zama.ai/",
  });
  
  return instance;
}

// 値の暗号化
export async function encryptUint32(
  value: number,
  provider: ethers.providers.Provider,
  contractAddress: string
) {
  const instance = await getFhevmInstance(provider);
  
  // 公開鍵生成
  const publicKey = instance.generatePublicKey({
    verifyingContract: contractAddress,
  });
  
  // 暗号化実行
  const encrypted = instance.encrypt32(value);
  
  return { data: encrypted, signature: publicKey };
}

// Input Proof生成（EIP-712署名）
export async function createInputProof(
  encryptedData: { data: Uint8Array; signature: string }[],
  userAddress: string,
  contractAddress: string,
  provider: ethers.providers.Provider
) {
  const instance = await getFhevmInstance(provider);
  
  const proof = await instance.generateProof({
    values: encryptedData.map(d => d.data),
    verifyingContract: contractAddress,
    userAddress: userAddress,
  });
  
  return proof;
}
```

#### ファイル: `frontend/components/CreditScoreForm.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // 1. 値を暗号化
  const encryptedIncome = await encryptUint32(
    parseInt(income),
    provider,
    contractAddress
  );
  
  const encryptedRepayment = await encryptUint32(
    parseInt(repaymentRate),
    provider,
    contractAddress
  );
  
  const encryptedHistory = await encryptUint32(
    parseInt(loanHistory),
    provider,
    contractAddress
  );

  // 2. Input Proof生成
  const inputProof = await createInputProof(
    [encryptedIncome, encryptedRepayment, encryptedHistory],
    account,
    contractAddress,
    provider
  );

  // 3. ブロックチェーンに送信
  const tx = await contract.submitCreditData(
    encryptedIncome.data,
    encryptedRepayment.data,
    encryptedHistory.data,
    inputProof
  );
  
  await tx.wait();
};
```

---

### 2. スマートコントラクト（TFHE）

#### ファイル: `contracts/PrivateCreditScore.sol`

```solidity
import "fhevm/lib/TFHE.sol";

contract PrivateCreditScore {
    // 暗号化された閾値
    euint32 private minScoreThreshold;
    
    // 暗号化データの構造体
    struct EncryptedCreditData {
        euint32 income;           // 暗号化された収入
        euint32 repaymentRate;    // 暗号化された返済率
        euint32 loanHistory;      // 暗号化された履歴
        euint32 calculatedScore;  // 暗号化されたスコア
        bool exists;
        uint256 timestamp;
    }
    
    // 暗号化データ送信
    function submitCreditData(
        einput _encryptedIncome,
        einput _encryptedRepaymentRate,
        einput _encryptedLoanHistory,
        bytes calldata inputProof
    ) public {
        // 暗号化データを euint32 に変換
        euint32 income = TFHE.asEuint32(_encryptedIncome, inputProof);
        euint32 repaymentRate = TFHE.asEuint32(_encryptedRepaymentRate, inputProof);
        euint32 loanHistory = TFHE.asEuint32(_encryptedLoanHistory, inputProof);
        
        // 暗号化状態で計算（重み付けスコア）
        euint32 incomeWeighted = TFHE.mul(income, 3);
        euint32 repaymentWeighted = TFHE.mul(repaymentRate, 4);
        euint32 historyWeighted = TFHE.mul(loanHistory, 3);
        
        // 暗号化状態で加算
        euint32 calculatedScore = TFHE.add(
            TFHE.add(incomeWeighted, repaymentWeighted),
            historyWeighted
        );
        
        // 暗号化データを保存
        userCreditData[msg.sender] = EncryptedCreditData({
            income: income,
            repaymentRate: repaymentRate,
            loanHistory: loanHistory,
            calculatedScore: calculatedScore,
            exists: true,
            timestamp: block.timestamp
        });
    }
    
    // ローン評価
    function evaluateLoan() public {
        EncryptedCreditData storage userData = userCreditData[msg.sender];
        
        // 暗号化状態で比較
        ebool isEligible = TFHE.ge(userData.calculatedScore, minScoreThreshold);
        
        // 結果のみ復号化
        bool approved = TFHE.decrypt(isEligible);
        
        approvedLoans[msg.sender] = approved;
    }
}
```

---

## 🔐 プライバシー保証

### 何が暗号化されるか

✅ **完全に暗号化**:
- ユーザーの収入レベル
- 返済率
- ローン履歴
- 計算されたスコア
- 各重み付け後の値

❌ **復号化される**:
- 最終的な承認/拒否の判定のみ

### 誰が何を見れるか

| 主体 | 生データ | 暗号化データ | 結果 |
|------|---------|-------------|-----|
| ユーザー本人 | ✅ | ✅ | ✅ |
| コントラクトオーナー | ❌ | ✅ | ✅ |
| マイナー | ❌ | ✅ | ✅ |
| 他のユーザー | ❌ | ❌ | ✅ |

**重要**: 暗号化データは見えても、復号化できないため意味がない！

---

## 📊 FHE演算の詳細

### TFHE ライブラリの主要関数

```solidity
// 型変換
euint32 encrypted = TFHE.asEuint32(input, proof);

// 算術演算（暗号化状態）
euint32 sum = TFHE.add(a, b);          // a + b
euint32 product = TFHE.mul(a, 3);      // a * 3
euint32 diff = TFHE.sub(a, b);         // a - b

// 比較演算（暗号化状態）
ebool result = TFHE.ge(a, b);          // a >= b
ebool result = TFHE.gt(a, b);          // a > b
ebool result = TFHE.eq(a, b);          // a == b

// 論理演算（暗号化状態）
ebool result = TFHE.and(a, b);         // a AND b
ebool result = TFHE.or(a, b);          // a OR b
ebool result = TFHE.not(a);            // NOT a

// 復号化（結果のみ）
bool decrypted = TFHE.decrypt(encrypted);

// アクセス制御
TFHE.allow(encrypted, address);        // アドレスにアクセス許可
TFHE.allowThis(encrypted);             // コントラクト自身にアクセス許可
```

### スコア計算の詳細

```solidity
// Input:
// income = 75 (暗号化)
// repaymentRate = 95 (暗号化)
// loanHistory = 80 (暗号化)

// Step 1: 重み付け（暗号化状態）
euint32 incomeWeighted = TFHE.mul(income, 3);        // 75 * 3 = 225
euint32 repaymentWeighted = TFHE.mul(repaymentRate, 4); // 95 * 4 = 380
euint32 historyWeighted = TFHE.mul(loanHistory, 3);   // 80 * 3 = 240

// Step 2: 合計（暗号化状態）
euint32 score = TFHE.add(
    TFHE.add(incomeWeighted, repaymentWeighted),  // 225 + 380 = 605
    historyWeighted                                // 605 + 240 = 845
);
// score = 845 (暗号化)

// Step 3: 閾値比較（暗号化状態）
ebool isEligible = TFHE.ge(score, minScoreThreshold); // 845 >= 650 = true (暗号化)

// Step 4: 結果のみ復号化
bool approved = TFHE.decrypt(isEligible); // true
```

**重要**: すべての中間値は暗号化されたまま！

---

## 🧪 テスト方法

### ローカルテスト

```bash
# FHEVMモックを使ったテスト
pnpm test

# テストではTFHE.asEuint32()などが実際に動作するか確認
```

### Zamaテストネットテスト

```bash
# 1. コントラクトをデプロイ
pnpm deploy --network zama

# 2. フロントエンド起動
cd frontend
pnpm dev

# 3. MetaMaskでZamaネットワークに接続

# 4. 実際にデータを送信してテスト
# - 暗号化が正常に動作するか
# - トランザクションが成功するか
# - スコア計算が正しいか
```

---

## 🔍 デバッグ方法

### フロントエンドのデバッグ

```typescript
// console.log で確認
console.log("Encrypting data...");
const encrypted = await encryptUint32(value, provider, address);
console.log("Encrypted:", encrypted.data);
console.log("Signature:", encrypted.signature);

// ブラウザのDevToolsで確認
// Network タブ → RPC calls → FHE operations
```

### スマートコントラクトのデバッグ

```solidity
// イベントを使って確認
event DebugScore(address user, uint256 timestamp);
emit DebugScore(msg.sender, block.timestamp);

// Hardhat console.log（開発時のみ）
import "hardhat/console.sol";
console.log("Score calculated");
```

---

## ⚠️ 制限事項と注意点

### 現在の制限

1. **Gas コスト**: FHE演算は通常の演算より高コスト
2. **演算速度**: 暗号化計算は時間がかかる
3. **サポート型**: uint8, uint16, uint32 のみサポート
4. **復号化回数**: 頻繁な復号化は避ける

### ベストプラクティス

✅ **推奨**:
- 必要最小限の復号化
- バッチ処理で効率化
- 中間結果は暗号化のまま保持
- アクセス制御を適切に設定

❌ **避けるべき**:
- 不要な復号化
- 複雑すぎる計算
- 大量のFHE演算を一度に実行
- セキュアでない復号化

---

## 🔗 参考リンク

### Zama Documentation

- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [TFHE Library](https://docs.zama.ai/fhevm/fundamentals/types)
- [fhevmjs SDK](https://docs.zama.ai/fhevmjs)

### チュートリアル

- [Getting Started](https://docs.zama.ai/fhevm/getting-started)
- [Writing FHE Smart Contracts](https://docs.zama.ai/fhevm/guides/first-smart-contract)
- [Frontend Integration](https://docs.zama.ai/fhevmjs/getting-started)

---

## ✅ チェックリスト

実装時に確認すべき項目:

- [ ] fhevmjs が正しくインポートされている
- [ ] TFHE ライブラリがコントラクトにインポートされている
- [ ] 暗号化関数が実装されている
- [ ] Input Proof が生成されている
- [ ] コントラクトで euint32 型を使用
- [ ] TFHE 演算（mul, add, ge）を使用
- [ ] 適切なアクセス制御（allow, allowThis）
- [ ] 復号化は最小限（結果のみ）
- [ ] エラーハンドリング実装
- [ ] テストが成功する

---

**🎉 FHE実装完了！**

このプロジェクトは、完全なFHEVM実装により、真のプライバシー保護型信用スコアリングを実現しています。

**Built with 🔐 using Zama's FHEVM**

