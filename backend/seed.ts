// ============================================================================
// SEED — Pobla la DB con datos de demostración del sistema OOP_Aerolinea
//
// Ejecutar:  npm run seed
//
// Idempotente: hace DROP de todas las tablas y recrea el esquema antes de
// insertar datos. La DB queda en data/aerolinea.db.
//
// Contenido:
//   · 1 aerolínea
//   · 6 aeronaves (4 reactores + 2 aeroplanos a hélice)
//   · ~80+ piezas distribuidas en componentes y subsistemas
//   · 12 empleados (2 jefes, 4 mecánicos, 6 pilotos)
//   · 30 pasajeros
//   · 8 vuelos en distintos estados (programado, embarcando, en_vuelo,
//     aterrizado, cancelado)
// ============================================================================

import { DatabaseConnection } from "./persistence/DatabaseConnection";
import { AerolineaRepository } from "./persistence/repositorios/AerolineaRepository";
import { AeronaveRepository } from "./persistence/repositorios/AeronaveRepository";
import { PersonaRepository } from "./persistence/repositorios/PersonaRepository";
import { VueloRepository } from "./persistence/repositorios/VueloRepository";

import { Aerolinea } from "./domain/operaciones/Aerolinea";
import { Vuelo } from "./domain/operaciones/Vuelo";
import { EstadoVuelo } from "./domain/operaciones/EstadoVuelo";
import { Aeroplano } from "./domain/aeronaves/Aeroplano";
import { AvionReactor } from "./domain/aeronaves/AvionReactor";
import { Aeronave } from "./domain/aeronaves/Aeronave";
import { SubsistemaPropulsion } from "./domain/subsistemas/SubsistemaPropulsion";
import { SubsistemaAterrizaje } from "./domain/subsistemas/SubsistemaAterrizaje";
import { SubsistemaAerodinamico } from "./domain/subsistemas/SubsistemaAerodinamico";
import { SubsistemaCabina } from "./domain/subsistemas/SubsistemaCabina";
import { Turbina } from "./domain/componentes/Turbina";
import { Helice } from "./domain/componentes/Helice";
import { TrenAterrizaje } from "./domain/componentes/TrenAterrizaje";
import { Ala } from "./domain/componentes/Ala";
import { Cubierta } from "./domain/componentes/Cubierta";
import { Tornillo } from "./domain/piezas/Tornillo";
import { Tuerca } from "./domain/piezas/Tuerca";
import { Arandela } from "./domain/piezas/Arandela";
import { Resorte } from "./domain/piezas/Resorte";
import { Piloto } from "./domain/personas/Piloto";
import { Mecanico } from "./domain/personas/Mecanico";
import { Jefe } from "./domain/personas/Jefe";
import { Pasajero } from "./domain/personas/Pasajero";

console.log("\n▶ Reiniciando esquema de la base de datos...");
const conn = DatabaseConnection.getInstance();
conn.resetSchema();
console.log("✓ Esquema reiniciado.");

const aerolineaRepo = new AerolineaRepository();
const aeronaveRepo = new AeronaveRepository();
const personaRepo = new PersonaRepository();
const vueloRepo = new VueloRepository();

// =========================================================================
// 1. AEROLÍNEA
// =========================================================================
console.log("\n▶ Creando aerolínea...");
const aerolinea = aerolineaRepo.guardar(
  new Aerolinea(0, "OOP Airlines"),
  new Date("2010-04-15")
);
console.log(`✓ ${aerolinea.getNombre()} (id=${aerolinea.getId()})`);

// =========================================================================
// Helpers para reducir verbosidad del seed
// =========================================================================
let pieceCounter = 0;
function nextPieceCode(prefix: string): string {
  pieceCounter++;
  return `${prefix}-${String(pieceCounter).padStart(4, "0")}`;
}

