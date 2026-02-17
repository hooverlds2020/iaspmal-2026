# --- Stage 1: Build ---
FROM node:20-alpine AS build

WORKDIR /app

# Argumentos de construcción
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Variables de entorno
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Dependencias
COPY package*.json ./
RUN npm ci

# Código fuente y Build
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM nginx:alpine AS production

# Configuración Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Archivos estáticos
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
