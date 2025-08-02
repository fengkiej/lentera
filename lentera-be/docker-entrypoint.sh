#!/bin/bash

# Wait for the database to be ready (optional but recommended)
echo "Waiting for database to be ready..."
sleep 5

# Run database initialization
echo "Initializing database..."
bun run init-db

# Start the application
echo "Starting application..."
bun run --hot src/index.ts