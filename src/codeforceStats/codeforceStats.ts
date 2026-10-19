import fs from "fs";
import path from "path";
import { theme } from "../themes/themes";
import { Submission, CodeforcesStats } from "./interfaces";

const USERNAME = "Berxwedan";
const OUTPUT = path.join("src", "svg", "codeforceStats.svg");

async function fetchSubmissions(handle: string): Promise<Submission[]> {
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    if (!res.ok) throw new Error(`Codeforces API responded with status ${res.status}`);

    const body = (await res.json()) as { status: string; comment?: string; result: Submission[] };
    if (body.status !== "OK") throw new Error(`Codeforces API error: ${body.comment}`);

    return body.result;
}

export function summarize(handle: string, submissions: Submission[]): CodeforcesStats {
    const solved = new Map<string, number | undefined>();

    for (const { verdict, problem } of submissions) {
        if (verdict !== "OK") continue;
        solved.set(`${problem.contestId}-${problem.index}`, problem.rating);
    }

    const byRating = new Map<number, number>();
    for (const rating of solved.values()) {
        if (rating !== undefined) byRating.set(rating, (byRating.get(rating) ?? 0) + 1);
    }

    return { handle, solved: solved.size, byRating };
}

function renderSVG({ handle, solved, byRating }: CodeforcesStats): string {
    const minRating = 800;
    const maxRating = Math.max(minRating, ...byRating.keys());
    const ratings: number[] = [];
    for (let r = minRating; r <= maxRating; r += 100) ratings.push(r);

    const chartLeft = 24;
    const chartWidth = 352;
    const chartBottom = 110;
    const chartHeight = 50;
    const slot = chartWidth / ratings.length;
    const barWidth = Math.max(2, slot * 0.7);
    const highest = Math.max(1, ...byRating.values());

    const bars = ratings
        .map((rating, i) => {
            const count = byRating.get(rating) ?? 0;
            const height = (chartHeight * count) / highest;
            const x = chartLeft + i * slot + (slot - barWidth) / 2;
            const bar = `<rect x="${x.toFixed(1)}" y="${(chartBottom - height).toFixed(1)}" width="${barWidth.toFixed(1)}" height="${height.toFixed(1)}" rx="2" fill="${theme.muted}"><title>${rating}: ${count}</title></rect>`;
            const label =
                rating % 400 === 0
                    ? `<text x="${(x + barWidth / 2).toFixed(1)}" y="126" font-size="9" fill="${theme.muted}" text-anchor="middle">${rating}</text>`
                    : "";
            return bar + label;
        })
        .join("\n    ");

    return `<svg width="400" height="140" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
    <rect x="0.5" y="0.5" width="399" height="139" rx="15" ry="15" fill="${theme.background}" stroke="${theme.border}"/>
    <text x="24" y="38" font-size="22" fill="${theme.text}">Codeforces Solved: <tspan fill="${theme.accent}">${solved}</tspan></text>
    <text x="376" y="38" font-size="12" fill="${theme.muted}" text-anchor="end">${handle}</text>
    ${bars}
    </svg>`;
}

async function main() {
    const stats = summarize(USERNAME, await fetchSubmissions(USERNAME));
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, renderSVG(stats));
    console.log(`Codeforces stats for ${USERNAME} saved to ${OUTPUT}`);
}

if (require.main === module) {
    main().catch((error) => {
        console.error("Failed to generate Codeforces SVG:", error);
        process.exit(1);
    });
}
