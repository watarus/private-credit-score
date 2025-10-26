import { ethers } from "ethers";
import { initSDK, createInstance, SepoliaConfig, type FhevmInstance } from "@zama-fhe/relayer-sdk/web";
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

type FhevmRuntimeConfig = {
  chainId: number;
};

let fhevmRuntimeConfig: FhevmRuntimeConfig | null = null;

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
  try {
    logger.info("Initializing FHEVM SDK...");
    await initSDK();

    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    logger.info(`Network chain ID: ${chainId}`);

    if (chainId === 11155111) {
      // Sepolia - use built-in SepoliaConfig
      logger.info("Using Sepolia FHEVM configuration");

      fhevmRuntimeConfig = {
        chainId,
      };

      // Use window.ethereum directly for FHEVM SDK
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask or compatible wallet not found");
      }

      // Use SepoliaConfig preset with window.ethereum as network provider
      const config = {
        ...SepoliaConfig,
        network: window.ethereum,
      };

      logger.info("Creating FHEVM instance for Sepolia with SepoliaConfig");
      logger.info({ config }, "Config details");
      fhevmInstance = await createInstance(config);
      logger.info("FHEVM instance created successfully");
    } else {
      // For other networks, manual configuration required
      throw new Error(`Unsupported network chainId: ${chainId}. Only Sepolia (11155111) is currently supported.`);
    }

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
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  if (
    fhevmRuntimeConfig &&
    fhevmRuntimeConfig.chainId !== chainId
  ) {
    logger.info(
      {
        previousChainId: fhevmRuntimeConfig.chainId,
        newChainId: chainId,
      },
      "Chain changed. Reinitializing FHEVM instance"
    );
    fhevmInstance = null;
  }

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

    logger.info(
      {
        chainId: fhevmRuntimeConfig?.chainId,
      },
      "Encrypting inputs with new SDK..."
    );

    // New SDK: encrypt() returns Promise
    const { handles, inputProof } = await encryptedInput.encrypt();

    logger.info("Encryption completed successfully");
    logger.info(`Handles: ${handles.length}`);
    logger.info(`InputProof length: ${inputProof.length}`);

    return {
      handles: handles.map((handle: Uint8Array) => ethers.hexlify(handle)),
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
