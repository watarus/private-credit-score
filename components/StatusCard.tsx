"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContractInstance } from "@/utils/contract";

interface StatusCardProps {
  signer: ethers.Signer | null;
  account: string | null;
}

export default function StatusCard({ signer, account }: StatusCardProps) {
  const [hasCreditData, setHasCreditData] = useState(false);
  const [loanStatus, setLoanStatus] = useState<boolean | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const checkStatus = async () => {
    if (!signer) return;

    try {
      const contract = getContractInstance(signer);
      
      // Check if user has submitted credit data
      const hasData = await contract.hasCreditData();
      setHasCreditData(hasData);

      // Check loan approval status
      const status = await contract.getLoanStatus();
      setLoanStatus(status);
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  useEffect(() => {
    if (signer && account) {
      checkStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer, account]);

  const evaluateLoan = async () => {
    if (!signer) return;

    try {
      setEvaluating(true);
      const contract = getContractInstance(signer);
      
      const tx = await contract.evaluateLoan();
      await tx.wait();

      // Refresh status
      await checkStatus();
      
      alert("Loan evaluation complete! Check your status above.");
    } catch (error: any) {
      console.error("Error evaluating loan:", error);
      if (error.message.includes("No credit data submitted")) {
        alert("Please submit your credit data first!");
      } else {
        alert("Failed to evaluate loan. Please try again.");
      }
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Your Status
      </h2>

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 font-medium">Credit Data Status</span>
            {hasCreditData ? (
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                ✓ Submitted
              </span>
            ) : (
              <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold">
                Not Submitted
              </span>
            )}
          </div>
          <p className="text-white/60 text-sm">
            {hasCreditData 
              ? "Your encrypted credit data is stored on-chain"
              : "Submit your credit data to get started"
            }
          </p>
        </div>

        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 font-medium">Loan Approval</span>
            {loanStatus === null ? (
              <span className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-sm font-semibold">
                Not Evaluated
              </span>
            ) : loanStatus ? (
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                ✓ Approved
              </span>
            ) : (
              <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-semibold">
                ✗ Not Approved
              </span>
            )}
          </div>
          <p className="text-white/60 text-sm">
            {loanStatus === null 
              ? "Submit data and click 'Evaluate' to get approved"
              : loanStatus
                ? "Congratulations! You're eligible for a loan"
                : "Your credit score didn't meet the threshold"
            }
          </p>
        </div>

        {hasCreditData && (
          <button
            onClick={evaluateLoan}
            disabled={evaluating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {evaluating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Evaluating...
              </span>
            ) : (
              "Evaluate My Loan Application"
            )}
          </button>
        )}

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
          <h3 className="text-white font-semibold mb-2">How It Works</h3>
          <ol className="text-sm text-white/70 space-y-1 list-decimal list-inside">
            <li>Submit your encrypted financial data</li>
            <li>Smart contract calculates your score (encrypted)</li>
            <li>Click "Evaluate" to check eligibility</li>
            <li>Get instant approval decision</li>
          </ol>
        </div>

        <button
          onClick={checkStatus}
          className="w-full bg-white/10 text-white border border-white/20 py-2 px-4 rounded-lg hover:bg-white/20 transition-colors text-sm"
        >
          🔄 Refresh Status
        </button>
      </div>
    </div>
  );
}

