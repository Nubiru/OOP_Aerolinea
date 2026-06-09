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

> **Modelo base / playground:** la carpeta [`playground-asociaciones/`](playground-asociaciones/)
> contiene el modelo standalone del aeroplano (actividad del 14/04/2026) que demuestra de
> forma aislada las 5 relaciones OOP en un solo archivo. Fue la base conceptual de este
> sistema completo.

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

## Docker / Podman

El mismo `docker-compose.yml` funciona con ambos runtimes. Elegí el que tengas instalado.

### Levantar todo con un solo comando

```bash
# Con Docker
docker compose up --build

# Con Podman
podman compose up --build
# (alternativa antigua: podman-compose up --build)
```

La API queda en `http://localhost:3000`. Está incluido el frontend estático servido por el mismo proceso.

### Poblar la DB dentro del contenedor

```bash
# Docker
docker compose exec api node dist/seed.js
docker compose exec api node dist/verify.js

# Podman
podman compose exec api node dist/seed.js
podman compose exec api node dist/verify.js
```

> **Tip alternativo**: setear `AUTO_SEED=true` en el environment hace que el seed corra automáticamente al boot si la DB no existe (útil en hosts sin disco persistente, ver sección Render).

### Persistencia

El volumen nombrado `oop_aerolinea_data` preserva la base entre restarts. Para reiniciar de cero:

```bash
# Docker
docker compose down -v       # borra el volumen
docker compose up --build    # vuelve a empezar

# Podman
podman compose down -v
podman compose up --build
```

### Detalles del Dockerfile

- **Multi-stage**: stage 1 compila TS y construye el módulo nativo de `better-sqlite3` con `python3/make/g++`; stage 2 es runtime mínimo con solo el `node_modules` ya pruneado.
- **Non-root**: corre como usuario `app:app`.
- **`tini` como PID 1**: signals y reaping correctos.
- **HEALTHCHECK** contra `/api/health` cada 30s.
- **Entrypoint inteligente** (`scripts/start.sh`): si `AUTO_SEED=true` y no hay DB, siembra antes de arrancar el servidor.

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

### Arquitectura recomendada

```
┌─────────────────────┐         ┌──────────────────────┐
│  Frontend (Vercel)  │  ────►  │  Backend (Render)    │
│  oop-aerolinea      │  /api/* │  oop-aerolinea-api   │
│  .vercel.app        │ rewrite │  .onrender.com       │
└─────────────────────┘         └──────────────────────┘
                                          │
                                          ▼
                                    SQLite (volumen)
```

> **Importante**: el backend usa `better-sqlite3` (módulo nativo + filesystem persistente), por eso **no funciona en Vercel serverless**. Vercel se usa solo para el frontend; el backend corre en Render (o Fly/Railway/VPS) como contenedor Docker.

### Backend → Render (paso a paso)

El repo incluye `render.yaml` (Blueprint) que automatiza la creación del servicio.

#### Opción A: Free tier (sin disco persistente)

Para una demo que se levanta on-demand. La DB se siembra automáticamente al boot si está vacía (`AUTO_SEED=true`).

> ⚠️ **Limitación**: el free tier de Render no tiene disco persistente y el container se duerme tras 15 min de inactividad. Cada vez que despierta (cold start ~30s) la DB se reinicia con datos demo. Para una demo controlada esto está bien — si insertás datos por la API se pierden al próximo restart.

**Pasos:**

1. **Push del repo** a GitHub (con `render.yaml` ya en la raíz).
2. Entrar a [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint**.
3. Conectar el repo `Nubiru/OOP_Aerolinea`. Render lee `render.yaml` y propone crear el servicio.
4. Click **Apply**. El primer build tarda ~5-7 min (compila el módulo nativo de SQLite).
5. Cuando termina, te da una URL tipo `https://oop-aerolinea-api.onrender.com`.

**Verificar que arrancó:**
```bash
curl https://oop-aerolinea-api.onrender.com/api/health
# {"status":"ok","servicio":"OOP_Aerolinea API"}

curl https://oop-aerolinea-api.onrender.com/api/aeronaves | jq length
# 6  (sembradas automáticamente al boot)
```

#### Opción B: Starter $7/mo + disco persistente $1/mo

Para mantener datos entre restarts. Editar `render.yaml`:

```yaml
plan: starter            # cambia de "free" a "starter"
envVars:
  - key: AUTO_SEED
    value: "false"       # NO sembrar al boot
disk:
  name: aerolinea-data
  mountPath: /app/data
  sizeGB: 1
```

Después del primer deploy, sembrar manualmente desde el shell de Render (UI: tu servicio → Shell):
```bash
node dist/seed.js
```

#### Resumen de la config en Render

| Setting | Valor |
|---|---|
| Service Type | Web Service |
| Runtime | Docker |
| Dockerfile path | `./Dockerfile` |
| Docker Context | `.` |
| Health Check Path | `/api/health` |
| Branch | `main` |
| Auto-Deploy | enabled |
| Env: `NODE_ENV` | `production` |
| Env: `PORT` | `3000` |
| Env: `AUTO_SEED` | `true` (free) o `false` (con disco) |

### Frontend → Vercel

El frontend es estático y deploya en Vercel desde el repo. **`vercel.json` está dentro de `frontend/`**, así que tenés que configurar el **Root Directory = `frontend`** en el proyecto de Vercel.

#### Pasos

1. **Editar `frontend/vercel.json`** y reemplazar `CHANGE-ME-BACKEND-URL.example.com` por la URL de Render obtenida arriba:

   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://oop-aerolinea-api.onrender.com/api/:path*"
       }
     ]
   }
   ```

2. **Push** ese cambio a `main`.

3. En [vercel.com/new](https://vercel.com/new) → **Import** del repo.

4. **Configure Project**:
   - **Root Directory**: `frontend` ← importante
   - Framework Preset: **Other**
   - Build Command: (vacío)
   - Output Directory: (vacío, usa la raíz del root directory)

5. **Deploy**. Te da una URL tipo `https://oop-aerolinea.vercel.app`.

Cómo funciona el proxy: el frontend hace `fetch('/api/aeronaves')`. Vercel intercepta, aplica el rewrite, y reenvía a `https://oop-aerolinea-api.onrender.com/api/aeronaves`. CORS no es problema porque para el browser todo viene del mismo origen.

#### Otros proveedores válidos para el backend

La imagen Docker corre tal cual en:

| Proveedor | Notas |
|---|---|
| **Fly.io** | `fly launch` detecta el Dockerfile. Volume persistente nativo en free tier (3 GB). |
| **Railway** | Detecta Dockerfile. Persistencia con `RAILWAY_VOLUME_MOUNT_PATH=/app/data`. |
| **VPS propio** | `docker compose up -d` o `podman compose up -d`. |

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
│   ├── app.js                clases JS paralelas al backend OOP
│   └── vercel.json           rewrites /api/* → backend de Render
├── scripts/
│   └── start.sh              entrypoint con auto-seed condicional
├── data/                     SQLite (gitignored)
├── .github/workflows/ci.yml  pipeline CI
├── Dockerfile                multi-stage production-grade
├── docker-compose.yml        orquestación local (compatible con podman compose)
├── render.yaml               Blueprint de Render (free + paid options)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Licencia

Proyecto académico — uso libre para fines educativos.
