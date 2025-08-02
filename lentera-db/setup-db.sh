#!/bin/bash

# setup-db.sh - Script to setup the libsql database volume and start services
# Created for lentera-db project

# Print commands as they're executed
set -e
echo "Setting up libsql database..."

# Create the volume directory if it doesn't exist
if [ ! -d "./libsql-data" ]; then
  echo "Creating libsql-data directory..."
  mkdir -p ./libsql-data
  # Set proper permissions for the database directory
  chmod 777 ./libsql-data
else
  echo "libsql-data directory already exists."
  # Ensure proper permissions
  chmod 777 ./libsql-data
fi

# Check if database files exist
if [ ! -d "./libsql-data/default.db" ]; then
  echo "Database files not found. A new database will be initialized."
else
  echo "Existing database files found in ./libsql-data/default.db"
fi

# Start the database using docker-compose
echo "Starting database services with docker-compose..."
docker-compose down 2>/dev/null || true
docker-compose up -d

# Wait for services to be ready
echo "Waiting for database to be ready..."

# Function to check if the database is ready
wait_for_db() {
  local max_attempts=30
  local attempt=1
  local wait_time=1
  
  echo "Checking database availability..."
  
  while [ $attempt -le $max_attempts ]; do
    # Try to connect to the HTTP API version endpoint
    if curl -s http://0.0.0.0:30000/version > /dev/null 2>&1; then
      echo "Database is ready after $((attempt * wait_time)) seconds!"
      return 0
    fi
    
    echo -n "."
    sleep $wait_time
    attempt=$((attempt + 1))
  done
  
  echo ""
  echo "Timed out after $((max_attempts * wait_time)) seconds waiting for database to be ready"
  return 1
}

# Wait for the database to be ready
if ! wait_for_db; then
  echo "❌ Error: Database failed to become ready in the expected time"
  docker-compose logs db
  exit 1
fi

# Check if services are running
if docker ps | grep -q "lentera-db"; then
  echo "✅ Database is running successfully!"
  echo "HTTP API available at: http://0.0.0.0:30000"
  echo "GRPC API available at: http://0.0.0.0:30001"
  echo "Admin interface available at: http://0.0.0.0:30002"
else
  echo "❌ Error: Database failed to start properly"
  docker-compose logs db
  exit 1
fi

echo "Setup complete!"