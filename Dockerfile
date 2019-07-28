FROM node:10-alpine

LABEL "com.github.actions.name"="GitHub Actions that converts an issue to a markdown"
LABEL "com.github.actions.description"="A GitHub Action that converts an issue to markdowon and commits the file to the current repo."
LABEL "com.github.actions.icon"="copy"
LABEL "com.github.actions.color"="blue"

LABEL "repository"="https://github.com/posos-tech/actions-issue-to-markdown"
LABEL "homepage"="https://github.com/posos-tech/actions-issue-to-markdown"
LABEL "maintainer"="posos-tech"

COPY package*.json ./
RUN npm ci
COPY . .

CMD ["node", "/index.js"]