function poblarTurbina(t: Turbina): Turbina {
  t.agregarPieza(new Tornillo(nextPieceCode("TRN"), "acero inoxidable", 8, 25, 6, "hexagonal"));
  t.agregarPieza(new Tornillo(nextPieceCode("TRN"), "titanio", 5, 15, 4, "torx"));
  t.agregarPieza(new Tornillo(nextPieceCode("TRN"), "titanio", 5, 15, 4, "torx"));
  t.agregarPieza(new Tuerca(nextPieceCode("TRC"), "acero", 4, 6, "metrica"));
  t.agregarPieza(new Tuerca(nextPieceCode("TRC"), "acero", 4, 6, "metrica"));
  t.agregarPieza(new Arandela(nextPieceCode("ARN"), "acero galvanizado", 1, 6, 12));
  t.agregarPieza(new Resorte(nextPieceCode("RST"), "acero templado", 12, 850, 40));
  return t;
}

function poblarHelice(h: Helice): Helice {
  h.agregarPieza(new Tornillo(nextPieceCode("TRN"), "acero", 4, 18, 5, "hexagonal"));
  h.agregarPieza(new Tornillo(nextPieceCode("TRN"), "acero", 4, 18, 5, "hexagonal"));
  h.agregarPieza(new Tuerca(nextPieceCode("TRC"), "acero", 3, 5, "metrica"));
  h.agregarPieza(new Resorte(nextPieceCode("RST"), "acero templado", 8, 200, 30));
  return h;
}

function poblarTren(tr: TrenAterrizaje, neumaticos: number): TrenAterrizaje {
  for (let i = 0; i < neumaticos; i++) {
    tr.agregarPieza(new Tornillo(nextPieceCode("TRN"), "acero", 12, 40, 10, "hexagonal"));
  }
  tr.agregarPieza(new Resorte(nextPieceCode("RST"), "acero templado", 250, 50000, 200));
  if (neumaticos >= 4) {
    tr.agregarPieza(new Resorte(nextPieceCode("RST"), "acero templado", 250, 50000, 200));
  }
  return tr;
}

function poblarAla(a: Ala): Ala {
  a.agregarPieza(new Tornillo(nextPieceCode("TRN"), "titanio", 6, 20, 5, "torx"));
  a.agregarPieza(new Tornillo(nextPieceCode("TRN"), "titanio", 6, 20, 5, "torx"));
  a.agregarPieza(new Arandela(nextPieceCode("ARN"), "titanio", 2, 5, 10));
  return a;
}

function poblarCubierta(c: Cubierta, puertas: number): Cubierta {
  for (let i = 0; i < puertas; i++) {
    c.agregarPieza(new Tornillo(nextPieceCode("TRN"), "acero inox", 3, 12, 3, "phillips"));
  }
  return c;
}

// =========================================================================
// 2. AVIONES — 6 aeronaves variadas
// =========================================================================
console.log("\n▶ Creando flota de 6 aeronaves...");

interface AvionDef {
  matricula: string;
  modelo: string;
  anio: number;
  tipo: "reactor" | "aeroplano";
  build: () => Aeronave;
}

