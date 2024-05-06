---
layout: default
title: 04-2024-asymmetry-afCVX
description: Rysk MM vaults Report
nav_order: 50
image: assets/images/logo.png
---
# yAudit asymmetry Review <!-- omit in toc -->

**Review Resources:**

 [code repository](https://github.com/asymmetryfinance/afCVX/)

**Auditors:**

- Spalen
- Panda

## Table of Contents <!-- omit in toc -->
{: .no_toc }

1. TOC
- [Review Summary](#review-summary)
- [Scope](#scope)
- [Code Evaluation Matrix](#code-evaluation-matrix)
- [Findings Explanation](#findings-explanation)
- [Critical Findings](#critical-findings)
  - [1. Critical - `requestUnlock()` doesn't take into consideration the amount of unlocking already requested](#1-critical---requestunlock-doesnt-take-into-consideration-the-amount-of-unlocking-already-requested)
    - [Technical Details](#technical-details)
    - [Impact](#impact)
    - [Recommendation](#recommendation)
    - [Developer Response](#developer-response)
  - [2. Critical - `totalValue()` reverts, breaking the protocol when unlockObligations grow](#2-critical---totalvalue-reverts-breaking-the-protocol-when-unlockobligations-grow)
    - [Technical Details](#technical-details-1)
    - [Impact](#impact-1)
    - [Recommendation](#recommendation-1)
    - [Developer Response](#developer-response-1)
- [Medium Findings](#medium-findings)
  - [1. Medium - `setOperator` and `setProtocolFeeCollector` can't be used to update the address](#1-medium---setoperator-and-setprotocolfeecollector-cant-be-used-to-update-the-address)
    - [Technical Details](#technical-details-2)
    - [Impact](#impact-2)
    - [Recommendation](#recommendation-2)
    - [Developer Response](#developer-response-2)
  - [2. Medium - `maxRequestUnlock()`doesn't take into consideration pending unlocks](#2-medium---maxrequestunlockdoesnt-take-into-consideration-pending-unlocks)
    - [Technical Details](#technical-details-3)
    - [Impact](#impact-3)
    - [Recommendation](#recommendation-3)
    - [Developer Response](#developer-response-3)
  - [3. Medium - `totalValue()` returns overestimated value](#3-medium---totalvalue-returns-overestimated-value)
    - [Technical Details](#technical-details-4)
    - [Impact](#impact-4)
    - [Recommendation](#recommendation-4)
    - [Developer Response](#developer-response-4)
- [Low Findings](#low-findings)
  - [1. Low - Contracts can receive ETH but do not implement any function for withdrawal](#1-low---contracts-can-receive-eth-but-do-not-implement-any-function-for-withdrawal)
    - [Technical Details](#technical-details-5)
    - [Impact](#impact-5)
    - [Recommendation](#recommendation-5)
    - [Developer Response](#developer-response-5)
  - [2. Low - `maxWithdraw()` should take into consideration the amount of CVX available to withdraw in the Convex reward pool](#2-low---maxwithdraw-should-take-into-consideration-the-amount-of-cvx-available-to-withdraw-in-the-convex-reward-pool)
    - [Technical Details](#technical-details-6)
    - [Impact](#impact-6)
    - [Recommendation](#recommendation-6)
    - [Developer Response](#developer-response-6)
  - [3. Low - Return 0 for max deposit and max withdraw values when paused](#3-low---return-0-for-max-deposit-and-max-withdraw-values-when-paused)
    - [Technical Details](#technical-details-7)
    - [Impact](#impact-7)
    - [Recommendation](#recommendation-7)
    - [Developer Response](#developer-response-7)
  - [4. Low - Instant share value increase can be sandwiched if the instant withdrawal fee is lower than the profit](#4-low---instant-share-value-increase-can-be-sandwiched-if-the-instant-withdrawal-fee-is-lower-than-the-profit)
    - [Technical Details](#technical-details-8)
    - [Impact](#impact-8)
    - [Recommendation](#recommendation-8)
    - [Developer Response](#developer-response-8)
- [Gas Saving Findings](#gas-saving-findings)
  - [1. Gas - Cache array length outside of the loop](#1-gas---cache-array-length-outside-of-the-loop)
    - [Technical Details](#technical-details-9)
    - [Impact](#impact-9)
    - [Recommendation](#recommendation-9)
    - [Developer Response](#developer-response-9)
  - [2. Gas - Split `deposit()` into two function](#2-gas---split-deposit-into-two-function)
    - [Technical Details](#technical-details-10)
    - [Impact](#impact-10)
    - [Recommendation](#recommendation-10)
    - [Developer Response](#developer-response-10)
  - [3. Gas - Remove double-checks](#3-gas---remove-double-checks)
    - [Technical Details](#technical-details-11)
    - [Impact](#impact-11)
    - [Recommendation](#recommendation-11)
    - [Developer Response](#developer-response-11)
  - [4. Gas - Unnecessary variable creation](#4-gas---unnecessary-variable-creation)
    - [Technical Details](#technical-details-12)
    - [Impact](#impact-12)
    - [Recommendation](#recommendation-12)
    - [Developer Response](#developer-response-12)
  - [5. Gas - Calculate variable only if needed](#5-gas---calculate-variable-only-if-needed)
    - [Technical Details](#technical-details-13)
    - [Impact](#impact-13)
    - [Recommendation](#recommendation-13)
    - [Developer Response](#developer-response-13)
  - [6. Gas - PirexMigrator multiRedeem should group redemption and deposits together](#6-gas---pirexmigrator-multiredeem-should-group-redemption-and-deposits-together)
    - [Technical Details](#technical-details-14)
    - [Impact](#impact-14)
    - [Recommendation](#recommendation-14)
    - [Developer Response](#developer-response-14)
  - [7. Gas - Skip claiming extra rewards from `CVX_REWARDS_POOL`](#7-gas---skip-claiming-extra-rewards-from-cvx_rewards_pool)
    - [Technical Details](#technical-details-15)
    - [Impact](#impact-15)
    - [Recommendation](#recommendation-15)
    - [Developer Response](#developer-response-15)
- [Informational Findings](#informational-findings)
  - [1. Informational - Recommended array length check](#1-informational---recommended-array-length-check)
    - [Technical Details](#technical-details-16)
    - [Impact](#impact-16)
    - [Recommendation](#recommendation-16)
    - [Developer Response](#developer-response-16)
  - [2. Informational - Prefer using Ownable2Step or Ownable2StepUpgradeable instead of Ownable](#2-informational---prefer-using-ownable2step-or-ownable2stepupgradeable-instead-of-ownable)
    - [Technical Details](#technical-details-17)
    - [Impact](#impact-17)
    - [Recommendation](#recommendation-17)
    - [Developer Response](#developer-response-17)
  - [3. Informational - `TODO` left in the code](#3-informational---todo-left-in-the-code)
    - [Technical Details](#technical-details-18)
    - [Impact](#impact-18)
    - [Recommendation](#recommendation-18)
    - [Developer Response](#developer-response-18)
  - [4. Informational - `public` functions not called by the contract should be declared `external` instead](#4-informational---public-functions-not-called-by-the-contract-should-be-declared-external-instead)
    - [Technical Details](#technical-details-19)
    - [Impact](#impact-19)
    - [Recommendation](#recommendation-19)
    - [Developer Response](#developer-response-19)
  - [5. Informational - Refactor duplicated require()/revert() checks into a modifier or function](#5-informational---refactor-duplicated-requirerevert-checks-into-a-modifier-or-function)
    - [Technical Details](#technical-details-20)
    - [Impact](#impact-20)
    - [Recommendation](#recommendation-20)
    - [Developer Response](#developer-response-20)
  - [6. Informational - Unnecessary integer variable initialization](#6-informational---unnecessary-integer-variable-initialization)
    - [Technical Details](#technical-details-21)
    - [Impact](#impact-21)
    - [Recommendation](#recommendation-21)
    - [Developer Response](#developer-response-21)
  - [7. Informational - Misleading modifier name](#7-informational---misleading-modifier-name)
    - [Technical Details](#technical-details-22)
    - [Impact](#impact-22)
    - [Recommendation](#recommendation-22)
    - [Developer Response](#developer-response-22)
  - [8. Informational - PirexMigrator prevents the receiver from being the PirexMigrator contract](#8-informational---pirexmigrator-prevents-the-receiver-from-being-the-pirexmigrator-contract)
    - [Technical Details](#technical-details-23)
    - [Impact](#impact-23)
    - [Recommendation](#recommendation-23)
    - [Developer Response](#developer-response-23)
  - [9. Informational - Use `memory` instead of `storage`](#9-informational---use-memory-instead-of-storage)
    - [Technical Details](#technical-details-24)
    - [Impact](#impact-24)
    - [Recommendation](#recommendation-24)
    - [Developer Response](#developer-response-24)
  - [10. Informational - The price of AfCVX can be manipulated atomically](#10-informational---the-price-of-afcvx-can-be-manipulated-atomically)
    - [Technical Details](#technical-details-25)
    - [Impact](#impact-25)
    - [Recommendation](#recommendation-25)
    - [Developer Response](#developer-response-25)
  - [11. Informational - Upgrade dependencies](#11-informational---upgrade-dependencies)
    - [Technical Details](#technical-details-26)
    - [Impact](#impact-26)
    - [Recommendation](#recommendation-26)
    - [Developer Response](#developer-response-26)
- [Final remarks](#final-remarks)


## Review Summary

**Asymmetry**

Asymmetry provides a vault built on top of Convex staker and ClevCVX contracts. The vault allows users to deposit CVX and earn more yield by depositing funds to CLever and Convex. The CVX gets locked for a higher yield, meaning they must wait some time before withdrawing CVX. The protocol handles this by using withdraw queues in the strategy contract.

![flows](../../assets/images/asymmetry-afCVX/flows.png)
The contracts of the Asymmetry [Repo](https://github.com/asymmetryfinance/) were reviewed over four days. Two auditors performed the code review between April 22nd and April 25th, 2024. The repository was under active development during the review, but the review was limited to the latest commit at the start. This was commit [57cb6d5162a526bce6b34209a13c0bcfd36f86cb](https://github.com/asymmetryfinance/afCVX/tree/57cb6d5162a526bce6b34209a13c0bcfd36f86cb) for the asymmetry repo.

## Scope

The scope of the review consisted of the following contracts at the specific commit:

- AfCvx.sol
- PirexMigrator.sol

After the findings were presented to the asymmetry team, fixes were made and included in several PRs.

This review is a code review to identify potential vulnerabilities in the code. The reviewers did not investigate security practices or operational security and assumed that privileged accounts could be trusted. The reviewers did not evaluate the security of the code relative to a standard or specification. The review may not have identified all potential attack vectors or areas of vulnerability.

yAudit and the auditors make no warranties regarding the security of the code and do not warrant that the code is free from defects. yAudit and the auditors do not represent nor imply to third parties that the code has been audited nor that the code is free from defects. By deploying or using the code, asymmetry, and users of the contracts agree to use the code at their own risk.


## Code Evaluation Matrix

| Category                 | Mark    | Description                                                                                                   |
|--------------------------|---------|---------------------------------------------------------------------------------------------------------------|
| Access Control           | Good    | Proper use of access control mechanics like `onlyOwner` and `onlyOperator` are present across the system.     |
| Mathematics              | Low     | Mathematical operations lead to critical issues like overflows and underflows, impacting the system's stability.|
| Complexity               | Average | The system demonstrates moderate complexity, which could lead to human management errors.      |
| Libraries                | Good    | Use of well-tested libraries and interfaces, contributing to the system's robustness.                         |
| Decentralization         | Low     | Centralized control mechanisms could threaten the system's trustlessness and potential censorship. Only the operator can initiate user withdrawals.       |
| Code stability           | Good    | The codebase appears to be stable, with no signs of incomplete implementations or significant changes needed. |
| Documentation            | Good    | Documentation is thorough and covers the majority of functionalities and their use cases.             |
| Monitoring               | Average | There's a moderate level of monitoring. Enhancements could improve response times to emerging issues.         |
| Testing and verification | Low     | Testing is present, but critical failures suggest a need for more comprehensive testing strategies. It is suggested that fuzzing and more integration tests be added.   |

## Findings Explanation

Findings are broken down into sections by their respective impact:

- Critical, High, Medium, Low Impact
  - These findings range from attacks that may cause loss of funds, impact control/ownership of the contracts, or cause any unintended consequences/actions that are outside the scope of the requirements.
- Gas savings
  - Findings that can improve the gas efficiency of the contracts.
- Informational
  - Findings including recommendations and best practices.

---

## Critical Findings

### 1. Critical - `requestUnlock()` doesn't take into consideration the amount of unlocking already requested

The function `requestUnlock()` in the CLeverCVXStrategy is designed to handle unlock requests from users by accessing locked funds and scheduling them for release. However, it does not consider concurrent unlock requests from multiple users targeting the same epoch. The function retrieves locked amounts and schedules unlocks without checking the available balance left to be unlocked per epoch based on other users' ongoing unlock requests.

#### Technical Details

This oversight can lead to the over-commitment of funds in a single unlock epoch, where the actual unlockable amount might be less than the sum of requests if multiple users attempt to unlock funds for the same epoch. Such a scenario could lead to transaction failures or incorrect processing of unlock requests, impacting user trust and the integrity of the fund management process.

[CLeverCVXStrategy.sol#L123-L150
](https://github.com/asymmetryfinance/afCVX/blob/a1235940698bad8ce5f173db7de1123e46be1858/src/strategies/CLeverCVXStrategy.sol#L123-L150)

Here is the test you can run to try out:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {CVX} from "src/interfaces/convex/Constants.sol";
import {ICleverCvxStrategy} from "src/interfaces/afCvx/ICleverCvxStrategy.sol";
import {BaseForkTest} from "test/utils/BaseForkTest.sol";
import {CLEVER_CVX_LOCKER, EpochUnlockInfo} from "src/interfaces/clever/ICLeverCvxLocker.sol";
import "forge-std/console.sol";

contract AfCvxUnlockForkTest is BaseForkTest {
    function test_withdrawUnlockedPoc() public {
        uint256 assets = 100e18;
        address userA = _createAccountWithCvx(assets);
        address userB = _createAccountWithCvx(assets);
        address userC = _createAccountWithCvx(assets * 10); // Add more assets.
        // First userA deposits.
        _deposit(userA, assets);
        _distributeAndBorrow();

        // Now we wait two week.
        skip(2 weeks);
        vm.roll(block.number + 1);

        // Now userB deposits.
        _deposit(userB, assets);
        _deposit(userC, assets * 10);
        _distributeAndBorrow();

        // We now have two locks.
        (EpochUnlockInfo[] memory locks, ) = CLEVER_CVX_LOCKER.getUserLocks(
            address(cleverCvxStrategy)
        );
        for (uint i = 0; i < locks.length; i++) {
            console.log("pendingUnlock", locks[i].pendingUnlock);
            console.log("unlockEpoch", locks[i].unlockEpoch);
        }
        // User A will request a unlock equal to 100% of the first unlock.
        uint256 firstUnlock = locks[0].pendingUnlock;

        vm.startPrank(userA);
        afCvx.approve(address(afCvx), afCvx.previewWithdraw(firstUnlock));
        (uint256 unlockEpochA, ) = afCvx.requestUnlock(
            firstUnlock,
            userA,
            userA
        );
        vm.stopPrank();

        // User B also asks for a unlock equal to the first unlock.
        vm.startPrank(userB);
        afCvx.approve(address(afCvx), afCvx.previewWithdraw(firstUnlock));
        (uint256 unlockEpochB, ) = afCvx.requestUnlock(
            firstUnlock,
            userB,
            userB
        );
        vm.stopPrank();

        // Let's read the strategy locks.
        ICleverCvxStrategy.UnlockRequest[] memory unlocksA = cleverCvxStrategy
            .getRequestedUnlocks(userA);
        ICleverCvxStrategy.UnlockRequest[] memory unlocksB = cleverCvxStrategy
            .getRequestedUnlocks(userB);
        console.log("unlocksA", unlocksA[0].unlockAmount, unlocksA[0].unlockEpoch);
        console.log("unlocksB", unlocksB[0].unlockAmount, unlocksB[0].unlockEpoch);
        // The two are equal but shouldn't be.
        assert(unlocksA[0].unlockEpoch == unlocksB[0].unlockEpoch);
    }
}
```
The test will show the unlock times for both requests, which have the same epoch.


#### Impact

Critical. With the user's AfCVX tokens burnt the funds are locked in the strategy.

#### Recommendation

Track the total amount of funds to be unlocked.

#### Developer Response

The issue was fixed in the [commit](https://github.com/asymmetryfinance/afCVX/commit/4a68d77d27dd731b924fc2d99d279594c6e0a1b8).

### 2. Critical - `totalValue()` reverts, breaking the protocol when unlockObligations grow

While testing, we uncovered an error with `totalValue()`.
The call reverts due to the `borrowedClever` and `unlockObligations` sum being higher than the `depositedClever`.

#### Technical Details

```solidity
File: CleverCvxStrategy.sol
 74 |       deposited = depositedClever - borrowedClever + unrealisedFurnace - unlockObligations;
```

[CLeverCVXStrategy.sol#L74](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol#L74)


Here is a test you can add to your test suite:

```solidity

// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import {CVX} from "src/interfaces/convex/Constants.sol";
import {ICleverCvxStrategy} from "src/interfaces/afCvx/ICleverCvxStrategy.sol";
import {BaseForkTest} from "test/utils/BaseForkTest.sol";

contract AfCvxReverts is BaseForkTest {
      function test_totalAssets() public {
        uint256 assets = 100e18;
        address userA = _createAccountWithCvx(assets);
        address userB = _createAccountWithCvx(assets);
        // First userA deposits.
        _deposit(userA, assets);
        _distributeAndBorrow();

        // Now we wait two week.
        skip(2 weeks);
        // Now userB deposits.
        _deposit(userB, assets);
        _distributeAndBorrow();
        // User A requests unlock.
        vm.startPrank(userA);
        uint256 maxUnlock = afCvx.maxRequestUnlock(userA);
        afCvx.approve(address(afCvx), afCvx.previewWithdraw(maxUnlock));
        (uint256 unlockEpochA, ) = afCvx.requestUnlock(maxUnlock, userA, userA);
        // totalAssets is reverting.
        afCvx.totalAssets();
    }
}
```

```bash
forge test --match-test test_totalAssets
Failing tests:
Encountered 1 failing test in test/AfCvx.unlock.t.sol:AfCvxUnlockForkTest
[FAIL. Reason: panic: arithmetic underflow or overflow (0x11)] test_totalAssets() (gas: 1492587)
```

#### Impact

Critical. `totalValue()` reverting breaks the vault.

#### Recommendation

Rethink [`totalValue()`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol#L70) so that `borrowedClever` and `unlockObligations` don't underflow the `deposited` calculation.

#### Developer Response

I fixed totalValue calculation to avoid the overflow in the following [commit](https://github.com/asymmetryfinance/afCVX/commit/eb00802e7a44f9306c7d989fb7c7781a302cc297).

## Medium Findings

### 1. Medium - `setOperator` and `setProtocolFeeCollector` can't be used to update the address

The function to set the new operator or new protocolFeeCollector will always revert except if the operator has a zero address, making updating the address impossible.

#### Technical Details

```solidity
File: AfCvx.sol
484 |    function setProtocolFeeCollector(address newProtocolFeeCollector) external onlyOwner {
485 |        if (newProtocolFeeCollector != address(0)) revert InvalidAddress();
486 |        protocolFeeCollector = newProtocolFeeCollector;
487 |        emit ProtocolFeeCollectorSet(newProtocolFeeCollector);
488 |    }
489 |
490 |    function setOperator(address newOperator) external onlyOwner {
491 |        if (newOperator != address(0)) revert InvalidAddress();
492 |         operator = newOperator;
493 |         emit OperatorSet(newOperator);
494 |     }
```

[AfCvx.sol#L484-L494](https://github.com/asymmetryfinance/afCVX/blob/74be317dd50055c09f6832760da362e47903aa98/src/AfCvx.sol#L484-L494)

```solidity
File: CLeverCVXStrategy.sol
228 |    function setOperator(address newOperator) external onlyOwner {
229 |        if (newOperator != address(0)) revert InvalidAddress();
230 |        operator = newOperator;
231 |        emit OperatorSet(newOperator);
232 |    }
```

[CLeverCVXStrategy.sol#L228-L232](https://github.com/asymmetryfinance/afCVX/blob/a1235940698bad8ce5f173db7de1123e46be1858/src/strategies/CLeverCVXStrategy.sol#L228-L232)


#### Impact

Medium. The operator or the protocolFeeCollector can't be updated.

#### Recommendation

Fix the condition.

#### Developer Response

Fixed in the [commit](https://github.com/asymmetryfinance/afCVX/commit/c7f74acf45dbd3a957e9867b33745c63e2c27c25).


### 2. Medium - `maxRequestUnlock()`doesn't take into consideration pending unlocks

The function [`maxRequestUnlock()`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L297) should return the maximum amount of assets that can be unlocked by the `owner` but it doesn't take into consideration that there can pending unlocks.

#### Technical Details

[`CLEVER_CVX_LOCKER.getUserInfo(address(cleverCvxStrategy))`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L298) returns the `totalLocked` in CLever locker that can withdraw. If some user requests unlock, the function should subtract that request from `totalLocked` value because pending requests will withdraw from the same Clever locker. This can lead to [users burning more assets](https://github.com/asymmetryfinance/afCVX/blob/a1235940698bad8ce5f173db7de1123e46be1858/src/AfCvx.sol#L320-L335) than it is possible to unlock.

#### Impact

Medium. Users could burn more assets than they can request to unlock.

#### Recommendation

In [`CleverCvxStrategy`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol) add a function in `CleverCvxStrategy` to return the maximum amount of assets that can be unlocked which is `totalLocked` minus pending unlock amount.

```solidity
function maxUnlock() external view returns (uint256) {
    (uint256 totalLocked,,,,) = CLEVER_CVX_LOCKER.getUserInfo(address(this));
    return totalLocked - unlockObligations;
}
```

Use this new function to calculate the correct value for max request unlock:

```diff
function maxRequestUnlock(address owner) public view returns (uint256 maxAssets) {
-   (uint256 totalLocked,,,,) = CLEVER_CVX_LOCKER.getUserInfo(address(cleverCvxStrategy));
+   uint256 totalLocked = cleverCvxStrategy.maxUnlock();
    return super.previewRedeem(balanceOf(owner)).min(totalLocked);
}
```

#### Developer Response

Related to findings 2. Fixed it in the same commit.


### 3. Medium - `totalValue()` returns overestimated value

[`totalValue()`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol#L70) returns the total value of the strategy's funds, but it doesn't account for the fee it has to pay, meaning the return value will be overestimated.

#### Technical Details

The strategy deposits `CVX` into CLever and borrows `clevCVX`. To withdraw all funds from CLever, it must repay the whole borrowed amount [plus the additional fee](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol#L201). This means that the strategy will have to pay that fee in the end, which should be subtracted from the total value of the strategy.

[The CLever repay fee](https://github.com/AladdinDAO/aladdin-v3-contracts/blob/63198430f5e4cfd981808b35ef5002a2b290807f/contracts/clever/CLeverCVXLocker.sol#L483) is calculated as a percentage of the repay `clevCVX` amount.

#### Impact

Medium. The strategy overestimates its total value.

#### Recommendation

Subtract the CLever repay fee from the total value of the strategy. Be aware that [`borrow()`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol#L195) call will decrease the total value.

#### Developer Response

Fixed in the [commit](https://github.com/asymmetryfinance/afCVX/commit/777654324350b8b0abbc1bc68a5059a118cb1e0f)

## Low Findings

### 1. Low - Contracts can receive ETH but do not implement any function for withdrawal

The AfCvx contract can receive ETH, but can not withdraw.


#### Technical Details

```solidity
File: src/AfCvx.sol

23 | contract AfCvx is IAfCvx, TrackedAllowances, Ownable, ERC4626Upgradeable, ERC20PermitUpgradeable, UUPSUpgradeable {
```

The contract isn't sending back the ETH received in the `initialize()` or the `receive()` functions, but this ETH hasn't been sent back.

[AfCvx.sol#L23](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L23)

#### Impact

Low. ETH can be stuck on the contract.

#### Recommendation

Remove the payable modifier and remove the receive function.

#### Developer Response

The `receive()` function is required to perform the swap. It can only receive ETH from the Curve pool. Removed `payable` modifier from `initialize` in the [commit](https://github.com/asymmetryfinance/afCVX/commit/77a18959bbaff9441673729fe4385c76f86caff7)


### 2. Low - `maxWithdraw()` should take into consideration the amount of CVX available to withdraw in the Convex reward pool

In the scenario where `weeklyWithdrawalLimit` is higher than the sum of the balance of CVX in the contract and available to withdraw from the convex reward pool, a user/contract calling `maxWithdraw()` will get an inaccurate value.

#### Technical Details

```solidity
File: AfCvx.sol
 165 |       return previewRedeem(balanceOf(owner)).min(weeklyWithdrawalLimit);
```

[AfCvx.sol#L158-L166](https://github.com/asymmetryfinance/afCVX/blob/74be317dd50055c09f6832760da362e47903aa98/src/AfCvx.sol#L158-L166)


#### Impact

Low. `AfCvx` doesn't follow the ERC4626 standard.

#### Recommendation

Add a check for available CVX to the `maxWithdraw()` function.

#### Developer Response

Fixed in [commit](https://github.com/asymmetryfinance/afCVX/commit/bc3687011ab2a37d8b71e82a40c849f4885f02c0)

### 3. Low - Return 0 for max deposit and max withdraw values when paused

When the contract is paused, the user cannot deposit or withdraw. In that case, the functions that return max values should return 0.

#### Technical Details

Override the following ERC4626 functions to return 0 when the `AfCvx` contract is paused:

- `maxDeposit()`
- `maxMint()`
- `maxWithdraw()`
- `maxRedeem()`

Returning other values than 0 will show users that they can deposit or withdraw returned values, but if the contract is paused, the call will revert. Returning 0 will imply that deposits and withdrawals cannot performed.

[EIP4626](https://eips.ethereum.org/EIPS/eip-4626) clearly specifies that disabled deposits must return 0: "MUST factor in both global and user-specific limits, like if deposits are entirely disabled (even temporarily), it MUST return 0".

#### Impact

Low. `AfCvx` doesn't follow the ERC4626 standard.

#### Recommendation

Return 0 if paused in specified function.

```solidity
if (paused) return 0;
```

#### Developer Response

Fixed in the [commit ](https://github.com/asymmetryfinance/afCVX/commit/73c69337ef237c5d2816ed1bc5d1670d88b76cc5)


### 4. Low - Instant share value increase can be sandwiched if the instant withdrawal fee is lower than the profit

The function `harvest(uint256 minAmountOut)` in the AfCVX contract triggers the harvesting of rewards from both a Convex staking pool and a clever strategy involving CVX tokens. However, adding rewards directly to the vault without a time-based distribution leads to an immediate increase in share value. This could result in discrepancies in share value for investors entering or exiting around the time of harvest, possibly leading to exploitation or unfair advantage.

#### Technical Details

The immediate increase in share value post-reward harvest can create opportunities for arbitrage, where users might predict the harvest time. The fee and withdrawal limits mitigate this.

#### Impact

Low. It's essential to set accurate limits and fees to prevent this behavior.

#### Recommendation

If possible, monitor on-chain transactions for a sandwich type `harvest()` attack.

#### Developer Response

We are aware of this risk and the withdrawal fee was introduced to mitigate it. The `harvest()` can also be sandwiched with a deposit and request unlock. We don't take a withdrawal fee on request unlock, but it's a very gas-intensive operation. The unit tests [here ](https://github.com/asymmetryfinance/afCVX/blob/fix/afCVX-audit-findings/test/AfCvx.harvest.t.sol#L45) illustrate the sandwich attacks


## Gas Saving Findings

### 1. Gas - Cache array length outside of the loop

When iterating over an array, it is recommended to cache the array length outside of the loop to avoid unnecessary gas costs.

#### Technical Details

```solidity
File: src/PirexMigrator.sol

122 | for (uint256 i = 0; i < _unlockTimes.length; i++) {
```

[PirexMigrator.sol#L122](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/PirexMigrator.sol#L122)

#### Impact

Gas savings.

#### Recommendation

Cache the array length outside of the loop.

#### Developer Response

Fixed.

### 2. Gas - Split `deposit()` into two function

Using two functions would save gas, as they do not require a boolean and a `minAmountOut` when calling `deposit` on `CLEVER_CVX_LOCKER`.

#### Technical Details

```solidity
94  |    function deposit(uint256 cvxAmount, bool swap, uint256 minAmountOut) external onlyManager unlockNotInProgress {
95  |        address(CVX).safeTransferFrom(msg.sender, address(this), cvxAmount);
96  |        if (swap) {
97  |            uint256 clevCvxAmount = Zap.swapCvxToClevCvx(cvxAmount, minAmountOut);
98  |            FURNACE.deposit(clevCvxAmount);
99  |        } else {
100 |            CLEVER_CVX_LOCKER.deposit(cvxAmount);
101 |        }
```
Using two functions, you can remove the need for a boolean argument and save some gas.

#### Impact

Gas savings

#### Recommendation


Use two functions named `deposit` with the following function definitions  `deposit(address)` that would `deposit` into `CLEVER_CVX_LOCKER` and `deposit(address, uint256)` for swapping CVX for ClevCVX.

#### Developer Response

I decided not to make the modifications here as it will require splitting `distribute()` as well. The gas savings are minimal and the function is restricted, the end-users won't be calling it. Also, I don't understand why the suggested recommendation passes `address` to `deposit()` function - `deposit(address)`.

### 3. Gas - Remove double-checks

In some places, there are double checks for the same value. Removing duplicated checks will save gas.

#### Technical Details

```solidity
File: src/PirexMigrator.sol

88 |    if (_minSwapReceived == 0) revert ZeroAmount();
89 |    PIREX_LP.swap(IPirexLiquidityPool.Token._PX_CVX, _amount, _minSwapReceived, FROM_INDEX, TO_INDEX);
```

[PirexMigrator.sol#L88](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/PirexMigrator.sol#L88) can be removed because because `PIREX_LP.swap()` function have also check for [`_minSwapReceived == 0`](https://etherscan.io/address/0x389fb29230d02e67eb963c1f5a00f2b16f95beb7#code#F1#L175).

```solidity
File: src/PirexMigrator.sol

106 |    if (_receiver == address(0)) revert ZeroAddress();
112 |    if (_amount > 0) _amount = ASYMMETRY_CVX.deposit(_amount, _receiver);
```

[PirexMigrator.sol#L106](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/PirexMigrator.sol#L106) can be removed because because `ASYMMETRY_CVX.deposit()` function have check inside `ERC20Upgradeable._mint()` that receiver account is [`account != address(0)`](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/723f8cab09cdae1aca9ec9cc1cfa040c2d4b06c1/contracts/token/ERC20/ERC20Upgradeable.sol#L251).

```solidity
File: src/PirexMigrator.sol

133 |    if (_for == address(0)) revert ZeroAddress();
147 |    if (_amount > 0) _amount = ASYMMETRY_CVX.deposit(_amount, _for);
```

[PirexMigrator.sol#L133](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/PirexMigrator.sol#L106) can be removed because because `ASYMMETRY_CVX.deposit()` function have check inside `ERC20Upgradeable._mint()` that receiver account is [`account != address(0)`](https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/723f8cab09cdae1aca9ec9cc1cfa040c2d4b06c1/contracts/token/ERC20/ERC20Upgradeable.sol#L251).

#### Impact

Gas savings.

#### Recommendation

Remove duplicated checks.

#### Developer Response

kept `PirexMigrator.sol#L106` check because _amount could be 0


### 4. Gas - Unnecessary variable creation

Unnecessary variable creation increases the gas cost.

#### Technical Details


Instead of creating the `realisedFurnace` variable, assign the value directly to `rewards`.

[CLeverCVXStrategy.sol#L70-L76](https://github.com/asymmetryfinance/afCVX/blob/a1235940698bad8ce5f173db7de1123e46be1858/src/strategies/CLeverCVXStrategy.sol#L70-L76)


#### Impact

Gas savings.

#### Recommendation

```diff
- (uint256 unrealisedFurnace, uint256 realisedFurnace) = FURNACE.getUserInfo(address(this));
+ uint256 unrealisedFurnace;
+ (unrealisedFurnace, rewards) = FURNACE.getUserInfo(address(this));

deposited = depositedClever - borrowedClever + unrealisedFurnace - unlockObligations;
- rewards = realisedFurnace;
```

#### Developer Response

The code has changed, and the recommendation isn't relevant anymore


### 5. Gas - Calculate variable only if needed

Calculation of some variables can be skipped in some cases.

#### Technical Details

In the function [`withdrawUnlocked()`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol#L156) variable [`unlockAmount`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol#L164C21-L164C33) can be calculated later inside `if` statement to save some gas.

 ```diff
-          uint256 unlockAmount = unlocks[nextUnlockIndex].unlockAmount;
            if (unlockEpoch <= currentEpoch) {
+              uint256 unlockAmount = unlocks[nextUnlockIndex].unlockAmount;
                delete unlocks[nextUnlockIndex];
                cvxUnlocked += unlockAmount;
             } else {
                break;
             }
```

#### Impact

Gas Savings.

#### Recommendation

Calculate variables only when needed, as suggested above.

#### Developer Response

Fixed


### 6. Gas - PirexMigrator multiRedeem should group redemption and deposits together

The contract exposes `multiRedeem()` and `redeem()`, and `multiRedeem()` uses `redeem()` in a for loop, which significantly increases the gas needed.

#### Technical Details

```solidity
File: PirexMigrator.sol
121 |    function multiRedeem(uint256[] calldata _unlockTimes, address[] calldata _fors) external returns (uint256 _amount) {
122 |        for (uint256 i = 0; i < _unlockTimes.length; i++) {
123 |            _amount += redeem(_unlockTimes[i], _fors[i]);
124 |        }
125 |    }
```
[PirexMigrator.sol#L121-L125](https://github.com/asymmetryfinance/afCVX/blob/43f06dab194ffa02f2835052086d8117694251b8/src/PirexMigrator.sol#L121-L125)

On every call to `redeem()`, the funds from `PIREX_CVX` are redeemed and deposited into `ASYMMETRY_CVX`. This process incurs a significant gas cost because it allows for redeems to be made for different users and unlock times. However, a single user with multiple unlock times will face a higher gas cost than necessary to migrate their funds.


#### Impact

Gas savings.

#### Recommendation

Since an array is required to call PIREX_CVX.redeem, it is advised to move most of the complexity in the `multiRedeem` function and have `redeem` call `multiRedeem` with a single-entry array. The `multiRedeem()` function could have the following interface.

```solidity
struct RedeemRequest {
address account,
uint256[] unlockTimes
}

function multiRedeem(RedeemRequest[] requests) {}
```
#### Developer Response

Because this function is designed to potentially be used by Asymmetry team to redeem for multiple users, and not necessarily for a user to redeem several requests.


### 7. Gas - Skip claiming extra rewards from `CVX_REWARDS_POOL`

Convex rewards pool provides an option to claim extra rewards. The contract [`AfCvx`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L419) is not designed to handle additional tokens so it would be cheaper to skip claiming.

#### Technical Details

The [`CVX_REWARDS_POOL` has an additional function to skip claiming extra rewards](https://etherscan.io/address/0xcf50b810e57ac33b91dcf525c6ddd9881b139332#code#L968). Use it to save some gas. Currently, [there are no extra rewards](https://etherscan.io/address/0xcf50b810e57ac33b91dcf525c6ddd9881b139332#readContract#F9).

#### Impact

Gas savings.

#### Recommendation

Use a different function to claim [Convex rewards](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L419) that skips claiming additional rewards:

```diff
- CVX_REWARDS_POOL.getReward(false);
+ CVX_REWARDS_POOL.getReward(address(this), false, false);
```

#### Developer Response

Fixed


## Informational Findings

### 1. Informational - Recommended array length check

If the length of the `_fors` array is smaller than the length of the `_unlockTimes` array, the transaction will revert and consume the gas used up to that point.

#### Technical Details

```solidity
File: PirexMigrator.sol
121 |    function multiRedeem(uint256[] calldata _unlockTimes, address[] calldata _fors) external returns (uint256 _amount) {
122 |        for (uint256 i = 0; i < _unlockTimes.length; i++) {
123 |            _amount += redeem(_unlockTimes[i], _fors[i]);
```

[PirexMigrator.sol#L121-L125](https://github.com/asymmetryfinance/afCVX/blob/43f06dab194ffa02f2835052086d8117694251b8/src/PirexMigrator.sol#L121-L125)

#### Impact

Informational

#### Recommendation

Add a requirement that checks if the lengths of the two variables are equal.

#### Developer Response

Fixed.

### 2. Informational - Prefer using Ownable2Step or Ownable2StepUpgradeable instead of Ownable

The contracts Ownable2Step or Ownable2StepUpgradeable introduce a mechanism that prevents accidental transfer of contract ownership to an incorrect address. This is achieved by requiring the recipient of owner permission to actively accept the transfer through a contract call of its own.


#### Technical Details

```solidity
File: src/AfCvx.sol

23 | contract AfCvx is IAfCvx, TrackedAllowances, Ownable, ERC4626Upgradeable, ERC20PermitUpgradeable, UUPSUpgradeable {
```

[AfCvx.sol#L23](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L23)

```solidity
File: src/strategies/CLeverCVXStrategy.sol

17 | contract CleverCvxStrategy is ICleverCvxStrategy, TrackedAllowances, Ownable, UUPSUpgradeable {
```

[CLeverCVXStrategy.sol#L17)](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol#L17)


#### Impact

Informational

#### Recommendation

Use `Ownable2Step` instead of Ownable.

#### Developer Response

Not an issue. `Ownable` from solady is already a two-step. See https://github.com/Vectorized/solady/blob/main/src/auth/Ownable.sol#L222


### 3. Informational - `TODO` left in the code

`TODO` should be resolved before deployment.

#### Technical Details

```solidity
File: src/PirexMigrator.sol

35 | // IERC4626 public constant ASYMMETRY_CVX = IERC4626(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B); // TODO - make constant

47 | ASYMMETRY_CVX = IERC4626(_afCVX); // TODO
```

[PirexMigrator.sol#L35](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/PirexMigrator.sol#L35)
[PirexMigrator.sol#L47](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/PirexMigrator.sol#L47)

#### Impact

Informational

#### Recommendation

Fix the todos

#### Developer Response

That TODO will be removed at deployment time, after afCVX is deployed.


### 4. Informational - `public` functions not called by the contract should be declared `external` instead

Using a public function instead of an external function does not necessarily incur more gas costs; however, it is still recommended to use the external modifier instead of the public modifier for clarity. A function override can change the visibility.

#### Technical Details


```solidity
File: src/AfCvx.sol

80 | function decimals() public pure override(ERC4626Upgradeable, ERC20Upgradeable, IERC20Metadata) returns (uint8) {

111 | function deposit(uint256 assets, address receiver)

127 | function mint(uint256 shares, address receiver)

158 | function maxWithdraw(address owner)

193 | function withdraw(uint256 assets, address receiver, address owner)

208 | function maxRedeem(address owner)

244 | function redeem(uint256 shares, address receiver, address owner)
```

AfCvx.sol [80](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L80), [111](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L111), [127](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L127), [158](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L158), [193](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L193), [208](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L208), [244](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L244)


#### Impact

Informational

#### Recommendation

Use the external modifier instead of the public

#### Developer Response

Not an issue. All mentioned functions are overrides and the function visibility should be the same as in the parent contract.


### 5. Informational - Refactor duplicated require()/revert() checks into a modifier or function

It is recommended to refactor duplicated require()/revert() checks into a modifier or function.

#### Technical Details

```solidity
File: src/AfCvx.sol

453 | if (newShareBps > BASIS_POINT_SCALE) revert InvalidShare();
477 | if (newShareBps > BASIS_POINT_SCALE) revert InvalidShare();

461 | if (newFeeBps > BASIS_POINT_SCALE) revert InvalidFee();
469 | if (newFeeBps > BASIS_POINT_SCALE) revert InvalidFee();
```

AfCvx.sol [453](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L453), [461](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L461), [469](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L469), [477](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L477)

```solidity
File: src/PirexMigrator.sol

79 | if (_receiver == address(0)) revert ZeroAddress();
106 | if (_receiver == address(0)) revert ZeroAddress();
```
PirexMigrator.sol [79](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/PirexMigrator.sol#L79), [106](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/PirexMigrator.sol#L106)


#### Impact

Informational.

#### Recommendation

Use a modifier for clarity.

#### Developer Response

Refactored in the [commit](https://github.com/asymmetryfinance/afCVX/commit/11f9637dfbbf9c1aa29df32276e315564d06113b)


### 6. Informational - Unnecessary integer variable initialization

In Solidity, variables are automatically initialized to zero. Therefore, explicitly initializing variables to zero is not mandatory and can be skipped to optimize gas costs.


#### Technical Details

```solidity
File: src/PirexMigrator.sol

27 | uint256 public constant TO_INDEX = 0; // CVX

122 | for (uint256 i = 0; i < _unlockTimes.length; i++) {
```

[PirexMigrator.sol#L27](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/PirexMigrator.sol#L27), [PirexMigrator.sol#L122](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/PirexMigrator.sol#L122)

#### Impact

Informational.

#### Recommendation

Do not initialize to zero.

#### Developer Response

Removed initialization from `PirexMigrator.sol#L122`, kept `PirexMigrator.sol#L27`, for code readability.



### 7. Informational - Misleading modifier name

The modifier name should clearly explain its function.

#### Technical Details

[`AfCvx.onlyOperator()`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/AfCvx.sol#L43) should limit the caller to the operator's address, but it also enables the owner to bypass this check.

[`CleverCvxStrategy.onlyOperator()`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol#L39) also enables the owner to bypass only operator check.

#### Impact

Informational.

#### Recommendation

Rename the modifier to `onlyOperatorOrOwner`.

#### Developer Response

Changed.


### 8. Informational - PirexMigrator prevents the receiver from being the PirexMigrator contract

The PirexMigrator prevents the `_receiver` from being the zero address. A second address that can be checked is making sure the recipient is not the contract itself.

#### Technical Details

[PirexMigrator.sol#L74](https://github.com/asymmetryfinance/afCVX/blob/43f06dab194ffa02f2835052086d8117694251b8/src/PirexMigrator.sol#L74)
[PirexMigrator.sol#L105](https://github.com/asymmetryfinance/afCVX/blob/43f06dab194ffa02f2835052086d8117694251b8/src/PirexMigrator.sol#L105)

#### Impact

Informational.

#### Recommendation

Consider adding a check to make sure the `_receiver` is not the PirexMigrator contract.

#### Developer Response

Fixed.


### 9. Informational - Use `memory` instead of `storage`

Using `memory` instead of `storage` clearly distinguishes that the data cannot be changed and will be used only for reading.

#### Technical Details

[`accountUnlocks`](https://github.com/asymmetryfinance/afCVX/blob/57cb6d5162a526bce6b34209a13c0bcfd36f86cb/src/strategies/CLeverCVXStrategy.sol#L79) can be defined as memory:

```diff
- UnlockRequest[] storage accountUnlocks = requestedUnlocks[account].unlocks;
+ UnlockRequest[] memory accountUnlocks = requestedUnlocks[account].unlocks;
```

#### Impact

Informational.

#### Recommendation

When the data is not updated, define it as `memory` instead of `storage`.

#### Developer Response

Done


### 10. Informational - The price of AfCVX can be manipulated atomically

The price of AfCVX based on `totalAssets()` can be inflated atomically using, for example, a `CVX` transfer to the afCVX contract or `stakeFor` from the convex rewards contract.
It's essential to consider the price of AfCVX while integrating with the lending borrowing protocol.

#### Technical Details

[AfCvx.sol#L93-L103](https://github.com/asymmetryfinance/afCVX/blob/74be317dd50055c09f6832760da362e47903aa98/src/AfCvx.sol#L93-L103)


#### Impact

Informational.

#### Recommendation

It doesn't impact the protocol but is highly risky if used in a lending and borrowing market.

#### Developer Response

acknowledged.

### 11. Informational - Upgrade dependencies

The Solady contracts dependency is version [0.0.180](, which is outdated. Consider updating to a newer version.

#### Technical Details

The new version of the Solady library is [`v0.0.192`](https://github.com/Vectorized/solady/releases/tag/v0.0.192).

#### Impact

Informational.

#### Recommendation

Upgrade Soliday dependency to a newer version.

#### Developer Response

Upgraded solady to v.0.0194


## Final remarks

The `afCVX` ERC4626 vaults enable the users to earn a yield on the deposited CVX by funneling funds to the Convex rewards pool and CLever. Additionally, CLever is used to borrow clevCVX and route it to Furnace to get more CVX tokens. The strategy and vault require active management to rebalance funds, harvest rewards, and trigger withdrawals from CLever. Both strategy and vault contracts are upgradeable proxies that enable future changes to the deployed contracts. The Pirex migrator contract provides users with a simple way to transfer uCVX, pxCVX, and upxCVX directly to the asymmetry `afCVX` vault.



