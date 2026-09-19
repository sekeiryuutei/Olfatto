# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Relative by default ('/api/v1') because in production the same Nginx that
# serves this app also reverse-proxies /api/ (see infrastructure/nginx) —
# no absolute host:port needed. Override only if the API lives on a
# different origin than the frontend.
ARG API_URL=/api/v1

COPY package*.json ./
RUN npm ci

COPY . .
RUN sed -i "s|apiUrl: '/api/v1'|apiUrl: '${API_URL}'|" src/environments/environment.prod.ts
RUN npm run build:prod

# ---------- Production stage ----------
FROM nginx:1.27-alpine AS production

COPY --from=builder /usr/src/app/www /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