const avionesDef: AvionDef[] = [
  {
    matricula: "LV-AERO", modelo: "Boeing 737-800", anio: 2018, tipo: "reactor",
    build: () => {
      const a = new AvionReactor("LV-AERO", "Boeing 737-800", 2018);
      const sp = new SubsistemaPropulsion("SUB-PROP-737", "Propulsión Boeing 737");
      sp.agregarComponente(poblarTurbina(new Turbina("TUR-737-A", "CFM56-7B (izq.)", 27300, 117)));
      sp.agregarComponente(poblarTurbina(new Turbina("TUR-737-B", "CFM56-7B (der.)", 27300, 117)));
      const sa = new SubsistemaAterrizaje("SUB-ATER-737", "Aterrizaje 737");
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-737-PPAL", "Tren Principal", 6, true), 6));
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-737-MORRO", "Tren de Morro", 2, true), 2));
      const se = new SubsistemaAerodinamico("SUB-AERO-737", "Aerodinámico 737");
      se.agregarComponente(poblarAla(new Ala("ALA-737-IZQ", "Ala Izquierda", 17.5, "principal")));
      se.agregarComponente(poblarAla(new Ala("ALA-737-DER", "Ala Derecha", 17.5, "principal")));
      se.agregarComponente(poblarAla(new Ala("ALA-737-EST", "Estabilizador horizontal", 13, "estabilizador")));
      const sc = new SubsistemaCabina("SUB-CAB-737", "Cabina 737");
      sc.agregarComponente(poblarCubierta(new Cubierta("CAB-737", "Cabina principal", 162, 4), 4));
      a.agregarSubsistema(sp); a.agregarSubsistema(sa); a.agregarSubsistema(se); a.agregarSubsistema(sc);
      return a;
    },
  },
  {
    matricula: "LV-A320", modelo: "Airbus A320neo", anio: 2021, tipo: "reactor",
    build: () => {
      const a = new AvionReactor("LV-A320", "Airbus A320neo", 2021);
      const sp = new SubsistemaPropulsion("SUB-PROP-A320", "Propulsión A320");
      sp.agregarComponente(poblarTurbina(new Turbina("TUR-A320-A", "PW1100G (izq.)", 33000, 130)));
      sp.agregarComponente(poblarTurbina(new Turbina("TUR-A320-B", "PW1100G (der.)", 33000, 130)));
      const sa = new SubsistemaAterrizaje("SUB-ATER-A320", "Aterrizaje A320");
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-A320-PPAL", "Tren Principal", 4, true), 4));
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-A320-MORRO", "Tren de Morro", 2, true), 2));
      const se = new SubsistemaAerodinamico("SUB-AERO-A320", "Aerodinámico A320");
      se.agregarComponente(poblarAla(new Ala("ALA-A320-IZQ", "Ala Izquierda", 17.7, "principal")));
      se.agregarComponente(poblarAla(new Ala("ALA-A320-DER", "Ala Derecha", 17.7, "principal")));
      se.agregarComponente(poblarAla(new Ala("ALA-A320-EST", "Estabilizador", 12.4, "estabilizador")));
      const sc = new SubsistemaCabina("SUB-CAB-A320", "Cabina A320");
      sc.agregarComponente(poblarCubierta(new Cubierta("CAB-A320", "Cabina principal", 180, 4), 4));
      a.agregarSubsistema(sp); a.agregarSubsistema(sa); a.agregarSubsistema(se); a.agregarSubsistema(sc);
      return a;
    },
  },
  {
    matricula: "LV-E190", modelo: "Embraer E190", anio: 2019, tipo: "reactor",
    build: () => {
      const a = new AvionReactor("LV-E190", "Embraer E190", 2019);
      const sp = new SubsistemaPropulsion("SUB-PROP-E190", "Propulsión E190");
      sp.agregarComponente(poblarTurbina(new Turbina("TUR-E190-A", "CF34-10E (izq.)", 18500, 82)));
      sp.agregarComponente(poblarTurbina(new Turbina("TUR-E190-B", "CF34-10E (der.)", 18500, 82)));
      const sa = new SubsistemaAterrizaje("SUB-ATER-E190", "Aterrizaje E190");
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-E190-PPAL", "Tren Principal", 4, true), 4));
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-E190-MORRO", "Tren de Morro", 2, true), 2));
      const se = new SubsistemaAerodinamico("SUB-AERO-E190", "Aerodinámico E190");
      se.agregarComponente(poblarAla(new Ala("ALA-E190-IZQ", "Ala Izquierda", 14.4, "principal")));
      se.agregarComponente(poblarAla(new Ala("ALA-E190-DER", "Ala Derecha", 14.4, "principal")));
      const sc = new SubsistemaCabina("SUB-CAB-E190", "Cabina E190");
      sc.agregarComponente(poblarCubierta(new Cubierta("CAB-E190", "Cabina principal", 100, 2), 2));
      a.agregarSubsistema(sp); a.agregarSubsistema(sa); a.agregarSubsistema(se); a.agregarSubsistema(sc);
      return a;
    },
  },
  {
    matricula: "LV-B787", modelo: "Boeing 787-9 Dreamliner", anio: 2022, tipo: "reactor",
    build: () => {
      const a = new AvionReactor("LV-B787", "Boeing 787-9 Dreamliner", 2022);
      const sp = new SubsistemaPropulsion("SUB-PROP-B787", "Propulsión B787");
      sp.agregarComponente(poblarTurbina(new Turbina("TUR-B787-A", "GEnx-1B (izq.)", 70000, 320)));
      sp.agregarComponente(poblarTurbina(new Turbina("TUR-B787-B", "GEnx-1B (der.)", 70000, 320)));
      const sa = new SubsistemaAterrizaje("SUB-ATER-B787", "Aterrizaje B787");
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-B787-PPAL", "Tren Principal", 8, true), 8));
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-B787-MORRO", "Tren de Morro", 2, true), 2));
      const se = new SubsistemaAerodinamico("SUB-AERO-B787", "Aerodinámico B787");
      se.agregarComponente(poblarAla(new Ala("ALA-B787-IZQ", "Ala Izquierda", 30.0, "principal")));
      se.agregarComponente(poblarAla(new Ala("ALA-B787-DER", "Ala Derecha", 30.0, "principal")));
      se.agregarComponente(poblarAla(new Ala("ALA-B787-EST", "Estabilizador", 19.4, "estabilizador")));
      const sc = new SubsistemaCabina("SUB-CAB-B787", "Cabina B787");
      sc.agregarComponente(poblarCubierta(new Cubierta("CAB-B787", "Cabina principal", 290, 8), 8));
      a.agregarSubsistema(sp); a.agregarSubsistema(sa); a.agregarSubsistema(se); a.agregarSubsistema(sc);
      return a;
    },
  },
  {
    matricula: "LV-CES", modelo: "Cessna 172", anio: 2015, tipo: "aeroplano",
    build: () => {
      const a = new Aeroplano("LV-CES", "Cessna 172", 2015);
      const sp = new SubsistemaPropulsion("SUB-PROP-CES", "Propulsión Cessna");
      sp.agregarComponente(poblarHelice(new Helice("HEL-CES", "McCauley fixed-pitch", 180, 2, 1.9)));
      const sa = new SubsistemaAterrizaje("SUB-ATER-CES", "Aterrizaje Cessna");
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-CES", "Tren fijo", 3, false), 3));
      const se = new SubsistemaAerodinamico("SUB-AERO-CES", "Aerodinámico Cessna");
      se.agregarComponente(poblarAla(new Ala("ALA-CES-IZQ", "Ala Izquierda", 5.5, "principal")));
      se.agregarComponente(poblarAla(new Ala("ALA-CES-DER", "Ala Derecha", 5.5, "principal")));
      const sc = new SubsistemaCabina("SUB-CAB-CES", "Cabina Cessna");
      sc.agregarComponente(poblarCubierta(new Cubierta("CAB-CES", "Cabina Cessna", 4, 2), 2));
      a.agregarSubsistema(sp); a.agregarSubsistema(sa); a.agregarSubsistema(se); a.agregarSubsistema(sc);
      return a;
    },
  },
  {
    matricula: "LV-ATR", modelo: "ATR 72-600", anio: 2017, tipo: "aeroplano",
    build: () => {
      const a = new Aeroplano("LV-ATR", "ATR 72-600", 2017);
      const sp = new SubsistemaPropulsion("SUB-PROP-ATR", "Propulsión ATR");
      sp.agregarComponente(poblarHelice(new Helice("HEL-ATR-A", "Hamilton Standard 568F (izq.)", 2750, 6, 3.93)));
      sp.agregarComponente(poblarHelice(new Helice("HEL-ATR-B", "Hamilton Standard 568F (der.)", 2750, 6, 3.93)));
      const sa = new SubsistemaAterrizaje("SUB-ATER-ATR", "Aterrizaje ATR");
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-ATR-PPAL", "Tren Principal", 4, true), 4));
      sa.agregarComponente(poblarTren(new TrenAterrizaje("TRA-ATR-MORRO", "Tren de Morro", 2, true), 2));
      const se = new SubsistemaAerodinamico("SUB-AERO-ATR", "Aerodinámico ATR");
      se.agregarComponente(poblarAla(new Ala("ALA-ATR-IZQ", "Ala Izquierda", 13.5, "principal")));
      se.agregarComponente(poblarAla(new Ala("ALA-ATR-DER", "Ala Derecha", 13.5, "principal")));
      se.agregarComponente(poblarAla(new Ala("ALA-ATR-EST", "Estabilizador", 7.3, "estabilizador")));
      const sc = new SubsistemaCabina("SUB-CAB-ATR", "Cabina ATR");
      sc.agregarComponente(poblarCubierta(new Cubierta("CAB-ATR", "Cabina principal", 70, 2), 2));
      a.agregarSubsistema(sp); a.agregarSubsistema(sa); a.agregarSubsistema(se); a.agregarSubsistema(sc);
      return a;
    },
  },
];

