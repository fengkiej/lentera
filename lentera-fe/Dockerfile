FROM node:20-alpine

# Use Bun instead of npm for faster builds
RUN npm install -g bun

WORKDIR /app

# Copy package.json and lockfile
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN bun install

# Copy project files
COPY . .

# Expose port for development server
EXPOSE 8080

# Use shell form of ENTRYPOINT to execute the script via shell
# This bypasses the need for executable permissions on the mounted script
ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]

# Start development server (passed to entrypoint)
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]