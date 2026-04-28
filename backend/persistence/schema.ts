// ============================================================================
// ESQUEMA SQL — Sistema OOP_Aerolinea
//
// ESTRATEGIA: Single Table Inheritance (STI) para las jerarquías de dominio.
// Cada raíz de jerarquía tiene una sola tabla con una columna `tipo` que
// discrimina la clase concreta. Las columnas específicas de cada subclase
// son nullable y solo se llenan cuando el tipo corresponde.
//
// MAPEO DE RELACIONES OOP A FOREIGN KEYS:
//
//   - COMPOSICIÓN (rombo negro): ON DELETE CASCADE
//     Si el padre se borra, los hijos se borran con él.
//     Ejemplo: aeronave → subsistemas → componentes → piezas
//
//   - AGREGACIÓN (rombo blanco): ON DELETE SET NULL
//     Si el agregador se borra, los miembros sobreviven (sin agregador).
//     Ejemplo: aerolínea → aeronaves (los aviones siguen existiendo)
//
//   - ASOCIACIÓN: ON DELETE RESTRICT (no permitir borrar si está asociado)
//     o SET NULL (desvincular). Decisión por caso.
//
// ============================================================================

export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────────────────────────────────
-- AEROLÍNEAS (raíz, agrega aviones y empleados)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aerolineas (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre          TEXT NOT NULL UNIQUE,
  fecha_fundacion TEXT NOT NULL                                 -- ISO yyyy-mm-dd
);

