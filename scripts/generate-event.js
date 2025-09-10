#!/usr/bin/env node
const fs = require("fs");
const { Octokit } = require("@octokit/rest");
require("dotenv").config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function main() {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
  if (!owner || !repo) {
    console.error("GITHUB_REPOSITORY missing in .env");
    process.exit(1);
  }

  const { data: prs } = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 1,
  });

  if (!prs.length) {
    console.error("No open PRs found");
    process.exit(1);
  }

  const pr = prs[0];

  const payload = {
    pull_request: {
      number: pr.number,
      title: pr.title,
      body: pr.body,
      user: { login: pr.user.login },
      head: { ref: pr.head.ref },
      base: { ref: pr.base.ref },
    },
  };

  fs.writeFileSync("event.json", JSON.stringify(payload, null, 2));
  console.log(`event.json created for PR #${pr.number} by ${pr.user.login}`);
}

main();
