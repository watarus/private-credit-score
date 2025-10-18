# 🤝 Contributing to Private Credit Score

Thank you for your interest in contributing to Private Credit Score! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Git
- Familiarity with Solidity, React, and TypeScript
- Understanding of FHE concepts (recommended)

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/private-credit-score.git
   cd private-credit-score
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/watarus/private-credit-score.git
   ```
4. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   ```

## 💻 Development Process

### Branch Naming

Use descriptive branch names:
- `feature/add-oracle-integration`
- `fix/gas-optimization`
- `docs/update-readme`
- `refactor/contract-structure`

### Commit Messages

Follow conventional commits:
```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(contract): add multi-signature threshold updates

fix(frontend): resolve wallet connection issue on mobile

docs(readme): add troubleshooting section
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update from upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**:
   ```bash
   npm run test
   cd frontend && npm run lint
   ```

3. **Build successfully**:
   ```bash
   npm run compile
   cd frontend && npm run build
   ```

### Submitting PR

1. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```

2. Open PR on GitHub with:
   - Clear title describing the change
   - Description explaining what and why
   - Link to related issue (if applicable)
   - Screenshots for UI changes

3. PR template:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   How was this tested?
   
   ## Screenshots (if applicable)
   Add screenshots here
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-reviewed code
   - [ ] Commented complex logic
   - [ ] Updated documentation
   - [ ] Added tests
   - [ ] Tests pass locally
   ```

### Review Process

- Maintainers will review within 48 hours
- Address feedback and push updates
- Once approved, maintainer will merge

## 📝 Coding Standards

### Solidity (Smart Contracts)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ContractName
 * @notice Brief description
 * @dev Detailed technical notes
 */
contract ContractName {
    // 1. State variables (grouped by visibility)
    // 2. Events
    // 3. Modifiers
    // 4. Constructor
    // 5. External functions
    // 6. Public functions
    // 7. Internal functions
    // 8. Private functions
    
    // Use descriptive names
    uint256 private _minScoreThreshold;
    
    // Document all functions
    /**
     * @notice Calculate credit score
     * @param income User income level
     * @return score Calculated credit score
     */
    function calculateScore(euint32 income) public returns (euint32 score) {
        // Implementation
    }
}
```

**Style Guide**:
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments for all public functions
- Prefix private variables with underscore
- Use explicit visibility modifiers

### TypeScript/React (Frontend)

```typescript
// Use TypeScript for type safety
interface CreditData {
  income: number;
  repaymentRate: number;
  loanHistory: number;
}

// Use functional components with hooks
export default function Component({ prop }: ComponentProps) {
  const [state, setState] = useState<Type>(initialValue);
  
  // Group related logic
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Early returns for readability
  if (!condition) {
    return <Loading />;
  }
  
  return (
    <div className="descriptive-class">
      {/* JSX */}
    </div>
  );
}
```

**Style Guide**:
- Use TypeScript strict mode
- Functional components over class components
- Hooks for state management
- Descriptive prop names
- Extract reusable logic into custom hooks

### JavaScript (Scripts)

```javascript
// Use async/await over promises
async function deploy() {
  const Contract = await ethers.getContractFactory("ContractName");
  const contract = await Contract.deploy();
  await contract.deployed();
  
  console.log("Contract deployed to:", contract.address);
}

// Handle errors properly
try {
  await deploy();
} catch (error) {
  console.error("Deployment failed:", error);
  process.exit(1);
}
```

## 🧪 Testing Guidelines

### Smart Contract Tests

```javascript
describe("PrivateCreditScore", function () {
  let contract, owner, user;
  
  beforeEach(async function () {
    // Setup for each test
    [owner, user] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("PrivateCreditScore");
    contract = await Contract.deploy(650);
  });
  
  describe("Feature Name", function () {
    it("should do expected behavior", async function () {
      // Arrange
      const input = 100;
      
      // Act
      const result = await contract.someFunction(input);
      
      // Assert
      expect(result).to.equal(expectedValue);
    });
    
    it("should revert on invalid input", async function () {
      await expect(
        contract.someFunction(invalidInput)
      ).to.be.revertedWith("Expected error message");
    });
  });
});
```

### Test Coverage

Aim for:
- **Smart Contracts**: 90%+ coverage
- **Frontend**: 70%+ coverage for utilities
- Test happy paths and edge cases
- Test error handling
- Test security-critical functions thoroughly

### Running Tests

```bash
# All tests
npm run test

# With coverage
npx hardhat coverage

# Specific file
npx hardhat test test/PrivateCreditScore.test.js

# Frontend tests
cd frontend
npm run test
```

## 📚 Documentation

### Code Documentation

- Document all public functions
- Explain complex algorithms
- Add TODO comments for future improvements
- Keep comments up-to-date with code

### README Updates

When adding features, update:
- Feature list
- Usage examples
- API documentation
- Configuration options

### CHANGELOG

Add entry to CHANGELOG.md:
```markdown
## [Unreleased]

### Added
- New feature description

### Changed
- Modified behavior description

### Fixed
- Bug fix description
```

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Verify it's reproducible
3. Test on latest version

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 13.0]
- Node: [e.g., v18.17.0]
- Browser: [e.g., Chrome 120]
- Network: [e.g., Zama testnet]

## Screenshots
Add screenshots if applicable

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem it Solves
What problem does this address?

## Proposed Solution
How should it work?

## Alternatives Considered
What other solutions did you consider?

## Additional Context
Any other relevant information
```

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📞 Getting Help

- **Questions**: Open a GitHub Discussion
- **Chat**: Join our Discord
- **Bugs**: Open an Issue
- **Email**: [maintainer email]

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Private Credit Score!** 🎉

Your contributions help build a more private and accessible financial future.

