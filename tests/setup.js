const path = require("path");

Object.assign(process.env, {
  GITHUB_REPOSITORY: "posos-tech/waddup",
  GITHUB_ACTION: "action-issue-to-markdown",
  GITHUB_EVENT_PATH: path.join(__dirname, "fixtures", "event.json"),
  GITHUB_WORKSPACE: path.join(__dirname, "fixtures")
});
