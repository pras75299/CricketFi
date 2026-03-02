import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    // TODO: Add proper JWT Token Verification / Header Auth logic
    // const authHeader = request.headers.get('Authorization');
    // const userId = verifyAndExtractUserId(authHeader);

    // For MVP development, we assume user_id is passed in payload

    try {
        const body = await request.json();
        const { contest_id, team_name, players, user_id } = body;

        // 1. Basic Validation
        if (!contest_id || !players || players.length !== 11 || !user_id) {
            return NextResponse.json({ error: "Invalid team payload. Must have 11 players." }, { status: 400 });
        }

        // Identify Captain and Vice Captain
        const captain = players.find((p: { player_id: number, credits: number, is_captain: boolean, is_vice_captain: boolean }) => p.is_captain);
        const viceCaptain = players.find((p: { player_id: number, credits: number, is_captain: boolean, is_vice_captain: boolean }) => p.is_vice_captain);

        if (!captain || !viceCaptain) {
            return NextResponse.json({ error: "Captain and Vice-Captain are required." }, { status: 400 });
        }

        // 2. Database Creation
        const team = await prisma.userTeam.create({
            data: {
                contestId: contest_id,
                userId: user_id, // Replace with dynamic auth user ID
                teamName: team_name || "My Team",
                players: players, // Store JSON array directly
                captainPlayerId: captain.player_id,
                vcPlayerId: viceCaptain.player_id,
                creditsUsed: players.reduce((sum: number, p: { player_id: number, credits: number, is_captain: boolean, is_vice_captain: boolean }) => sum + (p.credits || 0), 0)
            }
        });

        return NextResponse.json({
            team_id: team.id,
            credits_used: team.creditsUsed,
            valid: true
            // on_chain_tx logic expected to be constructed on the client and sent to Anchor manually or generated here via a backend signer
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating team:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
