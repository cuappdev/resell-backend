# Resell Backend

An open-sourced backend service for Resell.

## Setup

Make sure that `npm` installed (`nvm` is recomended to manage node versions.)  
Depending on preference, either run `yarn install` or `npm install` to ensure
all required dependencies are installed. Copy the `.env_template` to either a
`.env` file , and update with necessary credentials. Sourcing the file is not
necessary.

## Installing Postgres

Steps to install Postgres:

1. Update Homebrew 
```bash
brew update
```
2. Install and start
```bash
brew install postgresql
brew services start postgresql
```
3. Initialize DB
```bash
initdb /usr/local/var/postgres
```
4. Create User
In order to run the create and alter commands, you must be inside psql.
```bash
psql postgres
create user postgres with password 'postgres';
alter user postgres with superuser;
create database "resell-dev";
```

## Connecting to DB

In order to connect to the database, follow these steps:
1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Update Homebrew to ensure you have the latest information
```bash
brew update
```
3. Install pgAdmin
```bash
brew install --cask pgadmin4
```

Open pgAdmin and configure the connection using the defined user and password.


## Create/Update Objects in Postgres DB

To create/update the database objects, run:
```bash
npm run db:migrate
```

## Seeding Data for Development Environment

This project includes a mechanism for seeding consistent data for the development environment using TypeORM and typeorm-seeding. The seeders generate users, posts, feedback, reviews, reports, and requests, ensuring all developers work with the same data set.


### Running the Seeder

To seed the database for development, use the following command:

```bash
npm run db:seed
```

The seeding script checks the environment to ensure it only runs in the development environment. If the environment variable `IS_PROD` is set to `"true"`, the seeding process will be skipped to prevent accidental execution in production.

### Configuration

The factories and seeders are configured to generate consistent data that is shared across all development environments. This allows developers to have predictable data while working on the project.

- **Factories**: Each entity has a corresponding factory that generates consistent data using an `index` to differentiate between records.
- **Seeders**: The main seeder script (`SeedInitialData`) handles the creation of all entities, ensuring relationships are properly established.

### Notes

- **Resetting Data**: The seeder script will delete all existing data for users, posts, feedback, reviews, reports, and requests before creating new records. This ensures a clean slate for each run.
- **Relationships**: Factories take into consideration entity relationships, such as assigning posts to users, feedback entries to users, and creating reports and reviews between users.

This consistent seeding process ensures that all developers work with the same initial data, making it easier to test features and maintain alignment across the team.

## Running

To run in a development environment, open two terminal tabs. In one, run either
`yarn dev` if using yarn, or `npm run dev` otherwise. This command will
watch the TypeScript files for changes and recompile the JavaScript whenever an
update occurs. If the compilation succeeds, it will restart the server with the
changes applied.