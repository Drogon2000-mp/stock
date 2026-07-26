# ─── Build frontend ──────────────────────────────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# ─── Build & run backend ─────────────────────────────────────────────────
FROM node:20-alpine AS server
WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server/server.js"]

