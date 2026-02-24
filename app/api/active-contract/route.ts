import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('contracts')
      .select('address, abi')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Fallback to env variable if no active contract in DB
      return NextResponse.json({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x23F417BBc7d15ed099A0a6B4556e616282F0D19E',
        abi: []
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[v0] Error fetching active contract:', error);
    return NextResponse.json({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x23F417BBc7d15ed099A0a6B4556e616282F0D19E',
      abi: []
    });
  }
}
