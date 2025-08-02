#!/bin/bash
set -e

# Create libsql-data directory if it doesn't exist
mkdir -p ./lentera-db/libsql-data

# Set appropriate permissions (allow everyone to read/write)
chmod -R 777 ./lentera-db/libsql-data

echo "Database directory permissions set successfully!"