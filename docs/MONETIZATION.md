# Monetización de Olfatto — Arquitectura

Este documento cubre las 3 piezas que pediste. Las primeras dos (Club/Suscripción, Afiliados) tienen código real ya escrito (ver más abajo qué archivos tocar). La tercera (Marketplace de decants) está diseñada a fondo pero no implementada — depende de decisiones de negocio tuyas que están marcadas explícitamente.

---

## 1. Olfatto Club (Freemium / Suscripción)

### Modelo de negocio
- **Free**: todo lo que ya existe (catálogo, reseñas, wishlist, colección, ranking global, recomendaciones básicas por reglas).
- **Club** (pago mensual/anual vía Stripe Checkout): recomendaciones avanzadas, informe de durabilidad en piel detallado, y lo que definas después (badge visual, acceso anticipado a fragancias nuevas, etc.).

### Por qué Stripe y no MercadoPago para arrancar
Stripe tiene mejor soporte de suscripciones recurrentes out-of-the-box (Checkout + Billing Portal + webhooks) y un SDK de Node maduro. MercadoPago es más fuerte para pagos únicos en LATAM (útil para el punto 2 y 3 si en algún momento cobrás comisiones en pesos/dólares locales sin pasarela internacional). Mi recomendación: arrancar con Stripe para el Club (suscripción recurrente, mercado internacional), y evaluar MercadoPago específicamente para el marketplace de decants si tus usuarios son mayormente LATAM — son integraciones independientes, no hay que elegir una sola para todo el proyecto.

### Modelo de datos
```
subscriptions
  id                    UUID PK
  user_id               UUID FK -> users, UNIQUE (un usuario, una suscripción activa a la vez)
  stripe_customer_id    VARCHAR
  stripe_subscription_id VARCHAR NULL
  status                VARCHAR   -- ACTIVE | PAST_DUE | CANCELED | INCOMPLETE
  current_period_end    TIMESTAMPTZ NULL
  created_at / updated_at
```

### Flujo
```
Usuario toca "Unirme a Olfatto Club"
  → POST /billing/checkout-session
  → backend crea una Stripe Checkout Session (modo subscription)
  → frontend redirige a la URL de Stripe
  → usuario paga en Stripe (nunca tocás datos de tarjeta vos — cumplimiento PCI resuelto)
  → Stripe manda un webhook (checkout.session.completed, luego customer.subscription.updated/deleted)
  → backend actualiza la fila en `subscriptions`
  → ClubGuard (nuevo guard, mismo patrón que JwtAuthGuard/RolesGuard) protege los endpoints exclusivos
```

### Endpoints (ya implementados, ver sección de código)
```
POST /billing/checkout-session   (autenticado) → { checkoutUrl }
POST /billing/portal-session     (autenticado) → { portalUrl }  -- para que gestionen/cancelen desde Stripe
POST /billing/webhook            (público, verificado por firma de Stripe)
GET  /billing/me                 (autenticado) → { status, currentPeriodEnd }
```

### Lo que necesitás vos para que funcione de verdad
1. Cuenta de Stripe (modo test para probar, no hace falta cuenta real verificada todavía).
2. Crear un Product + Price recurrente en el Dashboard de Stripe (te da un `price_id`).
3. Completar en `.env`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CLUB_PRICE_ID`.
4. Para probar webhooks en local: `stripe listen --forward-to localhost:3100/api/v1/billing/webhook` (Stripe CLI).

---

## 2. Afiliados ("Comprar al mejor precio")

Mucho más simple: no es dinero que pasa por vos, es un link con tu código de afiliado a una tienda externa (Amazon, Sephora, FragranceX, etc.) — la comisión te la paga el programa de afiliados de esa tienda, no hay integración de pagos de tu lado.

### Modelo de datos
Un solo campo nuevo en `fragrances`: `affiliate_url VARCHAR NULL`.

### Flujo
```
Fragrance tiene affiliateUrl (vos lo cargás manualmente, o lo generás con tu link de afiliado + el nombre del perfume)
  → Botón "Comprar al mejor precio" en el detalle
  → abre affiliateUrl en pestaña nueva (target="_blank")
  → Olfatto no procesa ningún pago, ningún dato de tarjeta
