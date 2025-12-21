# Dockerfile for js_shell OS
FROM node:20-alpine

WORKDIR /os

COPY . /os

RUN npm install || true

ENTRYPOINT ["node", "js_shell.js"]
CMD []
