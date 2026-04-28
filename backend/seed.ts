// ============================================================================
// SEED — Pobla la DB con datos de demostración del sistema OOP_Aerolinea
//
// Ejecutar:  npm run seed
//
// Idempotente: hace DROP de todas las tablas y recrea el esquema antes de
// insertar datos. La DB queda en data/aerolinea.db.
// ============================================================================

import { DatabaseConnection } from "./persistence/DatabaseConnection";
import { AerolineaRepository } from "./persistence/repositorios/AerolineaRepository";
import { AeronaveRepository } from "./persistence/repositorios/AeronaveRepository";
import { PersonaRepository } from "./persistence/repositorios/PersonaRepository";
import { VueloRepository } from "./persistence/repositorios/VueloRepository";

import { Aerolinea } from "./domain/operaciones/Aerolinea";
import { Vuelo } from "./domain/operaciones/Vuelo";
import { Aeroplano } from "./domain/aeronaves/Aeroplano";
import { AvionReactor } from "./domain/aeronaves/AvionReactor";
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

// ─────────────────────────────────────────────────────────────────────────
// 1. AEROLÍNEA (raíz del agregado)
// ─────────────────────────────────────────────────────────────────────────
console.log("\n▶ Creando aerolínea...");
const aerolinea = aerolineaRepo.guardar(
  new Aerolinea(0, "OOP Airlines"),
  new Date("2010-04-15")
);
console.log(`✓ Aerolínea "${aerolinea.getNombre()}" id=${aerolinea.getId()}`);

// ─────────────────────────────────────────────────────────────────────────
// 2. AVIÓN 1 — Boeing 737-800 (avión reactor con árbol completo)
// ─────────────────────────────────────────────────────────────────────────
console.log("\n▶ Creando Boeing 737-800 con árbol completo de piezas...");

const boeing = new AvionReactor("LV-AERO", "Boeing 737-800", 2018);

// Subsistema de propulsión: 2 turbinas, cada una con sus piezas
const subProp = new SubsistemaPropulsion("SUB-PROP-737", "Propulsión Boeing 737");
const turbina1 = new Turbina("TUR-CFM56-A", "CFM56-7B (izq.)", 27300, 117);
turbina1.agregarPieza(new Tornillo("TRN-001", "acero inoxidable", 8, 25, 6, "hexagonal"));
turbina1.agregarPieza(new Tornillo("TRN-002", "titanio", 5, 15, 4, "torx"));
turbina1.agregarPieza(new Tornillo("TRN-003", "titanio", 5, 15, 4, "torx"));
turbina1.agregarPieza(new Tuerca("TRC-001", "acero", 4, 6, "metrica"));
turbina1.agregarPieza(new Arandela("ARN-001", "acero galvanizado", 1, 6, 12));
turbina1.agregarPieza(new Resorte("RST-001", "acero templado", 12, 850, 40));

const turbina2 = new Turbina("TUR-CFM56-B", "CFM56-7B (der.)", 27300, 117);
turbina2.agregarPieza(new Tornillo("TRN-004", "acero inoxidable", 8, 25, 6, "hexagonal"));
turbina2.agregarPieza(new Tornillo("TRN-005", "titanio", 5, 15, 4, "torx"));
turbina2.agregarPieza(new Tuerca("TRC-002", "acero", 4, 6, "metrica"));
turbina2.agregarPieza(new Arandela("ARN-002", "acero galvanizado", 1, 6, 12));

subProp.agregarComponente(turbina1);
subProp.agregarComponente(turbina2);

// Subsistema de aterrizaje
const subAter = new SubsistemaAterrizaje("SUB-ATER-737", "Aterrizaje principal");
const trenPpal = new TrenAterrizaje("TRA-PPAL-737", "Tren Principal", 6, true);
trenPpal.agregarPieza(new Tornillo("TRN-101", "acero", 12, 40, 10, "hexagonal"));
trenPpal.agregarPieza(new Tornillo("TRN-102", "acero", 12, 40, 10, "hexagonal"));
trenPpal.agregarPieza(new Resorte("RST-101", "acero templado", 250, 50000, 200));
trenPpal.agregarPieza(new Resorte("RST-102", "acero templado", 250, 50000, 200));

const trenMorro = new TrenAterrizaje("TRA-MORRO-737", "Tren de Morro", 2, true);
trenMorro.agregarPieza(new Tornillo("TRN-111", "acero", 8, 30, 8, "hexagonal"));

subAter.agregarComponente(trenPpal);
subAter.agregarComponente(trenMorro);

