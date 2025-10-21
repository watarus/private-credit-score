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
          // Wait a bit for extensions to fully load
          await new Promise(resolve => setTimeout(resolve, 100));
          const web3Provider = new ethers.BrowserProvider(window.ethereum as any);
          setProvider(web3Provider);
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
        try {
          // Try to switch to the expected network
          await provider.send("wallet_switchEthereumChain", [
            { chainId: targetChainId },
          ]);
        } catch (switchError: any) {
          logger.error("Error switching network:", switchError?.message || String(switchError));
          alert(`Please switch to Sepolia network in MetaMask`);
          setLoading(false);
          return;
        }
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

