---

# 📘 Tx Agent API 문서

Base URL: `/tx-agent`

---

## 🔹 `GET /agent`

### 📝 설명  
현재 설정된 에이전트 주소를 조회합니다.

### ✅ 응답 예시

```json
{
  "success": true,
  "agent": "0x1234...abcd"
}
```

---

## 🔹 `POST /createAccount`

### 📝 설명  
특정 유저 지갑 주소로 프록시 계정을 생성합니다.

### 📥 요청 바디

```json
{
  "address": "0xUserWalletAddress"
}
```

### ✅ 응답 예시

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

### 📝 설명  
Dapp의 함수 호출 정보를 이용해 트랜잭션을 실행합니다.  
해당 Dapp에 대한 `DappModel` 이 존재해야 합니다.

### 📥 요청 바디

```json
{
  "userAddress": "0xuser...",
  "dappAddress": "0xdapp...",
  "method": "transfer",
  "params": {
    "to": "0xrecipient...",
    "amount": "1000000000000000000"
  },
  "tokenAddress": "0xerc20...",        // (optional) approve 대상 토큰 주소
  "approveAmount": "1000000000000000000" // (optional) approve 금액
}
```

### ✅ 응답 예시

```json
{
  "success": true,
  "message": "Transaction executed",
  "txHash": "0xabc123..."
}
```

---

## 🔹 `POST /createAgentRule`

### 📝 설명  
실행 조건이 포함된 자동화 트랜잭션 룰을 생성합니다.

### 📥 요청 바디

```json
{
  "dappName": "MockContract",
  "method": "testCall",
  "params": {},
  "userAddress": "0xuser...",
  "interval": 120,         // (optional) 실행 주기 (초 단위)
  "timeout": 10,           // (optional) 실행 전 지연시간 (초 단위)
  "maxExecutions": 3       // (optional) 최대 실행 횟수
}
```

> 내부적으로는 다음과 같은 구조로 DB에 저장됩니다 (RuleModel 기준):

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

### ✅ 응답 예시

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

### 📝 설명  
특정 유저의 자동 실행 룰 목록을 반환합니다.

### ✅ 응답 예시

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

## 📌 참고 스키마

### ✅ DappModel 구조 예시

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

### ✅ RuleModel 구조 예시

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
