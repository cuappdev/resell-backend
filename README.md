# Resell Backend

An open-sourced backend service for Resell.

## Setup

Make sure that `npm` installed (`nvm` is recomended to manage node versions.)  
Depending on preference, either run `yarn install` or `npm install` to ensure
all required dependencies are installed. Copy the `.env_template` to either a
`.env` file , and update with necessary credentials. Sourcing the file is not
necessary.

In addition, this codebase requires these files in the project root to run:
- `.env` → Copy from `.env_template` and fill with your database credentials, Firebase configs, and API keys 
- `resell.pem` → Private key file required for authentication 
- a resell firebase json file → Firebase service account key for connecting to Firebase 

---

## Installing Postgres

Steps to install Postgres:

### macOS (via Homebrew)

1. Update Homebrew
    ```
    brew update
    ```

2. Install and start
    ```
    brew install postgresql
    brew services start postgresql
    ```

3. Initialize DB
    ```
    initdb /usr/local/var/postgres
    ```

4. Create User  
In order to run the create and alter commands, you must be inside psql.
    ```
    psql postgres
    create user postgres with password 'postgres';
    alter user postgres with superuser;
    create database "resell-dev";
    ```

Use the \l command to see if the "resell-dev" is owned by user postgres. If
instead it is owned by another root user, drop the database via:
    ```
    drop database "resell-dev";
    ```
and login to psql via
    ```
    psql postgres postgres
    ```
Then, create the database again, and it should be owned by user postgres.

---

### Windows (via Installer)

1. Download PostgreSQL from https://www.enterprisedb.com/downloads/postgres-postgresql-downloads  
2. During install, include **Command Line Tools** and **pgAdmin 4**. Set the default password for the `postgres` user (e.g., `postgres`).  
3. Add PostgreSQL’s bin folder to PATH:  
   ```
   C:\Program Files\PostgreSQL\<version>\bin
   ```
4. Open Command Prompt or PowerShell:
   ```
   psql -U postgres -d postgres
   ```
5. Inside psql:
   ```
   CREATE USER postgres WITH PASSWORD 'postgres';
   ALTER USER postgres WITH SUPERUSER;
   CREATE DATABASE "resell-dev";
   ```
6. Verify:
   ```
   \l
   ```
   If `resell-dev` is owned by another user:
   ```
   DROP DATABASE "resell-dev";
   CREATE DATABASE "resell-dev" OWNER postgres;
   ```

---

## Connecting to DB

In order to connect to the database, follow these steps:

### macOS
1. Install Homebrew
    ```
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
2. Update Homebrew to ensure you have the latest information
    ```
    brew update
    ```
3. Install pgAdmin
    ```
    brew install --cask pgadmin4
    ```

Open pgAdmin and configure the connection using the defined user and password.

### Windows
pgAdmin is installed by default with PostgreSQL. Launch it from the Start Menu and configure a new connection with:  
- Host: `localhost`  
- Port: `5432`  
- Username: `postgres`  
- Password: `postgres`  

---

## Installing pgvector

This codebase uses the [pgvector](https://github.com/pgvector/pgvector) extension.

### macOS
```
brew install pgvector
psql -U postgres -d resell-dev -c "CREATE EXTENSION vector;"
```

### Windows (manual install)
1. Download/build pgvector from GitHub releases.  
2. Copy files:  
   - `vector.control` → `C:\Program Files\PostgreSQL\<version>\share\extension\`  
   - `vector.dll` → `C:\Program Files\PostgreSQL\<version>\lib\`  
3. Restart PostgreSQL service.  
4. In psql:  
   ```
   CREATE EXTENSION vector;
   ```

### Docker (cross-platform alternative)
```
docker run -d --name pgvector -e POSTGRES_PASSWORD=postgres -p 5432:5432 ankane/pgvector
```
Update `.env`:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/resell-dev
```

---

## Create/Update Objects in Postgres DB

To create/update the database objects, run:
```
npm run db:migrate
```

---

## Migration debugging (last resort)

If you are encountering any migrations errors, use this as a last resort!

1. Log into psql and run
    ```
    drop database "resell-dev"
    ```
    This will delete all data in your database as well. Make sure you do not have any important data in your database.

2. Create the database again via.
    ```
    create database "resell-dev"
    ```

3. Delete all of the migration files in the "migrations" folder

4. Create a new migration file titled "init" via.
    ```
    npm run db:migrate:generate init
    ```

5. Run the migration
    ```
    npm run db:migrate
    ```

---

## Database Setup for Local Development

### Option 1: Import Dev Database (Rec)

To work with the same data as the dev environment, you can import a copy of the dev database into your local setup. This works with both Docker and native postgres installations.

#### Step 0: Set Up Remote Dev Database Connection in pgAdmin (First Time Only)

