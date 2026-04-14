# Migración de Sistema de Pagos a NestJS (ecommerce-be)

## Resumen de Cambios

Se completó la migración del flujo de pagos desde un sistema fragmentado (Next.js + Express) a un sistema centralizado en **ecommerce-be (NestJS)**.

---

## 🏗️ Arquitectura Implementada

### **ANTES** (Sistema Fragmentado)
```
Next.js API routes → Express API (orders) → PayPhone → Next.js confirm → Express update
```

### **DESPUÉS** (Sistema Centralizado)
```
Next.js (proxy simple) → ecommerce-be/orders → PayPhone → ecommerce-be/orders
```

---

## 📁 Archivos Creados/Modificados

### **ecommerce-be (NestJS)**

#### 1. **Módulo Orders** (`src/modules/orders/`)

- **`orders.module.ts`**
  - Registra OrdersModule con dependencias: LoyaltyModule, PromotionsModule, PrismaService
  - Exports: OrdersService para reutilización

- **`orders.controller.ts`**
  - `POST /orders/prepare-payment` - Prepara pago y crea orden PENDING_PAYMENT
  - `POST /orders/confirm-payment` - Confirma pago con PayPhone y actualiza orden
  - Thin controller: delega toda lógica al servicio

- **`orders.service.ts`** (500+ líneas - **Core Business Logic**)
  
  **Métodos Públicos:**
  
  - **`preparePayment(dto)`**
    - ✅ Valida carrito consultando productos con promociones activas desde Prisma
    - ✅ Valida cupón usando `CouponsService.validateCoupon()`
    - ✅ Calcula:
      - `subtotalBase`: Precio original sin promociones
      - `subtotal`: Precio con promociones aplicadas
      - `couponDiscount`: Descuento del cupón
      - `shipping`: $7 si es cashOnDelivery, $0 si no
      - `tax`: 15% sobre (subtotal - cupón)
      - `total`: subtotal - cupón + tax + shipping
    - ✅ Genera `clientTransactionId` único (idempotencia)
    - ✅ Crea orden en estado `PENDING_PAYMENT`
    - ✅ Retorna datos para PayPhone (montos en centavos)
    - 🔒 **Seguro**: Todo server-side, no confía en datos del cliente
  
  - **`confirmPayment(dto)`**
    - ✅ Confirma transacción con PayPhone API
    - ✅ Valida monto pagado vs esperado (±2 centavos de tolerancia)
    - ✅ Actualiza orden a `APPROVED` / `REJECTED` / `CANCELLED` / `AMOUNT_MISMATCH`
    - ✅ Aplica cupón usando `CouponsService.applyCoupon()` si fue aprobado
    - ✅ Maneja errores guardando estado incluso en fallos
    - 🔄 **Resiliente**: Reintentos con exponential backoff
  
  **Métodos Privados:**
  
  - `validateAndCalculateCart(items)`: Valida productos en BD, aplica mejor promoción por producto
  - `calculatePromotionDiscount(basePrice, promotion)`: Calcula descuento PERCENTAGE o FIXED_AMOUNT
  - `createPendingOrder(data)`: Crea Order con OrderItems en Prisma
  - `updateOrderStatus(orderId, data, retries=3)`: Actualiza con reintentos exponenciales (1s, 2s, 4s)
  
  **Integraciones:**
  - Uses: `PrismaService`, `CouponsService` (loyalty), `PromotionsService`, `ConfigService`
  - Logging: Logger con contexto detallado
  - Error Handling: BadRequestException, NotFoundException, InternalServerErrorException

#### 2. **DTOs** (`src/modules/orders/dto/`)

- **`prepare-payment.dto.ts`**
  - `PreparePaymentDto`: cart, billingData, customerEmail, appliedCoupon, city, cashOnDelivery
  - Nested DTOs: CartItemDto, ProductDto, AppliedCouponDto, BillingDataDto
  - Validación: class-validator decorators (@IsString, @IsEmail, @IsNumber, @Min, @ValidateNested)

- **`confirm-payment.dto.ts`**
  - `ConfirmPaymentDto`: id, clientTxId, orderId
  - Validación: Campos requeridos con tipos correctos

- **`index.ts`**: Barrel exports para imports limpios

#### 3. **Configuración**

- **`app.module.ts`**: 
  - Agregado `ConfigModule.forRoot({ isGlobal: true })` para variables de entorno
  - Agregado `OrdersModule` a imports

