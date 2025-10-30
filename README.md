# 🔐 Private Credit Score

> **Privacy-preserving credit scoring system built with Zama's FHEVM**

Prove your creditworthiness without revealing your financial history. Built with Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM) for complete privacy and transparent lending logic.

🔗 **Live Demo**: [https://private-credit-score.vercel.app](https://private-credit-score.vercel.app)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-orange.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black.svg)
![Network](https://img.shields.io/badge/Network-Sepolia-purple.svg)

## 🌟 Overview

**Private Credit Score** is a revolutionary DeFi application that enables users to prove their creditworthiness and access loans without ever revealing their sensitive financial data. Using Zama's FHEVM, all credit calculations happen on encrypted data directly on-chain.

### The Problem

Traditional credit scoring systems require users to:
- Share sensitive financial information
- Trust centralized entities with their data
- Have no transparency into scoring algorithms
- Risk data breaches and identity theft

### Our Solution

With Private Credit Score:
- ✅ **Fully Private**: Your financial data stays encrypted on-chain
- ✅ **Instant Evaluation**: Credit scores calculated on encrypted data
- ✅ **Transparent Logic**: Smart contract logic is public and verifiable
- ✅ **Decentralized**: No central authority can access your data

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │  Next.js 14 + @zama-fhe/relayer-sdk
│   (React/TS)    │  - Encrypt user inputs with FHE
└────────┬────────┘  - Auto wallet analysis
         │           - Submit to blockchain
         ▼
┌─────────────────┐
│   Smart         │  Solidity + TFHE
│   Contract      │  - Receive encrypted data
│   (FHEVM)       │  - Compute on encrypted data
└────────┬────────┘  - Return approval/rejection
         │
         ▼
┌─────────────────┐
│   Blockchain    │  Sepolia Testnet (11155111)
│   (Encrypted)   │  - Store encrypted state
└─────────────────┘  - Maintain privacy

Contract: 0xa57722b5e5cA2AC8AbF58fc6ef7f1CC5962346db
```

## 🔐 How It Works

1. **Automatic Wallet Analysis**
   - Transaction count
   - Wallet balance
   - Wallet age (estimated from transaction history)
   - All metrics normalized to 0-100 scale

2. **User Submits Credit Data**
   - Income level (0-100)
   - Repayment rate (0-100%)
   - Loan history score (0-100)

3. **Smart Contract Calculates Score**
   ```solidity
   // Traditional credit factors (weight: 10)
   traditionalScore = (income × 3) + (repaymentRate × 4) + (loanHistory × 3)

   // On-chain wallet factors (weight: 10)
   walletScore = (txCount × 2) + (balance × 4) + (walletAge × 4)

   // Total score (max: 2000)
   finalScore = traditionalScore + walletScore
   ```
   All operations performed on **encrypted data** using FHE

4. **Threshold Comparison**
   - Contract compares encrypted score with threshold (default: 650)
   - Returns approval/rejection

5. **Privacy Preserved**
   - Raw data never decrypted
   - Wallet metrics encrypted before submission
   - Only the approval decision is revealed

## 🔬 FHE Implementation Details

### Real FHE Encryption (Production-Ready)

Our implementation uses **real Fully Homomorphic Encryption**, not mocks or simulations:

#### Client-Side Encryption
- All credit data (income, repayment rate, loan history, wallet metrics) is encrypted using `@zama-fhe/relayer-sdk` before submission
- Encryption happens in the browser using the FHEVM instance with SepoliaConfig
- Dynamic imports prevent SSR issues in Next.js production builds
- Wallet analysis automatically fetches on-chain metrics (transaction count, balance, age)

#### Smart Contract Operations
```solidity
// Import from @fhevm/solidity
import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";

// Convert external encrypted inputs to internal format
euint32 income = FHE.fromExternal(_encryptedIncome, inputProof);
euint32 repaymentRate = FHE.fromExternal(_encryptedRepaymentRate, inputProof);
euint32 loanHistory = FHE.fromExternal(_encryptedLoanHistory, inputProof);

// All operations happen on encrypted data (euint32)
euint32 incomeWeighted = FHE.mul(income, FHE.asEuint32(3));
euint32 repaymentWeighted = FHE.mul(repaymentRate, FHE.asEuint32(4));
euint32 historyWeighted = FHE.mul(loanHistory, FHE.asEuint32(3));

euint32 calculatedScore = FHE.add(
    FHE.add(incomeWeighted, repaymentWeighted),
    historyWeighted
);

// Comparison also on encrypted data
ebool isEligible = FHE.ge(calculatedScore, minScoreThreshold);
```

#### Zero Knowledge
- Neither the smart contract nor any third party can see the raw financial data
- All computation happens on encrypted values
- Only encrypted results are stored on-chain

### Local Development Setup

The `@fhevm/hardhat-plugin` enables real FHE operations locally:

```bash
# Install the plugin
pnpm add -D @fhevm/hardhat-plugin @fhevm/solidity

# hardhat.config.js
require("@fhevm/hardhat-plugin");
```

- **Chain ID**: 31337 (Hardhat default)
- **Real FHE**: Uses actual FHEVM operations, not mocks
- **Full Workflow**: Complete end-to-end testing with encryption

### Gateway Integration (Future Work)

For decrypting comparison results in production:

```solidity
// TODO: Integrate with Zama Gateway for decryption
// Gateway.requestDecryption(isEligible, this.callback.selector);
```

**Current Status**:
- ✅ Real FHE encryption and computation implemented
- ✅ Works locally with `@fhevm/hardhat-plugin`
- ⏳ Gateway integration pending (requires testnet/mainnet deployment)

### Why This Implementation?

1. **Production-Grade FHE**: Uses real FHEVM library, not simulations
2. **Meaningful Encryption**: All sensitive data encrypted from client to contract
3. **Verifiable Privacy**: On-chain computations preserve confidentiality
4. **Future-Proof**: Ready for Gateway integration when infrastructure is available

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10.20.0+
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (get from [Sepolia faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/watarus/private-credit-score.git
cd private-credit-score

# Install pnpm (if not already installed)
npm install -g pnpm@10.20.0

# Install dependencies
pnpm install
```

### Environment Setup

Create a `.env` file in the project root:

```bash
# Frontend configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0xa57722b5e5cA2AC8AbF58fc6ef7f1CC5962346db
NEXT_PUBLIC_CHAIN_ID=11155111

# Deployment configuration (optional, for redeployment)
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
```

### Start Development Server

```bash
# Start Next.js development server
pnpm dev

# Or use build mode
pnpm build
pnpm start
```

Visit `http://localhost:3000` to use the application.

### Smart Contract Deployment

The contract is already deployed on Sepolia testnet. If you want to redeploy:

```bash
# 1. Update .env with your private key and RPC URL
# 2. Get Sepolia ETH from faucet
# 3. Deploy with Hardhat
npx hardhat run scripts/deploy.js --network sepolia

# 4. Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env
```

## 📁 Project Structure

```
private-credit-score/
├── contracts/
│   └── PrivateCreditScore.sol    # Main FHE contract
├── scripts/
│   └── deploy.ts                 # Deployment script
├── app/
│   ├── page.tsx                  # Main page with wallet connection
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── Header.tsx                # Header with wallet connect
│   ├── CreditScoreForm.tsx       # Credit data submission form
│   └── StatusCard.tsx            # Loan status display
├── utils/
│   ├── contract.ts               # FHEVM SDK integration
│   ├── walletAnalyzer.ts         # On-chain wallet metrics
│   └── logger.ts                 # Browser logging
├── hardhat.config.ts             # Hardhat + FHEVM config
├── next.config.mjs               # Next.js configuration
├── deployment.json               # Deployment info
└── package.json                  # Dependencies
```

## 🔧 Smart Contract API

### Core Functions

```solidity
// Submit encrypted credit data (6 encrypted values + proof)
function submitCreditData(
    bytes32 _encryptedIncome,          // externalEuint32
    bytes32 _encryptedRepaymentRate,   // externalEuint32
    bytes32 _encryptedLoanHistory,     // externalEuint32
    bytes32 _encryptedTransactionCount, // externalEuint32
    bytes32 _encryptedWalletBalance,   // externalEuint32
    bytes32 _encryptedWalletAge,       // externalEuint32
    bytes calldata inputProof
) public

// Evaluate loan eligibility
function evaluateLoan() public

// Get loan approval status
function getLoanStatus() public view returns (bool approved)

// Check if credit data exists
function hasCreditData() public view returns (bool exists)

// Get credit data timestamp
function getCreditDataTimestamp() public view returns (uint256)
```

### Events

```solidity
event CreditDataSubmitted(address indexed user, uint256 timestamp);
event LoanApproved(address indexed user, uint256 timestamp);
event LoanRejected(address indexed user, uint256 timestamp);
event ThresholdUpdated(uint256 timestamp);
```

## 🎯 Use Cases

1. **DeFi Lending Platforms**
   - Integrate private credit scoring for loan approval
   - Adjust interest rates based on encrypted creditworthiness

2. **Undercollateralized Loans**
   - Enable reputation-based lending without KYC
   - Maintain borrower privacy

3. **Credit Passport NFTs**
   - Tokenize encrypted credit history
   - Portable reputation across platforms

4. **Insurance Underwriting**
   - Private risk assessment
   - Fair pricing without data exposure

## 🛠️ Development

### Running Tests

```bash
pnpm test
```

### Building for Production

```bash
# Type check
pnpm run type-check

# Build Next.js app
pnpm build

# Start production server
pnpm start
```

### Linting

```bash
pnpm lint
```

## 🌐 Deployment

### Current Deployment

The application is currently deployed on:
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Contract**: `0xa57722b5e5cA2AC8AbF58fc6ef7f1CC5962346db`
- **Frontend**: [https://private-credit-score.vercel.app](https://private-credit-score.vercel.app)

### Deploy Your Own

1. **Fork the repository**

2. **Deploy to Vercel**:
   - Connect your GitHub repo to Vercel
   - Set environment variables:
     ```
     NEXT_PUBLIC_CONTRACT_ADDRESS=0xa57722b5e5cA2AC8AbF58fc6ef7f1CC5962346db
     NEXT_PUBLIC_CHAIN_ID=11155111
     ```
   - Deploy!

3. **(Optional) Deploy your own contract**:
   ```bash
   # Configure .env with your wallet
   PRIVATE_KEY=your_private_key
   SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io

   # Deploy to Sepolia
   npx hardhat run scripts/deploy.ts --network sepolia

   # Update Vercel environment variable with new address
   ```

## 🔒 Security Considerations

- ✅ All sensitive data encrypted with FHE
- ✅ No trusted setup required
- ✅ Transparent scoring logic
- ⚠️ Contract should be audited before production use
- ⚠️ Consider implementing access controls for threshold updates
- ⚠️ Add reentrancy guards for production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🚀 Vercel Deployment

This project is optimized for Vercel deployment with automatic GitHub integration.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/watarus/private-credit-score&project-name=private-credit-score&repository-name=private-credit-score&env=NEXT_PUBLIC_CONTRACT_ADDRESS,NEXT_PUBLIC_CHAIN_ID)

**Environment Variables Required**:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: `0xa57722b5e5cA2AC8AbF58fc6ef7f1CC5962346db`
- `NEXT_PUBLIC_CHAIN_ID`: `11155111` (Sepolia)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama** for pioneering FHE technology and FHEVM
- The **@fhevm/solidity** and **@zama-fhe/relayer-sdk** libraries
- Inspiration from traditional credit scoring systems

## 📚 Resources

- [Zama Documentation](https://docs.zama.ai/)
- [FHEVM GitHub](https://github.com/zama-ai/fhevm)
- [Relayer SDK](https://www.npmjs.com/package/@zama-fhe/relayer-sdk)
- [@fhevm/solidity](https://www.npmjs.com/package/@fhevm/solidity)
- [Sepolia Testnet](https://sepolia.etherscan.io/)
- [Zama Discord](https://discord.com/invite/zama)

## 📞 Contact

- GitHub: [@watarus](https://github.com/watarus)
- Project Link: [https://github.com/watarus/private-credit-score](https://github.com/watarus/private-credit-score)

---

**Built with ❤️ using Zama's FHEVM**

*Empowering financial privacy, one encrypted computation at a time.*

