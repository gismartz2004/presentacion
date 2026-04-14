# Sistema de Pago Resiliente - Documentación

## 🎯 Arquitectura Implementada

### Flujo Completo

```
1. Usuario completa checkout → BillingForm
2. Click "Finalizar Compra" → Navega a /payment
3. PaymentGateway llama a /api/payment/prepare [SERVER]
   ├─ Valida carrito con ecommerce-be
   ├─ Valida cupón si existe
   ├─ Calcula totales correctos
   ├─ Crea orden en estado PENDING_PAYMENT
   └─ Retorna datos seguros para PayPhone
4. Renderiza PayPhone widget con datos del servidor
5. Usuario completa pago → PayPhone redirect a /confirmation
6. PaymentConfirmation llama a /api/payment/confirm [SERVER]
   ├─ Confirma con PayPhone
   ├─ Valida monto pagado vs esperado
   ├─ Actualiza orden a APPROVED/REJECTED
   └─ Aplica cupón si el pago fue exitoso
7. Muestra resultado al usuario
```

## 🔒 Seguridad

### 1. Todo server-side
- ✅ Cálculos de precios en el servidor
- ✅ Validación de carrito server-side
- ✅ Validación de cupones server-side
- ✅ Confirmación de pago server-side
- ✅ Validación de montos (servidor vs PayPhone)

### 2. Validaciones en capas
- Carrito: `/api/cart/validate` (ecommerce-be)
- Cupón: `/api/checkout/validate-coupon` (frontend) + `/loyalty/coupons/validate` (ecommerce-be)
- Pago: Confirmación con PayPhone + validación de monto

### 3. Protección contra manipulación
- Cliente nunca envía montos finales
- Servidor recalcula todo desde cero
- Validación de integridad: monto pagado debe coincidir con orden (±2 centavos)

## 🛡️ Resiliencia

### 1. Idempotencia
- `clientTransactionId` único generado en servidor
- Misma transacción puede confirmarse múltiples veces sin duplicados
- API `updateOrder()` con reintentos automáticos (exponential backoff)

### 2. Orden creada ANTES del pago
```
Estado: PENDING_PAYMENT → usuario paga → APPROVED/REJECTED
```
**Beneficios:**
- Si PayPhone falla, la orden existe y puede recuperarse
- Si usuario cierra navegador, orden queda registrada
- Soporte puede buscar órdenes pendientes y recuperarlas

### 3. Recovery mechanisms
- **localStorage**: Guarda `orderId`, `clientTransactionId`, timestamp
- **URL params**: `orderId` se puede pasar en query string
- **Reintentos**: API update con 3 intentos y exponential backoff (1s, 2s, 4s)
- **Partial success**: Si pago OK pero update falla, retorna warning

### 4. Logging detallado
```typescript
console.log("[PREPARE] ...");  // Preparación de pago
console.log("[GATEWAY] ...");  // Frontend gateway
console.log("[CONFIRM] ...");  // Confirmación de pago
console.log("[UPDATE_ORDER] ..."); // Actualización de orden
```

### 5. Manejo de errores
- Cada paso captura y loguea errores
- Si falla confirmación, intenta guardar estado de error en orden
- Si falla update, retorna éxito parcial con warning
- Errores específicos para cada tipo de fallo

## 📊 Estados de Orden

```
PENDING_PAYMENT → Orden creada, esperando pago
PAYMENT_PROCESSING → Pago en proceso (opcional)
APPROVED → Pago confirmado exitosamente
REJECTED → Pago rechazado
CANCELLED → Pago cancelado por usuario
AMOUNT_MISMATCH → Monto no coincide (requiere revisión manual)
ERROR → Error en el proceso (requiere intervención)
```

## 🔄 Recuperación de Órdenes Huérfanas

### Escenarios cubiertos:

1. **Usuario cierra navegador después de crear orden**
   - Orden queda en PENDING_PAYMENT
   - Se puede buscar por email o clientTransactionId
   - Se puede reintentar el pago

2. **Falla conexión durante confirmación**
   - localStorage tiene orderId
   - Se puede consultar estado en servidor
   - Se puede reintentar confirmación con mismo clientTxId

3. **Falla actualización de orden**
   - Pago confirmado con PayPhone
   - Servidor retorna warning
   - Job de sincronización puede corregir (futuro)

## 🧪 Testing

### Casos a probar:

#### Flujo normal
- [ ] Crear orden → pagar → confirmar → éxito
- [ ] Crear orden → cancelar → orden queda CANCELLED
- [ ] Crear orden → pago rechazado → orden queda REJECTED

#### Resiliencia
- [ ] Cerrar navegador después de crear orden → reabrir → continuar
- [ ] Forzar error en update → verificar partial success
- [ ] Monto manipulado → debe fallar con AMOUNT_MISMATCH
- [ ] Reintentar confirmación con mismo clientTxId → idempotencia

#### Cupones
- [ ] Cupón válido → descuento aplicado correctamente
- [ ] Cupón expirado → error en prepare
- [ ] Cupón con segmento → validación correcta
- [ ] Pago exitoso → cupón marcado como usado

## 📁 Archivos Clave

### API Routes
- `/api/payment/prepare` - Crea orden pendiente
- `/api/payment/confirm` - Confirma y actualiza orden

### Components
- `payment-gateway.tsx` - Prepara y renderiza PayPhone
- `payment-confirmation.tsx` - Confirma pago y muestra resultado

### Stores
- `cart-store.ts` - Estado del carrito
- `checkout-store.ts` - Email y cupón aplicado
- `billing-store.ts` - Datos de facturación y cashOnDelivery

## 🚀 Mejoras Futuras

1. **Webhook de PayPhone**
   - Recibir notificaciones asíncronas
   - Actualizar órdenes sin depender de confirmación manual

2. **Job de sincronización**
   - Buscar órdenes PENDING_PAYMENT antiguas
   - Consultar estado con PayPhone
   - Actualizar automáticamente

3. **Dashboard de recuperación**
   - Ver órdenes pendientes
   - Reintentar manualmente
   - Marcar como resueltas

4. **Notificaciones**
   - Email al crear orden PENDING_PAYMENT
   - Email al confirmar pago
   - Alertas para AMOUNT_MISMATCH o ERROR

5. **Métricas**
   - Tiempo promedio de confirmación
   - Tasa de éxito de pagos
   - Órdenes huérfanas por día
   - Errores por tipo

## 🎓 Lecciones Aprendidas

### ✅ Hacer
- Crear orden antes del pago
- Validar todo server-side
- Implementar idempotencia
- Loguear detalladamente
- Guardar estado en localStorage
- Manejar errores parciales

### ❌ No hacer
- Calcular montos en cliente
- Confiar en datos del frontend
- Crear orden después del pago
- Fallar completamente por un error minor
- Perder órdenes por fallas de red
