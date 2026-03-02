import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const match = await prisma.match.findUnique({
            where: { id: params.id },
            include: {
                matchSquads: {
                    include: { player: true }
                }
            }
        });

        if (!match) {
            return NextResponse.json({ error: "Match not found" }, { status: 404 });
        }

        type SquadMember = { teamSide: string, creditValue: number | null, isPlayingXi: boolean, player: { id: string, name: string, role: string } };

        // Organize squad by side
        const homeSquad = match.matchSquads
            .filter((s: SquadMember) => s.teamSide === 'home')
            .map((s: SquadMember) => ({
                id: s.player.id,
                name: s.player.name,
                role: s.player.role,
                credits: s.creditValue,
                is_playing_xi: s.isPlayingXi
            }));

        const awaySquad = match.matchSquads
            .filter((s: SquadMember) => s.teamSide === 'away')
            .map((s: SquadMember) => ({
                id: s.player.id,
                name: s.player.name,
                role: s.player.role,
                credits: s.creditValue,
                is_playing_xi: s.isPlayingXi
            }));

        return NextResponse.json({
            id: match.id,
            series_name: match.seriesName,
            team_home: match.teamHome,
            team_away: match.teamAway,
            squad: {
                home: homeSquad,
                away: awaySquad
            },
            scorecard: match.scorecard
        });

    } catch (error) {
        console.error("Error fetching match details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
