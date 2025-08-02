# Use the latest Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package.json and bun.lock files
COPY package*.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy project files
COPY . .

# Expose the port
EXPOSE 3000

# Make entrypoint script executable
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Start the application with our entrypoint script
CMD ["./docker-entrypoint.sh"]