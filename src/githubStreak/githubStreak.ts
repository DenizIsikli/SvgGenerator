import fs from "fs";
import path from "path";
import { Contribution } from "./interfaces";
import { theme } from "../themes/themes";

const USERNAME = "DenizIsikli";
const OUTPUT = path.join("src", "svg", "githubStreak.svg");

interface YearData {
    days: Contribution[];
    total: number;
}

export interface StreakStats {
    current: number;
    longest: number;
    since: string | null;
    totalContributions: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: string, amount: number): string {
    return new Date(Date.parse(`${date}T00:00:00Z`) + amount * DAY_MS).toISOString().slice(0, 10);
}

// The year the account was created, so every year with possible contributions gets loaded.
async function fetchFirstYear(): Promise<number> {
    const headers: Record<string, string> = { "User-Agent": "svg-generator" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const res = await fetch(`https://api.github.com/users/${USERNAME}`, { headers });
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

    const { created_at } = (await res.json()) as { created_at: string };
    return new Date(created_at).getUTCFullYear();
}

async function fetchYear(year: number): Promise<YearData> {
    const url = `https://github.com/users/${USERNAME}/contributions?from=${year}-01-01&to=${year}-12-31`;
    const res = await fetch(url, { headers: { "User-Agent": "svg-generator" } });
    if (!res.ok) throw new Error(`GitHub responded ${res.status} for ${url}`);

    const html = await res.text();
    return { days: parseContributions(html), total: parseTotal(html) };
}

export function parseContributions(html: string): Contribution[] {
    const days: Contribution[] = [];

    for (const [cell] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
        const date = cell.match(/\bdata-date="([^"]+)"/)?.[1];
        const level = cell.match(/\bdata-level="(\d+)"/)?.[1];
        if (date && level !== undefined) days.push({ date, level: Number(level) });
    }

    return days;
}

export function parseTotal(html: string): number {
    const match = html.match(/([\d,]+)\s+contributions?\s+in\s+\d{4}/);
    if (!match) throw new Error("Could not find the yearly contribution total");
    return Number(match[1].replace(/,/g, ""));
}

export function streakStats(days: Contribution[], today: string, totalContributions: number): StreakStats {
    const active = new Set(days.filter((d) => d.level > 0).map((d) => d.date));

    let cursor = active.has(today) ? today : addDays(today, -1);
    let current = 0;
    while (active.has(cursor)) {
        current++;
        cursor = addDays(cursor, -1);
    }

    let longest = 0;
    let run = 0;
    let previous: string | null = null;
    for (const date of [...active].sort()) {
        run = previous !== null && addDays(previous, 1) === date ? run + 1 : 1;
        longest = Math.max(longest, run);
        previous = date;
    }

    return {
        current,
        longest,
        since: current > 0 ? addDays(cursor, 1) : null,
        totalContributions,
    };
}

async function fetchStats(): Promise<StreakStats> {
    const today = new Date().toISOString().slice(0, 10);
    const thisYear = new Date().getUTCFullYear();
    const firstYear = await fetchFirstYear();

    const days: Contribution[] = [];
    let total = 0;
    for (let year = thisYear; year >= firstYear; year--) {
        const data = await fetchYear(year);
        days.push(...data.days);
        total += data.total;
    }

    return streakStats(days, today, total);
}

function formatDate(date: string): string {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

export function renderSVG({ current, longest, since, totalContributions }: StreakStats): string {
    const sinceText = since ? `since ${formatDate(since)}` : "no active streak";

    return `<svg width="400" height="140" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">
    <rect x="0.5" y="0.5" width="399" height="139" rx="15" ry="15" fill="${theme.background}" stroke="${theme.border}"/>
    <text x="376" y="38" font-size="12" fill="${theme.muted}" text-anchor="end">Longest ${longest.toLocaleString("en-US")}</text>
    <text x="24" y="66"><tspan font-size="44" font-weight="bold" fill="${theme.accent}">${current.toLocaleString("en-US")}</tspan><tspan dx="10" font-size="16" fill="${theme.muted}">day streak</tspan></text>
    <text x="24" y="96" font-size="14" fill="${theme.text}">${totalContributions.toLocaleString("en-US")} total contributions</text>
    <text x="24" y="116" font-size="12" fill="${theme.muted}">${sinceText}</text>
</svg>
`;
}

async function main() {
    const stats = await fetchStats();
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, renderSVG(stats));
    console.log(
        `GitHub streak: ${stats.current} days, ${stats.totalContributions} contributions, written to ${OUTPUT}`,
    );
}

if (require.main === module) {
    main().catch((error) => {
        console.error("Failed to generate GitHub streak SVG:", error);
        process.exit(1);
    });
}
