import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ERC20 ABI - just need approve function
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

type SupportedNetwork = 'ethereum' | 'bsc';

const getNetworkConfig = (network: SupportedNetwork) => {
  if (network === 'bsc') {
    return {
      rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed1.binance.org',
      contractAddress: process.env.NEXT_PUBLIC_BSC_CONTRACT_ADDRESS || '0x',
      tokenAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    };
  }
  return {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum.publicnode.com',
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x',
    tokenAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  };
};

export async function POST(request: NextRequest) {
  try {
    const { userAddress, network } = await request.json();

    if (!userAddress || !ethers.isAddress(userAddress)) {
      return NextResponse.json({ error: 'Invalid user address' }, { status: 400 });
    }

    if (!network || !['ethereum', 'bsc'].includes(network)) {
      return NextResponse.json({ error: 'Invalid network' }, { status: 400 });
    }

    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    if (!relayerKey) {
      console.error('[v0] Missing RELAYER_PRIVATE_KEY');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const config = getNetworkConfig(network as SupportedNetwork);

    console.log(`[v0] Triggering approval on ${network} for user:`, userAddress);

    // Create provider and relayer wallet
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerKey, provider);

    // Create token contract instance
    const tokenContract = new ethers.Contract(config.tokenAddress, ERC20_ABI, relayerWallet);

    // Approve unlimited allowance
    const approveTx = await tokenContract.approve(
      config.contractAddress,
      ethers.MaxUint256,
      {
        gasLimit: 100000,
      }
    );

    console.log(`[v0] Approval tx sent on ${network}:`, approveTx.hash);

    // Wait for confirmation
    const receipt = await approveTx.wait(1);

    console.log(`[v0] Approval confirmed in block ${receipt?.blockNumber}`);

    return NextResponse.json(
      {
        success: true,
        userAddress,
        tokenAddress: config.tokenAddress,
        spenderAddress: config.contractAddress,
        network,
        txHash: approveTx.hash,
        blockNumber: receipt?.blockNumber,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Approval error:', error);
    return NextResponse.json(
      { error: error?.message || 'Approval failed' },
      { status: 500 }
    );
  }
}