Before you can dump from the remote dev server, you need to configure the connection in pgAdmin:

1. **Get Database Connection Details from DigitalOcean**
   - Go to DigitalOcean → **Databases**
   - Scroll down to **Database Connection Details** (you'll need these for pgAdmin)

2. **Add Your IP Address to Allowlist**
   - In DigitalOcean database settings, add your IP address to the trusted sources
   - (You may have already done this)

3. **Download CA Certificate**
   - In DigitalOcean, download the **CA certificate**
   - Save it somewhere safe (e.g., same folder as your `resell.pem` file, like in an `appdev` folder)

4. **Register Server in pgAdmin**
   - Open pgAdmin
   - Right-click **Servers** → **Register** → **Server**

5. **Configure Connection Details**
   - **General tab**: Give it a name (e.g., "appdev-postgres")
   - **Connection tab**: Fill in all the details from DigitalOcean:
     - Host name/address
     - Port
     - Database name
     - Username
     - Password
   
6. **Configure SSL Settings**
   - Go to the **Parameters** tab
   - Find `sslmode` and set it to **required**
   - Click **Add** (plus icon) to add a new parameter
   - Set parameter name: `root certificate`
   - Set value: Full path to the CA certificate you downloaded
   - Example: `/Users/yourname/appdev/ca-certificate.crt`

7. **Save and Connect**
   - Click **Save**
   - pgAdmin should now connect to the remote dev database

#### Step 1: Create Database Dump from Dev Environment

**Option A: Dump from Remote Server (Recommended)**

Once you have the remote dev server configured in pgAdmin (see Step 0), use those connection details to dump:
```bash
REMOTE_DB_HOST=your-dev-server-host \
REMOTE_DB_PORT=your-port \
REMOTE_DB_USER=your-username \
REMOTE_DB_NAME=resell-dev \
PGPASSWORD=your-password \
FORCE_DOCKER=1 \
./scripts/dump-dev-db.sh
```

Replace the values with your actual DigitalOcean connection details from pgAdmin. The `FORCE_DOCKER=1` flag tells the script to use your Docker container's `pg_dump` tool.

**Option B: Dump from Local Database**

If your dev database is local, simply run:
```bash
./scripts/dump-dev-db.sh
```

This automatically detects your Docker container or native postgres installation.

#### Step 2: Import into Local resell-dev Database

The import script automatically detects your postgres setup (Docker or native) and imports accordingly:
```bash
./scripts/import-dev-data.sh
```
**WARNING: This will replace all data in your local resell-dev database!** You'll be prompted to confirm.

**What these commands do:**

The first command (dump):
- Connects to the **remote DigitalOcean hosted dev database** (appdev-postgres)
- Reads the `resell-dev` database from DigitalOcean (READ ONLY - no changes to remote!)
- Saves a copy to `dumps/dev_db_dump_[timestamp].sql` on your machine

The second command (import):
- Finds the dump file you just created
- Imports it into your **local `resell-dev`** database (in postgres-docker)
- Shows a summary of imported tables and row counts

**Important Note:** Both the remote DigitalOcean database and your local database are named `resell-dev`, but they are completely SEPARATE. The dump script only reads from DigitalOcean and never modifies it.

**Manual Override Options:**
- Force Docker: `FORCE_DOCKER=1 ./scripts/import-dev-data.sh`
- Force Native: `FORCE_NATIVE=1 ./scripts/import-dev-data.sh`

**Supported Setups:**
- Docker containers (like `my_postgres`)
- Native PostgreSQL installations (Homebrew, apt, etc.)
- Custom PostgreSQL setups on localhost:5432

### Option 2: Use Data Seeder (Alternative)

This project includes a mechanism for seeding consistent data for the dev environment using TypeORM and typeorm-seeding. 
The seeders generate users, posts, feedback, reviews, reports, and requests, making sure all devs work with the same data set.

### Running the Seeder

To seed the database for dev, use the following command:
```
npm run db:seed
```

The seeding script checks the environment to ensure it only runs in the dev environment. If the environment variable `IS_PROD` is set to `"true"`, the seeding process will be skipped to prevent accidental execution in prod.

### Configuration

The factories and seeders are configured to generate consistent data that is shared across all dev environments.

- **Factories**: Each entity has a corresponding factory that generates consistent data using an `index` to differentiate between records
- **Seeders**: The main seeder script (`SeedInitialData`) handles the creation of all entities, ensuring relationships are properly established

### Notes

- **Resetting Data**: The seeder script will delete all existing data for users, posts, feedback, reviews, reports, and requests before creating new records. This ensures a clean slate for each run
- **Relationships**: Factories take into consideration entity relationships, such as assigning posts to users, feedback entries to users, and creating reports and reviews between users and posts