// Subsistema aerodinámico
const subAero = new SubsistemaAerodinamico("SUB-AERO-737", "Aerodinámico");
const alaIzq = new Ala("ALA-IZQ-737", "Ala Izquierda", 17.5, "principal");
alaIzq.agregarPieza(new Tornillo("TRN-201", "titanio", 6, 20, 5, "torx"));
alaIzq.agregarPieza(new Tornillo("TRN-202", "titanio", 6, 20, 5, "torx"));
alaIzq.agregarPieza(new Arandela("ARN-201", "titanio", 2, 5, 10));

const alaDer = new Ala("ALA-DER-737", "Ala Derecha", 17.5, "principal");
alaDer.agregarPieza(new Tornillo("TRN-203", "titanio", 6, 20, 5, "torx"));
alaDer.agregarPieza(new Tornillo("TRN-204", "titanio", 6, 20, 5, "torx"));
alaDer.agregarPieza(new Arandela("ARN-202", "titanio", 2, 5, 10));

const estabilizador = new Ala("ALA-ESTAB-737", "Estabilizador horizontal", 13, "estabilizador");
estabilizador.agregarPieza(new Tornillo("TRN-205", "titanio", 4, 16, 4, "torx"));

subAero.agregarComponente(alaIzq);
subAero.agregarComponente(alaDer);
subAero.agregarComponente(estabilizador);

// Subsistema cabina
const subCab = new SubsistemaCabina("SUB-CAB-737", "Cabina pasajeros");
const cabinaPrincipal = new Cubierta("CAB-PPAL-737", "Cabina principal", 162, 4);
cabinaPrincipal.agregarPieza(new Tornillo("TRN-301", "acero inox", 3, 12, 3, "phillips"));
cabinaPrincipal.agregarPieza(new Tornillo("TRN-302", "acero inox", 3, 12, 3, "phillips"));
cabinaPrincipal.agregarPieza(new Tornillo("TRN-303", "acero inox", 3, 12, 3, "phillips"));

subCab.agregarComponente(cabinaPrincipal);

boeing.agregarSubsistema(subProp);
boeing.agregarSubsistema(subAter);
boeing.agregarSubsistema(subAero);
boeing.agregarSubsistema(subCab);

aeronaveRepo.guardarConArbol(boeing, aerolinea.getId());
console.log(`✓ ${boeing.describir()}`);

// ─────────────────────────────────────────────────────────────────────────
// 3. AVIÓN 2 — Cessna 172 (aeroplano con hélice, más simple)
// ─────────────────────────────────────────────────────────────────────────
console.log("\n▶ Creando Cessna 172...");

const cessna = new Aeroplano("LV-CES", "Cessna 172", 2015);

const subPropC = new SubsistemaPropulsion("SUB-PROP-CES", "Propulsión Cessna");
const helice = new Helice("HEL-MCC-001", "McCauley fixed-pitch", 180, 2, 1.9);
helice.agregarPieza(new Tornillo("TRN-401", "acero", 4, 18, 5, "hexagonal"));
helice.agregarPieza(new Tornillo("TRN-402", "acero", 4, 18, 5, "hexagonal"));
helice.agregarPieza(new Tuerca("TRC-401", "acero", 3, 5, "metrica"));
subPropC.agregarComponente(helice);

const subAterC = new SubsistemaAterrizaje("SUB-ATER-CES", "Aterrizaje Cessna");
const trenC = new TrenAterrizaje("TRA-CES", "Tren fijo Cessna", 3, false);
trenC.agregarPieza(new Resorte("RST-401", "acero templado", 80, 8000, 100));
subAterC.agregarComponente(trenC);

const subAeroC = new SubsistemaAerodinamico("SUB-AERO-CES", "Aerodinámico Cessna");
const alaIzqC = new Ala("ALA-IZQ-CES", "Ala Izquierda Cessna", 5.5, "principal");
alaIzqC.agregarPieza(new Tornillo("TRN-411", "aluminio", 2, 14, 4, "phillips"));
const alaDerC = new Ala("ALA-DER-CES", "Ala Derecha Cessna", 5.5, "principal");
alaDerC.agregarPieza(new Tornillo("TRN-412", "aluminio", 2, 14, 4, "phillips"));
subAeroC.agregarComponente(alaIzqC);
subAeroC.agregarComponente(alaDerC);

const subCabC = new SubsistemaCabina("SUB-CAB-CES", "Cabina Cessna");
const cabinaC = new Cubierta("CAB-CES", "Cabina Cessna", 4, 2);
subCabC.agregarComponente(cabinaC);

cessna.agregarSubsistema(subPropC);
cessna.agregarSubsistema(subAterC);
cessna.agregarSubsistema(subAeroC);
cessna.agregarSubsistema(subCabC);