- **`.env`**: 
  - Agregado `PAYPHONE_TOKEN=your_payphone_token_here`

#### 4. **Base de Datos**

- **`prisma/schema.prisma`**:
  - Agregados campos a modelo `Order`:
    - `clientTransactionId String? @unique` - Para idempotencia
    - `payPhoneTransactionId String?` - ID de transacción PayPhone
    - `payPhoneAuthCode String?` - Código de autorización PayPhone
    - `couponDiscountCode String?` - Código de cupón usado
    - `cashOnDelivery Boolean @default(false)` - ¿Es COD?

- **`prisma/migrations/20250122000000_add_payphone_fields/migration.sql`**:
  - Agrega nuevos campos con constraint único en `clientTransactionId`

---

### **web-perfume (Next.js)**

#### API Routes Simplificadas (Proxies)

- **`src/app/api/payment/prepare/route.ts`**
  - **ANTES**: 284 líneas con lógica de negocio, validaciones, cálculos
  - **DESPUÉS**: 38 líneas - proxy simple a `ecommerce-be/orders/prepare-payment`
  - Maneja solo errores de red y configuración

- **`src/app/api/payment/confirm/route.ts`**
  - **ANTES**: 220 líneas con confirmación PayPhone, validaciones, reintentos
  - **DESPUÉS**: 38 líneas - proxy simple a `ecommerce-be/orders/confirm-payment`
  - Maneja solo errores de red y configuración

---

## 🔒 Seguridad Mejorada

### **Validaciones Server-Side**
- ✅ Carrito validado contra BD (productos reales, precios actuales)
- ✅ Promociones aplicadas desde BD, no confiamos en cliente
- ✅ Cupones validados con servicio de loyalty
- ✅ Cálculos de totales realizados en servidor
- ✅ Validación de monto pagado vs esperado (±2¢)

### **Integridad de Datos**
- ✅ Idempotencia: mismo `clientTransactionId` → misma orden
- ✅ Estado atómico: orden solo se crea si todo es válido
- ✅ No se confía en datos del cliente (recalculamos todo)

### **Trazabilidad**
- ✅ Logging detallado en cada paso
- ✅ IDs de transacción guardados
- ✅ Estados intermedios preservados en errores

---

## 🔄 Resiliencia

### **Manejo de Errores**
- ✅ Reintentos con exponential backoff (1s, 2s, 4s)
- ✅ Estados de error preservados (`ERROR`, `AMOUNT_MISMATCH`)
- ✅ Órdenes `PENDING_PAYMENT` recuperables
- ✅ Logging detallado para debugging

### **Recuperación**
- ✅ localStorage en frontend (orderId, clientTxId, timestamp)
- ✅ Órdenes parciales guardadas incluso en errores
- ✅ Confirmación idempotente (puede reintentarse)

### **Validaciones Múltiples Capas**
1. Frontend: Validación básica de formularios
2. Next.js API routes: Validación de estructura
3. NestJS DTOs: class-validator con reglas estrictas
4. Service Layer: Validaciones de negocio (BD, precios, stock)
5. PayPhone: Validación de transacción

---

## 🚀 Flujo de Pago Completo

### 1. **Preparación (Prepare Payment)**

**Cliente → Next.js → ecommerce-be**

```typescript
POST /api/payment/prepare
Body: {
  cart: [{ product: {...}, quantity: 2 }],
  billingData: { customerName, customerEmail, ... },
  appliedCoupon: { code, type, value } | null,
  cashOnDelivery: true/false
}
```

**Backend Process:**
1. Valida carrito con productos reales desde BD
2. Aplica promociones activas por producto
3. Valida cupón si existe
4. Calcula totales: subtotal → cupón → tax → shipping → total
5. Genera `clientTransactionId`
6. Crea orden en `PENDING_PAYMENT`
7. Retorna datos para PayPhone

**Respuesta:**
```typescript
{
  success: true,
  orderId: "cuid123...",
  clientTransactionId: "TRANS-1234567890-abc123",
  paymentData: {
    amount: 12000,  // $120.00 en centavos
    amountWithoutTax: 0,
    amountWithTax: 10435,  // subtotal - cupón
    tax: 1565,  // 15%
    currency: "USD",
    reference: "REF-..."
  },
  orderSummary: {
    subtotalBase: 150.00,    // Original sin promociones
    subtotal: 120.00,         // Con promociones
    promotionSavings: 30.00,  // Ahorrado en promociones
    couponDiscount: 10.00,    // Descuento de cupón
    shipping: 0,
    tax: 15.65,               // 15% de (120 - 10)
    total: 125.65             // Final
  }
}
```

