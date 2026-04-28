# OOP_Aerolinea

> Sistema de gestión de aerolínea construido como práctica universitaria de **Programación Orientada a Objetos**. Ejercita el espectro completo de relaciones OOP en un dominio realista: una aerolínea que gestiona su flota y rastrea cada avión hasta el último tornillo.

[![CI](https://github.com/Nubiru/OOP_Aerolinea/actions/workflows/ci.yml/badge.svg)](https://github.com/Nubiru/OOP_Aerolinea/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-20.x-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

---

## Tabla de contenidos

- [Relaciones OOP cubiertas](#relaciones-oop-cubiertas)
- [Arquitectura](#arquitectura)
- [Stack](#stack)
- [Quick start (local)](#quick-start-local)
- [Docker](#docker)
- [API REST](#api-rest)
- [CI / CD](#ci--cd)
- [Deployment](#deployment)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## Relaciones OOP cubiertas

| Relación | Símbolo UML | Ejemplo |
|---|---|---|
| **Herencia** (is-a) | `◁——` | `Persona → Empleado → {Piloto, Mecánico, Jefe}` · `Pieza → {Tornillo, Tuerca, Arandela, Resorte}` |
| **Composición** (has-a fuerte) | `◆——` | `Aeronave ◆ Subsistema ◆ Componente ◆ Pieza` (4 niveles, `ON DELETE CASCADE`) |
| **Agregación** (has-a débil) | `◇——` | `Aerolínea ◇ Avión[]` · `Vuelo ◇ Pasajero[]` |
| **Asociación** | `——` | `Piloto ↔ Aeronave` · `Jefe ↔ Subordinados[]` · `Vuelo ↔ Aeronave/Piloto` |
| **Dependencia** | `··>` | `TorreDeControl.autorizar(vuelo)` · `ServicioMantenimiento.inspeccionar(aeronave)` |
| **Clase anidada** | `(static)` | `Aeronave.Diagnostico` opera sobre la aeronave que la contiene |

Además se aplica una **máquina de estados** para `Vuelo`:
```
programado ──┬─→ embarcando ──┬─→ en_vuelo ──→ aterrizado (terminal)
             └────────────────┴─→ cancelado (terminal)
```

---

## Arquitectura

```
┌──────────────────────────────┐
│  Frontend (vanilla JS / SPA) │  ← Vercel (estático)
│   FlotaView / EmpleadosView  │
│   VuelosView / DiagnosticoView│
└────────────┬─────────────────┘
             │  fetch /api/*
             ▼
┌──────────────────────────────┐
│  Backend (Express + TS)      │  ← Docker en Render/Fly.io/local
│  ┌────────────────────────┐  │
│  │  api/  controllers     │  │  ← validación, errores HTTP tipados
│  │        serializers     │  │
│  │        routes          │  │
│  └────────────┬───────────┘  │
│               ▼              │
│  ┌────────────────────────┐  │
│  │  domain/  Persona      │  │  ← clases OOP puras (sin DB)
│  │           Pieza        │  │
│  │           Componente   │  │
│  │           Subsistema   │  │
│  │           Aeronave     │  │  ← contiene Diagnostico (clase anidada)
│  │           Aerolinea    │  │
│  │           Vuelo        │  │
│  └────────────┬───────────┘  │
│               ▼              │
│  ┌────────────────────────┐  │
│  │  persistence/          │  │  ← Repository pattern
│  │   schema.ts (SQL)      │  │
│  │   DatabaseConnection   │  │  ← Singleton
│  │   *Repository (×7)     │  │  ← hidratación polimórfica (STI)
│  └────────────┬───────────┘  │
│               ▼              │
│        SQLite (volume)       │  ← /app/data/aerolinea.db
└──────────────────────────────┘
```

**Patrones aplicados:** Singleton (DB), Repository, Composite (jerarquía Avión→Pieza), Single Table Inheritance (DB).

---

## Stack

- **Backend**: Node.js 20 · TypeScript 5 · Express 5 · better-sqlite3
- **Frontend**: HTML + vanilla JS (clases OOP paralelas al backend)
- **Persistencia**: SQLite con WAL + foreign keys
- **Infraestructura**: Docker multi-stage · GitHub Actions CI · Vercel (frontend)

---

## Quick start (local)

```bash
git clone git@github.com:Nubiru/OOP_Aerolinea.git
cd OOP_Aerolinea
npm install

npm run seed         # poblar SQLite con datos demo (6 aviones, 12 empleados, 8 vuelos)
npm run dev          # backend en :3000, frontend estático en :5173
```

Abrir `http://localhost:5173`.

### Otros scripts

| Comando | Para qué sirve |
|---|---|
| `npm run demo` | Demo del modelo de dominio en consola (sin DB) |
| `npm run seed` | Recrea la DB y la pobla con datos de demostración |
| `npm run verify` | Round-trip DB → dominio: carga avión, ejecuta `Diagnostico.generarReporte()` |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Corre la versión compilada (`dist/index.js`) |

---

## Docker

### Levantar todo con un solo comando

```bash
docker compose up --build
```

La API queda en `http://localhost:3000`. Está incluido el frontend estático servido por el mismo proceso.

### Poblar la DB dentro del contenedor

```bash
docker compose exec api node dist/seed.js
docker compose exec api node dist/verify.js
```

### Persistencia

El volumen nombrado `oop_aerolinea_data` preserva la base entre restarts. Para reiniciar de cero:

```bash
docker compose down -v       # borra el volumen
docker compose up --build    # vuelve a empezar
```

### Detalles del Dockerfile

- **Multi-stage**: stage 1 compila TS y construye el módulo nativo de `better-sqlite3` con `python3/make/g++`; stage 2 es runtime mínimo con solo el `node_modules` ya pruneado.
- **Non-root**: corre como usuario `app:app`.
- **`tini` como PID 1**: signals y reaping correctos.
- **HEALTHCHECK** contra `/api/health` cada 30s.

---

## API REST

Base URL: `http://localhost:3000/api`

### Aerolíneas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/aerolineas` | Lista con contadores agregados (SQL) |
| GET | `/aerolineas/:id` | Una aerolínea |
| GET | `/aerolineas/:id/miembros` | Con flota + empleados embebidos |
| POST | `/aerolineas` | Crear |
| PUT | `/aerolineas/:id` | Actualizar nombre/fundación |
| DELETE | `/aerolineas/:id` | Eliminar |

### Aeronaves
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/aeronaves` | Lista con contadores agregados |
| GET | `/aeronaves?aerolineaId=N` | Filtrar por aerolínea |
| GET | `/aeronaves/:matricula` | Una aeronave |
| GET | `/aeronaves/:matricula/arbol` | Árbol completo: Avión → Subsistema → Componente → Pieza |
| GET | `/aeronaves/:matricula/diagnostico` | Reporte vía `Aeronave.Diagnostico` |
| POST | `/aeronaves` | Crear |
| PUT | `/aeronaves/:matricula` | Actualizar |
| DELETE | `/aeronaves/:matricula` | Eliminar (CASCADE) |

### Personas (polimórfico)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/personas` | Todas |
| GET | `/personas?tipo=piloto` | Filtro polimórfico (jefe / mecanico / piloto / pasajero) |
| GET | `/personas/:id` | Una persona |
| GET | `/personas/:id/subordinados` | Subordinados (solo Jefes) |
| POST | `/personas/pilotos` · `/mecanicos` · `/jefes` · `/pasajeros` | Crear según subclase |
| PUT | `/personas/:id` | Actualizar campos editables |
| PUT | `/personas/:id/asignar-aeronave` | Asociar piloto a aeronave |
| PUT | `/personas/:id/jefe` | Asignar jefe (Jefe → Subordinado) |
| DELETE | `/personas/:id` | Eliminar |

### Vuelos (con máquina de estados)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/vuelos` | Todos (incluye `estado` + `transicionesPermitidas`) |
| GET | `/vuelos/:numero` | Con pasajeros embebidos |
| POST | `/vuelos` | Crear |
| PUT | `/vuelos/:numero` | Actualizar origen/destino/fecha |
| PUT | `/vuelos/:numero/estado` | Cambiar estado (valida transición) |
| POST | `/vuelos/:numero/embarcar` | Embarcar pasajero |
| DELETE | `/vuelos/:numero/pasajeros/:pasajeroId` | Desembarcar |
| DELETE | `/vuelos/:numero` | Eliminar |

### Servicios externos (DEPENDENCIA)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/torre/autorizar-despegue/:numeroVuelo` | `TorreDeControl.autorizarDespegue(vuelo)` |
| POST | `/torre/autorizar-aterrizaje/:numeroVuelo` | Idem aterrizaje |
| POST | `/taller/inspeccionar/:matricula` | `ServicioMantenimiento.inspeccionar(aeronave, mecánico)` |
| GET | `/taller/tornillos-a-revisar/:matricula` | Estimación basada en `Aeronave.Diagnostico` |

---

## CI / CD

`.github/workflows/ci.yml` corre en cada push y PR contra `main`:

1. **Test job**: `npm ci` → `npm run build` → `npm run demo` → `npm run seed` → `npm run verify`
2. **Docker job** (depende del anterior): build de la imagen con cache GHA + smoke test de `/api/health`

---

## Deployment

### Frontend → Vercel

El frontend es estático y deploya en Vercel directo desde el repo:

```bash
npm i -g vercel
vercel login
vercel --prod
```

`vercel.json` tiene `outputDirectory: "frontend"` y un **rewrite** de `/api/*` → `BACKEND_URL`. **Antes de pushear**, editá esa URL para apuntar a tu backend desplegado:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://oop-aerolinea-api.tu-dominio.com/api/:path*"
    }
  ]
}
```

> Importante: el backend usa `better-sqlite3` (módulo nativo + filesystem persistente), por eso **no funciona en Vercel serverless**. Vercel se usa solo para el frontend.

### Backend → Docker en cualquier proveedor

La imagen Docker funciona tal cual en:

| Proveedor | Notas |
|---|---|
| **Fly.io** | `fly launch` detecta el Dockerfile. Volume persistente nativo. |
| **Render** | "New Web Service" → "Docker" → apuntar al repo. Free tier con disk. |
| **Railway** | Detecta Dockerfile. Persistencia con `RAILWAY_VOLUME_MOUNT_PATH`. |
| **VPS propio** | `docker compose up -d` y listo. |

En cualquiera, después del primer deploy ejecutar el seed:
```bash
<comando-exec-del-proveedor> node dist/seed.js
```

---

## Estructura del proyecto

```
oop/
├── backend/
│   ├── api/
│   │   ├── controllers/      AerolineaController, AeronaveController, ...
│   │   ├── routes/           routers Express por recurso
│   │   ├── serializers/      DTOs polimórficos (domain → JSON)
│   │   ├── validators/       helpers de validación de input
│   │   ├── middleware/       errorHandler central
│   │   └── errors/           HttpError, NotFound, Validation, Conflict
│   ├── domain/
│   │   ├── personas/         Persona → Empleado → {Piloto, Mecánico, Jefe}, Pasajero
│   │   ├── piezas/           Pieza → {Tornillo, Tuerca, Arandela, Resorte}
│   │   ├── componentes/      Componente, Motor → {Turbina, Hélice}, Tren, Ala, Cubierta
│   │   ├── subsistemas/      Subsistema → {Propulsión, Aterrizaje, Aerodinámico, Cabina}
│   │   ├── aeronaves/        Aeronave (con Diagnostico anidada) → {Aeroplano, AvionReactor}
│   │   ├── operaciones/      Aerolinea, Vuelo + EstadoVuelo
│   │   └── servicios/        TorreDeControl, ServicioMantenimiento (DEPENDENCIA)
│   ├── persistence/
│   │   ├── schema.ts         9 tablas con STI + FKs + índices
│   │   ├── DatabaseConnection.ts  Singleton
│   │   └── repositorios/     Aerolinea, Aeronave, Subsistema, Componente, Pieza, Persona, Vuelo
│   ├── demo.ts               demo del modelo de dominio
│   ├── seed.ts               poblador idempotente
│   ├── verify.ts             round-trip DB → dominio
│   └── index.ts              entry point Express
├── frontend/
│   ├── index.html            SPA con 6 tabs
│   ├── styles.css            sistema de diseño
│   └── app.js                clases JS paralelas al backend OOP
├── data/                     SQLite (gitignored)
├── .github/workflows/ci.yml  pipeline CI
├── Dockerfile                multi-stage production-grade
├── docker-compose.yml        orquestación local
├── vercel.json               config de deploy del frontend
├── package.json
├── tsconfig.json
└── README.md
```

---

## Licencia

Proyecto académico — uso libre para fines educativos.
