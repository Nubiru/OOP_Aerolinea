// ============================================================================
// DEMO DEL MODELO DE DOMINIO — Sistema OOP_Aerolinea
// Ejercita las 5 relaciones OOP + clase anidada
// Ejecutar:  npm run demo
// ============================================================================

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
import { ServicioMantenimiento } from "./domain/servicios/ServicioMantenimiento";
import { TorreDeControl } from "./domain/servicios/TorreDeControl";

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║  DEMO OOP_AEROLINEA — Modelo de dominio                     ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

// ─────────────────────────────────────────────────────────────
// 1. Construir la jerarquía Avión → Tornillo (5 niveles)
// ─────────────────────────────────────────────────────────────
console.log("─── 1. COMPOSICIÓN profunda: Avión → Subsistema → Componente → Pieza ───\n");

// Piezas (nivel más bajo)
const tornilloA = new Tornillo("TRN-001", "acero inoxidable", 8, 25, 6, "hexagonal");
const tornilloB = new Tornillo("TRN-002", "titanio", 5, 15, 4, "torx");
const tuerca = new Tuerca("TRC-001", "acero", 4, 6, "metrica");
const arandela = new Arandela("ARN-001", "acero galvanizado", 1, 6, 12);
const resorte = new Resorte("RST-001", "acero templado", 12, 850, 40);

// Componente (Turbina) compone piezas
const turbina = new Turbina("TUR-CFM56-A", "CFM56-7B", 27300, 117);
turbina.agregarPieza(tornilloA);
turbina.agregarPieza(tornilloB);
turbina.agregarPieza(tuerca);
turbina.agregarPieza(arandela);
turbina.agregarPieza(resorte);

const turbina2 = new Turbina("TUR-CFM56-B", "CFM56-7B", 27300, 117);
turbina2.agregarPieza(new Tornillo("TRN-003", "acero inoxidable", 8, 25, 6, "hexagonal"));
turbina2.agregarPieza(new Tornillo("TRN-004", "titanio", 5, 15, 4, "torx"));
turbina2.agregarPieza(new Tuerca("TRC-002", "acero", 4, 6, "metrica"));

const trenPrincipal = new TrenAterrizaje("TRA-001", "Tren Principal", 6, true);
trenPrincipal.agregarPieza(new Tornillo("TRN-101", "acero", 12, 40, 10, "hexagonal"));
trenPrincipal.agregarPieza(new Resorte("RST-002", "acero templado", 250, 50000, 200));

const alaIzq = new Ala("ALA-IZQ", "Ala Izquierda", 17.5, "principal");
alaIzq.agregarPieza(new Tornillo("TRN-201", "titanio", 6, 20, 5, "torx"));
alaIzq.agregarPieza(new Arandela("ARN-201", "titanio", 2, 5, 10));

const alaDer = new Ala("ALA-DER", "Ala Derecha", 17.5, "principal");
alaDer.agregarPieza(new Tornillo("TRN-202", "titanio", 6, 20, 5, "torx"));
alaDer.agregarPieza(new Arandela("ARN-202", "titanio", 2, 5, 10));

const cubierta = new Cubierta("CAB-001", "Cabina principal", 180, 4);
cubierta.agregarPieza(new Tornillo("TRN-301", "acero inox", 3, 12, 3, "phillips"));
cubierta.agregarPieza(new Tornillo("TRN-302", "acero inox", 3, 12, 3, "phillips"));

// Subsistemas componen componentes
const subPropulsion = new SubsistemaPropulsion("SUB-PROP", "Propulsión Boeing 737");
subPropulsion.agregarComponente(turbina);
subPropulsion.agregarComponente(turbina2);

const subAterrizaje = new SubsistemaAterrizaje("SUB-ATER", "Aterrizaje principal");
subAterrizaje.agregarComponente(trenPrincipal);

const subAero = new SubsistemaAerodinamico("SUB-AERO", "Aerodinámico");
subAero.agregarComponente(alaIzq);
subAero.agregarComponente(alaDer);

const subCabina = new SubsistemaCabina("SUB-CAB", "Cabina pasajeros");
subCabina.agregarComponente(cubierta);

// Aeronave compone subsistemas
const boeing = new AvionReactor("LV-AERO", "Boeing 737-800", 2018);
boeing.agregarSubsistema(subPropulsion);
boeing.agregarSubsistema(subAterrizaje);
boeing.agregarSubsistema(subAero);
boeing.agregarSubsistema(subCabina);

console.log(boeing.describir());
console.log();

// Segunda aeronave: un Aeroplano con hélices
const cessna = new Aeroplano("LV-CES", "Cessna 172", 2015);
const subPropCessna = new SubsistemaPropulsion("SUB-PROP-2", "Propulsión Cessna");
const helice = new Helice("HEL-001", "McCauley", 180, 2, 1.9);
helice.agregarPieza(new Tornillo("TRN-401", "acero", 4, 18, 5, "hexagonal"));
helice.agregarPieza(new Tornillo("TRN-402", "acero", 4, 18, 5, "hexagonal"));
subPropCessna.agregarComponente(helice);
cessna.agregarSubsistema(subPropCessna);
console.log(cessna.describir());
console.log();

