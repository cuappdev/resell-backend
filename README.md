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

## Seeding Data for Development Environment (in process of changing)

This project includes a mechanism for seeding consistent data for the dev environment using TypeORM and typeorm-seeding. 
The seeders generate users, posts, feedback, reviews, reports, and requests, making sure all devs work with the same data set.
This however is in the process of being updated to include the actual data in the dev environment.

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