const aeronaves: Aeronave[] = avionesDef.map(def => {
  const a = def.build();
  aeronaveRepo.guardarConArbol(a, aerolinea.getId());
  console.log(`  ✓ ${a.describir()}`);
  return a;
});
const [boeing, a320, e190, b787, cessna, atr72] = aeronaves;

// =========================================================================
// 3. EMPLEADOS (12)
// =========================================================================
console.log("\n▶ Creando empleados...");

const jefeMant = new Jefe(0, "María Torres",   "25444555", new Date("1975-09-21"),
  "EMP-001", new Date("2005-01-10"), 12000, "Mantenimiento");
const jefeOps  = new Jefe(0, "Ricardo Castro", "26777888", new Date("1972-03-04"),
  "EMP-002", new Date("2007-04-22"), 13500, "Operaciones de Vuelo");
personaRepo.guardar(jefeMant, { aerolineaId: aerolinea.getId() });
personaRepo.guardar(jefeOps,  { aerolineaId: aerolinea.getId() });

const mecanicos = [
  new Mecanico(0, "Carlos López",    "28999111", new Date("1980-11-04"),
    "EMP-101", new Date("2008-02-15"), 4500, "Motores",   ["A&P", "ETOPS"]),
  new Mecanico(0, "Sofía Ramírez",   "31222333", new Date("1988-04-19"),
    "EMP-102", new Date("2014-09-20"), 4200, "Aviónica",  ["Avionics", "RVSM"]),
  new Mecanico(0, "Joaquín Vidal",   "33444555", new Date("1990-06-12"),
    "EMP-103", new Date("2016-11-03"), 4100, "Estructura", ["Composite Repair"]),
  new Mecanico(0, "Florencia Díaz",  "34555666", new Date("1991-01-25"),
    "EMP-104", new Date("2017-08-14"), 4000, "Hidráulico", ["Hydraulics", "A&P"]),
];
for (const m of mecanicos) {
  personaRepo.guardar(m, { aerolineaId: aerolinea.getId() });
  personaRepo.setJefe(m.getId(), jefeMant.getId());
}

