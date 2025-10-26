"use client";

import { ethers } from "ethers";
import { logger } from "./logger";

export interface WalletMetrics {
  transactionCount: number;
  balance: string; // in ETH
  walletAge: number; // in days
  // Normalized scores (0-100)
  transactionCountScore: number;
  balanceScore: number;
  ageScore: number;
}

/**
 * Analyze wallet on-chain data and calculate normalized scores
 */
export async function analyzeWallet(
  address: string,
  provider: ethers.Provider
): Promise<WalletMetrics> {
  try {
    logger.info(`Analyzing wallet: ${address}`);

    // Get transaction count
    const txCount = await provider.getTransactionCount(address);
    logger.info(`Transaction count: ${txCount}`);

    // Get wallet balance
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    logger.info(`Balance: ${balanceInEth} ETH`);

    // Get wallet age by checking the first transaction
    // Note: This is an approximation - we check recent blocks
    const walletAge = await estimateWalletAge(address, provider);
    logger.info(`Estimated wallet age: ${walletAge} days`);

    // Calculate normalized scores (0-100)
    const transactionCountScore = normalizeTxCount(txCount);
    const balanceScore = normalizeBalance(parseFloat(balanceInEth));
    const ageScore = normalizeAge(walletAge);

    logger.info({
      transactionCountScore,
      balanceScore,
      ageScore,
    }, "Normalized scores");

    return {
      transactionCount: txCount,
      balance: balanceInEth,
      walletAge,
      transactionCountScore,
      balanceScore,
      ageScore,
    };
  } catch (error: any) {
    logger.error({ error }, "Error analyzing wallet");
    throw new Error(`Failed to analyze wallet: ${error.message}`);
  }
}

/**
 * Estimate wallet age by finding the first transaction
 * For simplicity, we approximate based on transaction count
 */
async function estimateWalletAge(
  address: string,
  provider: ethers.Provider
): Promise<number> {
  try {
    // Try to find an old transaction
    // This is a simplified approach - in production, you'd use an indexer
    const txCount = await provider.getTransactionCount(address);

    if (txCount === 0) {
      return 0; // Brand new wallet
    }

    // Estimate: assume wallet is older if it has more transactions
    // Very rough heuristic: 1 transaction per day on average
    // Cap at 365 days for normalization purposes
    const estimatedDays = Math.min(txCount, 365);

    return estimatedDays;
  } catch (error) {
    logger.warn({ error }, "Could not estimate wallet age, using default");
    return 30; // Default to 30 days if we can't determine
  }
}

/**
 * Normalize transaction count to 0-100 scale
 * 0 txs = 0, 1000+ txs = 100
 */
function normalizeTxCount(count: number): number {
  // Logarithmic scale works better for transaction counts
  if (count === 0) return 0;
  if (count >= 1000) return 100;

  // Log scale: score = 100 * log(count + 1) / log(1001)
  const score = Math.floor((100 * Math.log(count + 1)) / Math.log(1001));
  return Math.min(100, Math.max(0, score));
}

/**
 * Normalize balance to 0-100 scale
 * 0 ETH = 0, 10+ ETH = 100
 */
function normalizeBalance(balanceInEth: number): number {
  if (balanceInEth <= 0) return 0;
  if (balanceInEth >= 10) return 100;

  // Linear scale: 0-10 ETH maps to 0-100
  const score = Math.floor((balanceInEth / 10) * 100);
  return Math.min(100, Math.max(0, score));
}

/**
 * Normalize wallet age to 0-100 scale
 * 0 days = 0, 365+ days = 100
 */
function normalizeAge(days: number): number {
  if (days <= 0) return 0;
  if (days >= 365) return 100;

  // Linear scale: 0-365 days maps to 0-100
  const score = Math.floor((days / 365) * 100);
  return Math.min(100, Math.max(0, score));
}
