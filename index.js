const { Toolkit } = require("actions-toolkit");
const fs = require("fs");
const fm = require("front-matter");
const path = require("path");
const nunjucks = require("nunjucks");
const dashify = require("dashify");

Toolkit.run(
  async tools => {
    const template = process.env.TEMPLATE_FILE || "./actions/template.md";
    const contentPath = process.env.CONTENT_PATH || "./content/docs/";
    const env = nunjucks.configure({ autoescape: false });

    tools.log.debug("context", tools.context);

    const {
      repository: { issue }
    } = await tools.github.graphql(
      `query issue($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $number) {
          title
          number
          author {
            ... on User {
              name
            }
          }
          createdAt
          body
          labels(first: 10) {
            totalCount
            edges {
              node {
                name
              }
            }
          }
        }
      }
    }`,
      {
        owner: tools.context.payload.repository.owner.login,
        repo: tools.context.payload.repository.name,
        number: tools.context.payload.issue.number
      }
    );

    const labels = issue.labels.edges.map(label => label.node.name);
    // Check that the issue's labels matches a certain type
    if (
      !issue.labels.totalCount ||
      !labels.includes(process.env.VALID_ISSUE_LABEL || "paper")
    ) {
      tools.exit.neutral("No VALID_ISSUE_LABEL found in the issue, skipping");
    }

    // Convert the issue's body to a front matter JSON
    const { attributes, body } = fm(issue.body);
    tools.log.info(`Front matter for issue #${issue.number} is`, attributes);

    // Create the .md file
    var templateContent = fs.readFileSync(template, "utf8");
    const templated = env.renderString(templateContent, {
      body,
      title: issue.title,
      createdAt: issue.createdAt,
      tags: labels,
      author: issue.author.name,
      notes: attributes.notes,
      source: attributes.source
    });

    // Commit file
    const fileToCommit = path.join(contentPath, dashify(issue.title) + ".md");
    const err = fs.writeFileSync(fileToCommit, templated);
    tools.log.info(`${fileToCommit} created`);
  },
  {
    event: ["issues.closed"],
    secrets: ["GITHUB_TOKEN"]
  }
);
