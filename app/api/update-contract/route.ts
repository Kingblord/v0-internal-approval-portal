import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONTRACT_STORAGE_PATH = path.join(process.cwd(), 'data', 'contract-address.json');

function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function saveContractAddress(address: string) {
  ensureDataDirectory();
  const data = {
    address,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(CONTRACT_STORAGE_PATH, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const { contractAddress } = await request.json();

    if (!contractAddress || !contractAddress.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid contract address' },
        { status: 400 }
      );
    }

    // Save the contract address universally
    saveContractAddress(contractAddress);

    return NextResponse.json({
      success: true,
      contractAddress,
      message: 'Contract address updated universally for all users.'
    });

  } catch (error: any) {
    console.error('[v0] Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update contract address' },
      { status: 500 }
    );
  }
}
