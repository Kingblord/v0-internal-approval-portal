import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { contractAddress } = await request.json();

    if (!contractAddress || !contractAddress.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Invalid contract address' },
        { status: 400 }
      );
    }

    // In a production environment, you would update this in a database
    // For now, we'll return the address to be stored in localStorage or state
    return NextResponse.json({
      success: true,
      contractAddress,
      message: 'Contract address updated. Please set NEXT_PUBLIC_CONTRACT_ADDRESS environment variable for persistence.'
    });

  } catch (error: any) {
    console.error('[v0] Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update contract address' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const currentAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not set';
  
  return NextResponse.json({
    contractAddress: currentAddress,
    message: 'Current contract address retrieved'
  });
}
