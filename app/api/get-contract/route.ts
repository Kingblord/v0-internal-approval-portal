import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CONTRACT_STORAGE_PATH = path.join(process.cwd(), 'data', 'contract-address.json');

export async function GET(request: NextRequest) {
  try {
    // Check if file exists
    if (!fs.existsSync(CONTRACT_STORAGE_PATH)) {
      // Return default from env if no file exists
      const defaultAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not set';
      return NextResponse.json({
        address: defaultAddress,
        source: 'environment',
        updatedAt: null
      });
    }

    // Read from file
    const fileContent = fs.readFileSync(CONTRACT_STORAGE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json({
      address: data.address,
      source: 'deployed',
      updatedAt: data.updatedAt
    });

  } catch (error: any) {
    console.error('[v0] Error reading contract address:', error);
    
    // Fallback to environment variable
    const defaultAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not set';
    return NextResponse.json({
      address: defaultAddress,
      source: 'environment',
      updatedAt: null
    });
  }
}