-- ─────────────────────────────────────────────────────────────────────────
-- AERONAVES (STI: aeroplano | reactor)
-- AGREGACIÓN con aerolinea: SET NULL (avión sobrevive si la aerolínea cierra)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aeronaves (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula         TEXT NOT NULL UNIQUE,
  modelo            TEXT NOT NULL,
  anio_fabricacion  INTEGER NOT NULL,
  tipo              TEXT NOT NULL CHECK (tipo IN ('aeroplano','reactor')),
  aerolinea_id      INTEGER REFERENCES aerolineas(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────────────
-- PERSONAS (STI: piloto | mecanico | jefe | pasajero)
-- jefe_id es self-reference para la asociación Jefe→subordinados.
-- aeronave_asignada_id es la asociación Piloto↔Aeronave.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS personas (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre                TEXT NOT NULL,
  dni                   TEXT NOT NULL UNIQUE,
  fecha_nacimiento      TEXT NOT NULL,
  tipo                  TEXT NOT NULL CHECK (tipo IN ('piloto','mecanico','jefe','pasajero')),
  -- Empleado (piloto, mecanico, jefe)
  legajo                TEXT UNIQUE,
  fecha_ingreso         TEXT,
  salario               REAL,
  -- Piloto
  licencia              TEXT,
  horas_vuelo           REAL,
  aeronave_asignada_id  INTEGER REFERENCES aeronaves(id) ON DELETE SET NULL,
  -- Mecanico
  especialidad          TEXT,
  -- Jefe
  departamento          TEXT,
  jefe_id               INTEGER REFERENCES personas(id) ON DELETE SET NULL,
  -- Pasajero
  numero_ticket         TEXT,
  clase                 TEXT CHECK (clase IS NULL OR clase IN ('economica','ejecutiva','primera')),
  -- Aerolínea (solo empleados)
  aerolinea_id          INTEGER REFERENCES aerolineas(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────────────────────────────────
-- SUBSISTEMAS (STI: propulsion | aterrizaje | aerodinamico | cabina)
-- COMPOSICIÓN con aeronave: CASCADE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subsistemas (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo       TEXT NOT NULL UNIQUE,
  nombre       TEXT NOT NULL,
  tipo         TEXT NOT NULL CHECK (tipo IN ('propulsion','aterrizaje','aerodinamico','cabina')),
  aeronave_id  INTEGER NOT NULL REFERENCES aeronaves(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────────
-- COMPONENTES (STI: turbina | helice | tren | ala | cubierta)
-- COMPOSICIÓN con subsistema: CASCADE
-- Las columnas específicas se llenan según el valor de tipo.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS componentes (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo              TEXT NOT NULL UNIQUE,
  nombre              TEXT NOT NULL,
  tipo                TEXT NOT NULL CHECK (tipo IN ('turbina','helice','tren','ala','cubierta')),
  -- Motor (turbina + helice)
  potencia_cv         REAL,
  -- Turbina
  empuje_kn           REAL,
  -- Helice
  num_palas           INTEGER,
  diametro_m          REAL,
  -- TrenAterrizaje
  num_neumaticos      INTEGER,
  es_retractil        INTEGER CHECK (es_retractil IN (0,1) OR es_retractil IS NULL),
  -- Ala
  envergadura_m       REAL,
  posicion            TEXT CHECK (posicion IS NULL OR posicion IN ('principal','estabilizador')),
  -- Cubierta
  capacidad_pasajeros INTEGER,
  num_puertas         INTEGER,
  subsistema_id       INTEGER NOT NULL REFERENCES subsistemas(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────────
-- PIEZAS (STI: tornillo | tuerca | arandela | resorte)
-- COMPOSICIÓN con componente: CASCADE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS piezas (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo              TEXT NOT NULL UNIQUE,
  material            TEXT NOT NULL,
  peso_g              REAL NOT NULL,
  tipo                TEXT NOT NULL CHECK (tipo IN ('tornillo','tuerca','arandela','resorte')),
  -- Tornillo
  longitud_mm         REAL,
  diametro_mm         REAL,
  tipo_cabeza         TEXT CHECK (tipo_cabeza IS NULL OR tipo_cabeza IN ('hexagonal','phillips','torx','allen')),
  -- Tuerca
  medida_mm           REAL,
  tipo_rosca          TEXT CHECK (tipo_rosca IS NULL OR tipo_rosca IN ('metrica','imperial')),
  -- Arandela
  diametro_int_mm     REAL,
  diametro_ext_mm     REAL,
  -- Resorte
  constante_elastica  REAL,
  longitud_reposo_mm  REAL,
  componente_id       INTEGER NOT NULL REFERENCES componentes(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────────────────────
-- CERTIFICACIONES de mecánicos (1:N)
-- COMPOSICIÓN con persona (mecánico): CASCADE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mecanico_certificaciones (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  mecanico_id   INTEGER NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  certificacion TEXT NOT NULL,
  UNIQUE (mecanico_id, certificacion)
);

-- ─────────────────────────────────────────────────────────────────────────
-- VUELOS (asociación con aeronave + piloto)
-- ASOCIACIÓN: usamos RESTRICT — no permitir borrar avión/piloto si tiene
-- vuelos asignados. Es decisión de diseño (alternativa: SET NULL).
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vuelos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  numero        TEXT NOT NULL UNIQUE,
  origen        TEXT NOT NULL,
  destino       TEXT NOT NULL,
  fecha_salida  TEXT NOT NULL,
  aeronave_id   INTEGER NOT NULL REFERENCES aeronaves(id) ON DELETE RESTRICT,
  piloto_id     INTEGER NOT NULL REFERENCES personas(id) ON DELETE RESTRICT
);

-- ─────────────────────────────────────────────────────────────────────────
-- VUELO_PASAJEROS (M:N agregación)
-- AGREGACIÓN con pasajero: SET NULL no aplica en tabla puente. Si se borra
-- el pasajero, se borra solo el vínculo. Si se borra el vuelo, se borra el
-- vínculo (no los pasajeros).
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vuelo_pasajeros (
  vuelo_id     INTEGER NOT NULL REFERENCES vuelos(id) ON DELETE CASCADE,
  pasajero_id  INTEGER NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  asiento      TEXT,
  PRIMARY KEY (vuelo_id, pasajero_id)
);

-- Índices en columnas FK para acelerar las consultas jerárquicas
CREATE INDEX IF NOT EXISTS idx_aeronaves_aerolinea     ON aeronaves(aerolinea_id);
CREATE INDEX IF NOT EXISTS idx_subsistemas_aeronave    ON subsistemas(aeronave_id);
CREATE INDEX IF NOT EXISTS idx_componentes_subsistema  ON componentes(subsistema_id);
CREATE INDEX IF NOT EXISTS idx_piezas_componente       ON piezas(componente_id);
CREATE INDEX IF NOT EXISTS idx_personas_tipo           ON personas(tipo);
CREATE INDEX IF NOT EXISTS idx_personas_aerolinea      ON personas(aerolinea_id);
CREATE INDEX IF NOT EXISTS idx_personas_jefe           ON personas(jefe_id);
CREATE INDEX IF NOT EXISTS idx_vuelos_aeronave         ON vuelos(aeronave_id);
CREATE INDEX IF NOT EXISTS idx_vuelos_piloto           ON vuelos(piloto_id);
`;
