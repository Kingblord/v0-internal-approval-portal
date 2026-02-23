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
    console.log('[v0] Relay API: Request received');
    
    // Verify this is called from server-side only
    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const rpcUrl = process.env.BSC_RPC_URL;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!relayerKey || !rpcUrl || !contractAddress) {
      console.error('[v0] Missing environment variables');
      return NextResponse.json(
        { error: 'Missing environment variables. Please configure RELAYER_PRIVATE_KEY, BSC_RPC_URL, and NEXT_PUBLIC_CONTRACT_ADDRESS.' },
        { status: 500 }
      );
    }

    const { user, token, amount, deadline, signature } = await request.json();
    console.log('[v0] Relay API: Parsed request body - User:', user, 'Token:', token, 'Amount:', amount, 'Deadline:', deadline);

    // Validate inputs
    if (!user || !token || !amount || !deadline || !signature) {
      console.error('[v0] Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!ethers.isAddress(user) || !ethers.isAddress(token)) {
      console.error('[v0] Invalid addresses - User:', user, 'Token:', token);
      return NextResponse.json(
        { error: 'Invalid addresses' },
        { status: 400 }
      );
    }

    // Clean and validate amount - convert string to BigInt
    let cleanAmount: bigint;
    try {
      cleanAmount = BigInt(amount);
      console.log('[v0] Relay API: Parsed amount as BigInt:', cleanAmount.toString());
    } catch (e) {
      console.error('[v0] Invalid amount format:', amount);
      return NextResponse.json(
        { error: 'Invalid amount format' },
        { status: 400 }
      );
    }

    // Clean signature - remove any whitespace
    const cleanSignature = signature.trim();
    console.log('[v0] Relay API: Signature length:', cleanSignature.length);

    console.log('[v0] Relay API: Creating relayer wallet and contract instance');
    const relayProvider = new ethers.JsonRpcProvider(rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerKey, relayProvider);
    const relayExecutor = new ethers.Contract(contractAddress, EXECUTOR_ABI, relayerWallet);
    console.log('[v0] Relay API: Relayer address:', relayerWallet.address);

    console.log('[v0] Relay API: Executing meta transaction...');
    const tx = await relayExecutor.executeMetaTx(user, token, cleanAmount, deadline, cleanSignature);
    console.log('[v0] Relay API: Transaction sent, hash:', tx.hash);
    
    console.log('[v0] Relay API: Waiting for confirmation...');
    const receipt = await tx.wait();
    console.log('[v0] Relay API: Transaction confirmed in block:', receipt?.blockNumber);

    return NextResponse.json(
      { 
        success: true,
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Relay API error:', error);
    console.error('[v0] Error details:', error?.message, error?.code, error?.reason);
    return NextResponse.json(
      { error: error?.message || 'Transaction relay failed' },
      { status: 500 }
    );
  }
}
