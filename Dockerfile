FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run check
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S relayops && adduser -S relayops -G relayops
COPY --from=build --chown=relayops:relayops /app/package.json /app/package-lock.json ./
COPY --from=build --chown=relayops:relayops /app/node_modules ./node_modules
COPY --from=build --chown=relayops:relayops /app/dist ./dist

USER relayops
EXPOSE 3100
CMD ["npm", "start"]

