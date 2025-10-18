const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Private Credit Score contract...");

  // Default minimum score threshold (can be adjusted)
  const MIN_SCORE_THRESHOLD = 650;

  const PrivateCreditScore = await hre.ethers.getContractFactory("PrivateCreditScore");
  const creditScore = await PrivateCreditScore.deploy(MIN_SCORE_THRESHOLD);

  await creditScore.waitForDeployment();

  const contractAddress = await creditScore.getAddress();
  console.log("✅ PrivateCreditScore deployed to:", contractAddress);
  console.log("📊 Minimum Score Threshold:", MIN_SCORE_THRESHOLD);
  console.log("");
  console.log("📝 Next steps:");
  console.log("1. Update NEXT_PUBLIC_CONTRACT_ADDRESS in frontend/.env.local");
  console.log("2. Run: cd frontend && npm run dev");
  console.log("");
  console.log("Contract Address:", contractAddress);

  // Save deployment info
  const fs = require("fs");
  const network = await hre.ethers.provider.getNetwork();
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    chainId: Number(network.chainId),
    minScoreThreshold: MIN_SCORE_THRESHOLD,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

