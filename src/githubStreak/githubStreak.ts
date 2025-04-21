import fs from 'fs';
import axios from "axios";
import { Contribution } from "./interfaces";

const username = "DenizIsikli"

async function fetchContributions() {
    try {
        const res = await axios.get(`https://github.com/users/${username}/contributions`);

        console.log(res.data);
    }
    catch (error) {
        console.error("Error fetching contributions:", error);
        throw error;
    }
}

async function generateSVG() {
    const streak = await fetchContributions();
    console.log(`Current Streak: ${streak} days`);

    // const svgContent = `
    // <svg width="400" height="120" xmlns="http://www.w3.org/2000/svg">
    //   <rect width="100%" height="100%" fill="#282828" rx="15" ry="15"/>
    //   <text x="50%" y="50%" font-size="24" fill="#ebdbb2" text-anchor="middle" alignment-baseline="middle" font-family="Arial, sans-serif">
    //     🔥 Current Streak: <tspan fill="#fe8019">${streak}</tspan> days 🔥
    //   </text>
    // </svg>`;
    //
    // fs.writeFileSync("src/svg/githubStreak.svg", svgContent);
    // console.log("SVG generated successfully!");
}

generateSVG();
