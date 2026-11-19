import fs from "fs";
import path from "path";
import {
    Contribution,
    CONTRIBUTION_LEVELS,
    CONTRIBUTIONS_QUERY,
    ContributionsData,
    CREATED_AT_QUERY,
    CreatedAtData,
    GraphQLResponse,
} from "./interfaces";
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

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN is not set");

    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "svg-generator",
        },
        body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) throw new Error(`GitHub GraphQL responded ${res.status}`);

    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
    if (!json.data) throw new Error("GitHub GraphQL returned no data");
    return json.data;
}

async function fetchFirstYear(): Promise<number> {
    const { user } = await graphql<CreatedAtData>(CREATED_AT_QUERY, { login: USERNAME });
    return new Date(user.createdAt).getUTCFullYear();
}

async function fetchYear(year: number): Promise<YearData> {
    const yearEnd = new Date(`${year}-12-31T23:59:59Z`);
    const to = yearEnd.getTime() > Date.now() ? new Date() : yearEnd;

    const { user } = await graphql<ContributionsData>(CONTRIBUTIONS_QUERY, {
        login: USERNAME,
        from: `${year}-01-01T00:00:00Z`,
        to: to.toISOString(),
    });
    const calendar = user.contributionsCollection.contributionCalendar;

    return {
        days: calendar.weeks.flatMap((week) =>
            week.contributionDays.map((day) => ({
                date: day.date,
                level: CONTRIBUTION_LEVELS[day.contributionLevel],
            })),
        ),
        total: calendar.totalContributions,
    };
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
