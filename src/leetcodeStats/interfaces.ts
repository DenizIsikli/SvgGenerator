export interface MatchedUser {
  submitStats: {
    acSubmissionNum: Array<{ count: number }>;
    totalSubmissionNum: Array<{ count: number }>;
  };
  profile: {
    ranking: number;
    reputation: number;
  };
  contributions: {
    points: number;
  };
  submissionCalendar: string;
}

export interface AllQuestionsCount {
  difficulty: string;
  count: number;
}

export interface RecentSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
  __typename: string;
}

export interface GraphQLResponse {
  errors?: any;
  data: {
    allQuestionsCount: AllQuestionsCount[];
    matchedUser: MatchedUser;
    recentSubmissionList: RecentSubmission[];
  };
}

