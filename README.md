# 🔐 Private Credit Score

> **Privacy-preserving credit scoring system built with Zama's FHEVM**

Prove your creditworthiness without revealing your financial history. Built with Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM) for complete privacy and transparent lending logic.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-orange.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black.svg)

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
│   Frontend      │  Next.js + fhevmjs
│   (React/TS)    │  - Encrypt user inputs
└────────┬────────┘  - Submit to blockchain
         │
         ▼
┌─────────────────┐
│   Smart         │  Solidity + TFHE
│   Contract      │  - Receive encrypted data
│   (FHEVM)       │  - Compute on encrypted data
└────────┬────────┘  - Return approval/rejection
         │
         ▼
┌─────────────────┐
│   Blockchain    │  Zama Devnet
│   (Encrypted)   │  - Store encrypted state
└─────────────────┘  - Maintain privacy
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
- All credit data (income, repayment rate, loan history) is encrypted using `fhevmjs` before submission
- Encryption happens in the browser using the FHEVM instance
- Uses `@fhevm/hardhat-plugin` for local development with actual FHE operations

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
- MetaMask or compatible Web3 wallet
- Zama testnet tokens (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/watarus/private-credit-score.git
cd private-credit-score

# Install pnpm (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install
cd frontend && pnpm install && cd ..
# Or simply: pnpm install (installs all workspaces)
```

### Smart Contract Setup

```bash
# Compile contracts
pnpm compile

# Run tests
pnpm test

# Deploy to local network
pnpm node  # In one terminal
pnpm deploy  # In another terminal

# Deploy to localhost (recommended for development)
pnpm deploy --network localhost

# Deploy to Sepolia testnet (when FHEVM is available)
# 1. Get Sepolia ETH from faucet
# 2. Update .env with SEPOLIA_RPC_URL and PRIVATE_KEY
# pnpm deploy --network sepolia
```

### Frontend Setup

```bash
cd frontend

# Create .env.local file
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS" > .env.local
echo "NEXT_PUBLIC_CHAIN_ID=8009" >> .env.local

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to use the application.

## 📁 Project Structure

```
private-credit-score/
├── contracts/
│   └── PrivateCreditScore.sol    # Main FHE contract
├── scripts/
│   └── deploy.js                 # Deployment script
├── test/
│   └── PrivateCreditScore.test.js # Contract tests
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Main page
│   │   ├── layout.tsx            # Layout wrapper
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── Header.tsx            # Header component
│   │   ├── CreditScoreForm.tsx   # Data submission form
│   │   └── StatusCard.tsx        # Status display
│   └── utils/
│       └── contract.ts           # Contract interaction
├── hardhat.config.js             # Hardhat configuration
└── package.json                  # Project dependencies
```

## 🔧 Smart Contract API

### Core Functions

```solidity
// Submit encrypted credit data
function submitCreditData(
    einput _encryptedIncome,
    einput _encryptedRepaymentRate,
    einput _encryptedLoanHistory,
    bytes calldata inputProof
) public

// Evaluate loan eligibility
function evaluateLoan() public

// Get loan approval status
function getLoanStatus() public view returns (bool approved)

// Check if credit data exists
function hasCreditData() public view returns (bool exists)

// Get encrypted score (user only)
function getMyEncryptedScore() public view returns (euint32)
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
# Build contracts
pnpm compile

# Build frontend
cd frontend
pnpm build
```

### Linting

```bash
# Frontend linting
cd frontend
pnpm lint
```

## 🌐 Deployment

### Local Development Deployment

**Note**: Zama does not have a dedicated network. FHEVM runs on existing chains like Ethereum.

1. Start local Hardhat node:
   ```bash
   pnpm node
   ```
2. Deploy to localhost:
   ```bash
   pnpm deploy --network localhost
   ```
3. Update `frontend/.env.local` with deployed contract address:
   ```bash
   cd frontend
   echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3" > .env.local
   echo "NEXT_PUBLIC_CHAIN_ID=1337" >> .env.local
   ```
4. Deploy frontend to Vercel

See [NETWORK_INFO.md](NETWORK_INFO.md) for detailed network information./Netlify

### Mainnet Considerations

⚠️ **Important**: FHEVM is currently in development. For mainnet deployment:
- Wait for Zama's mainnet launch
- Complete security audits
- Implement proper key management
- Add rate limiting and gas optimization

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

This project is optimized for Vercel deployment. See [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) for complete deployment guide.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/watarus/private-credit-score&project-name=private-credit-score&repository-name=private-credit-score&root-directory=frontend&env=NEXT_PUBLIC_CONTRACT_ADDRESS,NEXT_PUBLIC_CHAIN_ID)

**Environment Variables Required**:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your deployed contract address
- `NEXT_PUBLIC_CHAIN_ID`: `8009` (Zama Devnet)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama** for pioneering FHE technology and FHEVM
- The **fhevm** and **fhevm-core-contracts** libraries
- Inspiration from traditional credit scoring systems

## 📚 Resources

- [Zama Documentation](https://docs.zama.ai/)
- [FHEVM GitHub](https://github.com/zama-ai/fhevm)
- [fhevmjs SDK](https://github.com/zama-ai/fhevmjs)
- [Zama Discord](https://discord.com/invite/zama)

## 📞 Contact

- GitHub: [@watarus](https://github.com/watarus)
- Project Link: [https://github.com/watarus/private-credit-score](https://github.com/watarus/private-credit-score)

---

**Built with ❤️ using Zama's FHEVM**

*Empowering financial privacy, one encrypted computation at a time.*

