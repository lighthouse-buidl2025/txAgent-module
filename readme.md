---

# 📘 Tx Agent API Documentation

**Base URL:** `/tx-agent`

---

## 🔹 `GET /agent`

### 📝 Description  
Returns the currently configured Agent address.

### ✅ Sample Response

```json
{
  "success": true,
  "agent": "0x1234...abcd"
}
```

---

## 🔹 `POST /createAccount`

### 📝 Description  
Creates a proxy account for the specified user wallet address.

### 📥 Request Body

```json
{
  "address": "0xUserWalletAddress"
}
```

### ✅ Sample Response

```json
{
  "success": true,
  "message": "Account mapping created",
  "data": {
    "userAddress": "0xuser...",
    "agentAddress": "0xproxy..."
  }
}
```

---

## 🔹 `POST /executeTransaction`

### 📝 Description  
Executes a transaction using function information from a DApp.  
The target DApp must already exist in the `DappModel` collection.

### 📥 Request Body

```json
{
  "userAddress": "0xuser...",
  "dappAddress": "0xdapp...",
  "method": "transfer",
  "params": {
    "to": "0xrecipient...",
    "amount": "1000000000000000000"
  },
  "tokenAddress": "0xerc20...",         // (optional) Token address for approval
  "approveAmount": "1000000000000000000" // (optional) Approval amount
}
```

### ✅ Sample Response

```json
{
  "success": true,
  "message": "Transaction executed",
  "txHash": "0xabc123..."
}
```

---

## 🔹 `POST /createAgentRule`

### 📝 Description  
Creates an automated transaction rule with optional execution conditions.

### 📥 Request Body

```json
{
  "dappName": "MockContract",
  "method": "testCall",
  "params": {},
  "userAddress": "0xuser...",
  "interval": 120,       // (optional) Execution interval in seconds
  "timeout": 10,         // (optional) Delay before execution in seconds
  "maxExecutions": 3     // (optional) Maximum number of executions
}
```

> Internally, the rule is stored in the database using the following structure (based on `RuleModel`):

```ts
{
  dappName,
  method,
  params,
  userAddress,
  extra: {
    intervalSeconds,
    timeoutSeconds,
    maxExecutions,
    executedCount,
    lastExecutedAt
  }
}
```

### ✅ Sample Response

```json
{
  "success": true,
  "message": "Agent rule created",
  "data": {
    "_id": "644...",
    "dappName": "MockContract",
    "method": "testCall",
    "params": {},
    "userAddress": "0xuser...",
    "extra": {
      "intervalSeconds": 120,
      "timeoutSeconds": 10,
      "maxExecutions": 3
    }
  }
}
```

---

## 🔹 `GET /getRules/:address`

### 📝 Description  
Returns a list of automation rules created by the specified user.

### ✅ Sample Response

```json
{
  "success": true,
  "message": "Rules fetched",
  "data": [
    {
      "_id": "abc123...",
      "dappName": "MockContract",
      "method": "testCall",
      "params": {},
      "userAddress": "0xuser...",
      "extra": {
        "intervalSeconds": 120,
        "timeoutSeconds": 10,
        "maxExecutions": 3,
        "executedCount": 1
      }
    }
  ]
}
```

---

## 📌 Reference Schemas

### ✅ Example: `DappModel` Structure

```ts
{
  name: 'ERC20',
  address: '0xTokenAddress...',
  method: 'transfer',
  calldataTemplate: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ],
  requiresApproval: true
}
```

### ✅ Example: `RuleModel` Structure

```ts
{
  dappName: 'ERC20',
  method: 'transfer',
  params: {
    to: '0x...',
    amount: '1000000000000000000'
  },
  userAddress: '0xuser...',
  extra: {
    intervalSeconds: 120,
    timeoutSeconds: 10,
    maxExecutions: 3,
    executedCount: 0
  }
}
```

---
