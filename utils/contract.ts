import { ethers } from "ethers";
import { initFhevm, createInstance, FhevmInstance } from "fhevmjs";
import { logger } from "./logger";

// Contract ABI (minimal version for demo)
// Note: externalEuint32 is an alias for bytes32 in the ABI
const CONTRACT_ABI = [
  "function submitCreditData(bytes32 _encryptedIncome, bytes32 _encryptedRepaymentRate, bytes32 _encryptedLoanHistory, bytes32 _encryptedTransactionCount, bytes32 _encryptedWalletBalance, bytes32 _encryptedWalletAge, bytes calldata inputProof) public",
  "function evaluateLoan() public",
  "function getLoanStatus() public view returns (bool approved)",
  "function hasCreditData() public view returns (bool exists)",
  "function getCreditDataTimestamp() public view returns (uint256)",
  "event CreditDataSubmitted(address indexed user, uint256 timestamp)",
  "event LoanApproved(address indexed user, uint256 timestamp)",
  "event LoanRejected(address indexed user, uint256 timestamp)",
];

// Contract address (should be set after deployment)
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x0000000000000000000000000000000000000000";

// FHEVM instance cache
let fhevmInstance: FhevmInstance | null = null;

export function getContractInstance(
  signerOrProvider: ethers.Signer | ethers.Provider
) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

export function getContractAddress() {
  return CONTRACT_ADDRESS;
}

/**
 * Initialize FHEVM instance
 */
export async function initializeFhevm(
  provider: ethers.Provider
): Promise<FhevmInstance> {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  try {
    logger.info("Initializing FHEVM...");
    await initFhevm();

    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    logger.info(`Network chain ID: ${chainId}`);

    // Use appropriate RPC URL based on chain ID
    let networkUrl: string;
    if (chainId === 11155111) {
      // Sepolia - use public RPC
      networkUrl = "https://ethereum-sepolia-rpc.publicnode.com";
    } else if (chainId === 31337) {
      // Localhost
      networkUrl = "http://localhost:8545";
    } else {
      networkUrl = (provider as ethers.JsonRpcProvider)._getConnection?.()?.url || "http://localhost:8545";
    }
    logger.info(`Network URL: ${networkUrl}`);

    const config: any = {
      chainId,
      networkUrl,
    };

    // For Sepolia, use Zama's coprocessor testnet configuration
    if (chainId === 11155111) {
      config.aclContractAddress = "0x687820221192C5B662b25367F70076A37bc79b6c";
      config.kmsContractAddress = "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC";
      config.relayerUrl = "https://relayer.testnet.zama.cloud";
      config.gatewayUrl = "https://gateway.sepolia.zama.ai/";
      logger.info("Using Sepolia FHEVM coprocessor configuration");
      logger.info({
        aclContractAddress: config.aclContractAddress,
        kmsContractAddress: config.kmsContractAddress,
        relayerUrl: config.relayerUrl,
        gatewayUrl: config.gatewayUrl,
      }, "Sepolia config");
    }

    // Add gateway URL if available (for production networks)
    if (process.env.NEXT_PUBLIC_GATEWAY_URL) {
      config.gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
      logger.info(`Gateway URL configured (overridden): ${config.gatewayUrl}`);
    }

    logger.info({ config }, "Creating FHEVM instance with config");
    fhevmInstance = await createInstance(config);
    logger.info("FHEVM instance created successfully");

    return fhevmInstance;
  } catch (error: any) {
    logger.error({ error }, "Failed to initialize FHEVM");
    logger.error(`Error details: ${error?.message || error}`);
    throw new Error(`FHEVM initialization failed: ${error?.message || error}`);
  }
}

/**
 * Get or create FHEVM instance
 */
export async function getFhevmInstance(
  provider: ethers.Provider
): Promise<FhevmInstance> {
  if (!fhevmInstance) {
    return initializeFhevm(provider);
  }
  return fhevmInstance;
}

type EncryptResult = {
  handles: string[];
  inputProof: string;
};

/**
 * Encrypt a list of uint32 values for a given account/contract pair.
 */
export async function encryptCreditInputs(
  values: number[],
  account: string,
  contractAddress: string,
  provider: ethers.Provider
): Promise<EncryptResult> {
  try {
    logger.info({ values, account, contractAddress }, "encryptCreditInputs called with");

    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    logger.info({ chainId, name: network.name }, "Network detected");

    // Use real FHE encryption for all supported networks
    logger.info("Initializing FHEVM instance for encryption...");
    const instance = await getFhevmInstance(provider);

    logger.info("Creating encrypted input...");
    const encryptedInput = instance.createEncryptedInput(
      contractAddress,
      account
    );

    logger.info("Adding values to encrypted input...");
    values.forEach((value, index) => {
      logger.info(`Encrypting value ${index}: ${value}`);
      encryptedInput.add32(value);
    });

    logger.info("Encrypting inputs...");
    const { handles, inputProof } = encryptedInput.encrypt();

    logger.info("Encryption completed successfully");
    logger.info(`Handles: ${handles.length}`);
    logger.info(`InputProof length: ${inputProof.length}`);

    return {
      handles: handles.map((handle) => ethers.hexlify(handle)),
      inputProof: ethers.hexlify(inputProof),
    };
  } catch (error: any) {
    logger.error("Encryption failed:");
    logger.error(error);
    logger.error(`Error message: ${error?.message}`);
    logger.error(`Error stack: ${error?.stack}`);
    throw new Error(`Failed to encrypt values: ${error?.message || JSON.stringify(error)}`);
  }
}
