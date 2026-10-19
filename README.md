# SvgGenerator

Self-hosted SVG cards for a GitHub profile README. Public stat-card services are often slow or time out, so a GitHub Actions workflow generates the cards every hour and commits them to this repository, where GitHub serves them as static files.

## Cards

| Card                          | File                        |
| ----------------------------- | --------------------------- |
| GitHub contribution streak    | `src/svg/githubStreak.svg`  |
| LeetCode solved by difficulty | `src/svg/leetcodeStats.svg` |

Embed a card in a README:

```md
![GitHub Streak](https://raw.githubusercontent.com/DenizIsikli/SvgGenerator/main/src/svg/githubStreak.svg)
![LeetCode Stats](https://raw.githubusercontent.com/DenizIsikli/SvgGenerator/main/src/svg/leetcodeStats.svg)
```

## How it works

The workflow in `.github/workflows/svgGenerator.yml` runs hourly. It compiles the TypeScript in `src/`, runs each generator, and commits the SVGs only if they changed. It pushes with the built-in `GITHUB_TOKEN`, so no personal access token is needed.

- **GitHub streak** reads the public contribution graph, year by year, until the streak ends.
- **LeetCode stats** queries LeetCode's GraphQL API.

## Running locally

Requires Node.js 20 or later.

```bash
npm install
npm run generate
```

## Using it for your own profile

1. Fork the repository.
2. Change `USERNAME` in `src/githubStreak/githubStreak.ts` and `src/leetcodeStats/leetcodeStats.ts`.
3. Run the workflow once from the **Actions** tab, then embed the cards using your own username in the URLs.

## License

MIT
