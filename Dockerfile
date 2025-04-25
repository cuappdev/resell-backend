FROM node:20-bullseye
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN rm -rf node_modules
RUN npm install --force
CMD npm run db:migrate && npm run start