FROM node:24-alpine3.24 AS base
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci
FROM base AS test
WORKDIR /app
COPY . .
CMD ["npm", "test", "--if-present"]
FROM base AS run
WORKDIR /app
COPY . .
RUN npm prune --omit=dev
RUN chmod +x /app/entrypoint.sh
EXPOSE 3000
CMD ["/app/entrypoint.sh"]