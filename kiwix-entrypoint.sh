#!/bin/bash
set -e

echo "Initializing Kiwix library.xml..."

# Check if library.xml exists, create if not
if [ ! -f /data/library.xml ]; then
  echo "Creating new library.xml file..."
  touch /data/library.xml
fi

# Add all ZIM files to the library
for zim in /data/zimfiles/*.zim; do
  if [ -f "$zim" ]; then
    echo "Adding to library: $(basename "$zim")"
    kiwix-manage /data/library.xml add "$zim"
  fi
done

echo "Library initialization complete!"

# Start the Kiwix server
echo "Starting Kiwix server..."
exec kiwix-serve --library /data/library.xml --port=8090