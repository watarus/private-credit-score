// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivateCreditScore
 * @notice Privacy-preserving credit scoring system using Zama's FHEVM
 * @dev Users can prove creditworthiness without revealing financial data
 */
contract PrivateCreditScore is SepoliaConfig {
    // Encrypted threshold for minimum acceptable score
    euint32 private minScoreThreshold;
    
    // Owner address
    address public owner;
    
    // Struct to hold encrypted user credit data
    struct EncryptedCreditData {
        euint32 income;                 // Encrypted income level
        euint32 repaymentRate;          // Encrypted repayment ratio (0-100)
        euint32 loanHistory;            // Encrypted loan history score
        euint32 transactionCount;       // Encrypted transaction count (normalized)
        euint32 walletBalance;          // Encrypted wallet balance (normalized)
        euint32 walletAge;              // Encrypted wallet age in days (normalized)
        euint32 calculatedScore;        // Encrypted final score
        bool exists;
        uint256 timestamp;
    }
    
    // Mapping from user address to their encrypted credit data
    mapping(address => EncryptedCreditData) private userCreditData;
    
    // Mapping to track approved loans
    mapping(address => bool) public approvedLoans;
    
    // Events
    event CreditDataSubmitted(address indexed user, uint256 timestamp);
    event LoanApproved(address indexed user, uint256 timestamp);
    event LoanRejected(address indexed user, uint256 timestamp);
    event ThresholdUpdated(uint256 timestamp);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(uint32 _minScoreThreshold) {
        owner = msg.sender;
        minScoreThreshold = FHE.asEuint32(_minScoreThreshold);
        FHE.allowThis(minScoreThreshold);
    }
    
    /**
     * @notice Submit encrypted credit data for scoring
     * @param _encryptedIncome Encrypted income level (0-100)
     * @param _encryptedRepaymentRate Encrypted repayment rate (0-100)
     * @param _encryptedLoanHistory Encrypted loan history score (0-100)
     * @param _encryptedTransactionCount Encrypted transaction count (normalized 0-100)
     * @param _encryptedWalletBalance Encrypted wallet balance (normalized 0-100)
     * @param _encryptedWalletAge Encrypted wallet age (normalized 0-100)
     */
    function submitCreditData(
        externalEuint32 _encryptedIncome,
        externalEuint32 _encryptedRepaymentRate,
        externalEuint32 _encryptedLoanHistory,
        externalEuint32 _encryptedTransactionCount,
        externalEuint32 _encryptedWalletBalance,
        externalEuint32 _encryptedWalletAge,
        bytes calldata inputProof
    ) public {
        // Convert external encrypted inputs to euint32
        euint32 income = FHE.fromExternal(_encryptedIncome, inputProof);
        euint32 repaymentRate = FHE.fromExternal(_encryptedRepaymentRate, inputProof);
        euint32 loanHistory = FHE.fromExternal(_encryptedLoanHistory, inputProof);
        euint32 transactionCount = FHE.fromExternal(_encryptedTransactionCount, inputProof);
        euint32 walletBalance = FHE.fromExternal(_encryptedWalletBalance, inputProof);
        euint32 walletAge = FHE.fromExternal(_encryptedWalletAge, inputProof);

        // Calculate weighted credit score (all operations on encrypted data)
        // Traditional credit factors (weight: 10)
        // - Income: 3
        // - Repayment rate: 4
        // - Loan history: 3
        // Wallet/On-chain factors (weight: 10)
        // - Transaction count: 2
        // - Wallet balance: 4
        // - Wallet age: 4
        // Total possible score: 2000 (20 factors * 100 max each)

        euint32 incomeWeighted = FHE.mul(income, FHE.asEuint32(3));
        euint32 repaymentWeighted = FHE.mul(repaymentRate, FHE.asEuint32(4));
        euint32 historyWeighted = FHE.mul(loanHistory, FHE.asEuint32(3));
        euint32 txCountWeighted = FHE.mul(transactionCount, FHE.asEuint32(2));
        euint32 balanceWeighted = FHE.mul(walletBalance, FHE.asEuint32(4));
        euint32 ageWeighted = FHE.mul(walletAge, FHE.asEuint32(4));

        // Sum all components
        euint32 traditionalScore = FHE.add(
            FHE.add(incomeWeighted, repaymentWeighted),
            historyWeighted
        );
        euint32 walletScore = FHE.add(
            FHE.add(txCountWeighted, balanceWeighted),
            ageWeighted
        );
        euint32 calculatedScore = FHE.add(traditionalScore, walletScore);

        // Store encrypted credit data
        userCreditData[msg.sender] = EncryptedCreditData({
            income: income,
            repaymentRate: repaymentRate,
            loanHistory: loanHistory,
            transactionCount: transactionCount,
            walletBalance: walletBalance,
            walletAge: walletAge,
            calculatedScore: calculatedScore,
            exists: true,
            timestamp: block.timestamp
        });

        // Allow this contract and user to access the encrypted data
        FHE.allowThis(income);
        FHE.allowThis(repaymentRate);
        FHE.allowThis(loanHistory);
        FHE.allowThis(transactionCount);
        FHE.allowThis(walletBalance);
        FHE.allowThis(walletAge);
        FHE.allowThis(calculatedScore);

        FHE.allow(income, msg.sender);
        FHE.allow(repaymentRate, msg.sender);
        FHE.allow(loanHistory, msg.sender);
        FHE.allow(transactionCount, msg.sender);
        FHE.allow(walletBalance, msg.sender);
        FHE.allow(walletAge, msg.sender);
        FHE.allow(calculatedScore, msg.sender);

        emit CreditDataSubmitted(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Evaluate credit score and approve/reject loan application
     * @dev Performs comparison on encrypted data
     * @dev Note: This is a simplified version. Production would use Gateway for decryption.
     */
    function evaluateLoan() public {
        require(userCreditData[msg.sender].exists, "No credit data submitted");

        EncryptedCreditData storage userData = userCreditData[msg.sender];

        // Compare encrypted score with threshold
        ebool isEligible = FHE.ge(userData.calculatedScore, minScoreThreshold);
        FHE.allowThis(isEligible);

        // TODO: Integrate with Gateway callbacks to obtain decrypted result
        // The Gateway will call back with the decrypted result
        // For now, this demonstration omits Gateway integration
        // In production, you would:
        // 1. Request decryption from Gateway
        // 2. Gateway decrypts using its private key
        // 3. Gateway calls back with the boolean result
        // 4. Update approvedLoans based on that result

        // Placeholder: mark as rejected until Gateway integration
        bool approved = false;
        approvedLoans[msg.sender] = approved;

        // Note: In production, emit events in the Gateway callback
        emit LoanRejected(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Get loan approval status
     * @return approved Whether the loan is approved
     */
    function getLoanStatus() public view returns (bool approved) {
        return approvedLoans[msg.sender];
    }
    
    /**
     * @notice Check if user has submitted credit data
     * @return exists Whether credit data exists for the user
     */
    function hasCreditData() public view returns (bool exists) {
        return userCreditData[msg.sender].exists;
    }
    
    /**
     * @notice Get encrypted credit score (only accessible by the user)
     * @return score Encrypted credit score
     */
    function getMyEncryptedScore() public view returns (euint32) {
        require(userCreditData[msg.sender].exists, "No credit data submitted");
        return userCreditData[msg.sender].calculatedScore;
    }
    
    /**
     * @notice Update minimum score threshold (owner only)
     * @param _newThreshold New minimum score threshold
     */
    function updateThreshold(uint32 _newThreshold) public onlyOwner {
        minScoreThreshold = FHE.asEuint32(_newThreshold);
        FHE.allowThis(minScoreThreshold);
        emit ThresholdUpdated(block.timestamp);
    }

    /**
     * @notice Get timestamp of when credit data was submitted
     * @return timestamp Unix timestamp
     */
    function getCreditDataTimestamp() public view returns (uint256) {
        require(userCreditData[msg.sender].exists, "No credit data submitted");
        return userCreditData[msg.sender].timestamp;
    }
}
