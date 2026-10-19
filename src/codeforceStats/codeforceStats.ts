import fs from "fs";
import path from "path";
import { CodeforcesStats } from "./interfaces";

const USERNAME = "Berxwedan";
const OUTPUT = path.join("src", "svg", "codeforceStats.svg");

async function fetchCodeforceStats(username: string): Promise<CodeforcesStats> {
    const res = await fetch("https://codeforces.com/api/user.status?handle=" + username, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Referer: "https://codeforces.com",
            "User-Agent": "svg-generator",
        },
    });
    if (!res.ok) throw new Error(`Codeforces responded ${res.status}`);

    const data = await res.json();
    if (data.status !== "OK") throw new Error(`Codeforces API error: ${data.comment}`);

    const solved = new Set<number>();
    for (const submission of data.result) {
        if (submission.verdict === "OK") {
            solved.add(submission.problem.contestId * 1000 + submission.problem.index.charCodeAt(0));
        }
    }

    return {
        handle: username,
        solved: solved.size,
    };
}

function renderSVG({ handle, solved }: CodeforcesStats): string {
    return `<svg width="400" height="80" viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
    <rect x="0.5" y="0.5" width="399" height="79" rx="15" ry="15" fill="#282828" stroke="#282828"/>
    <text x="24" y="38" font-size="22" fill="#ebdbb2">Codeforces Solved: <tspan fill="#fe8019">${solved}</tspan></text>
    <text x="24" y="60" font-size="12" fill="#a89984">${handle}</text>
    </svg>`;
}

async function main() {
    const stats = await fetchCodeforceStats(USERNAME);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, renderSVG(stats));
    console.log(`Codeforces stats for ${USERNAME} saved to ${OUTPUT}`);
}

main().catch((error) => {
    console.error("Failed to generate Codeforces SVG:", error);
    process.exit(1);
});
