const fs = require("fs");
const axios = require("axios");

const username = "DenizIsikli";

async function fetchContributions() {
    const url = `https://api.rigle.co/github-streak/stats/${username}`;
    try {
        const response = await axios.get(url);
        const { currentStreak } = response.data;
        
        return currentStreak.days || 0;
    } catch (error) {
        console.error("Error fetching contributions:", error);
        return 0;
    }
}

async function generateSVG() {
    const streak = await fetchContributions();

    const svgContent = `
    <svg width="400" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#282828" rx="15" ry="15"/>
      <text x="50%" y="50%" font-size="24" fill="#ebdbb2" text-anchor="middle" alignment-baseline="middle" font-family="Arial, sans-serif">
        🔥 Current Streak: <tspan fill="#fe8019">${streak}</tspan> days 🔥
      </text>
    </svg>`;

    fs.writeFileSync("streak.svg", svgContent);
    console.log("SVG generated successfully!");
}

generateSVG();
