# Instalación desde cero y guía de pruebas — Olfatto

Esta guía asume que no tenés nada instalado más que Docker y Git. Todo el código fue escrito a mano (no pude correr `npm install` en el entorno donde lo generé porque no tiene acceso a red), así que el **Paso 3** es el que más probablemente necesite un ajuste — si algo falla ahí, pegame el error y lo corrijo.

---

## 0. Requisitos

- **Docker Desktop** (o Docker Engine + Compose v2 en Linux) — [docker.com](https://www.docker.com/products/docker-desktop/)
- **Git**
- Opcional, solo si querés correr algo fuera de Docker: **Node.js 20+**

Verificá que tenés todo:

```bash
docker --version
docker compose version
git --version
```

---

## 1. Obtener el proyecto

Si ya tenés la carpeta `olfatto/` (por ejemplo, descomprimida del zip que te entregué), saltá al paso 2. Si vas a versionarlo en Git:

```bash
cd olfatto
git init
git add .
git commit -m "chore: initial scaffold"
```

---

## 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Abrí `.env` y como mínimo cambiá estos tres valores (no son opcionales, son secretos):

```
DATABASE_PASSWORD=elegí-una-contraseña
JWT_SECRET=un-string-largo-y-random
REFRESH_TOKEN_SECRET=otro-string-largo-y-random-distinto-al-anterior
```

Para generar strings random rápido:

```bash
openssl rand -base64 32
```

El resto de las variables (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`) podés dejarlas vacías — el login con Google simplemente no va a funcionar hasta que las completes con credenciales reales de [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

---

## 3. Levantar todo con Docker (modo desarrollo)

```bash
docker compose -f docker-compose.dev.yml up --build
```

Esto levanta 3 servicios: `postgres`, `backend` (NestJS con hot reload) y `frontend` (Angular dev server con hot reload).

**Qué esperar:**
- `postgres` debería quedar `healthy` en unos segundos.
- `backend` va a correr `npm install` la primera vez (puede tardar unos minutos) y después `npm run start:dev`.
- `frontend` igual, con `ng serve`.

**Si `backend` falla al arrancar:** casi seguro es un typo de compilación TypeScript en algún archivo — copiame el error completo de la terminal y lo arreglo. El código sigue el patrón de NestJS/TypeORM al pie de la letra, pero no pude compilarlo en el entorno donde lo escribí para verificarlo.

Dejá esta terminal corriendo y abrí una nueva para los siguientes pasos.

---

## 4. Correr las migraciones

Con los contenedores ya arriba, en una terminal nueva:

```bash
docker compose -f docker-compose.dev.yml exec backend npm run migration:run
```

Deberías ver 8 migraciones aplicándose (users, user_profiles, refresh_tokens, brands/notes/families, fragrances, las tablas de relación, reviews, review_helpful).

---

## 5. Cargar datos de prueba (seed)

```bash
docker compose -f docker-compose.dev.yml exec backend npm run seed
```

Esto crea:
- 7 marcas, 10 familias olfativas, 15 notas
- 7 fragancias demo (incluida **Sauvage**, la que usa el documento original en todos sus mockups)
- 4 usuarios demo, contraseña para todos: **`Olfatto2026!`**
  - `admin@olfatto.app` (rol ADMIN)
  - `carlos@olfatto.app`, `ana@olfatto.app`, `laura@olfatto.app`
- 3 reseñas reales sobre Sauvage, para que la distribución de duración y el rendimiento por piel tengan datos desde el primer momento.

---

## 6. Verificar que el backend responde

```bash
curl http://localhost:3000/api/v1/health
```

Esperado:

```json
{"data":{"status":"ok","database":"up"},"meta":{"timestamp":"..."}}
```

Abrí Swagger en el navegador: **http://localhost:3000/api/v1/docs** — ahí podés probar cualquier endpoint directamente, incluido `POST /auth/login`.

---

## 7. Abrir el frontend

**http://localhost:8100**

Deberías ver la pantalla de login de Olfatto (fondo oscuro, dorado, tipografía Cormorant Garamond en el nombre).

---

## 8. Probar el flujo completo a mano

1. **Registrate** con un usuario nuevo (o iniciá sesión con `carlos@olfatto.app` / `Olfatto2026!`).
2. Deberías caer en **Home**, con secciones "Para tu piel" y "Tendencias" mostrando fragancias reales.
3. Tocá la lupa/barra de búsqueda → **Catálogo**: probá buscar "Sauvage", cambiar el orden a "Mayor duración".
4. Entrá al detalle de **Sauvage** → deberías ver:
   - Rating promedio y cantidad de reseñas reales.
   - Histograma de "Duración experimentada".
   - Sección "¿Cómo funciona en diferentes pieles?" con al menos 3 tipos de piel (los del seed: OILY, DRY, COMBINATION).
   - Las 3 reseñas del seed, con su comentario y duración.
5. **Probar la API directamente** (crear una reseña, por ejemplo) vía Swagger:
   - `POST /auth/login` con `carlos@olfatto.app` / `Olfatto2026!` → copiá el `accessToken`.
   - En Swagger, botón "Authorize" (arriba a la derecha) → pegá el token.
   - `POST /fragrances/{id}/reviews` sobre una fragancia que Carlos **no** haya reseñado todavía (Sauvage ya tiene la suya — probá con Bleu de Chanel).

---

## 9. Correr los tests

```bash
docker compose -f docker-compose.dev.yml exec backend npm run test
```

(Suite todavía mínima — ver `PROGRESS.md`.)

---

## 10. Modo producción (opcional, para probar el build real)

```bash
docker compose up --build -d
docker compose exec backend npm run migration:run
docker compose exec backend npm run seed
```

La app queda disponible en **http://localhost** (puerto 80, servida por Nginx — backend y Postgres ya no están expuestos directamente).

Para bajar todo:

```bash
docker compose down          # mantiene los datos (volumen de postgres)
docker compose down -v       # borra también los datos
```

---

## Troubleshooting

| Problema | Causa probable | Solución |
|---|---|---|
| `backend` no arranca, error de TypeScript | Typo en algún archivo (ver nota del paso 3) | Pegame el error exacto de la terminal |
| `ECONNREFUSED` al correr migraciones | Postgres todavía no está `healthy` | Esperá unos segundos y reintentá |
| Frontend no pega al backend (CORS) | `CORS_ORIGIN` en `.env` no coincide con el puerto real del frontend | Confirmá que sea `http://localhost:8100` en dev |
| `EADDRINUSE` en 3000/8100/5432 | Ya tenés algo corriendo en esos puertos | Paralo o cambiá el mapeo de puertos en `docker-compose.dev.yml` |
| Íconos PWA rotos (favicon/manifest) | Son archivos binarios que todavía no generé (ver `PROGRESS.md`) | No bloquea nada funcional; agregalos en `frontend/src/assets/icon/` |
| Login con Google no funciona | `GOOGLE_CLIENT_ID`/`SECRET` vacíos en `.env` | Configurá credenciales OAuth reales en Google Cloud Console |

Cualquier otro error: copiame el mensaje completo (terminal + si aplica, la respuesta de la petición HTTP) y lo resuelvo en el momento.
