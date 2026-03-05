#!/bin/bash
# Script to dump dev database (local Docker/native or remote server)
# Use like this --> ./scripts/dump-dev-db.sh
#
# For REMOTE server (this is referring to the real db info you can get from digitalocean):
#   REMOTE_DB_HOST=your-host REMOTE_DB_USER=postgres ./scripts/dump-dev-db.sh

# connection deets
CONTAINER_NAME="my_postgres"
DEV_DB_HOST="${REMOTE_DB_HOST:-localhost}"
DEV_DB_PORT="${REMOTE_DB_PORT:-5432}"
DEV_DB_NAME="${REMOTE_DB_NAME:-resell-dev}"
DB_USER="${REMOTE_DB_USER:-postgres}"

# creating dumps directory if not exists
mkdir -p dumps

# timestamp for the dump file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="dumps/dev_db_dump_${TIMESTAMP}.sql"

echo "=========================================="
echo "Creating database dump"
echo "=========================================="
echo "Host: $DEV_DB_HOST"
echo "Port: $DEV_DB_PORT"
echo "Database: $DEV_DB_NAME"
echo "User: $DB_USER"
echo "Output file: $DUMP_FILE"
echo ""

IS_REMOTE=false
if [ -n "$REMOTE_DB_HOST" ]; then
    IS_REMOTE=true
    echo "Remote server mode detected"
    if [ -z "$PGPASSWORD" ]; then
        echo "Set PGPASSWORD environment variable to avoid password prompt"
        echo "   or find it in pgAdmin (right-click server → Properties → Connection)"
        echo ""
    fi
fi

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
    if [ -n "$PGPASSWORD" ]; then
        docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER_NAME" pg_dump -h "$DEV_DB_HOST" \
                -p "$DEV_DB_PORT" \
                -U "$DB_USER" \
                -d "$DEV_DB_NAME" \
                --no-owner \
                --no-privileges \
                --clean \
                --if-exists > "$DUMP_FILE"
    else
        docker exec "$CONTAINER_NAME" pg_dump -h "$DEV_DB_HOST" \
                -p "$DEV_DB_PORT" \
                -U "$DB_USER" \
                -d "$DEV_DB_NAME" \
                --no-owner \
                --no-privileges \
                --clean \
                --if-exists > "$DUMP_FILE"
    fi
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
elif [ "$IS_REMOTE" = true ] && command -v pg_dump > /dev/null 2>&1; then
    dump_via_native
elif [ "$IS_REMOTE" = true ]; then
    dump_via_docker
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
    echo ""
    echo "For remote server:"
    echo "  REMOTE_DB_HOST=host REMOTE_DB_USER=user ./scripts/dump-dev-db.sh"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database dump created successfully!"
    echo "File: $DUMP_FILE"
    echo "Size: $(du -h "$DUMP_FILE" | cut -f1)"
    echo ""
    echo "Next step: Import to local resell-dev database"
    echo "  ./scripts/import-dev-data.sh"
else
    echo ""
    echo "Failed to create database dump"
    exit 1
fi