const pilotos = [
  new Piloto(0, "Ana García",       "30111222", new Date("1985-03-12"),
    "EMP-201", new Date("2010-06-01"), 8500, "ATP-AR-12345", 4200),
  new Piloto(0, "Diego Fernández",  "29888777", new Date("1982-07-30"),
    "EMP-202", new Date("2009-03-15"), 7800, "CPL-AR-22345", 1850),
  new Piloto(0, "Laura Iglesias",   "32555444", new Date("1986-12-09"),
    "EMP-203", new Date("2012-05-20"), 8100, "ATP-AR-33445", 3700),
  new Piloto(0, "Martín Ríos",      "30888666", new Date("1984-08-17"),
    "EMP-204", new Date("2011-09-04"), 8300, "ATP-AR-44556", 4100),
  new Piloto(0, "Cecilia Morales",  "33222111", new Date("1989-02-28"),
    "EMP-205", new Date("2015-07-11"), 7600, "CPL-AR-55667", 2200),
  new Piloto(0, "Federico Bianchi", "31888999", new Date("1987-10-15"),
    "EMP-206", new Date("2013-12-02"), 7900, "ATP-AR-66778", 3300),
];
const aeronavesAsignadas = [boeing, a320, e190, b787, cessna, atr72];
pilotos.forEach((p, i) => {
  personaRepo.guardar(p, {
    aerolineaId: aerolinea.getId(),
    aeronaveAsignadaId: aeronavesAsignadas[i].getId(),
  });
  personaRepo.setJefe(p.getId(), jefeOps.getId());
});