```

Ya implementado (ver código abajo). Lo único que te falta hacer: conseguir tus IDs de afiliado reales (Amazon Associates, programa de Sephora, etc.) y cargar las URLs — eso es un paso manual/de negocio, no técnico.

---

## 3. Marketplace de decants/muestras entre usuarios o tiendas verificadas

Esta es la más grande de las tres — es básicamente un e-commerce con dos lados (compra/venta) más comisión. Antes de escribir una línea de código necesito que definas 4 cosas, porque cada una cambia la arquitectura:

### Decisiones de negocio que necesito de vos

1. **¿Quién puede vender?** ¿Cualquier usuario (marketplace P2P tipo Mercado Libre) o solo "tiendas verificadas" que vos aprobás a mano? Esto define si necesito un flujo de verificación/aprobación de vendedores.
2. **¿Quién retiene el dinero?** Tres opciones, cada una con implicancias legales distintas:
   - **(A) Stripe Connect**: Stripe le paga directo al vendedor, vos te quedás con tu comisión automáticamente (`application_fee_amount`). Es lo más simple técnicamente y lo que recomiendo para arrancar — pero cada vendedor necesita crear su propia cuenta de Stripe Connect (fricción para el vendedor).
   - **(B) Vos cobrás todo y le pagás al vendedor después** (transferencia manual o por lotes). Más simple para el vendedor, pero técnicamente sos vos quien maneja el dinero — en muchas jurisdicciones eso te convierte en un negocio de "money transmission" con requisitos legales/regulatorios. Consultalo con un abogado antes de ir por acá.
   - **(C) Olfatto solo conecta compradores y vendedores** (como un clasificado) y el pago se coordina fuera de la plataforma. Cero fricción técnica y cero riesgo regulatorio, pero no podés cobrar comisión automáticamente — dependés de que el vendedor te pague después, o cobrás una tarifa fija por publicar en vez de % por venta.
3. **¿Es solo decants (muestras que alguien decanta de su propio frasco) o también perfumes completos de segunda mano?** Afecta el modelo de "condición"/cantidad del ítem.
4. **¿Hay envío físico?** Si sí, necesitás una noción mínima de dirección de envío y estado del pedido (pagado → enviado → recibido) — aunque sea manual al principio.

### Modelo de datos propuesto (para cuando definas lo de arriba)
```
decant_listings
  id                UUID PK
  seller_id         UUID FK -> users
  fragrance_id      UUID FK -> fragrances
  volume_ml         DECIMAL
  price             DECIMAL
  currency          VARCHAR
  condition         VARCHAR   -- NEW | DECANTED_FROM_OWN_BOTTLE
  status            VARCHAR   -- ACTIVE | SOLD | REMOVED
  description       TEXT NULL
  created_at / updated_at

decant_orders
  id                UUID PK
  listing_id        UUID FK -> decant_listings
  buyer_id          UUID FK -> users
  quantity          INTEGER
  total_price       DECIMAL
  commission_amount DECIMAL   -- lo que se queda Olfatto
  status            VARCHAR   -- PENDING_PAYMENT | PAID | SHIPPED | COMPLETED | CANCELED | DISPUTED
  payment_provider_ref VARCHAR NULL  -- depende de la opción A/B/C de arriba
  created_at / updated_at
```

### Por qué no lo implemento todavía
Escribir el modelo de datos es la parte fácil — la parte que realmente importa (cómo se mueve la plata, quién asume el riesgo de fraude/devoluciones, si necesitás términos y condiciones de marketplace) depende 100% de las decisiones de arriba. Construirlo antes de que las definas significa alta probabilidad de tener que rehacerlo. Apenas me digas qué opción elegís en cada punto, lo armo con el mismo nivel de profundidad que el resto del proyecto (dominio → aplicación → infraestructura → frontend).
