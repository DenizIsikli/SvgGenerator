import fs from "fs";
import path from "path";
import { Contribution } from "./interfaces";

const USERNAME = "DenizIsikli";
const OUTPUT = path.join("src", "svg", "githubStreak.svg");
const MAX_YEARS = 15;

async function fetchYear(year: number): Promise<Contribution[]> {
    const url = `https://github.com/users/${USERNAME}/contributions?from=${year}-01-01&to=${year}-12-31`;
    const res = await fetch(url, { headers: { "User-Agent": "svg-generator" } });
    if (!res.ok) throw new Error(`GitHub responded ${res.status} for ${url}`);

    return parseContributions(await res.text());
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

export function currentStreak(days: Contribution[], today: string): number {
    const active = new Set(days.filter((d) => d.level > 0).map((d) => d.date));
    const cursor = new Date(`${today}T00:00:00Z`);

    if (!active.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);

    let streak = 0;
    while (active.has(cursor.toISOString().slice(0, 10))) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return streak;
}

async function fetchStreak(): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);
    const thisYear = new Date().getUTCFullYear();
    const days: Contribution[] = [];

    for (let year = thisYear; year > thisYear - MAX_YEARS; year--) {
        days.push(...(await fetchYear(year)));

        const streak = currentStreak(days, today);
        const streakStart = new Date(`${today}T00:00:00Z`);
        streakStart.setUTCDate(streakStart.getUTCDate() - streak - 1);
        if (streakStart.getUTCFullYear() >= year) return streak;
    }

    return currentStreak(days, today);
}

function renderSVG(streak: number): string {
    return `<svg width="400" height="140" viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="399" height="139" rx="15" ry="15" fill="#282828" stroke="#282828"/>
    <text x="50%" y="50%" font-size="24" fill="#ebdbb2" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">
        Current Streak: <tspan fill="#fe8019">${streak}</tspan> days
    </text>
    </svg>`;
}

async function main() {
    const streak = await fetchStreak();
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, renderSVG(streak));
    console.log(`GitHub streak: ${streak} days, written to ${OUTPUT}`);
}

if (require.main === module) {
    main().catch((error) => {
        console.error("Failed to generate GitHub streak SVG:", error);
        process.exit(1);
    });
}
