export interface Theme {
    background: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
    easy: string;
    medium: string;
    hard: string;
}

export const gruvboxDark: Theme = {
    background: "#282828",
    border: "#282828",
    text: "#ebdbb2",
    muted: "#a89984",
    accent: "#fe8019",
    easy: "#b8bb26",
    medium: "#fabd2f",
    hard: "#fb4934",
};

export const monochrome: Theme = {
    background: "#0a0a0a",
    border: "#262626",
    text: "#f5f5f5",
    muted: "#8a8a8a",
    accent: "#ffffff",
    easy: "#d4d4d4",
    medium: "#a3a3a3",
    hard: "#737373",
};

export const tokyoNight: Theme = {
    background: "#1a1b26",
    border: "#292e42",
    text: "#c0caf5",
    muted: "#565f89",
    accent: "#7aa2f7",
    easy: "#9ece6a",
    medium: "#e0af68",
    hard: "#f7768e",
};

export const nord: Theme = {
    background: "#2e3440",
    border: "#3b4252",
    text: "#eceff4",
    muted: "#7b88a1",
    accent: "#88c0d0",
    easy: "#a3be8c",
    medium: "#ebcb8b",
    hard: "#bf616a",
};

export const theme: Theme = monochrome;