console.log(`  ✓ Jefes: ${jefeMant.getNombre()}, ${jefeOps.getNombre()}`);
console.log(`  ✓ Mecánicos: ${mecanicos.length} bajo ${jefeMant.getNombre()}`);
console.log(`  ✓ Pilotos: ${pilotos.length} bajo ${jefeOps.getNombre()}`);

// =========================================================================
// 4. PASAJEROS (30)
// =========================================================================
console.log("\n▶ Creando 30 pasajeros...");
const nombresP = [
  "Lucía Ruiz", "Pedro Sosa", "Sol Méndez", "Tomás Núñez", "Valentina Páez",
  "Bruno Acosta", "Camila Frías", "Damián Ortiz", "Emilia Vargas", "Franco Lema",
  "Gabriela Soto", "Hernán Pinto", "Inés Bravo", "Julián Coria", "Karen Aguirre",
  "Leandro Mansilla", "Magalí Vera", "Nicolás Quiroga", "Ornella Suárez", "Pablo Toro",
  "Rocío Domínguez", "Sergio Funes", "Tamara Olmos", "Ulises Aldao", "Verónica Pizzi",
  "Wenceslao Cruz", "Ximena Rolón", "Yamil Cardozo", "Zaira Albarracín", "Tobías Wagner",
];
const clases: Array<"economica" | "ejecutiva" | "primera"> = ["economica", "ejecutiva", "primera"];
const pasajeros = nombresP.map((nombre, i) => {
  const dni = String(40000000 + i * 137).padStart(8, "0");
  const año = 1980 + (i % 25);
  const mes = String((i % 12) + 1).padStart(2, "0");
  const día = String((i % 28) + 1).padStart(2, "0");
  const clase = clases[i % 3];
  const p = new Pasajero(0, nombre, dni, new Date(`${año}-${mes}-${día}`),
    `TKT-${String(1000 + i)}`, clase);
  personaRepo.guardar(p);
  return p;
});
console.log(`  ✓ ${pasajeros.length} pasajeros guardados`);

// =========================================================================
// 5. VUELOS (8) — distintos estados
// =========================================================================
console.log("\n▶ Creando 8 vuelos en distintos estados...");

interface VueloDef {
  numero: string;
  origen: string;
  destino: string;
  fecha: string;
  aeronave: Aeronave;
  pilotoIdx: number;        // índice en pilotos[]
  pasajerosIdx: number[];   // índices en pasajeros[]
  estado: EstadoVuelo;
}

