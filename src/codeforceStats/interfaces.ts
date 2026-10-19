export interface Submission {
    verdict?: string;
    problem: {
        contestId?: number;
        index: string;
        rating?: number;
    };
}

export interface CodeforcesStats {
    handle: string;
    solved: number;
    byRating: Map<number, number>;
}
