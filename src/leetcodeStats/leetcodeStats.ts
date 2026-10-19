import fs from "fs";
import path from "path";
import userProfileQuery from "./graphQuery";
import { DifficultyCount, GraphQLResponse, LeetCodeStats } from "./interfaces";

const USERNAME = "DenizIsikli";
const OUTPUT = path.join("src", "svg", "leetcodeStats.svg");

function byDifficulty(list: DifficultyCount[]): LeetCodeStats["solved"] {
    const result = { All: 0, Easy: 0, Medium: 0, Hard: 0 };
    for (const { difficulty, count } of list) result[difficulty] = count;
    return result;
}

async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats> {
    const res = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Referer: "https://leetcode.com",
            "User-Agent": "svg-generator",
        },
        body: JSON.stringify({ query: userProfileQuery, variables: { username } }),
    });
    if (!res.ok) throw new Error(`LeetCode responded ${res.status}`);

    const { data, errors } = (await res.json()) as GraphQLResponse;
    if (errors?.length) throw new Error(`LeetCode GraphQL error: ${errors[0].message}`);
    if (!data.matchedUser) throw new Error(`LeetCode user "${username}" not found`);

    return {
        solved: byDifficulty(data.matchedUser.submitStats.acSubmissionNum),
        total: byDifficulty(data.allQuestionsCount),
        ranking: data.matchedUser.profile.ranking,
    };
}

function renderSVG({ solved, total, ranking }: LeetCodeStats): string {
    const rows = [
        { label: "Easy", color: "#b8bb26", y: 70 },
        { label: "Medium", color: "#fabd2f", y: 92 },
        { label: "Hard", color: "#fb4934", y: 114 },
    ] as const;

    const rowSvg = rows
        .map(
            ({ label, color, y }) =>
                `<text x="24" y="${y}" font-size="14" fill="${color}">${label}</text>
    <text x="376" y="${y}" font-size="14" fill="#ebdbb2" text-anchor="end">${solved[label]} / ${total[label]}</text>`,
        )
        .join("\n    ");

    return `<svg width="400" height="140" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
    <rect x="0.5" y="0.5" width="399" height="139" rx="15" ry="15" fill="#282828" stroke="#282828"/>
    <text x="24" y="38" font-size="22" fill="#ebdbb2">LeetCode Solved: <tspan fill="#fe8019">${solved.All}</tspan></text>
    <text x="376" y="38" font-size="12" fill="#a89984" text-anchor="end">Rank ${ranking.toLocaleString("en-US")}</text>
    ${rowSvg}
    </svg>`;
}

async function main() {
    const stats = await fetchLeetCodeStats(USERNAME);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, renderSVG(stats));
    console.log(`LeetCode solved: ${stats.solved.All}, written to ${OUTPUT}`);
}

main().catch((error) => {
    console.error("Failed to generate LeetCode SVG:", error);
    process.exit(1);
});
