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
## Create/Update Objects in Postgres DB

To create/update the database objects, run:
```bash
npm run db:migrate
```

## Running

To run in a development environment, open two terminal tabs. In one, run either
`yarn dev` if using yarn, or `npm run dev` otherwise. This command will
watch the TypeScript files for changes and recompile the JavaScript whenever an
update occurs. If the compilation succeeds, it will restart the server with the
changes applied.

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