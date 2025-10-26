"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import CreditScoreForm from "@/components/CreditScoreForm";
import StatusCard from "@/components/StatusCard";
import Header from "@/components/Header";
import { logger } from "@/utils/logger";

// Force dynamic rendering to avoid SSR issues with browser-only SDK
export const dynamic = 'force-dynamic';

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Wait for MetaMask to be fully initialized
          // MetaMask emits 'ethereum#initialized' event when ready
          if (window.ethereum.isMetaMask) {
            // If already initialized, create provider immediately
            const web3Provider = new ethers.BrowserProvider(window.ethereum as any);
            setProvider(web3Provider);
          } else {
            // Wait for initialization
            await new Promise(resolve => setTimeout(resolve, 500));
            if (window.ethereum && typeof window.ethereum.request === 'function') {
              const web3Provider = new ethers.BrowserProvider(window.ethereum as any);
              setProvider(web3Provider);
            } else {
              logger.warn("window.ethereum exists but is not a valid provider");
            }
          }
        } catch (error: any) {
          logger.error("Error initializing provider:", error?.message || error);
        }
      }
    };
    initProvider();
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      setLoading(true);

      // Check current network
      const network = await provider.getNetwork();
      const expectedChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111");
      const targetChainId = `0x${expectedChainId.toString(16)}`;

      // If not on expected network, switch to it
      if (network.chainId !== BigInt(expectedChainId)) {
        logger.info(`Current network: ${network.chainId}, expected: ${expectedChainId}`);
        try {
          // Try to switch to the expected network
          logger.info("Attempting to switch network...");
          await provider.send("wallet_switchEthereumChain", [
            { chainId: targetChainId },
          ]);
          logger.info("Network switched successfully");
        } catch (switchError: any) {
          logger.error({
            code: switchError.code,
            message: switchError.message,
            data: switchError.data,
            errorCode: switchError.error?.code,
            errorData: switchError.error?.data,
            originalErrorCode: switchError.error?.data?.originalError?.code
          }, "Switch error");

          // Check for error code 4902 (chain not added)
          // It can be nested in different ways depending on the wallet
          const errorCode =
            switchError.code ||
            switchError.error?.code ||
            switchError.data?.originalError?.code ||
            switchError.error?.data?.originalError?.code;

          const originalErrorCode =
            switchError.data?.originalError?.code ||
            switchError.error?.data?.originalError?.code;

          const is4902 = errorCode === 4902 || originalErrorCode === 4902;

          logger.info({ errorCode, originalErrorCode, is4902 }, "Error code check");

          if (is4902) {
            logger.info("Network not found, attempting to add...");
            try {
              await provider.send("wallet_addEthereumChain", [
                {
                  chainId: targetChainId,
                  chainName: "Sepolia Testnet",
                  nativeCurrency: {
                    name: "Sepolia ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://eth-sepolia.public.blastapi.io"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ]);
              logger.info("Network added successfully");
              // Network is automatically switched after adding
            } catch (addError: any) {
              logger.error({ error: addError?.message || String(addError) }, "Error adding network");
              if (addError.code === 4001) {
                // User rejected the request
                alert(`You need to add Sepolia network to use this app.`);
              } else {
                alert(`Failed to add Sepolia network to MetaMask. Please add it manually.`);
              }
              setLoading(false);
              return;
            }
          } else if (errorCode === 4001 || switchError.data?.originalError?.code === 4001) {
            // User rejected the request
            logger.info("User rejected network switch");
            alert(`Please accept the network switch to Sepolia to continue.`);
            setLoading(false);
            return;
          } else {
            logger.error({ error: switchError }, "Unknown error switching network");
            alert(`Please switch to Sepolia network in MetaMask manually.`);
            setLoading(false);
            return;
          }
        }

        // Wait a bit for the network switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Reinitialize provider after network switch
      const newProvider = new ethers.BrowserProvider(window.ethereum as any);
      setProvider(newProvider);

      // Connect wallet
      const accounts = await newProvider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      const web3Signer = await newProvider.getSigner();
      setSigner(web3Signer);
    } catch (error: any) {
      logger.error("Error connecting wallet:", error?.message || String(error));
      alert("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header 
        account={account}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        loading={loading}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Private Credit Score
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Prove your creditworthiness without revealing your financial history.
            Built with Zama's FHEVM for complete privacy.
          </p>
        </div>

        {!account ? (
          <div className="max-w-md mx-auto glass-effect rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-white/70 mb-6">
              Connect your wallet to submit encrypted credit data and get evaluated for loans.
            </p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <CreditScoreForm 
              signer={signer}
              account={account}
            />
            <StatusCard 
              signer={signer}
              account={account}
            />
          </div>
        )}

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Fully Private
              </h3>
              <p className="text-white/70 text-sm">
                Your financial data stays encrypted on-chain. Nobody can see your details.
              </p>
            </div>
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Instant Evaluation
              </h3>
              <p className="text-white/70 text-sm">
                Credit scores are calculated instantly using encrypted computation.
              </p>
            </div>
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Transparent Logic
              </h3>
              <p className="text-white/70 text-sm">
                Smart contract logic is public and verifiable on-chain.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-white/60">
        <p>Built with ❤️ using Zama's FHEVM</p>
      </footer>
    </div>
  );
}

