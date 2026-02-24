import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

const EXECUTOR_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "Incomingamount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "executeMetaTx",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export async function POST(request: NextRequest) {
  try {
    // Verify this is called from server-side only
    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const rpcUrl = process.env.BSC_RPC_URL;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!relayerKey || !rpcUrl || !contractAddress) {
      return NextResponse.json(
        { error: 'Missing environment variables. Please configure RELAYER_PRIVATE_KEY, BSC_RPC_URL, and NEXT_PUBLIC_CONTRACT_ADDRESS.' },
        { status: 500 }
      );
    }

    const { user, token, amount, deadline, signature } = await request.json();

    // Validate inputs
    if (!user || !token || !amount || !deadline || !signature) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!ethers.isAddress(user) || !ethers.isAddress(token)) {
      return NextResponse.json(
        { error: 'Invalid addresses' },
        { status: 400 }
      );
    }

    // Clean and validate amount - convert string to BigInt
    let cleanAmount: bigint;
    try {
      cleanAmount = BigInt(amount);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid amount format' },
        { status: 400 }
      );
    }

    // Clean signature - remove ALL internal whitespace (spaces can appear inside hex strings)
    const cleanSignature = signature.replace(/\s+/g, '');

    const relayProvider = new ethers.JsonRpcProvider(rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerKey, relayProvider);
    const relayExecutor = new ethers.Contract(contractAddress, EXECUTOR_ABI, relayerWallet);

    const tx = await relayExecutor.executeMetaTx(user, token, cleanAmount, deadline, cleanSignature);
    const receipt = await tx.wait();

    return NextResponse.json(
      { 
        success: true,
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Relay error:', error);
    return NextResponse.json(
      { error: error?.message || 'Transaction relay failed' },
      { status: 500 }
    );
  }
}
