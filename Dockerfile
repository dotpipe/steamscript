# Dockerfile for js_shell OS (dev & prod)
FROM node:20-alpine

# Set working directory
WORKDIR /os

# Copy package files and install dependencies first (better cache)
COPY package*.json ./
RUN npm ci || npm install

# Copy the rest of the source
COPY . ./
RUN mkdir -p /os/users/home

# Copy shadow.json to /etc/shadow in the image
RUN mkdir -p /etc/js_shell
COPY etc/shadow/shadow.json /etc/js_shell/shadow.json

# Remove test files from image (prod best practice)
RUN rm -f test.js test_shell.js test_shell_permissions.js test_system.js test_user_file_write.js test_apps_scripts.js test_apps_file_existence.js || true

# For development, expose a shell (uncomment if needed)
# RUN apk add --no-cache bash
# SHELL ["/bin/bash", "-c"]

# Default command: start the shell
ENTRYPOINT ["node", "js_shell.js"]
CMD []
