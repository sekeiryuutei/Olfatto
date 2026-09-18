# Olfatto

Plataforma social de descubrimiento, reseñas y perfilado olfativo. No solo qué perfume te gusta, sino cómo se comporta realmente en diferentes personas.

> 📋 Ver [`PROGRESS.md`](./PROGRESS.md) para el estado exacto de avance contra la especificación completa.
> 🚀 Ver [`INSTALL.md`](./INSTALL.md) para instalar y probar el proyecto paso a paso desde cero.

## ¿Qué es Olfatto?

Catálogo de fragancias + reseñas reales de usuarios + duración y proyección experimentadas + rendimiento por tipo de piel + perfil olfativo personal + rankings + wishlist/colección + recomendaciones. Pensada como una PWA mobile-first con estética premium, minimalista y oscura — no como una tienda genérica.

## Características (MVP implementado)

- Autenticación: email/password + Google OAuth, refresh tokens rotativos, recuperación de contraseña.
- Perfil olfativo: tipo de piel, preferencias de duración/proyección, familias y notas favoritas/no deseadas.
- Catálogo: búsqueda, filtros (marca, familia, género, concentración, año), orden (relevancia/rating/duración/más reseñados/recientes), paginación.
- Detalle de fragancia: métricas, **distribución de duración** (histograma, no solo un promedio), **rendimiento por tipo de piel**, notas y familias olfativas.
- Reseñas: rating, duración, proyección, comentario (280 caracteres), sistema de "útil" con reglas anti-abuso.
- PWA: instalable, service worker, manifest, i18n (es/en).

Ver `PROGRESS.md` para lo que todavía falta (Rankings, Recommendations, Collection/Wishlist, tests, admin).

## Arquitectura

**Backend**: Modular Monolith + Arquitectura Hexagonal + DDD + SOLID. Cada módulo separa estrictamente:

```
modules/<nombre>/
├── domain/          # Entidades, value objects, puertos (interfaces), excepciones. Sin dependencias de framework.
├── application/     # Use Cases — orquestan el dominio.
└── infrastructure/  # Controllers, DTOs, TypeORM, adapters. Implementa los puertos del dominio.
```

El dominio no depende de NestJS, TypeORM, PostgreSQL ni HTTP — se podría cambiar cualquiera de esos sin tocar las reglas de negocio (ver punto 91 del spec original).

**Frontend**: Angular 18 (standalone components + signals) + Ionic 8 + Tailwind CSS, feature-based (`core/` / `shared/` / `features/`), lazy loading por feature.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 18, Ionic 8, Tailwind CSS, RxJS, @ngx-translate |
| Backend | NestJS 10, TypeScript strict, TypeORM |
| Base de datos | PostgreSQL 16 |
| Infraestructura | Docker, Docker Compose, Nginx |
| Auth | JWT + refresh tokens, Passport (JWT + Google OAuth20), bcrypt |
| Docs API | Swagger / OpenAPI |

## Requisitos

- Docker + Docker Compose (v2)
- Node.js 20+ y npm (solo si querés correr algo fuera de Docker)
- Git

## Instalación rápida

```bash
git clone <tu-fork-o-repo> olfatto
cd olfatto
cp .env.example .env          # y editá los valores, especialmente JWT_SECRET/REFRESH_TOKEN_SECRET/DATABASE_PASSWORD
docker compose -f docker-compose.dev.yml up --build
```

Guía completa, paso a paso, con troubleshooting: **[`INSTALL.md`](./INSTALL.md)**.

## Docker

- `docker-compose.yml` → producción (nginx + backend + frontend + postgres, Postgres no expuesto).
- `docker-compose.dev.yml` → desarrollo (hot reload, Postgres expuesto en `5432`, pgadmin opcional vía `--profile tools`).

## Variables de entorno

Ver [`.env.example`](./.env.example) — nunca commitear un `.env` real (está en `.gitignore`).

## Migraciones

```bash
cd backend
npm run migration:run      # aplica las migraciones pendientes
npm run migration:revert   # revierte la última
```

`synchronize` está siempre en `false` — el esquema solo cambia por migraciones (punto 59).

## Seed

```bash
cd backend
npm run seed
```

Crea marcas, familias, notas, 7 fragancias demo y 4 usuarios demo (contraseña: `Olfatto2026!`) con reseñas reales sobre Sauvage, para que la app tenga datos desde el primer arranque.

## Testing

```bash
cd backend && npm run test        # unit tests (Jest)
cd backend && npm run test:cov    # con cobertura
```

Suite todavía mínima — ver `PROGRESS.md`.

## Swagger

Con el backend corriendo: **http://localhost:3000/api/v1/docs**

## Estructura

```
olfatto/
├── frontend/          # Angular + Ionic + Tailwind
├── backend/           # NestJS — Hexagonal + DDD
├── infrastructure/
│   └── nginx/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── README.md
├── INSTALL.md
└── PROGRESS.md
```

## Contribución

- Ramas: `main`, `develop`, `feature/*`, `fix/*`, `hotfix/*`.
- Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Antes de implementar una funcionalidad: Domain → Use Case → Repository → API → DTO → Frontend service → Component → Tests. No saltar capas.
