# Estado de avance — Olfatto

Última actualización: tras la primera ronda de bugs reales (registro, listado de fragancias) + reseñas con autor/útil + creación de fragancias por usuarios + avatar por URL.

## 🐛 Bugs reales corregidos esta ronda

1. **Registro fallaba ("No pudimos crear tu cuenta")**: `UserProfileOrmEntity` tenía DOS mapeos a la misma columna `user_id` — una `@Column` manual y una relación `@OneToOne` + `@JoinColumn` que nunca se seteaba. TypeORM priorizaba la relación (vacía) sobre el valor real, escribiendo NULL en una columna `UNIQUE NOT NULL` y rompiendo el INSERT. Saqué la relación de ambos lados (`User` y `UserProfile`) — en todo el código siempre trabajé con `userId` directo, nunca con el grafo de relación, así que no se perdió nada.
2. **`GET /fragrances` 500 (`SELECT DISTINCT... ORDER BY`)**: exactamente lo que diagnosticaste — `.skip()/.take()` activa el modo de paginación "inteligente" de TypeORM (DISTINCT + subquery) cuando hay joins, y ese modo exige que el `ORDER BY` esté en el `SELECT`. Cambié a `.offset()/.limit()` (SQL crudo, sin ese envoltorio) en `postgres-fragrance.repository.ts` **y** en `postgres-review.repository.ts` (mismo bug, se iba a disparar apenas alguien ordenara reseñas por "más útil" — lo até antes de que lo reportaras).

## ✅ Nuevo esta ronda

- **Reseñas**: autor (nombre + avatar, con fallback a inicial) vía JOIN con `users`; botón "útil" funcional con contador (marca/desmarca, estado local de sesión ya que el endpoint de listado es público y no sabe quién sos); orden por defecto ahora es "más relevantes" (más útiles primero) con límite configurable (top 10).
- **Favoritos/Wishlist/Colección**: ya estaban conectados desde la entrega anterior — lo que agregué es feedback visible cuando falla algo (antes revertía en silencio, por eso probablemente parecía que "no hacía nada" mientras el backend estaba roto por los bugs de arriba).
- **Crear fragancias**: cualquier usuario autenticado puede publicar una fragancia nueva (antes era solo ADMIN). Pantalla completa en `/fragrances/create` (el botón `+` del nav ahora lleva ahí): nombre, marca (elegís una existente o creás una nueva al vuelo), concentración, género, año, imagen por URL, descripción, familias y notas. Nuevos endpoints `GET/POST /brands`, `GET /families`, `GET /notes`.
- **Avatar**: `PATCH /users/me` ya soportaba `avatarUrl` desde el principio — lo que faltaba era la UI. Ahora en Perfil podés tocar tu avatar y pegar una URL de imagen.
- **Imágenes de fragancias**: el seed nunca las cargaba — ahora sí (placeholders genéricos con el nombre de cada perfume, no fotos reales de producto). Si ya tenés datos cargados, corré `update-existing-images.sql` (adjunto) para no perder tus reseñas re-seedeando.

## ⚠️ Pendiente de lo que pediste

- **Subir foto de perfil como archivo real**: lo que hay hoy es pegar una URL. Subida real (`<input type="file">` → backend con Multer → almacenamiento) es más trabajo de infraestructura (storage, servir estático) que no llegué a hacer esta ronda.
- **Fotos reales de las lociones**: la plomería ya funciona (mostrás lo que sea que esté en `imageUrl`), pero las URLs son placeholders — necesitás fotos con licencia real para producción.

## Checklist del punto 88 — sigue completo, con lo de arriba ahora más sólido

Nada del checklist en sí cambió de estado (ya estaba todo implementado), pero **Reviews**, **Wishlist/Colección** y **Recomendaciones** pasaron de "conectado pero posiblemente roto en silencio" a "con manejo de errores visible y bugs de fondo corregidos". Sigue pendiente lo mismo que ya estaba documentado: breakpoints responsive de tablet/desktop, más tests, subida real de archivos, Admin (fuera de MVP por diseño).

## Cómo seguir

Decime qué probaste y qué encontraste — con el registro y el listado de fragancias arreglados, deberías poder recorrer el flujo completo (registro → catálogo → detalle → reseña → útil → favoritos/wishlist → crear fragancia → perfil) sin choques. Si algo sigue fallando, pegame el log del backend tal como la vez pasada — ahí está la respuesta siempre.
