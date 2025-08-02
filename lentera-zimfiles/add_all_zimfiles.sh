for zim in data/zimfiles/*.zim; do
    echo "Adding to library: $zim"
    docker run -it --rm \
        -v "$(pwd)/data:/data" \
        ghcr.io/kiwix/kiwix-tools \
        kiwix-manage /data/library.xml add "/data/zimfiles/$(basename "$zim")"
done

CONTAINER_NAME="kiwix-server"

# Check if container exists
if [ "$(docker ps -aq -f name=^${CONTAINER_NAME}$)" ]; then
    # If it's already running
    if [ "$(docker ps -q -f name=^${CONTAINER_NAME}$)" ]; then
        echo "Container '$CONTAINER_NAME' is running. Restarting..."
        docker restart "$CONTAINER_NAME"
    else
        echo "Container '$CONTAINER_NAME' exists but is not running. Starting..."
        docker start "$CONTAINER_NAME"
    fi
else
    echo "Container '$CONTAINER_NAME' not found. Running a new one..."
    docker run -d \
        --name "$CONTAINER_NAME" \
        -v "$(pwd)/data:/data" \
        -p 8090:8090 \
        ghcr.io/kiwix/kiwix-tools \
        kiwix-serve --library /data/library.xml --port=8090
fi
