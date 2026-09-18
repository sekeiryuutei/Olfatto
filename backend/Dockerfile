# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Production stage ----------
FROM node:20-alpine AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

RUN addgroup -S olfatto && adduser -S olfatto -G olfatto
USER olfatto

EXPOSE 3000

CMD ["node", "dist/main.js"]
