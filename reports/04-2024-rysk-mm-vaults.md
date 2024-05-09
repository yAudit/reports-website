---
layout: default
title: 04-2024-Rysk-MM-vaults
description: Rysk MM vaults Report
nav_order: 49
image: assets/images/logo.png
---

# yAudit Rysk vault Review <!-- omit in toc -->
{: .no_toc }

**Review Resources:**

- Codebase
- [docs](https://docs.100x.finance/)

**Auditors:**

- spalen
- panda

## Table of Contents <!-- omit in toc -->
{: .no_toc }

1. TOC
{:toc}

## Review Summary

**Rysk vault**

Rysk provides a vault to wrap deposits into the Ciao contract.

The contracts of the Rysk [Repo](https://github.com/rysk-finance/mm-vault/) were reviewed over 3 days. The code review was performed by 2 auditors between April 16th and April 19th, 2024. The repository was under active development during the review, but the review was limited to the latest commit at the start of the review. This was commit [b7538f59f97846eda129435b7c0debe473360bf3](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/) for the Risk vault repo.

## Scope

The scope of the review consisted of the following contracts at the specific commit:
```
src
├── Vault.sol
├── interfaces
│   ├── Errors.sol
│   ├── Events.sol
│   ├── IAddressManifest.sol
│   ├── IBlast.sol
│   ├── IBlastPoints.sol
│   ├── ICiao.sol
│   ├── IProductCatalogue.sol
│   ├── IVault.sol
│   └── WETHRebasing.sol
```

After the findings were presented to the Rysk team, fixes were made and included in several PRs.

This review is a code review to identify potential vulnerabilities in the code. The reviewers did not investigate security practices or operational security and assumed that privileged accounts could be trusted. The reviewers did not evaluate the security of the code relative to a standard or specification. The review may not have identified all potential attack vectors or areas of vulnerability.

yAudit and the auditors make no warranties regarding the security of the code and do not warrant that the code is free from defects. yAudit and the auditors do not represent nor imply to third parties that the code has been audited nor that the code is free from defects. By deploying or using the code, Rysk vault and users of the contracts agree to use the code at their own risk.


## Code Evaluation Matrix

| Category                 | Mark    | Description |
| ------------------------ | ------- | ----------- |
| Access Control           | Good | Access controls are properly implemented with checks for approved Signer and other role-based conditions, ensuring that only authorized entities can interact with sensitive functions. |
| Mathematics              | Good | Calculations, especially in functions handling transactions, fees, and queuing, are executed correctly without errors reported in mathematical logic. |
| Complexity               | Good | The contract logic maintains a manageable level of complexity. |
| Libraries                | Good | Uses standard Solidity patterns and practices. |
| Decentralization         | Low | The reliance on `approvedSigner` and other centralized components suggests a degree of centralization that might not align with decentralized principles. |
| Code stability           | Good    | Code is stable. |
| Documentation            | Good | The codebase is generally well-documented. |
| Monitoring               | Average | There appears to be room for improvement in terms of event emissions and logging. |
| Testing and verification | Good | Code is tested.  |

## Findings Explanation

Findings are broken down into sections by their respective impact:

- Critical, High, Medium, Low impact
  - These are findings that range from attacks that may cause loss of funds, impact control/ownership of the contracts, or cause any unintended consequences/actions that are outside the scope of the requirements.
- Gas savings
  - Findings that can improve the gas efficiency of the contracts.
- Informational
  - Findings including recommendations and best practices.

---
## Low Findings

### 1. Low - `takeGas()` should return excess ETH sent by mistake

In case a user sends significantly more ETH than necessary to cover future gas usage, the contract should return the excess ETH.

#### Technical Details

```solidity
299 |        // ETH cost of the transaction using the stored gas amount.
300 |        uint256 fee = processQueueGasUsage * gasPrice;
301 |
302 |        // Check that the msg.value is equal or more than the fee.
303 |        if (msg.value < fee) revert(Errors.feeTooLow);
304 |
305 |        // Transfer fee to the external account EOA.
306 |        (bool sent,) = payable(approvedSigner).call{value: msg.value}("");
307 |        if (!sent) revert(Errors.feeTransferFailed);
```

[Vault.sol#L300-L307](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L300-L307)


#### Impact

Low. There is a risk that users might inadvertently overpay.

#### Recommendation

Define a threshold, for example, 5% above the `fee`. If this threshold is exceeded, refund all ETH above the `fee`.

#### Developer Response
implemented. [changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/98ee72bc7a645d29368f72c67b3666c5b51e2c79)

### 2. Low - Unintended queue item skipping in `processQueue()`

`processQueue()` function, there is a vulnerability that allows a `approvedSigner` to inadvertently skip future queue positions or alter a previously processed `queueItem`. This occurs when the `amountToReceive` parameter is passed as zero, permitting any value of `queuePosition` to be used without validation. Although skipping is intentional when amountToReceive is zero, the nextToProcess variable is always incremented, which can lead to unintentional skipping of important future queue items that won't be processable.

#### Technical Details

```solidity
File: Vault.sol
185 |    function processQueue(uint256 queuePosition, uint256 amountToReceive) external {
186 |        if (msg.sender != approvedSigner) revert(Errors.notApprovedSigner);
187 |        // Get the action data from the queue.
188 |        QueueItem storage queueItem = queue[nextToProcess];
189 |        if (queueItem.sender == address(0)) revert(Errors.emptyQueueItem);
190 |
191 |        if (amountToReceive != 0) {
192 |            // check queuePosition matches the next position to be processed
193 |             if (queuePosition != nextToProcess) {
194 |                 revert(Errors.invalidQueuePosition);
195 |            }
196 |
197 |            // process this position in the queue. Skips if fails or reverts
198 |            try this.processSingleQueuePosition(queueItem, amountToReceive) {
199 |                queueItem.state = ItemState.Executed;
200 |            } catch {
201 |                queueItem.state = ItemState.Skipped;
202 |            }
203 |        } else {
204 |            // intentionally skip this position
205 |             queueItem.state = ItemState.Skipped;
206 |         }
207 |
208 |         // increment next position to process
209 |         nextToProcess++;
210 |     }
```

[Vault.sol#L185-L201](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L185-L210)

#### Impact

Low. A wrong skipped item will prevent queued items from ever being executed.

#### Recommendation

Remove the `queuePosition` parameter and always process the `nextToProcess` item.

#### Developer Response
Moved `queuePosition` check on L193 to outside the `if` block immediately above it. 
[changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/581d0fb60fe179db6ab870c434263ecd82719601)

### 3. Low - Verify deposit amount is above minimum amount

The user can use any amount in [`deposit()`](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L137), but Ciao has defined minimum deposit amount per each token. This can lead to failed transactions in the queue and users paying gas.

#### Technical Details

Ciao has the function [`minDepositAmount()`](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/interfaces/ICiao.sol#L11) to get the minimum deposit amount. Reject the users who are trying to deposit below that amount to save some gas costs for the users.

#### Impact

Low. The user will pay the deposit gas fee even though the deposit call to Ciao will fail.

#### Recommendation

In [`deposit()`](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L137) verify that the `amount` is above minimum value defined in Ciao for desired token.

```solidity
if (ciao.minDepositAmount(token) > amount) revert(Errors.insufficientDepositAmount);
```

#### Developer Response
implemented
[changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/8fb99d16a627ced0370d2b8198b2716c939c13b6)

## Gas Saving Findings

### 1. Gas - Structure can be packed into fewer storage slots

The `QueueItem` can be organized to save 20000 gas on every structure added to the queue.

#### Technical Details

```solidity
15 | struct QueueItem {
16 |     Action action;
17 |     address sender;
18 |     address token;
19 |     uint256 amount; // for Deposits, this is core collateral. For Withdrawals it is LP shares.
20 |     ItemState state;
21 | }
```

Can be restructured following this order, to have `sender`, `action` and `state` under the same storage space.

```
 * uint256 amount; // (256 bits)
 * address sender; // (160 bits)
 * enum IVault.Action action; // (8 bits)
 * enum IVault.ItemState state; // (8 bits)
 * address token; // (160 bits)
```

[IVault.sol#L15](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/interfaces/IVault.sol#L15)

#### Impact

Gas savings.

#### Recommendation

Change the structure definition.

#### Developer Response
implemented.
[changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/1e2761258f70bd65137602daae97e887507469ed)


### 2. Gas - Use a circular buffer instead of an indefinitely growing queue

Managing a FIFO queue efficiently in blockchain applications is essential due to the high cost of gas associated with state changes. A solution to reduce gas usage and prevent the queue from growing indefinitely is to replace the queue with a circular buffer.

#### Technical Details

The circular buffer method allows efficient queue management by using a fixed-size array and two pointers to denote the front and rear of the queue. This approach avoids costly array-shifting operations.

Here is an idea of a queue structure and function associated.
```solidity
uint256 constant MAX_SIZE=500;
QueueItem[MAX_SIZE] queue;
uint256 front;
uint256 rear;
uint256 size;

function enqueue(Queue storage queue, QueueItem item) public {
    require(size < MAX_SIZE, "Queue is full");
    rear = (rear + 1) % MAX_SIZE;
    queue[rear] = item;
    size++;
}

function dequeue(Queue storage queue) public returns (QueueItem) {
    require(size > 0, "Queue is empty");
    uint item = data[queue.front];
    front = (front + 1) % capacity;
    size--;
    return item;
}
```
The gas savings become effective after the queue is filled once. Therefore, determining the optimal size of the queue to maximize gas efficiency while ensuring sufficient capacity is crucial.

#### Impact

Gas savings.

#### Recommendation

Consider a circular buffer, if not storing the processed data is possible.

#### Developer Response
acknowledged.

### 3. Gas - Optimize `queueCounter`

`queueCounter` can be optimized in deposit and withdraw functions.

#### Technical Details

`queueCounter` is first increased by one and later decreased by one. Using additional variable to store counter can save gas.

#### Impact

Gas savings.

#### Recommendation

Change [`deposit()`](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L142-148) to following:

```solidity
uint256 currentItem = queueCounter++;
queue[currentItem] =
    QueueItem(Action.Deposit, msg.sender, token, amount, ItemState.Pending);

emit Events.AddedToQueue(queue[currentItem], queueCounter, nextToProcess);
```

Change [`withdraw()`](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L168-174) to following:

```solidity
uint256 currentItem = queueCounter++;
queue[currentItem] =
    QueueItem(Action.Withdraw, msg.sender, token, amount, ItemState.Pending);

emit Events.AddedToQueue(queue[currentItem], queueCounter, nextToProcess);
```

Gas savings data from provided tests:

```logs
test_Fail_userMakesDepositNotEnoughGas() (gas: -10 (-0.008%))
test_Happy_userMakesWithdrawalRequest(uint8,uint8,uint128,uint128,uint128) (gas: -192 (-0.033%))
test_Happy_userMakesDepositAndProcessed(uint8,uint128,uint128) (gas: -192 (-0.034%))
test_Fail_userMakesWithdrawalInsufficientShares() (gas: -192 (-0.035%))
test_Happy_ProcessDeposit() (gas: -192 (-0.037%))
test_Happy_ProcessMultipleDeposits() (gas: -384 (-0.046%))
test_Happy_processWithdrawalBlacklistedUser() (gas: -384 (-0.046%))
test_Happy_ProcessUserWithdrawal() (gas: -384 (-0.048%))
test_Happy_ProcessDepositCiaoDepositError() (gas: -192 (-0.049%))
test_Happy_ProcessDepositAndWithdrawal() (gas: -576 (-0.060%))
test_Happy_userWithdrawal() (gas: -384 (-0.062%))
test_Happy_ProccessDepositHardCapReached() (gas: -192 (-0.064%))
test_Happy_ProcessDepositButUserRemovesAllowance() (gas: -192 (-0.070%))
test_Happy_ProcessMultipleUserWithdrawals() (gas: -960 (-0.071%))
test_Happy_SkipQueuePosition() (gas: -192 (-0.085%))
test_Happy_userMultipleWithdrawals() (gas: -960 (-0.086%))
test_Fail_ProcessDepositInvalidQueuePosition() (gas: -192 (-0.105%))
test_Happy_userMakesDepositRequest() (gas: -192 (-0.106%))
test_Happy_UserMakeDeposit(uint8,uint128) (gas: -192 (-0.110%))
test_Happy_userMakesDepositRequestTwoAssets() (gas: -384 (-0.125%))
test_Happy_userMakesWithdrawalAndProcessed(uint8,uint8,uint128,uint128,uint128,uint128) (gas: -1384 (-0.163%))
Overall gas change: -7922 (-0.064%)
```

#### Developer Response
implemented.
[changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/0ea14f5eef38fb6e8d7050afcf9e693737d54e76)

## Informational Findings

### 1. Informational - Unused import

The identifier is imported but never used within the file.


#### Technical Details

```solidity
File: src/Vault.sol

6 | import {IAddressManifest} from "src/interfaces/IAddressManifest.sol";
```

[Vault.sol#L6](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L6)

#### Impact

Informational.

#### Recommendation

Remove the unused import.

#### Developer Response
Fixed.
[changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/7300dc45f28041f34e2e1635106389b790d93a33)

### 2. Informational - Typos

Typos were found in the codebase.

#### Technical Details

```solidity
File: src/Vault.sol

// @audit: processs should be processes, process
56 | /// @notice the queue for the backend to processs

// @audit: responisble should be responsible
134 | /// @dev the back-end is responisble for calling ProcessQueue with correct parameters.

// @audit: responisble should be responsible
153 | /// @dev the back-end is responisble for calling ProcessQueue with correct parameters.

// @audit: oustanding should be outstanding
274 | // decrease total oustanding shares balance
```

Vault.sol [56](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L56), [134](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L134), [153](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L153), [274](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L274)

#### Impact

Informational.

#### Recommendation

Fix typos.

#### Developer Response
Fixed.
[changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/7300dc45f28041f34e2e1635106389b790d93a33)

### 3. Informational - Refactor duplicated require()/revert() checks into a modifier or function

It is recommended to refactor duplicated require()/revert() checks into a modifier.

#### Technical Details

```solidity
File: src/Vault.sol

// @audit: Other occurrence found: src/Vault.sol:159
139 | if (approvedTokens[token] == false) revert(Errors.invalidToken);

// @audit: Other occurrence found: src/Vault.sol:139
159 | if (approvedTokens[token] == false) revert(Errors.invalidToken);
```

Vault.sol [139](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L139), [159](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L159)

#### Impact

Informational.

#### Recommendation

You should use a modifier to improve code clarity.

#### Developer Response
Acknowledged.

### 4. Informational - Unused error string

`amountIsZero` is not used.

#### Technical Details


```solidity
File: src/interfaces/Errors.sol

33 | string internal constant amountIsZero = "Amount cannot be zero";
```

[Errors.sol#L33](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/interfaces/Errors.sol#L33)

#### Impact

Informational.

#### Recommendation

Make sure it's not meant to be used and remove it if not.

#### Developer Response
Removed.
[changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/7300dc45f28041f34e2e1635106389b790d93a33)

### 5. Informational - Setters should have boundaries

It's recommended to have boundaries for the values set by the different update methods.

#### Technical Details
```solidity
File: Vault.sol
214 |    function updateGas(uint256 _processQueueGasUsage) external onlyOwner {
215 |        processQueueGasUsage = _processQueueGasUsage;
216 |
217 |        emit Events.GasUpdated(_processQueueGasUsage);
218 |    }
219 |
220 |    function updateHardCap(uint256 _hardCap) external onlyOwner {
221 |        hardCap = _hardCap;
222 |        emit Events.HardCapUpdated(_hardCap);
222 |    }
223 |
224 |    function updateVaultFee(uint256 _vaultFee) external onlyOwner {
225 |        vaultFee = _vaultFee;
226 |        emit Events.VaultFeeUpdated(_vaultFee);
227 |    }
```
[Vault.sol#L214-L228](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L214-L228)

#### Impact

Informational.

#### Recommendation

Add hard limits to prevent values from being set to low or too high.

#### Developer Response
Acknowledged.

### 6. Informational - `approvedSigner` can't be updated

`approvedSigner` is not updatable, it might be necessary to update it, we recommend adding a setter to `approvedSigner`.

#### Technical Details

A setter might be missing for `approvedSigner`, without it the contract will have to be updated before updating `approvedSigner`.

#### Impact

Informational.

#### Recommendation

Add a setter to `approvedSigner`.

#### Developer Response
Created function to update approved signer.
[changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/7300dc45f28041f34e2e1635106389b790d93a33)

### 7. Informational - Replace magic numbers with constants

Constant variables should be used in place of magic numbers to prevent typos and better explain such values.

#### Technical Details

For example, the unexplained number is [10000](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L277) can be replaced with the constant private variable maximum basis points. Another value is 0 used for `subAccountId` in the Ciao protocol when [approving the signer](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L89) and [for call deposit to the Ciao](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L260).

#### Impact

Informational.

#### Recommendation

Use constant variables instead of magic numbers. This will not change gas consumption.

#### Developer Response
Fixed.
[changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/7300dc45f28041f34e2e1635106389b790d93a33)

### 8. Informational - Use OpenZeppelin `forceApprove()` instead of approve

In case a token doesn't comply with the ERC20 approve method it's recommended to use `forceApprove()` from [SafeERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/932fddf69a699a9a80fd2396fd1a2ab91cdda123/contracts/token/ERC20/utils/SafeERC20.sol#L76)

#### Technical Details

```solidity
File: Vault.sol
231 |        approvedTokens[_token] = _approved;
232 |        if (_approved) {
233 |            IERC20(_token).approve(address(ciao), type(uint256).max);
234 |        } else {
235 |            IERC20(_token).approve(address(ciao), 0);
236 |        }
```
[Vault.sol#L231-L236](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L231-L236)


#### Impact

Informational.

#### Recommendation

Use `forceApprove()` instead of `approve()`.

#### Developer Response
implemented.
[changes](https://github.com/rysk-finance/mm-vault/pull/1/commits/7300dc45f28041f34e2e1635106389b790d93a33)

### 9. Informational - Missing event emits

Events can assist with analyzing the on-chain history of contracts and are therefore beneficial to add in important functions.

#### Technical Details

Function [`configureBlastGovernor()`](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L123) is changing state variable but do not have an event to track it.

#### Impact

Informational.

#### Recommendation

Add event to the function [`configureBlastGovernor()`](https://github.com/rysk-finance/mm-vault/blob/b7538f59f97846eda129435b7c0debe473360bf3/src/Vault.sol#L123).

#### Developer Response
acknowledged. Will likely never happen and governor updates for this contract are handled externally anyway under normal circumstances.

### 10. Informational - Change the value of `processQueueGasUsage`

The initial value of variable `processQueueGasUsage` is set to `2_000_000`. This number is too high if we compare it with the gas report from the tests.

#### Technical Details

Gas report values for the worst case scenario is `318_246`.

```
| Function Name                | min             | avg    | median | max    | # calls |
| processQueue                 | 2951            | 203161 | 315009 | 318246 | 1046    |
```

#### Impact

Informational.

#### Recommendation

Set lower value for `processQueueGasUsage`.

#### Developer Response
acknowledged - will update when we have more accurate data taking L1 calldata costs into account

## Final remarks

The MM Vault enables users to deposit and get shares of strategies on 100x Ciao protocol managed by Rysk. The strategies are managed by an off-chain system. Deposits and withdrawals are also handled by the off-chain system which puts a lot of trust in off-chain management.