### 2. **Pago (PayPhone Widget)**

**Cliente carga PayPhone SDK con datos recibidos:**
```javascript
PayPhoneButton.createButton({
  amount: paymentData.amount,
  amountWithoutTax: paymentData.amountWithoutTax,
  tax: paymentData.tax,
  clientTransactionId: clientTransactionId,
  // ... más config
})
```

**PayPhone procesa el pago y retorna:**
- `id`: ID transacción PayPhone
- `clientTxId`: clientTransactionId enviado
- `transactionStatus`: "Approved" | "Rejected" | "Cancelled"

### 3. **Confirmación (Confirm Payment)**

**Cliente → Next.js → ecommerce-be**

```typescript
POST /api/payment/confirm
Body: {
  id: 12345,           // PayPhone transaction ID
  clientTxId: "TRANS-1234567890-abc123",
  orderId: "cuid123..."
}
```

**Backend Process:**
1. Confirma con PayPhone API: `POST /api/button/V2/Confirm`
2. Obtiene orden de BD
3. Valida monto: `paid - expected <= 2 centavos`
4. Actualiza estado según resultado:
   - `Approved` → orden a `APPROVED`, status `CONFIRMED`, aplica cupón
   - `Rejected` → orden a `REJECTED`, status `CANCELLED`
   - `Cancelled` → orden a `CANCELLED`, status `CANCELLED`
   - Mismatch → orden a `AMOUNT_MISMATCH`, status `PENDING`
5. Guarda `payPhoneTransactionId` y `payPhoneAuthCode`
6. Reintentos si falla actualización

**Respuesta:**
```typescript
{
  success: true,
  paymentConfirmed: true,
  orderUpdated: true,
  paymentData: {
    transactionId: "PAYPHONE-123...",
    transactionStatus: "Approved",
    authorizationCode: "ABC123",
    amount: 12000,
    date: "2025-01-22T10:30:00Z",
    ...
  },
  orderId: "cuid123...",
  message: "Pago confirmado y orden actualizada correctamente"
}
```

---

## 🧪 Testing

### Pasos para Probar:

#### 1. **Setup ecommerce-be**

```bash
cd ecommerce-be

# Instalar dependencias si faltan
npm install

# Configurar .env
# Asegurar que tiene: DATABASE_URL, PAYPHONE_TOKEN

# Aplicar migración (si no está aplicada)
npx prisma migrate deploy

# Generar cliente Prisma (ya ejecutado)
npx prisma generate

# Iniciar servidor
npm run start:dev
```

Debería estar corriendo en `http://localhost:3001`

#### 2. **Setup web-perfume**

```bash
cd web-perfume

# Verificar .env.local tiene:
# ECOMMERCE_API_URL=http://localhost:3001
# (NO usar NEXT_PUBLIC_ para API routes server-side)

# Iniciar Next.js
npm run dev
```

Debería estar corriendo en `http://localhost:3000`

#### 3. **Test Prepare Payment**

```bash
# Desde terminal o Postman
POST http://localhost:3001/orders/prepare-payment
Content-Type: application/json

{
  "cart": [
    {
      "id": "product1",
      "product": {
        "id": "prod_real_id",  # Usar un ID real de tu BD
        "name": "Perfume Example",
        "price": 50.00,
        "basePrice": 60.00,
        "finalPrice": 50.00,
        "category": "perfumes"
      },
      "quantity": 2
    }
  ],
  "billingData": {
    "customerName": "John",
    "customerLastName": "Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+593987654321",
    "billingPrincipalAddress": "Calle 123",
    "billingCity": "Quito",
    "billingProvince": "Pichincha"
  },
  "customerEmail": "john@example.com",
  "appliedCoupon": null,
  "city": "Quito",
  "cashOnDelivery": false
}
```

**Respuesta Esperada:**
- `success: true`
- `orderId` y `clientTransactionId` válidos
- `paymentData` con montos en centavos
- `orderSummary` con cálculos correctos

#### 4. **Test Confirm Payment** (Simulado)

