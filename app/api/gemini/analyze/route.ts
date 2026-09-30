import { NextRequest, NextResponse } from 'next/server';
import { analyzeCapabilityWithGemini } from '@/lib/gemini';
import { PHC, ServiceCapabilityResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetPHC, serviceCapability, nearbyPHCsSummary } = body as {
      targetPHC: PHC;
      serviceCapability: ServiceCapabilityResult;
      nearbyPHCsSummary: { name: string; distanceKm: number; hasTechnician: boolean; techniciansAvailable: number }[];
    };

    if (!targetPHC || !serviceCapability) {
      return NextResponse.json(
        { error: 'Missing required parameters (targetPHC or serviceCapability).' },
        { status: 400 }
      );
    }

    const analysis = await analyzeCapabilityWithGemini(
      targetPHC,
      serviceCapability,
      nearbyPHCsSummary || []
    );

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze:', error);
    return NextResponse.json(
      { error: 'Internal server error processing AI capability reasoning.' },
      { status: 500 }
    );
  }
}
