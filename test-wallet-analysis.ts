import { ethers } from "ethers";

async function testWalletAnalysis() {
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
  
  // Test address (Vitalik's address)
  const testAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
  
  console.log("Testing wallet analysis for:", testAddress);
  
  try {
    const txCount = await provider.getTransactionCount(testAddress);
    console.log("Transaction count:", txCount);
    
    const balance = await provider.getBalance(testAddress);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    
    const blockNumber = await provider.getBlockNumber();
    console.log("Current block:", blockNumber);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testWalletAnalysis();
