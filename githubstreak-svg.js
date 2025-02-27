const fs = require("fs");
const axios = require("axios");

const username = "DenizIsikli"; // Change this to your username

async function fetchContributions() {
    const url = `https://api.github.com/users/${username}/events/public`;
    try {
        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        const events = response.data;
        let streak = 0;
        let lastDate = null;

        events.forEach(event => {
            // Only count contributions (commits, PRs, issues)
            if (["PushEvent", "PullRequestEvent", "IssuesEvent"].includes(event.type)) {
                const eventDate = new Date(event.created_at).toDateString();
                if (eventDate !== lastDate) {
                    streak++;
                    lastDate = eventDate;
                }
            }
        });

        return streak;
    } catch (error) {
        console.error("Error fetching contributions:", error);
        return 0;
    }
}

async function generateSVG() {
    const streak = await fetchContributions();

    const svgContent = `
    <svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="black"/>
      <text x="50%" y="50%" font-size="24" fill="white" text-anchor="middle" alignment-baseline="middle">
        🔥 Current Streak: ${streak} days 🔥
      </text>
    </svg>`;

    fs.writeFileSync("streak.svg", svgContent);
    console.log("SVG generated successfully!");
}

generateSVG();
