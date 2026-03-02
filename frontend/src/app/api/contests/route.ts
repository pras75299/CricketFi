import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('match_id');
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'upcoming';

    if (!matchId) {
        return NextResponse.json({ error: "match_id is required" }, { status: 400 });
    }

    try {
        const whereClause: Record<string, string> = { matchId, status };
        if (type) whereClause.contestType = type;

        const contests = await prisma.contest.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { userTeams: true }
                }
            }
        });

        return NextResponse.json({
            data: contests.map((c: { id: string, name: string, contestType: string, entryFeeUsdc: number, prizePoolUsdc: number, maxTeams: number, _count: { userTeams: number }, winnerCount: number, status: string, guaranteedPool: boolean }) => ({
                id: c.id,
                name: c.name,
                contest_type: c.contestType,
                entry_fee_usdc: c.entryFeeUsdc,
                prize_pool_usdc: c.prizePoolUsdc,
                max_teams: c.maxTeams,
                current_teams: c._count.userTeams,
                winner_count: c.winnerCount,
                status: c.status,
                guaranteed_pool: c.guaranteedPool
            }))
        });
    } catch (error) {
        console.error("Error fetching contests:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
