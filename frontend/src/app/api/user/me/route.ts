import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // TODO: Use actual auth
    // const userId = "mock-user-id"; 

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized / Missing user_id" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: user.id,
            wallet: user.walletAddress,
            username: user.username,
            level: user.level,
            stats: {
                total_contests: user.totalContests,
                total_wins: user.totalWins,
                total_earnings_usdc: user.totalEarnings,
                win_rate: user.totalContests > 0
                    ? ((user.totalWins / user.totalContests) * 100).toFixed(2)
                    : 0
            }
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { user_id, username, avatar_url } = body;

        if (!user_id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user_id },
            data: {
                ...(username && { username }),
                ...(avatar_url && { avatarUrl: avatar_url }),
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
