#!/bin/bash
# Script to dump dev database
# Use like this --> ./scripts/dump-dev-db.sh

# connection deets
DEV_DB_HOST="localhost"
DEV_DB_PORT="5432"
DEV_DB_NAME="resell-dev"
DEV_DB_USERNAME="postgres"

# creating dumps directory if not exists
mkdir -p dumps

# timestamp for the dump file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="dumps/dev_db_dump_${TIMESTAMP}.sql"

echo "Creating db dump from dev environment..."
echo "Host: $DEV_DB_HOST"
echo "Database: $DEV_DB_NAME"
echo "Output file: $DUMP_FILE"

# create the db dump
pg_dump -h "$DEV_DB_HOST" \
        -p "$DEV_DB_PORT" \
        -U "$DEV_DB_USERNAME" \
        -d "$DEV_DB_NAME" \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        -f "$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo "db dump created successfully: $DUMP_FILE"
    echo "File size: $(du -h "$DUMP_FILE" | cut -f1)"
else
    echo "Failed to create db dump"
    exit 1
fi