const vuelosDef: VueloDef[] = [
  // 2 PROGRAMADOS (futuros, sin embarque aún)
  { numero: "OOP-101", origen: "EZE", destino: "MAD", fecha: "2026-06-15",
    aeronave: boeing, pilotoIdx: 0, pasajerosIdx: [0, 1, 2, 3, 4], estado: "programado" },
  { numero: "OOP-202", origen: "EZE", destino: "GRU", fecha: "2026-06-18",
    aeronave: e190,   pilotoIdx: 2, pasajerosIdx: [5, 6, 7], estado: "programado" },

  // 1 EMBARCANDO
  { numero: "OOP-303", origen: "EZE", destino: "MIA", fecha: "2026-05-02",
    aeronave: a320,   pilotoIdx: 1, pasajerosIdx: [8, 9, 10, 11, 12, 13], estado: "embarcando" },

  // 1 EN_VUELO
  { numero: "OOP-404", origen: "EZE", destino: "JFK", fecha: "2026-04-28",
    aeronave: b787,   pilotoIdx: 3, pasajerosIdx: [14, 15, 16, 17, 18, 19, 20], estado: "en_vuelo" },

  // 3 ATERRIZADOS
  { numero: "OOP-505", origen: "AEP", destino: "COR", fecha: "2026-04-20",
    aeronave: cessna, pilotoIdx: 4, pasajerosIdx: [21, 22], estado: "aterrizado" },
  { numero: "OOP-606", origen: "EZE", destino: "BOG", fecha: "2026-04-15",
    aeronave: atr72,  pilotoIdx: 5, pasajerosIdx: [23, 24, 25], estado: "aterrizado" },
  { numero: "OOP-707", origen: "EZE", destino: "SCL", fecha: "2026-04-10",
    aeronave: a320,   pilotoIdx: 1, pasajerosIdx: [26, 27, 28], estado: "aterrizado" },

  // 1 CANCELADO
  { numero: "OOP-808", origen: "AEP", destino: "MDZ", fecha: "2026-04-25",
    aeronave: atr72,  pilotoIdx: 5, pasajerosIdx: [29], estado: "cancelado" },
];

for (const def of vuelosDef) {
  const v = new Vuelo(
    def.numero, def.origen, def.destino, new Date(def.fecha),
    def.aeronave, pilotos[def.pilotoIdx], def.estado,
  );
  for (const idx of def.pasajerosIdx) v.embarcar(pasajeros[idx]);
  vueloRepo.guardar(v);
  console.log(`  ✓ ${v.describir()}`);
}

// =========================================================================
// Resumen
// =========================================================================
console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║  SEED COMPLETADO                                            ║");
console.log("╚════════════════════════════════════════════════════════════╝");
const db = conn.getDb();
const cuenta = (t: string) => (db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get() as { c: number }).c;
console.log(`  Aerolíneas:   ${cuenta("aerolineas")}`);
console.log(`  Aeronaves:    ${cuenta("aeronaves")}`);
console.log(`  Subsistemas:  ${cuenta("subsistemas")}`);
console.log(`  Componentes:  ${cuenta("componentes")}`);
console.log(`  Piezas:       ${cuenta("piezas")}`);
console.log(`  Personas:     ${cuenta("personas")}`);
console.log(`    - Jefes:      ${cuenta("personas WHERE tipo = 'jefe'")}`);
console.log(`    - Mecánicos:  ${cuenta("personas WHERE tipo = 'mecanico'")}`);
console.log(`    - Pilotos:    ${cuenta("personas WHERE tipo = 'piloto'")}`);
console.log(`    - Pasajeros:  ${cuenta("personas WHERE tipo = 'pasajero'")}`);
console.log(`  Vuelos:       ${cuenta("vuelos")}`);
console.log(`    - Programados: ${cuenta("vuelos WHERE estado = 'programado'")}`);
console.log(`    - Embarcando:  ${cuenta("vuelos WHERE estado = 'embarcando'")}`);
console.log(`    - En vuelo:    ${cuenta("vuelos WHERE estado = 'en_vuelo'")}`);
console.log(`    - Aterrizados: ${cuenta("vuelos WHERE estado = 'aterrizado'")}`);
console.log(`    - Cancelados:  ${cuenta("vuelos WHERE estado = 'cancelado'")}`);
console.log(`  Embarques:    ${cuenta("vuelo_pasajeros")}`);
console.log(`  Certificac.:  ${cuenta("mecanico_certificaciones")}`);
console.log();

conn.close();