aeronaveRepo.guardarConArbol(cessna, aerolinea.getId());
console.log(`✓ ${cessna.describir()}`);

// ─────────────────────────────────────────────────────────────────────────
// 4. EMPLEADOS (Jefe + Mecánicos + Pilotos)
// ─────────────────────────────────────────────────────────────────────────
console.log("\n▶ Creando empleados...");

const jefe = new Jefe(
  0, "María Torres", "25444555", new Date("1975-09-21"),
  "EMP-001", new Date("2005-01-10"), 12000,
  "Mantenimiento"
);
personaRepo.guardar(jefe, { aerolineaId: aerolinea.getId() });

const mecanico1 = new Mecanico(
  0, "Carlos López", "28999111", new Date("1980-11-04"),
  "EMP-002", new Date("2008-02-15"), 4500,
  "Motores", ["A&P", "ETOPS"]
);
personaRepo.guardar(mecanico1, { aerolineaId: aerolinea.getId() });
personaRepo.setJefe(mecanico1.getId(), jefe.getId());

const mecanico2 = new Mecanico(
  0, "Sofía Ramírez", "31222333", new Date("1988-04-19"),
  "EMP-003", new Date("2014-09-20"), 4200,
  "Aviónica", ["Avionics", "RVSM"]
);
personaRepo.guardar(mecanico2, { aerolineaId: aerolinea.getId() });
personaRepo.setJefe(mecanico2.getId(), jefe.getId());

const piloto1 = new Piloto(
  0, "Ana García", "30111222", new Date("1985-03-12"),
  "EMP-004", new Date("2010-06-01"), 8500,
  "ATP-AR-12345", 4200
);
personaRepo.guardar(piloto1, { aerolineaId: aerolinea.getId(), aeronaveAsignadaId: boeing.getId() });

const piloto2 = new Piloto(
  0, "Diego Fernández", "29888777", new Date("1982-07-30"),
  "EMP-005", new Date("2009-03-15"), 7800,
  "CPL-AR-22345", 1850
);
personaRepo.guardar(piloto2, { aerolineaId: aerolinea.getId(), aeronaveAsignadaId: cessna.getId() });

console.log(`✓ Jefe: ${jefe.getNombre()}`);
console.log(`✓ Mecánicos: ${mecanico1.getNombre()}, ${mecanico2.getNombre()}`);
console.log(`✓ Pilotos: ${piloto1.getNombre()} (${boeing.getMatricula()}), ${piloto2.getNombre()} (${cessna.getMatricula()})`);

// ─────────────────────────────────────────────────────────────────────────
// 5. PASAJEROS y VUELO
// ─────────────────────────────────────────────────────────────────────────
console.log("\n▶ Creando pasajeros y vuelo...");

const pasajeros = [
  new Pasajero(0, "Lucía Ruiz", "40111222", new Date("1992-07-08"), "TKT-101", "ejecutiva"),
  new Pasajero(0, "Pedro Sosa", "39222111", new Date("1990-02-17"), "TKT-102", "economica"),
  new Pasajero(0, "Sol Méndez", "41333222", new Date("1995-12-30"), "TKT-103", "primera"),
  new Pasajero(0, "Tomás Núñez", "38999111", new Date("1989-08-04"), "TKT-104", "economica"),
  new Pasajero(0, "Valentina Páez", "42555444", new Date("1996-05-15"), "TKT-105", "economica"),
];
for (const p of pasajeros) personaRepo.guardar(p);

const vuelo = new Vuelo(
  "OOP-101", "EZE", "MAD",
  new Date("2026-05-15"),
  boeing, piloto1
);
for (const p of pasajeros) vuelo.embarcar(p);
vueloRepo.guardar(vuelo);

console.log(`✓ ${vuelo.describir()}`);

// ─────────────────────────────────────────────────────────────────────────
// Resumen
// ─────────────────────────────────────────────────────────────────────────
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
console.log(`    - Pilotos:    ${cuenta("personas WHERE tipo = 'piloto'")}`);
console.log(`    - Mecánicos:  ${cuenta("personas WHERE tipo = 'mecanico'")}`);
console.log(`    - Jefes:      ${cuenta("personas WHERE tipo = 'jefe'")}`);
console.log(`    - Pasajeros:  ${cuenta("personas WHERE tipo = 'pasajero'")}`);
console.log(`  Vuelos:       ${cuenta("vuelos")}`);
console.log(`  Embarques:    ${cuenta("vuelo_pasajeros")}`);
console.log(`  Certificac.:  ${cuenta("mecanico_certificaciones")}`);
console.log();

conn.close();
