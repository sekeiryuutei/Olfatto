# Estado de avance — Olfatto

Última actualización: bugs de estante/imágenes corregidos, subida real de avatar, cambio de contraseña, campana de notificaciones (mínima), y arquitectura + código de monetización (Club/Stripe + Afiliados).

## 🐛 Bugs reales corregidos esta ronda

- **Perfil ("Todavía no tienes perfumes aquí" aunque sí había datos)**: `forkJoin` en `loadShelf()` fallaba TODO el lote si una sola fragancia del wishlist/colección daba error al buscarse (ítem borrado, id inconsistente, etc.). Ahora cada fetch tiene su propio `catchError` y se filtran los que fallan — el resto se muestra igual.
- **Imágenes rotas mostrando texto literal (`Bleu+de+Chanel`)**: el seed anterior apuntaba a `placehold.co` (servicio externo). Si tu Docker no tiene salida a internet o el servicio está lento/caído, el navegador podía mostrar el texto de la URL en vez de la imagen. Saqué esa dependencia por completo: ahora hay un placeholder **local en SVG** (`shared/utils/placeholder-image.ts`, cero red) que se usa como imagen por defecto y como fallback automático (`(error)`) en cualquier `<img>` de la app — catálogo, detalle, ranking, avatares de reseña. Si tenés datos viejos con la URL rota, corré `update-existing-images.sql`.

## ✅ Nuevo esta ronda

**Perfil:**
- Subida real de foto de perfil (archivo, no URL) — `POST /users/me/avatar` con Multer, servido desde `/uploads/avatars`. Local disk para MVP; ver nota de S3 en el propio endpoint para producción real.
- Cambio de contraseña (actual + nueva) — `POST /auth/change-password`, distinto del flujo de "olvidé mi contraseña".
- Botón de cerrar sesión (ya existía, ahora más visible).

**Reseñas:** (repaso — esto ya estaba de la ronda anterior, por si no llegó a aplicarse) autor con nombre+avatar, botón "útil" con contador, orden por relevancia con top 10.

**Home:** campana de notificaciones ahora abre un popover — todavía sin generación real de eventos en el backend (ver pendientes).

**Rankings:** cada fila ahora tiene miniatura de imagen.

**Monetización — ver `docs/MONETIZATION.md` para la arquitectura completa:**
- **Afiliados**: campo `affiliateUrl` en Fragrance, botón "Comprar al mejor precio" en el detalle (con disclosure de afiliado). Vos cargás las URLs (es una decisión de negocio/manual, no técnica).
- **Olfatto Club (Stripe)**: módulo `billing` completo — Customer + Checkout Session + Billing Portal + webhook con verificación de firma, entidad `Subscription`, `ClubGuard` para gatear funciones exclusivas. Ya gateado: `GET /recommendations/advanced` (20 resultados + razones del match, en vez de 10 sin razones). Frontend: sección "Olfatto Club" en Perfil con botón de unirse/gestionar.
  - **Para que funcione de verdad necesitás vos**: cuenta de Stripe (modo test alcanza), crear un Product+Price recurrente, completar `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_CLUB_PRICE_ID` en `.env`. Sin eso, el botón "Unirme" va a fallar con un error de Stripe — es esperable, no es un bug.

## ⚠️ Pendiente

- **Marketplace de decants**: diseñado a fondo en `docs/MONETIZATION.md`, sin implementar — depende de 4 decisiones de negocio tuyas (quién vende, quién retiene el dinero, decants vs. perfumes completos, envío físico). Te las dejé explícitas ahí.
- **Informe de durabilidad en piel (Club)**: el endpoint `/recommendations/advanced` ya está, pero el "informe de durabilidad" específico (percentil vs. el catálogo) todavía no — es la siguiente pieza lógica de Club.
- **Notificaciones reales**: el ícono ya abre un popover, pero no hay generación de eventos (alguien marcó tu reseña útil, etc.) — necesita un mini sistema de eventos en el backend.
- Lo que ya estaba documentado antes sigue igual: breakpoints responsive de escritorio, más tests, Admin fuera de MVP por diseño.

## Cómo probar Stripe en local (opcional, solo si ya tenés cuenta)

```bash
stripe listen --forward-to localhost:3100/api/v1/billing/webhook
```
Te da un `whsec_...` para `STRIPE_WEBHOOK_SECRET`. Sin esto, el checkout igual funciona (redirige a Stripe y vuelve), pero el estado de la suscripción no se actualiza solo hasta que el webhook llegue.

## Cómo seguir

Decime qué opción elegís para cada una de las 4 decisiones del marketplace de decants (`docs/MONETIZATION.md`, sección 3) y lo construyo con el mismo nivel de profundidad que el resto. Mientras tanto, probá lo de arriba y contame qué encontrás.
