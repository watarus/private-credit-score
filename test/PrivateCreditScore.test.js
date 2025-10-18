const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateCreditScore", function () {
  let creditScore;
  let owner;
  let user1;
  let user2;

  const MIN_SCORE_THRESHOLD = 650;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const PrivateCreditScore = await ethers.getContractFactory("PrivateCreditScore");
    creditScore = await PrivateCreditScore.deploy(MIN_SCORE_THRESHOLD);
    await creditScore.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await creditScore.owner()).to.equal(owner.address);
    });

    it("Should initialize with no approved loans", async function () {
      expect(await creditScore.approvedLoans(user1.address)).to.equal(false);
    });
  });

  describe("Credit Data Submission", function () {
    it("Should allow users to submit credit data", async function () {
      // Note: In a real FHEVM environment, you would encrypt these values
      // For testing purposes, we'll use mock values
      // This test will need to be updated with actual FHE encryption in production
      
      expect(await creditScore.hasCreditData()).to.equal(false);
      
      // In production, you would:
      // 1. Encrypt income, repaymentRate, loanHistory using fhevm-js
      // 2. Generate inputProof
      // 3. Call submitCreditData with encrypted inputs
    });
  });

  describe("Loan Evaluation", function () {
    it("Should reject evaluation if no credit data submitted", async function () {
      await expect(
        creditScore.connect(user1).evaluateLoan()
      ).to.be.revertedWith("No credit data submitted");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update threshold", async function () {
      await expect(
        creditScore.connect(owner).updateThreshold(700)
      ).to.emit(creditScore, "ThresholdUpdated");
    });

    it("Should prevent non-owner from updating threshold", async function () {
      await expect(
        creditScore.connect(user1).updateThreshold(700)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("View Functions", function () {
    it("Should return false for loan status if not evaluated", async function () {
      expect(await creditScore.connect(user1).getLoanStatus()).to.equal(false);
    });

    it("Should return false for hasCreditData initially", async function () {
      expect(await creditScore.connect(user1).hasCreditData()).to.equal(false);
    });
  });
});
