# GitHub SVG Generators

This repository contains multiple SVG generators for different purposes, allowing users to display live-updating visuals in their GitHub profiles or other platforms.

## How to Use

Follow these steps to set up and use any SVG generator in this repository.

### Fork & Clone the Repository

```sh
# Clone the repository
git clone https://github.com/your-username/repo-name.git
cd repo-name
```

### Set Up GitHub Actions Workflow

To automate SVG generation, create a workflow file inside `.github/workflows/`.

Example workflow file (`update-svgs.yml`):

```yaml
name: Update SVGs

on:
  schedule:
    - cron: "0 * * * *" # Runs every hour
  workflow_dispatch:

jobs:
  generate-svgs:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Set Up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm install

      - name: Generate SVGs
        run: node path/to/your-svg-script.js

      - name: Commit and Push Changes
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add .
          git commit -m "Updated SVGs" || exit 0
          git push
        env:
          GH_PAT: ${{ secrets.GH_PAT }}
```

### Set Up GitHub Secrets

Go to **GitHub Repository → Settings → Secrets and variables → Actions**, then:

- **Add a new secret** named `GH_PAT` with a **Personal Access Token (PAT)**.
- The token should have these permissions:
  - `repo → Contents (Read & Write)`
  - `workflow (Read & Write)`

### Run the Workflow

- **Manually trigger the workflow** via GitHub Actions (or wait for the scheduled run).
- The SVGs will be generated and updated in their respective folders.

## Available SVG Generators

- **GitHub Streak** → `githubstreak/streak.svg`
- *(Add more SVG generators here as needed)*

## Usage

To use an SVG in your `README.md`, embed it like this:

```md
![GitHub Streak](https://raw.githubusercontent.com/your-username/repo-name/main/githubstreak/streak.svg)
```

