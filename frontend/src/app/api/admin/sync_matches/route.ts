import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CricAPI } from '@/lib/cricapi';

export const dynamic = 'force-dynamic';

export async function POST() {
    // In production, you would want to add admin authentication here!

    try {
        const responseData = await CricAPI.getMatches(0);
        if (!responseData || responseData.status !== 'success') {
            return NextResponse.json({ error: "Failed to fetch matches from provider" }, { status: 502 });
        }

        const matches = responseData.data;
        let syncedCount = 0;

        for (const match of matches) {
            // Filter to only T20 or specific formats if desired, but we'll try to sync T20 mostly.
            if (!match.matchType || match.matchType.toLowerCase() !== 't20') {
                continue;
            }

            // CricAPI response structure mapping:
            const externalId = match.id;
            const seriesName = match.name.split(',')[0] || "Unknown Series";
            const teamHome = match.teams?.[0] || 'TBD';
            const teamAway = match.teams?.[1] || 'TBD';
            const venue = match.venue || 'TBD';
            const matchStartAt = new Date(match.dateTimeGMT);

            // Determine status mapping
            let status = 'upcoming';
            if (match.matchStarted && !match.matchEnded) {
                status = 'live';
            } else if (match.matchEnded) {
                status = 'completed';
            }

            await prisma.match.upsert({
                where: { externalId },
                update: {
                    status,
                    result: match.status,
                    matchStartAt,
                },
                create: {
                    externalId,
                    seriesName,
                    teamHome,
                    teamAway,
                    venue,
                    format: 'T20',
                    matchStartAt,
                    status,
                    result: match.status
                }
            });

            syncedCount++;
        }

        return NextResponse.json({
            message: "Successfully synchronized matches",
            count: syncedCount
        });

    } catch (error) {
        console.error("Error syncing matches:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
