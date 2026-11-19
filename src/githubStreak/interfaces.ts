export interface Contribution {
    date: string;
    level: number;
}

export type ContributionLevel = "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";

export const CONTRIBUTION_LEVELS: Record<ContributionLevel, number> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
};

export interface GraphQLResponse<T> {
    data?: T;
    errors?: { message: string }[];
}

export interface CreatedAtData {
    user: { createdAt: string };
}

export interface ContributionsData {
    user: {
        contributionsCollection: {
            contributionCalendar: {
                totalContributions: number;
                weeks: {
                    contributionDays: {
                        date: string;
                        contributionLevel: ContributionLevel;
                    }[];
                }[];
            };
        };
    };
}

export const CREATED_AT_QUERY = `
    query ($login: String!) {
        user(login: $login) {
            createdAt
        }
    }
`;

export const CONTRIBUTIONS_QUERY = `
    query ($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays {
                            date
                            contributionLevel
                        }
                    }
                }
            }
        }
    }
`;
