import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, bytecode, abi, contractAddress, functionName } = body;

    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const rpcUrl = process.env.BSC_RPC_URL;

    if (!relayerKey || !rpcUrl) {
      return NextResponse.json(
        { error: 'Missing environment variables' },
        { status: 500 }
      );
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerKey, provider);

    // Deploy new contract
    if (action === 'deploy') {
      if (!bytecode || !abi) {
        return NextResponse.json(
          { error: 'Bytecode and ABI required for deployment' },
          { status: 400 }
        );
      }

      const factory = new ethers.ContractFactory(abi, bytecode, relayerWallet);
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      const deployedAddress = await contract.getAddress();

      return NextResponse.json({
        contractAddress: deployedAddress,
        txHash: contract.deploymentTransaction()?.hash
      });
    }

    // Call contract function
    if (action === 'call') {
      if (!contractAddress || !functionName) {
        return NextResponse.json(
          { error: 'Contract address and function name required' },
          { status: 400 }
        );
      }

      const contract = new ethers.Contract(contractAddress, abi, relayerWallet);
      
      // Try to call the function
      if (typeof contract[functionName] === 'function') {
        const result = await contract[functionName]();
        return NextResponse.json({ result: result.toString() });
      }

      return NextResponse.json(
        { error: `Function ${functionName} not found` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[v0] Contract operation error:', error);
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
