## Implementación del Módulo de Fidelización de Clientes (Email-first, Bajo Costo)

### Rol de la Agente
Eres una **Agente de Desarrollo de Software Senior**, responsable de **implementar directamente** un módulo de fidelización en un sistema existente.

Las decisiones funcionales y técnicas **ya están tomadas**.  
Tu objetivo es **implementar**, no redefinir alcance.

## Objetivo General
Implementar un **Módulo de Fidelización de Clientes** para:
- Incrementar la recompra
- Mejorar la retención
- Reactivar clientes inactivos

usando exclusivamente **correo electrónico** como canal, con un enfoque **MVP, de bajo costo y rápido impacto**.

## Restricciones Clave (NO NEGOCIABLES)
1. **Canal único**: Email
    - No SMS
    - No push
    - No app móvil
2. **Costo cero o mínimo**
    - Si no existe proveedor gratuito viable → implementar **envío interno por SMTP
    - El sistema **no debe depender obligatoriamente** de servicios pagos
3. **Plantillas fijas**
    - No editor visual
    - No HTML dinámico complejo
    - Solo plantillas predefinidas + variables
4. **La agente NO debe redefinir funcionalidades
    - Todo lo necesario está especificado aquí
    
## Arquitectura General
- **Backend**: Nuevo proyecto `ecommerce-be` (NestJS)
- **ORM**: Prisma
- **Base de datos**: Se replica el esquema existente y se extiende
- **Frontend**: Cliente React existente (panel administrativo)
- **Automatizaciones**: Cron Jobs internos
- **Emails**: Servicio interno desacoplado

## Backend – ecommerce-be
### Infraestructura
- Inicializar Prisma
- Copiar `api/prisma/schema.prisma` existente
- Extender el esquema sin romper compatibilidad
- Instalar:
    - `@prisma/client`
    - `prisma`
    - `@nestjs/schedule`
    - `nodemailer
    - 
## Servicio de Email (DECISIÓN IMPORTANTE)
### EmailService (obligatorio)
Debe implementarse una interfaz genérica:
	`sendEmail(to, subject, html, metadata?)`

### Implementación
- **Primera opción**: SMTP gratuito (correo corporativo, Gmail, etc.)
- **Segunda opción**: Proveedor externo si el cliente lo proporciona
- La app **no debe fallar** si no hay proveedor externo configurado
### Manejo de errores
- Envío best-effort
- Log de errores
- No bloquear procesos críticos

## Base del Módulo – Segmentación de Clientes
### Objetivo
Permitir enviar correos **solo a clientes relevantes**, evitando spam.

### Segmentación – MVP (OBLIGATORIO)
Los segmentos se definen por **reglas declarativas en JSON**.

Campos soportados:
- Fecha de última compra
- Total comprado histórico
- Número de compras
- Ciudad

Ejemplo de regla:
`{   "lastPurchaseDays": { "gte": 60 },   "totalSpent": { "gte": 100 } }`

### Evaluación
- Los segmentos **NO se precalculan masivamente**
- Se evalúan:
    - Al enviar campañas
    - En automatizaciones puntuales

### Segmentación – Deseable
- Categorías más compradas
- Productos frecuentes
- Etiquetas manuales:
    - VIP
    - Riesgo
    - Mayorista

## Campañas por Correo
### Plantillas (DECISIÓN CERRADA)

- Plantillas fijas por:
    - Temporada (Navidad, Black Friday, etc.)
    - Plantilla genérica
- Las plantillas **no se editan estructuralmente**

Variables permitidas:
- Nombre del cliente
- Código de cupón
- Fecha de vigencia
- Valor del descuento

### Campañas Manuales (One-shot)

Funcionalidad:
- Crear campaña
- Elegir:
    - Plantilla
    - Segmento
- Definir valores dinámicos
- Programar envío (fecha/hora)

## Automatizaciones (ALTO VALOR, BAJO COSTO)

### Implementación
- Cron jobs diarios internos
- Sin colas externas

### Automatizaciones MVP (OBLIGATORIAS)

#### 1. Cumpleaños
- Se envía el día del cumpleaños
- Incluye cupón automático

#### 2. Re-activación (Win-back)
- Condiciones:
    - Sin compras en 30 / 60 / 90 días
- Acción:
    - Envío automático de incentivo

### Automatizaciones Futuras (NO IMPLEMENTAR AHORA)
- Post-compra
- Encuestas
- Feedback

## Cupones y Descuentos
### Motor de Cupones – MVP

Propiedades:
- Código:
    - General
    - Único por cliente
- Tipo:
    - Porcentaje
    - Valor fijo
- Restricciones:
    
    - Vigencia
    - Monto mínimo
    - Máximo 1 uso por cliente

Estados:
- Válido
- Usado
- Vencido
- No aplicable

## Consentimiento y Seguridad (MVP LEGAL)
- Campo obligatorio:
    - `acceptsMarketing`
- Si es `false`:
    - No enviar correos
- Link de desuscripción básico (opcional en MVP, recomendado)

## Frontend – Panel Administrativo (React)
### Rutas
- Agregar `/loyalty` al panel admin

### Pantallas a Implementar
- LoyaltyDashboard
- SegmentsList / SegmentForm
- CampaignsList / CampaignForm
- CouponsList / CouponForm

> UI simple, funcional, sin foco estético.

## Verificación (OBLIGATORIA)
### Tests Automatizados
- `validateCoupon`
- Evaluación de reglas de segmentación
- Mock de envío de emails

### Verificación Manual
- Crear cupón → aplicarlo → verificar uso
- Crear campaña → enviar → verificar salida email
- Ejecutar cron manual → verificar correos automáticos

## Resultado Esperado
Un módulo que:
- Funcione sin costos adicionales
- Sea fácil de mantener
- Aporte valor inmediato al negocio
- Sirva como base para futuras mejoras

## Evaluación Final
Este documento:
- Cierra decisiones
- Evita ambigüedades
- Está listo para **ejecución directa por una IA desarrolladora**
- Minimiza riesgos de sobreingeniería