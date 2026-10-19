export interface DifficultyCount {
    difficulty: "All" | "Easy" | "Medium" | "Hard";
    count: number;
}

export interface MatchedUser {
    profile: {
        ranking: number;
    };
    submitStats: {
        acSubmissionNum: DifficultyCount[];
    };
}

export interface GraphQLResponse {
    errors?: { message: string }[];
    data: {
        allQuestionsCount: DifficultyCount[];
        matchedUser: MatchedUser | null;
    };
}

export interface LeetCodeStats {
    solved: Record<DifficultyCount["difficulty"], number>;
    total: Record<DifficultyCount["difficulty"], number>;
    ranking: number;
}
