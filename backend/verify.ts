// ============================================================================
// VERIFY — round-trip: carga la DB y verifica que las clases se reconstruyen
// con el mismo árbol que el seed sembró. Demuestra que la hidratación
// polimórfica funciona en todas las jerarquías.
//
// Ejecutar:  npm run verify   (asumiendo que ya corriste npm run seed)
// ============================================================================

import { AeronaveRepository } from "./persistence/repositorios/AeronaveRepository";
import { AerolineaRepository } from "./persistence/repositorios/AerolineaRepository";
import { PersonaRepository } from "./persistence/repositorios/PersonaRepository";
import { VueloRepository } from "./persistence/repositorios/VueloRepository";
import { ServicioMantenimiento } from "./domain/servicios/ServicioMantenimiento";
import { TorreDeControl } from "./domain/servicios/TorreDeControl";
import { Mecanico } from "./domain/personas/Mecanico";
import { Piloto } from "./domain/personas/Piloto";
import { Jefe } from "./domain/personas/Jefe";
import { Aeronave } from "./domain/aeronaves/Aeronave";
import { AvionReactor } from "./domain/aeronaves/AvionReactor";
import { Aeroplano } from "./domain/aeronaves/Aeroplano";

const aeronaveRepo = new AeronaveRepository();
const aerolineaRepo = new AerolineaRepository();
const personaRepo = new PersonaRepository();
const vueloRepo = new VueloRepository();

console.log("\n╔══════════════════════════════════════════════════════════════════╗");
console.log("║  VERIFICACIÓN ROUND-TRIP — DB → Dominio                          ║");
console.log("╚══════════════════════════════════════════════════════════════════╝\n");

// ─────────────────────────────────────────────────────────────────────────
// 1. Cargar aerolínea + flota + empleados
// ─────────────────────────────────────────────────────────────────────────
console.log("─── 1. Aerolínea con miembros ───");
const aerolinea = aerolineaRepo.findByIdConMiembros(1);
if (!aerolinea) throw new Error("No se encontró la aerolínea (¿corriste el seed?)");
console.log(`  Aerolínea: ${aerolinea.getNombre()}`);
console.log(`  Flota:     ${aerolinea.getFlota().length} aeronaves`);
console.log(`  Empleados: ${aerolinea.getEmpleados().length}`);
console.log();

// ─────────────────────────────────────────────────────────────────────────
// 2. Cargar el Boeing con todo el árbol y verificar polimorfismo
// ─────────────────────────────────────────────────────────────────────────
console.log("─── 2. Hidratación polimórfica del Boeing ───");
const boeing = aeronaveRepo.findByMatriculaConArbol("LV-AERO");
if (!boeing) throw new Error("No se encontró el Boeing");

console.log(`  Tipo concreto: ${boeing.constructor.name}  (esperado: AvionReactor)`);
console.log(`  Es AvionReactor: ${boeing instanceof AvionReactor}`);
console.log(`  Es Aeronave (base): ${boeing instanceof Aeronave}`);

// Verificar que cada subsistema se reconstruyó con su clase concreta correcta
console.log("\n  Subsistemas (cada uno con su clase concreta):");
for (const s of boeing.getSubsistemas()) {
  console.log(`    - ${s.constructor.name}: ${s.getNombre()}`);
  for (const c of s.getComponentes()) {
    console.log(`        · ${c.constructor.name}: ${c.getNombre()} (${c.contarPiezas()} piezas)`);
    for (const p of c.getPiezas()) {
      console.log(`            ↳ ${p.constructor.name}: ${p.getCodigo()}`);
    }
  }
}
console.log();

// ─────────────────────────────────────────────────────────────────────────
// 3. Usar la CLASE ANIDADA Aeronave.Diagnostico sobre datos de DB
// ─────────────────────────────────────────────────────────────────────────
console.log("─── 3. Aeronave.Diagnostico sobre datos hidratados ───");
const diag = boeing.crearDiagnostico();
console.log(`  Total piezas:         ${diag.contarPiezasTotales()}`);
console.log(`  Tornillos:            ${diag.listarPiezasPorTipo("Tornillo").length}`);
console.log(`  Tuercas:              ${diag.listarPiezasPorTipo("Tuerca").length}`);
console.log(`  Arandelas:            ${diag.listarPiezasPorTipo("Arandela").length}`);
console.log(`  Resortes:             ${diag.listarPiezasPorTipo("Resorte").length}`);
console.log(`  Peso total:           ${diag.pesoTotalKg().toFixed(3)} kg`);
console.log();

