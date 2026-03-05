#!/bin/bash

# Script to import dev db dump into LOCAL resell-dev database (Docker or native)
# Use like this --> ./scripts/import-dev-data.sh [dump-file]

CONTAINER_NAME="my_postgres"
DB_NAME="resell-dev"  # This is the LOCAL resell-dev db (the actual dev db in digital ocean hsa the same name)
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

if [ $# -eq 1 ]; then
    DUMP_FILE="$1"
else
    DUMP_FILE=$(ls -t dumps/dev_db_dump_*.sql 2>/dev/null | head -n1)
    if [ -z "$DUMP_FILE" ]; then
        echo "No dump files found in dumps/ directory"
        echo "Run ./scripts/dump-dev-db.sh first or provide a dump file as argument"
        exit 1
    fi
fi

# check if dump file exists
if [ ! -f "$DUMP_FILE" ]; then
    echo "Dump file not found: $DUMP_FILE"
    exit 1
fi

echo "=========================================="
echo "Importing to LOCAL resell-dev database"
echo "=========================================="
echo "Target Database: $DB_NAME"
echo "Dump file: $DUMP_FILE"
echo "File size: $(du -h "$DUMP_FILE" | cut -f1)"
echo ""

echo "WARNING: This will replace ALL data in your local $DB_NAME database!"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Import cancelled."
    exit 0
fi
echo ""

# import using docker
import_via_docker() {
    echo "Using docker container: $CONTAINER_NAME"
    
    # check if container is running
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo "Container $CONTAINER_NAME is not running"
        echo "Start it with: docker start $CONTAINER_NAME"
        exit 1
    fi

    echo "Waiting for postgres to be ready..."
    until docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" > /dev/null 2>&1; do
        echo "Waiting for postgres..."
        sleep 2
    done

    echo "Postgres is ready. Starting import..."

    # copying dump file to container and import it
    docker cp "$DUMP_FILE" "$CONTAINER_NAME:/tmp/dump.sql"

    # import dump
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/dump.sql

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Database import completed successfully!"
        docker exec "$CONTAINER_NAME" rm /tmp/dump.sql
        echo ""
        echo "Import summary:"
        docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
            SELECT 
                schemaname,
                tablename,
                n_tup_ins as rows
            FROM pg_stat_user_tables 
            WHERE n_tup_ins > 0
            ORDER BY n_tup_ins DESC;
        "
    else
        echo ""
        echo "Database import failed"
        exit 1
    fi
}

# import using native postgres
import_via_native() {
    echo "Using native postgres installation"
    
    # check if postgres is running
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
        echo "Postgres is not ready at $DB_HOST:$DB_PORT"
        echo "Make sure postgres is running"
        exit 1
    fi

    echo "Postgres is ready. Starting import..."

    # import dump directly
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$DUMP_FILE"

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Database import completed successfully!"
        echo ""
        echo "Import summary:"
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
            SELECT 
                schemaname,
                tablename,
                n_tup_ins as rows
            FROM pg_stat_user_tables 
            WHERE n_tup_ins > 0
            ORDER BY n_tup_ins DESC;
        "
    else
        echo ""
        echo "Database import failed"
        exit 1
    fi
}

if [ "$FORCE_DOCKER" = "1" ]; then
    import_via_docker
elif [ "$FORCE_NATIVE" = "1" ]; then
    import_via_native
# detect postgres setup and import
elif docker ps | grep -q "$CONTAINER_NAME"; then
    import_via_docker
elif command -v psql > /dev/null 2>&1 && pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
    import_via_native
else
    echo "Could not detect postgres setup. Make sure that:"
    echo "1. Docker container '$CONTAINER_NAME' is running, OR"
    echo "2. Native postgres is installed and running on $DB_HOST:$DB_PORT"
    echo ""
    echo "To manually specify method:"
    echo "  Docker: FORCE_DOCKER=1 ./scripts/import-dev-data.sh"
    echo "  Native: FORCE_NATIVE=1 ./scripts/import-dev-data.sh"
    exit 1
fi