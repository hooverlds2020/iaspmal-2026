# Etapa de desarrollo
FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Definimos los argumentos que recibiremos desde docker-compose
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Los convertimos en variables de entorno para que Vite los vea al compilar
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package*.json ./
RUN npm install

COPY . .
# Ahora, al ejecutar build, las variables estarán disponibles
RUN npm run build

# Etapa de producción
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
