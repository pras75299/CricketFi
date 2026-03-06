export class CricAPI {
    private static readonly API_KEY = process.env.CRICAPI_KEY || '';
    private static readonly BASE_URL = 'https://api.cricapi.com/v1';

    private static async fetchCricApi(endpoint: string, params: Record<string, string> = {}) {
        if (!this.API_KEY) {
            console.warn("CRICAPI_KEY is not set in environment variables");
            return null;
        }

        const url = new URL(`${this.BASE_URL}${endpoint}`);
        url.searchParams.append('apikey', this.API_KEY);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

        try {
            const response = await fetch(url.toString(), { next: { revalidate: 60 } });
            const data = await response.json();

            if (data.status !== "success") {
                console.error("CricAPI Error:", data.reason);
                return null;
            }

            return data;
        } catch (error) {
            console.error("Failed to fetch from CricAPI:", error);
            return null;
        }
    }

    /**
     * Fetch current and upcoming matches
     */
    static async getMatches(offset: number = 0) {
        return this.fetchCricApi('/matches', { offset: offset.toString() });
    }

    /**
     * Fetch match info including squads and player details
     */
    static async getMatchInfo(matchId: string) {
        return this.fetchCricApi('/match_info', { id: matchId });
    }

    /**
     * Fetch live score for a specific match
     */
    static async getLiveScore(matchId: string) {
        return this.fetchCricApi('/match_scorecard', { id: matchId });
    }
}
