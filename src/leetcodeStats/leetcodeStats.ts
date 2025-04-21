import * as fs from 'fs';
import userProfileQuery from './graphQuery';
import { GraphQLResponse } from './interfaces';

const formatData = (data: GraphQLResponse['data']) => {
    return {
        totalSolved: data.matchedUser.submitStats.acSubmissionNum[0].count,
        totalSubmissions: data.matchedUser.submitStats.totalSubmissionNum,
        totalQuestions: data.allQuestionsCount[0].count,
        easySolved: data.matchedUser.submitStats.acSubmissionNum[1].count,
        totalEasy: data.allQuestionsCount[1].count,
        mediumSolved: data.matchedUser.submitStats.acSubmissionNum[2].count,
        totalMedium: data.allQuestionsCount[2].count,
        hardSolved: data.matchedUser.submitStats.acSubmissionNum[3].count,
        totalHard: data.allQuestionsCount[3].count,
        ranking: data.matchedUser.profile.ranking,
        contributionPoint: data.matchedUser.contributions.points,
        reputation: data.matchedUser.profile.reputation,
        submissionCalendar: JSON.parse(data.matchedUser.submissionCalendar),
        recentSubmissions: data.recentSubmissionList,
        matchedUserStats: data.matchedUser.submitStats
    };
}

async function fetchLeetCodeData(user: string): Promise<any> {
    try {
        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            },
            body: JSON.stringify({ query: userProfileQuery, variables: { username: user } }),
        });
        
        const result = await response.json();

        const typedResult = result as GraphQLResponse;

        if (typedResult.errors) {
            throw new Error(`Error fetching data: ${typedResult.errors[0].message}`);
        } else {
            return formatData(typedResult.data);
        }
    }
    catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}


async function generateSVG(user: string) {
    const stats = await fetchLeetCodeData(user);

    const svgContent = `
    <svg width="400" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#282828" rx="15" ry="15"/>
        <text x="50%" y="50%" font-size="24" fill="#ebdbb2" text-anchor="middle" alignment-baseline="middle" font-family="Arial, sans-serif">
            🔥 Current Streak: <tspan fill="#fe8019">${stats.totalSolved}</tspan> days 🔥
        </text>
    </svg>`;

    fs.writeFileSync("../svg/leetcodeStats.svg", svgContent);
    console.log("SVG generated successfully!");
}

generateSVG("DenizIsikli");