// ─────────────────────────────────────────────────────────────────────────
// 4. Verificar polimorfismo de Personas
// ─────────────────────────────────────────────────────────────────────────
console.log("─── 4. Hidratación polimórfica de Personas ───");
for (const e of aerolinea.getEmpleados()) {
  let detalle = "";
  if (e instanceof Piloto) {
    detalle = `licencia ${e.getLicencia()}, ${e.getHorasVuelo()}h vuelo`;
  } else if (e instanceof Mecanico) {
    detalle = `especialidad ${e.getEspecialidad()}, certs: [${e.getCertificaciones().join(", ")}]`;
  } else if (e instanceof Jefe) {
    detalle = `depto ${e.getDepartamento()}`;
  }
  console.log(`  ${e.constructor.name.padEnd(10)} ${e.getNombre()} — ${detalle}`);
}
console.log();

// ─────────────────────────────────────────────────────────────────────────
// 5. Verificar relación Jefe → Subordinados (asociación self-referencing)
// ─────────────────────────────────────────────────────────────────────────
console.log("─── 5. Asociación Jefe → Subordinados ───");
const jefes = personaRepo.findByTipo("jefe");
for (const j of jefes) {
  if (!(j instanceof Jefe)) continue;
  const subs = personaRepo.findSubordinadosDe(j.getId());
  console.log(`  ${j.getNombre()} (${j.getDepartamento()}) supervisa a:`);
  for (const s of subs) console.log(`    - ${s.constructor.name} ${s.getNombre()}`);
}
console.log();

// ─────────────────────────────────────────────────────────────────────────
// 6. Vuelo + asociaciones (Aeronave, Piloto) + agregación (Pasajeros)
// ─────────────────────────────────────────────────────────────────────────
console.log("─── 6. Vuelo hidratado con asociaciones y pasajeros ───");
const vuelo = vueloRepo.findByNumero("OOP-101");
if (!vuelo) throw new Error("No se encontró el vuelo OOP-101");
console.log(`  ${vuelo.describir()}`);
console.log(`  Aeronave (asoc.): ${vuelo.getAeronave().constructor.name} ${vuelo.getAeronave().getMatricula()}`);
console.log(`  Piloto (asoc.):   ${vuelo.getPiloto().getNombre()}`);
console.log(`  Pasajeros (agreg., M:N): ${vuelo.getPasajeros().length}`);
for (const p of vuelo.getPasajeros()) {
  console.log(`    · ${p.describir()}`);
}
console.log();

// ─────────────────────────────────────────────────────────────────────────
// 7. Servicios externos (DEPENDENCIA) usan el avión hidratado
// ─────────────────────────────────────────────────────────────────────────
console.log("─── 7. Servicios externos (DEPENDENCIA) ───");
const taller = new ServicioMantenimiento("Taller EZE");
const torre = new TorreDeControl("EZE");
const mec = aerolinea.getEmpleados().find(e => e instanceof Mecanico) as Mecanico;
console.log(`\n${taller.inspeccionar(boeing, mec)}\n`);
console.log(torre.autorizarDespegue(vuelo));
console.log();

// ─────────────────────────────────────────────────────────────────────────
// 8. Aeroplano (Cessna) — verificar que la otra rama de herencia funciona
// ─────────────────────────────────────────────────────────────────────────
console.log("─── 8. Cessna (rama Aeroplano) ───");
const cessna = aeronaveRepo.findByMatriculaConArbol("LV-CES");
if (!cessna) throw new Error("No se encontró la Cessna");
console.log(`  Tipo concreto: ${cessna.constructor.name}  (esperado: Aeroplano)`);
console.log(`  Es Aeroplano: ${cessna instanceof Aeroplano}`);
console.log(`  ${cessna.describir()}`);
console.log();

console.log("╔══════════════════════════════════════════════════════════════════╗");
console.log("║  ✓ VERIFICACIÓN COMPLETA — Round-trip OK                         ║");
console.log("╚══════════════════════════════════════════════════════════════════╝");
