"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const username = "DenizIsikli";
function fetchContributions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axios_1.default.get(`https://github.com/users/${username}/contributions`);
            console.log(res.data);
        }
        catch (error) {
            console.error("Error fetching contributions:", error);
            throw error;
        }
    });
}
function generateSVG() {
    return __awaiter(this, void 0, void 0, function* () {
        const streak = yield fetchContributions();
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
    });
}
generateSVG();
//# sourceMappingURL=githubStreak.js.map