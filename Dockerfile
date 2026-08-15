FROM node:20.18.0-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies AS development

ENV NODE_ENV=development

COPY . .

EXPOSE 4001
CMD ["npm", "run", "start:dev"]

FROM dependencies AS build

COPY . .
RUN npm run build

FROM node:20.18.0-alpine AS production-dependencies

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20.18.0-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --chown=node:node --from=production-dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node package*.json ./
COPY --chown=node:node --chmod=755 scripts/production-entrypoint.sh ./scripts/production-entrypoint.sh

EXPOSE 4001

USER node
CMD ["sh", "./scripts/production-entrypoint.sh"]
