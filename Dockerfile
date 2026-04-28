# =============================================================================
# OOP Aerolínea — Dockerfile multi-stage
#
# Stage 1 (build): compila TypeScript a JS y construye el módulo nativo de
# better-sqlite3 con sus dependencias (python/make/g++).
#
# Stage 2 (runtime): imagen mínima con node + tini (PID 1 correcto), usuario
# no-root, healthcheck contra /api/health.
#
# Build:  docker build -t oop-aerolinea:latest .
# Run:    docker run -p 3000:3000 -v oop_data:/app/data oop-aerolinea:latest
# =============================================================================

# ─────────────────────────────────────────────────────────────────────────
# Stage 1 — build
# ─────────────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Build deps necesarias para compilar el binding nativo de better-sqlite3
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Instalar TODAS las dependencias (incluye dev) para poder correr `tsc`
COPY package.json package-lock.json ./
RUN npm ci

# Compilar TypeScript → dist/
COPY tsconfig.json ./
COPY backend ./backend
RUN npm run build

# Limpiar devDeps (queda solo lo de runtime, incluido el .node compilado)
RUN npm prune --omit=dev

# ─────────────────────────────────────────────────────────────────────────
# Stage 2 — runtime
# ─────────────────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime

WORKDIR /app

# tini   → PID 1 correcto (signals + zombie reaping)
# curl   → para el HEALTHCHECK
RUN apt-get update \
 && apt-get install -y --no-install-recommends tini curl ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system app && useradd --system --gid app --create-home app

# Artefactos del build
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist          ./dist
COPY --chown=app:app package.json     ./
COPY --chown=app:app frontend         ./frontend
COPY --chown=app:app scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

# Carpeta para SQLite (montada como volumen)
RUN mkdir -p /app/data && chown -R app:app /app/data
VOLUME /app/data

USER app

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["./start.sh"]
