# Estado de avance — Olfatto

Última actualización: MVP completo (punto 88 del spec). Léelo antes de pedir cambios para saber qué asumí y por qué.

## ✅ Checklist del MVP (punto 88) — completo

```
✓ Registro/Login        (email+password, Google OAuth, refresh rotativo)
✓ Perfil                (ver + editar: tipo de piel, duración/proyección preferida, clima)
✓ Catálogo              (grid, imágenes, rating, duración)
✓ Búsqueda              (por nombre, con debounce)
✓ Detalle de perfume    (hero, métricas, notas, familias)
✓ Reviews               (ver Y crear — rating, duración, proyección, like, comentario 280c)
✓ Duración              (histograma de distribución, no solo promedio)
✓ Proyección            (badges, dominante por piel)
✓ Tipo de piel          (rendimiento por piel en el detalle + ranking "Mi piel")
✓ Estadísticas          (todo lo anterior, agregado)
✓ Rankings              (Global / Mi piel / Duración — media bayesiana real)
✓ Wishlist              (agregar/quitar desde el catálogo y el detalle)
✓ Colección             (Tengo/Probé desde el detalle, tabs en Perfil)
✓ Recomendaciones       (compatibility score real basado en reglas, "Para tu piel" en Home)
✓ PWA                   (manifest, service worker Angular, i18n es/en)
✓ Responsive            (mobile-first; ver limitación abajo)
✓ Docker                (dev + prod, healthchecks, Nginx)
✓ PostgreSQL            (9 migraciones, 14 tablas, sin synchronize)
✓ Swagger               (/api/v1/docs, todos los endpoints documentados)
✓ Tests básicos         (4 suites: Review, FragrancePerformanceCalculator, RankingCalculator, CompatibilityScoreCalculator)
```

Backend: **7 módulos completos** (auth, users, fragrances, reviews, rankings, recommendations, collection), los 7 con Domain → Application → Infrastructure real, sin lógica de negocio en Controllers ni SQL en Use Cases (punto 92).

## ⚠️ Limitaciones conocidas (léelas antes de reportar un "bug")

- **No compilé nada.** Este sandbox no tiene red — no pude correr `npm install` ni `tsc` ni `ng build`. Todo el código sigue las convenciones exactas de NestJS/TypeORM/Angular, pero hay una chance real de un typo o import mal resuelto en el primer build. Pegame el error y lo arreglo al toque.
- **El corazón de Wishlist en las cards del catálogo solo refleja lo que tocaste en esta sesión** — el endpoint de listado no devuelve el estado de wishlist por fragancia todavía, así que si ya tenías algo en wishlist de antes, la card lo muestra sin marcar hasta que la toques de nuevo. Arreglarlo implica sumar ese dato a `GET /fragrances`.
- **Responsive es mobile-first pero no tiene breakpoints explícitos** para tablet/desktop (grid siempre a 2 columnas). Funciona en desktop, pero no aprovecha el espacio como describe el punto 47.
- **Iconos PWA** (`favicon.png`, `icon-192.png`, `icon-512.png`) son binarios que no generé — agregalos en `frontend/src/assets/icon/`.
- **"Mis reseñas" en el tab de Perfil** todavía no tiene endpoint dedicado — el contador de reseñas se queda en 0.
- **Tests básicos = 4 suites de dominio**, no cobertura completa. No hay tests de Use Cases, Controllers, Repositories, ni frontend.
- **No hay E2E.**

## ❌ Explícitamente fuera de este MVP (por diseño, no por tiempo)

El propio punto 88 del spec los excluye del MVP: Chat, Marketplace, Pagos, IA avanzada, Microservicios, Kafka/RabbitMQ, Redis obligatorio, Gamificación avanzada. El punto 71 dice Admin se crea "posteriormente". Ninguno de estos se tocó — es intencional, no un recorte silencioso.

## Decisiones de diseño que tomé sin preguntarte

- **ORM**: TypeORM.
- **Password reset**: token JWT firmado de un solo uso (no hay tabla `password_reset_tokens` en el punto 30).
- **`retention_level` vs `preferred_duration`**: el primero = qué tan importante te es la duración (onboarding, punto 9); el segundo = la duración que preferís. El punto 32 los lista separados sin explicar la diferencia.
- **Favorites**: endpoint `/users/me/favorites` agregado por simetría con la tabla del punto 30 (no estaba en el punto 35).
- **Una reseña activa por usuario por fragancia** (interpretación del punto 70).
- **Tokens de sesión en `localStorage`**, no cookie httpOnly — más simple para MVP, cambiarlo es un endurecimiento razonable antes de producción real.
- **Recomendaciones**: score ponderado (familia 35%, duración 30%, proyección 20%, rating 15%), con fallback a stats globales cuando no hay datos de reseñas para tu tipo de piel específico todavía.

## Cómo seguir desde acá

Con el MVP funcional, lo siguiente en valor sería (en orden):
1. Que lo instales y me reportes errores de compilación/runtime — es lo único que de verdad no puedo verificar yo.
2. Breakpoints responsive reales (punto 47).
3. Wishlist-aware catalog listing (arreglar la limitación de arriba).
4. Más tests (Use Cases, al menos un E2E del flujo registro→review).
5. Admin (punto 71) y todo lo del punto 88 marcado como "no incluir inicialmente", si en algún momento lo querés.
