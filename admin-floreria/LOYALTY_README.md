# Módulo de Fidelización de Clientes

## Descripción General

Módulo completo de fidelización que permite:
- Gestionar clientes centralizados
- Crear segmentos dinámicos basados en comportamiento
- Emitir y validar cupones de descuento
- Crear campañas de email masivas
- Automatizar emails de cumpleaños y win-back

## Arquitectura

```
admin-web/
├── ecommerce-be/          # Backend NestJS (nuevo)
│   ├── prisma/
│   │   ├── schema.prisma  # Modelos de BD extendidos
│   │   └── migrations/    # Migración de clientes desde orders
│   └── src/
│       └── loyalty/       # Módulo de fidelización
│           ├── shared/    # Prisma y Email services
│           ├── customers/
│           ├── segments/
│           ├── coupons/
│           ├── templates/
│           ├── campaigns/
│           └── automations/
│
├── client/                # Frontend React (extendido)
│   └── src/features/loyalty/
│       ├── pages/         # Pantallas principales
│       ├── services/      # API service
│       └── hooks/         # Custom hooks
│
└── api/                   # Backend Express (producción - sin cambios)
```

## Configuración Inicial

### 1. Variables de Entorno (Backend)

Crear archivo `.env` en `ecommerce-be/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

EMAIL_FROM="Tu Tienda <noreply@tutienda.com>"

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Configurar SMTP (Gmail como ejemplo):
1. Ir a tu cuenta de Google
2. Activar verificación en 2 pasos
3. Generar contraseña de aplicación en: https://myaccount.google.com/apppasswords
4. Usar esa contraseña en `SMTP_PASS`

### 2. Migración de Base de Datos

```bash
cd ecommerce-be

# Crear la base de datos y tablas
npx prisma migrate dev --name init

# Ejecutar migración de clientes existentes
psql $DATABASE_URL -f prisma/migrations/migrate-customers-from-orders.sql

# Verificar
npx prisma studio
```

### 3. Seed de Plantillas Iniciales

```bash
# Iniciar el backend
npm run start:dev

# En otro terminal, crear plantillas por defecto
curl -X POST http://localhost:3001/loyalty/templates/seed
```

### 4. Variables de Entorno (Frontend)

Crear/actualizar `.env` en `client/`:

```env
VITE_LOYALTY_API_URL=http://localhost:3001
```

## Iniciar el Sistema

### Backend (NestJS)
```bash
cd ecommerce-be
npm run start:dev
# Disponible en http://localhost:3001
```

### Frontend (React)
```bash
cd client
npm run dev
# Disponible en http://localhost:5173
```

### Backend Express (Producción - sigue funcionando normal)
```bash
cd api
npm run dev
# Disponible en http://localhost:3000
```

## Uso del Sistema

### 1. Acceder al Panel de Fidelización
- Ir a http://localhost:5173/app/loyalty
- Dashboard con estadísticas generales

### 2. Crear un Segmento
- **Ruta:** `/app/loyalty/segments`
- **Ejemplo de reglas:**
```json
{
  "lastPurchaseDays": { "gte": 60 },
  "totalSpent": { "gte": 100, "lte": 500 },
  "acceptsMarketing": true
}
```

### 3. Crear un Cupón
- **Ruta:** `/app/loyalty/coupons`
- Tipos: PERCENTAGE (porcentaje) o FIXED (valor fijo)
- Configurar vigencia, usos máximos, monto mínimo

### 4. Crear una Campaña
- **Ruta:** `/app/loyalty/campaigns`
- Seleccionar segmento y plantilla
- Personalizar variables (couponCode, discountValue, etc.)
- Enviar inmediatamente o programar

### 5. Configurar Automatizaciones
- **Ruta:** `/app/loyalty/automations`
- Tipos disponibles:
  - **BIRTHDAY**: Envío el día del cumpleaños
  - **WINBACK_30**: Sin compras en 30 días
  - **WINBACK_60**: Sin compras en 60 días
  - **WINBACK_90**: Sin compras en 90 días
- Se ejecutan automáticamente todos los días a las 8:00 AM

## API Endpoints

### Customers
- `GET /loyalty/customers` - Listar clientes (con paginación)
- `GET /loyalty/customers/:id` - Detalle de cliente
- `GET /loyalty/customers/stats` - Estadísticas
- `POST /loyalty/customers` - Crear cliente
- `PATCH /loyalty/customers/:id` - Actualizar cliente

### Segments
- `GET /loyalty/segments` - Listar segmentos
- `POST /loyalty/segments` - Crear segmento
- `POST /loyalty/segments/preview` - Preview de reglas
- `POST /loyalty/segments/:id/evaluate` - Evaluar segmento

### Coupons
- `GET /loyalty/coupons` - Listar cupones
- `POST /loyalty/coupons` - Crear cupón
- `POST /loyalty/coupons/validate` - Validar cupón
- `POST /loyalty/coupons/apply` - Aplicar cupón a orden
- `GET /loyalty/coupons/generate-code` - Generar código único

### Campaigns
- `GET /loyalty/campaigns` - Listar campañas
- `POST /loyalty/campaigns` - Crear campaña
- `POST /loyalty/campaigns/:id/send` - Enviar campaña

### Automations
- `GET /loyalty/automations` - Listar automatizaciones
- `POST /loyalty/automations` - Crear automatización
- `PATCH /loyalty/automations/:id` - Actualizar automatización

### Templates
- `GET /loyalty/templates` - Listar plantillas
- `POST /loyalty/templates/seed` - Crear plantillas por defecto
- `GET /loyalty/templates/by-type/:type` - Por tipo

## Segmentación - Ejemplos de Reglas

### Clientes inactivos hace más de 60 días
```json
{
  "lastPurchaseDays": { "gte": 60 },
  "acceptsMarketing": true
}
```

### Clientes VIP (alto gasto)
```json
{
  "totalSpent": { "gte": 500 },
  "purchaseCount": { "gte": 5 }
}
```

### Clientes de ciudades específicas
```json
{
  "city": { "in": ["Quito", "Guayaquil"] },
  "acceptsMarketing": true
}
```

### Cumpleaños en mes específico
```json
{
  "birthday": { "month": 12 },
  "acceptsMarketing": true
}
```

## Validación de Cupones

### Reglas automáticas:
- ✅ Cupón activo
- ✅ Dentro de vigencia (validFrom - validUntil)
- ✅ No excede usos máximos totales
- ✅ No excede usos por cliente
- ✅ Cumple monto mínimo de compra
- ✅ Si es personalizado, valida que sea para el cliente correcto

### Integración con Checkout (Express Backend)

```javascript
// En tu checkout del backend Express
const { data } = await axios.post('http://localhost:3001/loyalty/coupons/validate', {
  code: 'BIRTHDAY2026',
  customerId: 'customer-id',
  orderTotal: 150.00
});

