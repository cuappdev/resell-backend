#!/bin/bash
# Script to dump dev database (Docker or native)
# Use like this --> ./scripts/dump-dev-db.sh

# connection deets
CONTAINER_NAME="my_postgres"
DEV_DB_HOST="localhost"
DEV_DB_PORT="5432"
DEV_DB_NAME="resell-dev"
DB_USER="postgres"

# creating dumps directory if not exists
mkdir -p dumps

# timestamp for the dump file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="dumps/dev_db_dump_${TIMESTAMP}.sql"

echo "Creating db dump from dev environment..."
echo "Database: $DEV_DB_NAME"
echo "Output file: $DUMP_FILE"

# dumping with docker
dump_via_docker() {
    echo "Using docker container: $CONTAINER_NAME"
    
    # check if container is running
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo "Container $CONTAINER_NAME is not running"
        echo "Start it with: docker start $CONTAINER_NAME"
        exit 1
    fi

    # create the db dump using docker
    docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" \
            -d "$DEV_DB_NAME" \
            --no-owner \
            --no-privileges \
            --clean \
            --if-exists > "$DUMP_FILE"
}

# dumping with native postgres
dump_via_native() {
    echo "Using native postgres installation"
    
    # create the db dump using local pg_dump
    pg_dump -h "$DEV_DB_HOST" \
            -p "$DEV_DB_PORT" \
            -U "$DB_USER" \
            -d "$DEV_DB_NAME" \
            --no-owner \
            --no-privileges \
            --clean \
            --if-exists \
            -f "$DUMP_FILE"
}

if [ "$FORCE_DOCKER" = "1" ]; then
    dump_via_docker
elif [ "$FORCE_NATIVE" = "1" ]; then
    dump_via_native
# detect postgres setup and dump
elif docker ps | grep -q "$CONTAINER_NAME"; then
    dump_via_docker
elif command -v pg_dump > /dev/null 2>&1; then
    dump_via_native
else
    echo "Could not detect postgres setup. Make sure that:"
    echo "1. Docker container '$CONTAINER_NAME' is running, OR"
    echo "2. Native postgres with pg_dump is installed"
    echo ""
    echo "To manually specify method:"
    echo "  Docker: FORCE_DOCKER=1 ./scripts/dump-dev-db.sh"
    echo "  Native: FORCE_NATIVE=1 ./scripts/dump-dev-db.sh"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo "db dump created successfully: $DUMP_FILE"
    echo "File size: $(du -h "$DUMP_FILE" | cut -f1)"
else
    echo "Failed to create db dump"
    exit 1
fi