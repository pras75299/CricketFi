import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const format = searchParams.get('format');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
        const whereClause: Record<string, string> = {};
        if (status) whereClause.status = status;
        if (format) whereClause.format = format;

        const matches = await prisma.match.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { contests: true }
                }
            },
            orderBy: { matchStartAt: 'asc' },
            take: limit,
            skip: offset,
        });

        const total = await prisma.match.count({ where: whereClause });

        return NextResponse.json({
            data: matches.map((m: { id: string, seriesName: string, teamHome: string, teamAway: string, venue: string | null, matchStartAt: Date, status: string, _count: { contests: number } }) => ({
                id: m.id,
                series_name: m.seriesName,
                team_home: m.teamHome,
                team_away: m.teamAway,
                venue: m.venue,
                match_start_at: m.matchStartAt,
                status: m.status,
                contests_count: m._count.contests
            })),
            total
        });
    } catch (error) {
        console.error("Error fetching matches:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
