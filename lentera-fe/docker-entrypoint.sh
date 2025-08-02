#!/bin/sh

# Default to localhost if SERVER_IP is not set
SERVER_IP=${SERVER_IP:-localhost}
echo "Configuring frontend with SERVER_IP: $SERVER_IP"

# Create dynamic .env file
cat > .env << EOF
# Dynamically generated .env file
VITE_API_BASE_URL=http://${SERVER_IP}:3000
VITE_LIBRARY_URL=http://${SERVER_IP}:8090
VITE_CHAT_URL=http://${SERVER_IP}:8080
EOF

# Display the generated config for debugging
echo "Generated environment configuration:"
cat .env

# Execute the provided command (or default to starting the dev server)
exec "$@"