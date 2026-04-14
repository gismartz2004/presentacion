# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Verificar que el .env existe
RUN if [ -f .env ]; then echo "✅ .env encontrado"; cat .env; else echo "⚠️ .env no encontrado"; fi
RUN npm run build

# Stage 2: Production con Nginx
FROM nginx:stable-alpine
# Copiamos el build (ajusta 'dist' si tu carpeta de salida es 'build')
COPY --from=build /app/dist /usr/share/nginx/html
# Configuración para que React Router funcione (evita 404 al recargar)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]