if (data.valid) {
  const discount = data.discountAmount; // Aplicar descuento
  
  // Después de confirmar la orden, registrar uso
  await axios.post('http://localhost:3001/loyalty/coupons/apply', {
    code: 'BIRTHDAY2026',
    customerId: 'customer-id',
    orderId: 'order-id'
  });
}
```

## Cron Jobs (Automatizaciones)

Los cron jobs se ejecutan automáticamente sin intervención manual:

- **Frecuencia**: Diario a las 8:00 AM
- **Tareas**:
  - Buscar cumpleaños del día → enviar email + cupón
  - Buscar clientes inactivos (30/60/90 días) → enviar win-back
- **Logs**: Visibles en consola del backend

### Ejecución manual (para testing):
```typescript
// En automations-cron.service.ts, cambiar el cron:
@Cron('*/5 * * * *') // Cada 5 minutos
async runDailyAutomations() { ... }
```

## Consentimiento de Marketing

**IMPORTANTE**: El sistema respeta el campo `acceptsMarketing`.

- Por defecto, clientes migrados tienen `acceptsMarketing = false`
- Solo se envían emails a clientes con `acceptsMarketing = true`
- Actualizar manualmente o implementar checkbox en checkout

```sql
-- Habilitar marketing para cliente específico
UPDATE customers SET "acceptsMarketing" = true WHERE email = 'cliente@email.com';
```

## Solución de Problemas

### Emails no se envían
1. Verificar configuración SMTP en `.env`
2. Revisar logs del backend: `Email service not configured`
3. Validar que `acceptsMarketing = true`

### Segmento retorna 0 clientes
1. Usar endpoint `/segments/preview` para probar reglas
2. Verificar que existan clientes con esos criterios
3. Revisar sintaxis de reglas JSON

### Cron jobs no se ejecutan
1. Verificar que el backend esté corriendo
2. Logs deben mostrar: `Starting daily automations...`
3. Si no aparece, reiniciar backend

### Cupón no valida
1. Verificar vigencia
2. Revisar usos máximos
3. Confirmar monto mínimo de compra
4. Logs en backend muestran razón exacta

## Monitoreo

### Estadísticas en Dashboard
- Total de clientes y con marketing habilitado
- Cupones activos vs expirados
- Campañas enviadas y emails totales
- Automatizaciones activas

### EmailLog
Todas las interacciones quedan registradas en tabla `email_logs`:
- ¿Se envió correctamente?
- ¿Falló? ¿Por qué?
- Metadata completa

```sql
SELECT * FROM email_logs ORDER BY "sentAt" DESC LIMIT 20;
```

## Próximos Pasos / Mejoras Futuras

- [ ] Editor visual de plantillas de email
- [ ] Más tipos de segmentación (categorías, productos)
- [ ] A/B testing de campañas
- [ ] Reportes avanzados (tasas de apertura, clicks)
- [ ] Integración con proveedores externos (SendGrid, Mailgun)
- [ ] Webhook desde Express a NestJS para sync automática
- [ ] Formularios de captura de consentimiento en frontend

## Soporte

Para dudas o problemas:
1. Revisar logs de backend
2. Verificar configuración de environment
3. Consultar este README

## Licencia

Privado - Uso interno
