"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContractInstance } from "@/utils/contract";
import { logger } from "@/utils/logger";
import { analyzeWallet, WalletMetrics } from "@/utils/walletAnalyzer";

interface CreditScoreFormProps {
  signer: ethers.Signer | null;
  account: string | null;
}

export default function CreditScoreForm({ signer, account }: CreditScoreFormProps) {
  const [income, setIncome] = useState("");
  const [repaymentRate, setRepaymentRate] = useState("");
  const [loanHistory, setLoanHistory] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [walletMetrics, setWalletMetrics] = useState<WalletMetrics | null>(null);
  const [analyzingWallet, setAnalyzingWallet] = useState(false);
  const [walletAnalysisError, setWalletAnalysisError] = useState<string | null>(null);

  // Analyze wallet when account changes
  useEffect(() => {
    async function loadWalletMetrics() {
      if (!account || !signer) return;

      setAnalyzingWallet(true);

      try {
        logger.info(`Loading wallet metrics for: ${account}`);
        setWalletAnalysisError(null);

        const provider = signer.provider;
        if (!provider) {
          const error = "No provider available";
          logger.warn(error);
          setWalletAnalysisError(error);
          // Use demo metrics instead of zeros
          setWalletMetrics({
            transactionCount: 50,
            balance: "0.1",
            walletAge: 90,
            transactionCountScore: 35,
            balanceScore: 10,
            ageScore: 25,
          });
          setAnalyzingWallet(false);
          return;
        }

        const metrics = await analyzeWallet(account, provider);
        setWalletMetrics(metrics);
        setWalletAnalysisError(null);
        logger.info({ metrics }, "Wallet metrics loaded");
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        logger.error({ error: errorMsg }, "Failed to load wallet metrics");
        setWalletAnalysisError(errorMsg);

        // Use demo metrics instead of zeros to allow testing
        setWalletMetrics({
          transactionCount: 50,
          balance: "0.1",
          walletAge: 90,
          transactionCountScore: 35,
          balanceScore: 10,
          ageScore: 25,
        });
      } finally {
        setAnalyzingWallet(false);
      }
    }

    loadWalletMetrics();
  }, [account, signer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signer || !account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!income || !repaymentRate || !loanHistory) {
      alert("Please fill in all fields");
      return;
    }

    if (!walletMetrics) {
      alert(`Please wait for wallet analysis to complete.\n\nDebug info:\n- analyzingWallet: ${analyzingWallet}\n- walletMetrics: ${walletMetrics}\n- account: ${account}\n- signer: ${signer ? 'exists' : 'null'}`);
      return;
    }

    try {
      setLoading(true);
      setSuccess(false);

      const contract = getContractInstance(signer);
      const provider = signer.provider;

      if (!provider) {
        throw new Error("Provider not available");
      }

      const parsedIncome = parseInt(income, 10);
      const parsedRepayment = parseInt(repaymentRate, 10);
      const parsedHistory = parseInt(loanHistory, 10);

      logger.info({ parsedIncome, parsedRepayment, parsedHistory }, "Parsed credit values");
      logger.info({ walletMetrics }, "Wallet metrics");

      // Import encryption functions
      const { encryptCreditInputs } = await import("@/utils/contract");
      const contractAddress = await contract.getAddress();

      logger.info(`Contract address: ${contractAddress}`);
      logger.info(`Account: ${account}`);
      logger.info(`Provider: ${provider ? "exists" : "null"}`);

      // Encrypt all values including wallet metrics
      logger.info("Encrypting credit data with FHE...");

      const { handles, inputProof } = await encryptCreditInputs(
        [
          parsedIncome,
          parsedRepayment,
          parsedHistory,
          walletMetrics.transactionCountScore,
          walletMetrics.balanceScore,
          walletMetrics.ageScore,
        ],
        account,
        contractAddress,
        provider
      );

      logger.info({ count: handles.length }, "Encryption completed. Handles");

      if (handles.length < 6) {
        throw new Error("Encryption output incomplete");
      }

      logger.info("Submitting to blockchain...");

      // Submit encrypted data to smart contract
      const tx = await contract.submitCreditData(
        handles[0], // income
        handles[1], // repaymentRate
        handles[2], // loanHistory
        handles[3], // transactionCount
        handles[4], // walletBalance
        handles[5], // walletAge
        inputProof
      );

      logger.info("Waiting for confirmation...");
      await tx.wait();

      setSuccess(true);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const isLocal = chainId === 31337;

      alert(`✅ Credit data submitted successfully!\n\nYour data was encrypted with FHE and submitted to the blockchain. Nobody can see your raw data!${isLocal ? '\n\n(Running on local Hardhat network with real FHE encryption)' : ''}`);

    } catch (error: any) {
      logger.error({ error: error?.message || String(error) }, "Error submitting credit data");
      
      // Provide more specific error messages
      let errorMessage = "Failed to submit credit data. ";
      
      if (error.message?.includes("user rejected")) {
        errorMessage += "Transaction was rejected.";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage += "Insufficient funds for gas.";
      } else if (error.message?.includes("FHEVM")) {
        errorMessage += "FHE encryption failed. Make sure you're connected to Zama network.";
      } else {
        errorMessage += "Please try again.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Submit Credit Data
      </h2>

      {/* Wallet Metrics Display */}
      {analyzingWallet && (
        <div className="mb-6 bg-blue-500/20 border border-blue-500/50 text-white rounded-lg p-4">
          <p className="text-sm">🔍 Analyzing your wallet...</p>
        </div>
      )}

      {walletMetrics && !analyzingWallet && (
        <div className="mb-6 bg-white/5 border border-white/20 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">📊 Your Wallet Metrics {walletAnalysisError && "(Demo Data)"}</h3>
          {walletAnalysisError && (
            <div className="mb-3 bg-yellow-500/20 border border-yellow-500/50 rounded p-2">
              <p className="text-xs text-yellow-200">⚠️ Could not fetch real data: {walletAnalysisError}. Using demo values for testing.</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/60">Transactions</p>
              <p className="text-white font-medium">{walletMetrics.transactionCount} txs (Score: {walletMetrics.transactionCountScore}/100)</p>
            </div>
            <div>
              <p className="text-white/60">Balance</p>
              <p className="text-white font-medium">{parseFloat(walletMetrics.balance).toFixed(4)} ETH (Score: {walletMetrics.balanceScore}/100)</p>
            </div>
            <div>
              <p className="text-white/60">Wallet Age</p>
              <p className="text-white font-medium">~{walletMetrics.walletAge} days (Score: {walletMetrics.ageScore}/100)</p>
            </div>
            <div>
              <p className="text-white/60">On-chain Score</p>
              <p className="text-white font-medium">{Math.round((walletMetrics.transactionCountScore + walletMetrics.balanceScore + walletMetrics.ageScore) / 3)}/100</p>
            </div>
          </div>
          <p className="text-xs text-white/60 mt-3">
            ✨ These metrics are {walletAnalysisError ? "demo values that will be" : "automatically calculated from your wallet's on-chain history and will be"} included (encrypted) in your credit evaluation.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white mb-2 font-medium">
            Monthly Income Level (1-100)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="e.g., 75"
          />
          <p className="text-xs text-white/60 mt-1">
            Higher values indicate higher income
          </p>
        </div>

        <div>
          <label className="block text-white mb-2 font-medium">
            Repayment Rate (0-100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={repaymentRate}
            onChange={(e) => setRepaymentRate(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="e.g., 95"
          />
          <p className="text-xs text-white/60 mt-1">
            Percentage of loans repaid on time
          </p>
        </div>

        <div>
          <label className="block text-white mb-2 font-medium">
            Loan History Score (0-100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={loanHistory}
            onChange={(e) => setLoanHistory(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="e.g., 80"
          />
          <p className="text-xs text-white/60 mt-1">
            Quality and length of credit history
          </p>
        </div>

        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <p className="text-sm text-white/80">
            🔒 <strong>Privacy Note:</strong> All data (traditional credit info + wallet metrics) will be encrypted using FHE before submission.
            The smart contract calculates your score on encrypted data without ever seeing your actual values.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || analyzingWallet}
          className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzingWallet ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Wallet...
            </span>
          ) : loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Encrypting & Submitting...
            </span>
          ) : (
            "Submit Encrypted Data"
          )}
        </button>

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-white rounded-lg p-4">
            ✅ Credit data submitted successfully!
          </div>
        )}
      </form>
    </div>
  );
}
