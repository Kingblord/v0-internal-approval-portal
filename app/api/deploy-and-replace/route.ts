import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EXECUTOR_ABI } from '@/lib/blockchain';
import { EXECUTOR_BYTECODE } from '@/lib/contract-bytecode';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Verify relayer credentials
    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const rpcUrl = process.env.BSC_RPC_URL;

    if (!relayerKey || !rpcUrl) {
      return NextResponse.json(
        { error: 'Missing RELAYER_PRIVATE_KEY or BSC_RPC_URL environment variables' },
        { status: 500 }
      );
    }

    // Deploy new contract using relayer
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const relayerWallet = new ethers.Wallet(relayerKey, provider);

    console.log('[v0] Deploying new contract using relayer:', relayerWallet.address);

    // Clean bytecode - remove all whitespace
    const cleanBytecode = EXECUTOR_BYTECODE.replace(/\s/g, '');

    // Deploy contract
    const factory = new ethers.ContractFactory(EXECUTOR_ABI, cleanBytecode, relayerWallet);
    const deploymentTx = await factory.deploy();
    const deployedContract = await deploymentTx.waitForDeployment();
    const newContractAddress = await deployedContract.getAddress();

    console.log('[v0] Contract deployed at:', newContractAddress);

    // Update Supabase with new contract address
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contracts')
      .update({ is_active: false })
      .eq('is_active', true);

    if (error) {
      console.error('[v0] Error deactivating old contract:', error);
    }

    // Insert new active contract
    const { data: newContract, error: insertError } = await supabase
      .from('contracts')
      .insert({
        address: newContractAddress,
        abi: EXECUTOR_ABI,
        bytecode: cleanBytecode,
        is_active: true,
        deployed_at: new Date().toISOString(),
        deployed_by: relayerWallet.address,
        deployment_tx: deploymentTx.hash
      })
      .select()
      .single();

    if (insertError) {
      console.error('[v0] Error saving contract to database:', insertError);
      return NextResponse.json(
        { error: 'Contract deployed but failed to save to database: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contract deployed and activated successfully',
      contractAddress: newContractAddress,
      deploymentTx: deploymentTx.hash,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[v0] Deployment error:', error);
    return NextResponse.json(
      { error: 'Deployment failed: ' + error.message },
      { status: 500 }
    );
  }
}
