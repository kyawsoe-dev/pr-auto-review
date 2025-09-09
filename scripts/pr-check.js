#!/usr/bin/env node
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
import "dotenv/config";

function runCmd(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      resolve({ code: err ? err.code ?? 1 : 0, stdout, stderr });
    });
  });
}

async function main() {
  const repo = process.env.GITHUB_REPOSITORY;
  const eventPath = process.env.GITHUB_EVENT_PATH || "event.json";

  if (!repo || !fs.existsSync(eventPath)) {
    console.error("Missing GITHUB_REPOSITORY or event.json for local testing.");
    process.exit(1);
  }

  const [owner, name] = repo.split("/");
  const payload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  const prNumber = payload.pull_request.number;

  // Run lint and tests
  const lint = await runCmd("npm run lint");
  const test = await runCmd(
    "npm test -- --coverage --coverageReporters=json-summary"
  );

  // Read coverage
  let coveragePct = null;
  const covPath = path.join(process.cwd(), "coverage/coverage-summary.json");

  if (fs.existsSync(covPath)) {
    const cov = JSON.parse(fs.readFileSync(covPath, "utf8"));
    coveragePct = cov.total.lines.pct;
  } else {
    console.log("No coverage summary found, skipping coverage check.");
  }

  // Build comment
  let comment = "## Automated PR Review\n\n";
  comment += lint.code === 0 ? "✅ Lint passed\n" : "❌ Lint failed\n";
  comment += test.code === 0 ? "✅ Tests passed\n" : "❌ Tests failed\n";
  if (coveragePct !== null) comment += `Coverage: ${coveragePct}%\n`;

  // Post comment (only if valid token)
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== "dummy-token") {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    await octokit.rest.issues.createComment({
      owner,
      repo: name,
      issue_number: prNumber,
      body: comment,
    });
  } else {
    console.log("Skipping GitHub comment (dummy token).");
  }

  // Fail job if checks fail
  if (
    lint.code !== 0 ||
    test.code !== 0 ||
    (coveragePct !== null &&
      coveragePct < (process.env.COVERAGE_THRESHOLD || 80))
  ) {
    process.exit(1);
  }
}

main();
