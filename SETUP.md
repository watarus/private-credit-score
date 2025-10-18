# 🚀 Setup Guide - Private Credit Score

Complete step-by-step guide to get Private Credit Score running locally and deployed.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn**: Package manager
- **Git**: Version control
- **MetaMask**: Browser wallet extension ([Install](https://metamask.io/))

Check your installations:
```bash
node --version  # Should be v18+
npm --version
git --version
```

## 🔧 Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/watarus/private-credit-score.git
cd private-credit-score
```

### Step 2: Install Dependencies

```bash
# Install root dependencies (Hardhat, contracts)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy from example
cp .env.example .env
```

Edit `.env` and add:

```env
# For local development, you can use a test private key
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Zama testnet RPC (for deployment)
ZAMA_RPC_URL=https://devnet.zama.ai/
```

⚠️ **Security Warning**: Never commit your real private key! The key above is from Hardhat's default accounts for local testing only.

### Step 4: Compile Smart Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### Step 5: Run Local Blockchain (Optional)

For local testing, run a Hardhat node:

```bash
# Terminal 1: Start local node
npm run node
```

This will:
- Start a local Ethereum node
- Give you 20 test accounts with 10,000 ETH each
- Keep running until you stop it (Ctrl+C)

### Step 6: Deploy Smart Contract

#### Option A: Deploy to Local Network

```bash
# Terminal 2 (keep Terminal 1 running)
npm run deploy --network localhost
```

#### Option B: Deploy to Zama Testnet

First, get testnet tokens:
1. Visit [Zama Faucet](https://faucet.zama.ai/)
2. Enter your wallet address
3. Request tokens

Then deploy:
```bash
npm run deploy --network zama
```

Expected output:
```
🚀 Deploying Private Credit Score contract...
✅ PrivateCreditScore deployed to: 0x1234...5678
📊 Minimum Score Threshold: 650
```

**Save the contract address!** You'll need it for the frontend.

### Step 7: Configure Frontend

Create `frontend/.env.local`:

```bash
cd frontend
cat > .env.local << EOF
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
NEXT_PUBLIC_CHAIN_ID=8009
EOF
```

Replace `0xYourContractAddressHere` with your deployed contract address.

### Step 8: Start Frontend Development Server

```bash
# From frontend directory
npm run dev
```

Or from root:
```bash
npm run dev:frontend
```

The app will open at: **http://localhost:3000**

### Step 9: Configure MetaMask

1. Open MetaMask
2. Add Zama Testnet (if using testnet):
   - Network Name: `Zama Devnet`
   - RPC URL: `https://devnet.zama.ai/`
   - Chain ID: `8009`
   - Currency Symbol: `ZAMA`
   - Block Explorer: `https://explorer.zama.ai/`

3. Import test account (for local development):
   - Use one of the private keys from Hardhat node output

### Step 10: Test the Application

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Fill in credit data:
   - Income: 75
   - Repayment Rate: 95
   - Loan History: 80
5. Click "Submit Encrypted Data"
6. Wait for transaction confirmation
7. Click "Evaluate My Loan Application"
8. Check your approval status!

## 🧪 Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npx hardhat coverage

# Run specific test file
npx hardhat test test/PrivateCreditScore.test.js
```

## 🌐 Production Deployment

### Deploy Smart Contract to Zama Mainnet

⚠️ **Note**: Zama mainnet is not yet live. Use testnet for now.

1. Get mainnet tokens
2. Update `.env` with your **secure** private key
3. Deploy:
   ```bash
   npm run deploy --network zama
   ```

### Deploy Frontend

#### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_CHAIN_ID`
5. Deploy!

#### Option B: Netlify

1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `frontend/.next` folder to Netlify

#### Option C: Traditional Hosting

```bash
cd frontend
npm run build
npm run start  # Runs production server on port 3000
```

Use PM2 or similar for process management:
```bash
npm install -g pm2
pm2 start npm --name "credit-score" -- start
```

## 🔍 Troubleshooting

### Common Issues

#### Issue: "Cannot find module 'fhevm'"

**Solution**:
```bash
npm install
# or
npm install fhevm fhevm-core-contracts
```

#### Issue: "Error: could not detect network"

**Solution**:
- Check your `.env` file has correct RPC URL
- Verify network is running
- For local: Ensure `npm run node` is running

#### Issue: MetaMask "Error: Invalid Chain ID"

**Solution**:
- Add Zama network to MetaMask (see Step 9)
- Switch to correct network in MetaMask

#### Issue: Transaction fails with "No credit data submitted"

**Solution**:
- First call `submitCreditData()`
- Wait for transaction confirmation
- Then call `evaluateLoan()`

#### Issue: "Transaction reverted: Only owner can call this function"

**Solution**:
- You're trying to call an owner-only function
- Use the account that deployed the contract

### Frontend Issues

#### Issue: "Module not found" errors

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "Cannot connect to wallet"

**Solution**:
- Ensure MetaMask is installed
- Refresh the page
- Check browser console for errors
- Try incognito mode to rule out extensions

### Smart Contract Issues

#### Issue: Gas estimation fails

**Solution**:
- Check you have sufficient testnet tokens
- Verify contract is deployed
- Try increasing gas limit manually

## 📊 Project Structure

```
private-credit-score/
├── contracts/
│   └── PrivateCreditScore.sol    # Main smart contract
├── scripts/
│   └── deploy.js                 # Deployment script
├── test/
│   └── PrivateCreditScore.test.js # Tests
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Main page
│   │   ├── layout.tsx            # Layout
│   │   └── globals.css           # Styles
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── CreditScoreForm.tsx
│   │   └── StatusCard.tsx
│   └── utils/
│       └── contract.ts           # Contract utilities
├── hardhat.config.js             # Hardhat config
├── package.json                  # Dependencies
├── .env                          # Environment variables (create this)
└── README.md                     # Documentation
```

## 🔗 Useful Commands

```bash
# Smart Contract Commands
npm run compile          # Compile contracts
npm run test            # Run tests
npm run node            # Start local node
npm run deploy          # Deploy to localhost
npm run deploy --network zama  # Deploy to Zama

# Frontend Commands
cd frontend
npm run dev             # Development server
npm run build           # Production build
npm run start           # Production server
npm run lint            # Run linter

# Utilities
npx hardhat clean       # Clean artifacts
npx hardhat console     # Interactive console
npx hardhat accounts    # List test accounts
```

## 📚 Next Steps

After setup:

1. **Read the docs**: Check [README.md](README.md) for full documentation
2. **Review contract**: Understand `contracts/PrivateCreditScore.sol`
3. **Customize UI**: Modify components in `frontend/components/`
4. **Add features**: Implement new scoring models
5. **Deploy**: Push to production when ready

## 🆘 Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/watarus/private-credit-score/issues)
- **Zama Discord**: [Join community](https://discord.com/invite/zama)
- **Documentation**: [Zama Docs](https://docs.zama.ai/)

## ✅ Setup Checklist

- [ ] Node.js v18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (root + frontend)
- [ ] `.env` file created
- [ ] Contracts compiled successfully
- [ ] Contract deployed (local or testnet)
- [ ] `frontend/.env.local` configured
- [ ] Frontend running on localhost:3000
- [ ] MetaMask configured with correct network
- [ ] Test transaction successful

---

**Congratulations! 🎉** You now have Private Credit Score running locally.

Need help? Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or open an issue!

**Happy Building!** 🚀