// ─────────────────────────────────────────────────────────────
// 2. CLASE ANIDADA: Aeronave.Diagnostico
// ─────────────────────────────────────────────────────────────
console.log("─── 2. CLASE ANIDADA: Aeronave.Diagnostico ───\n");

const diagBoeing = boeing.crearDiagnostico();
console.log(`Tornillos en el Boeing: ${diagBoeing.listarPiezasPorTipo("Tornillo").length}`);
console.log(`Tuercas en el Boeing:   ${diagBoeing.listarPiezasPorTipo("Tuerca").length}`);
console.log(`Resortes en el Boeing:  ${diagBoeing.listarPiezasPorTipo("Resorte").length}`);
console.log();
console.log(diagBoeing.generarReporte());
console.log();

// ─────────────────────────────────────────────────────────────
// 3. HERENCIA de Personas: Empleado → Piloto/Mecánico/Jefe
// ─────────────────────────────────────────────────────────────
console.log("\n─── 3. HERENCIA de Personas ───\n");

const piloto = new Piloto(
  1, "Ana García", "30111222", new Date("1985-03-12"),
  "EMP-001", new Date("2010-06-01"), 8500,
  "ATP-AR-12345", 4200
);
const mecanico = new Mecanico(
  2, "Carlos López", "28999111", new Date("1980-11-04"),
  "EMP-002", new Date("2008-02-15"), 4500,
  "Motores", ["A&P", "ETOPS"]
);
const jefe = new Jefe(
  3, "María Torres", "25444555", new Date("1975-09-21"),
  "EMP-003", new Date("2005-01-10"), 12000,
  "Mantenimiento"
);

// ASOCIACIÓN: el Jefe gestiona empleados (no los compone)
jefe.agregarSubordinado(mecanico);
jefe.agregarSubordinado(piloto);

console.log(piloto.describir());
console.log(mecanico.describir());
console.log(jefe.describir());
console.log(`Subordinados de ${jefe.getNombre()}: ${jefe.getSubordinados().length}`);
console.log();

// ─────────────────────────────────────────────────────────────
// 4. ASOCIACIÓN: Piloto ↔ Aeronave
// ─────────────────────────────────────────────────────────────
console.log("─── 4. ASOCIACIÓN: Piloto ↔ Aeronave ───\n");

piloto.asignarAeronave(boeing);
console.log(`${piloto.getNombre()} pilotará: ${piloto.getAeronaveAsignada()?.getMatricula()}`);
console.log();

// ─────────────────────────────────────────────────────────────
// 5. AGREGACIÓN: Aerolínea ◇── Avión[] / Vuelo ◇── Pasajero[]
// ─────────────────────────────────────────────────────────────
console.log("─── 5. AGREGACIÓN: Aerolínea y Vuelo ───\n");

const aerolinea = new Aerolinea(1, "OOP Airlines");
aerolinea.agregarAeronave(boeing);
aerolinea.agregarAeronave(cessna);
aerolinea.contratar(piloto);
aerolinea.contratar(mecanico);
aerolinea.contratar(jefe);
console.log(`Aerolínea "${aerolinea.getNombre()}" — Flota: ${aerolinea.getFlota().length}, Empleados: ${aerolinea.getEmpleados().length}`);

const vuelo = new Vuelo("OOP-101", "EZE", "MAD", new Date("2026-05-15"), boeing, piloto);
vuelo.embarcar(new Pasajero(101, "Lucía Ruiz", "40111222", new Date("1992-07-08"), "TKT-A1", "ejecutiva"));
vuelo.embarcar(new Pasajero(102, "Pedro Sosa", "39222111", new Date("1990-02-17"), "TKT-A2", "economica"));
vuelo.embarcar(new Pasajero(103, "Sol Méndez", "41333222", new Date("1995-12-30"), "TKT-A3", "primera"));
console.log(vuelo.describir());

const desembarcados = vuelo.desembarcarTodos();
console.log(`Pasajeros desembarcados (siguen existiendo fuera del vuelo): ${desembarcados.length}`);
console.log();

// ─────────────────────────────────────────────────────────────
// 6. DEPENDENCIA: ServicioMantenimiento ··> Aeronave
//                 TorreDeControl ··> Vuelo
// ─────────────────────────────────────────────────────────────
console.log("─── 6. DEPENDENCIA ───\n");

const taller = new ServicioMantenimiento("Taller Central EZE");
console.log(`Tornillos a revisar en el Boeing: ${taller.contarTornillosFlojos(boeing)}`);

const torre = new TorreDeControl("EZE");
console.log(torre.autorizarDespegue(vuelo));
console.log();

console.log("╚════════════════════════════════════════════════════════════╝");
console.log("Demo completada.");
