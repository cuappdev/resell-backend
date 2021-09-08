# Resell Backend
An open-sourced backend service for Resell.

## Setup
Make sure that `npm` installed (`nvm` is recomended to manage node versions.)  
Depending on preference, either run `yarn install` or `npm install` to ensure
all required dependencies are installed. 

## Running
To run in a development environment, open two terminal tabs. In one, run either
`yarn watch` if using yarn, or `npm run watch` otherwise. The watch command will
watch the TypeScript files for changes and recompile the JavaScript whenever an
update occurs. In another, run `yarn dev` if using yarn, or `npm run dev` 
otherwise. This will run an instance of `nodemon`, which will watch the JavaScript
files for changes and update the running server based on those changes.