```bash
POST http://localhost:3001/orders/confirm-payment
Content-Type: application/json

{
  "id": 12345,  # ID simulado de PayPhone
  "clientTxId": "TRANS-...",  # Del paso anterior
  "orderId": "cuid123..."  # Del paso anterior
}
```

**Nota**: Este endpoint llamará a PayPhone real, así que necesitas un `PAYPHONE_TOKEN` válido.

#### 5. **Verificar en BD**

```sql
SELECT 
  id, 
  orderNumber, 
  paymentStatus, 
  status, 
  clientTransactionId, 
  payPhoneTransactionId,
  total,
  createdAt
FROM orders
WHERE clientTransactionId = 'TRANS-...'
ORDER BY createdAt DESC;
```

---

## 📊 Estados de Orden

| Estado Pago | Estado Orden | Descripción |
|-------------|--------------|-------------|
| `PENDING_PAYMENT` | `PENDING` | Orden creada, esperando pago |
| `APPROVED` | `CONFIRMED` | Pago aprobado, orden confirmada |
| `REJECTED` | `CANCELLED` | Pago rechazado por banco |
| `CANCELLED` | `CANCELLED` | Usuario canceló el pago |
| `AMOUNT_MISMATCH` | `PENDING` | Monto pagado no coincide (alerta) |
| `ERROR` | `PENDING` | Error en confirmación, requiere revisión |

---

## 🔧 Variables de Entorno

### **ecommerce-be/.env**
```bash
DATABASE_URL=postgresql://user:pass@host/db
PAYPHONE_TOKEN=your_payphone_token_here
PORT=3001
NODE_ENV=development
```

### **web-perfume/.env.local**
```bash
ECOMMERCE_API_URL=http://localhost:3001
# NO usar NEXT_PUBLIC_ aquí, son API routes server-side
```

---

## 🚧 Pendiente (Opcional)

### Mejoras Futuras
- [ ] Webhook de PayPhone para confirmación async
- [ ] Job cron para limpiar órdenes `PENDING_PAYMENT` antiguas (>1 hora)
- [ ] Admin dashboard para recuperar órdenes huérfanas
- [ ] Email notifications en cambio de estado
- [ ] Customer order history endpoint
- [ ] Refund workflow

### Migración Completa
- [ ] Deprecar completamente Express API (`api/`) para nuevas órdenes
- [ ] Migrar órdenes existentes de Express a ecommerce-be (si necesario)
- [ ] Remover rutas `/checkout` del backend Express

---

## 📚 Referencias

- **PayPhone API**: https://docs.payphone.app/
- **NestJS**: https://docs.nestjs.com/
- **Prisma**: https://www.prisma.io/docs/
- **class-validator**: https://github.com/typestack/class-validator

---

## ✅ Checklist de Implementación

- [x] Crear módulo orders en ecommerce-be
- [x] Crear DTOs con validaciones
- [x] Implementar preparePayment con validaciones completas
- [x] Implementar confirmPayment con PayPhone
- [x] Simplificar Next.js routes a proxies
- [x] Actualizar Prisma schema con campos PayPhone
- [x] Crear migración SQL
- [x] Generar cliente Prisma
- [x] Agregar PAYPHONE_TOKEN a .env
- [x] Registrar OrdersModule en app.module
- [x] Documentar arquitectura y flujo

**Estado**: ✅ **IMPLEMENTACIÓN COMPLETA**

---

## 💡 Notas Importantes

1. **Seguridad**: TODO el cálculo de precios se hace server-side. El cliente solo envía IDs y cantidades.

2. **Idempotencia**: `clientTransactionId` asegura que reintentar prepare no crea órdenes duplicadas.

3. **Resilencia**: Múltiples capas de validación + reintentos + estados intermedios = sistema robusto.

4. **Trazabilidad**: Cada paso tiene logging detallado con contexto `[PREPARE]` o `[CONFIRM]`.

5. **Integración**: Usa servicios existentes (CouponsService, PromotionsService) sin duplicar lógica.

6. **Migración Manual**: La migración de Prisma se creó manualmente porque el entorno no es interactivo.

7. **Testing Real**: Necesitas un `PAYPHONE_TOKEN` válido para probar confirmación real. Para testing local, considera mockear PayPhone API.

---

**Fecha Implementación**: 2025-01-22  
**Implementado por**: GitHub Copilot (Claude Sonnet 4.5)
