# Multi-stage build para optimizar tamaño final
FROM node:22-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de package management
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Generar Prisma client
RUN npx prisma generate

# Crear directorio para logs
RUN mkdir -p logs

# Stage de producción
FROM node:22-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Instalar dependencias del sistema
RUN apk add --no-cache dumb-init

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs . .

# Crear directorios para logs y uploads con permisos correctos
RUN mkdir -p logs uploads && chown -R nodejs:nodejs logs uploads

# Exponer puerto
EXPOSE 4000

# Cambiar a usuario no-root
USER nodejs

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
# Comando de inicio con dumb-init para mejor signal handling
CMD ["dumb-init", "node", "src/index.js"]