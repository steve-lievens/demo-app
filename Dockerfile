FROM node:18 AS frontend-build
WORKDIR /usr/src/app
COPY frontend/ ./frontend/
WORKDIR /usr/src/app/frontend
RUN yarn install && yarn run build

FROM node:18 AS server-build
WORKDIR /tmp/
COPY --from=frontend-build /usr/src/app/frontend/build ./frontend/build
COPY backend/ ./backend/
WORKDIR /tmp/backend/
RUN npm install

EXPOSE 8080

WORKDIR /tmp/backend/
CMD ["node", "app.js"]