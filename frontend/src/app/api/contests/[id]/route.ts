import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const contest = await prisma.contest.findUnique({
            where: { id: params.id }
        });

        if (!contest) {
            return NextResponse.json({ error: "Contest not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: contest.id,
            prize_distribution: typeof contest.prizeDistribution === 'string'
                ? JSON.parse(contest.prizeDistribution)
                : contest.prizeDistribution,
            on_chain_address: contest.onChainAddress,
            entry_fee_usdc: contest.entryFeeUsdc,
            prize_pool_usdc: contest.prizePoolUsdc,
            status: contest.status
        });

    } catch (error) {
        console.error("Error fetching contest details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
