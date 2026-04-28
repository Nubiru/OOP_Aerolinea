import { Subsistema } from "../subsistemas/Subsistema";
import { Pieza } from "../piezas/Pieza";

// HERENCIA (raíz): clase base abstracta de todas las aeronaves.
//
// COMPOSICIÓN: una Aeronave compone Subsistemas. Si la aeronave se desmantela,
// sus subsistemas (y los componentes y piezas dentro de ellos) van con ella.
//
// CLASE ANIDADA: `Aeronave.Diagnostico` es una clase estática anidada. Solo
// tiene sentido en el contexto de una Aeronave concreta, así que vive dentro
// de la propia clase. Recibe la aeronave por composición vía constructor y
// recorre su árbol completo (subsistemas → componentes → piezas) para
// generar reportes de mantenimiento.
export abstract class Aeronave {
  protected matricula: string;
  protected modelo: string;
  protected anioFabricacion: number;
  protected subsistemas: Subsistema[] = [];

  constructor(matricula: string, modelo: string, anioFabricacion: number) {
    this.matricula = matricula;
    this.modelo = modelo;
    this.anioFabricacion = anioFabricacion;
  }

  getMatricula(): string { return this.matricula; }
  getModelo(): string { return this.modelo; }
  getAnio(): number { return this.anioFabricacion; }
  getSubsistemas(): Subsistema[] { return [...this.subsistemas]; }

  agregarSubsistema(s: Subsistema): void {
    this.subsistemas.push(s);
  }

  abstract obtenerTipo(): string;

  describir(): string {
    const diag = this.crearDiagnostico();
    return `${this.obtenerTipo()} ${this.matricula} (${this.modelo}, ${this.anioFabricacion}) — ${this.subsistemas.length} subsistemas, ${diag.contarPiezasTotales()} piezas, ${diag.pesoTotalKg().toFixed(2)}kg`;
  }

  // Factory para crear el diagnóstico de esta aeronave concreta.
  crearDiagnostico(): InstanceType<typeof Aeronave.Diagnostico> {
    return new Aeronave.Diagnostico(this);
  }

  // ────────────────────────────────────────────────────────────
  // CLASE ANIDADA ESTÁTICA: Aeronave.Diagnostico
  // Encapsula la lógica de inspección de una aeronave. Vive dentro
  // de Aeronave porque su única razón de existir es operar sobre
  // una instancia de Aeronave: no tiene sentido fuera de ese contexto.
  // ────────────────────────────────────────────────────────────
  static Diagnostico = class {
    private aeronave: Aeronave;

    constructor(aeronave: Aeronave) {
      this.aeronave = aeronave;
    }

    contarPiezasTotales(): number {
      return this.aeronave.subsistemas
        .reduce((sum, s) => sum + s.contarPiezasTotales(), 0);
    }

    pesoTotalKg(): number {
      const gramos = this.aeronave.subsistemas
        .reduce((sum, s) => sum + s.pesoTotal(), 0);
      return gramos / 1000;
    }

    obtenerTodasLasPiezas(): Pieza[] {
      return this.aeronave.subsistemas.flatMap(s => s.obtenerTodasLasPiezas());
    }

    // Recorre todo el árbol y filtra piezas por tipo (Tornillo, Tuerca, etc.)
    listarPiezasPorTipo(tipo: string): Pieza[] {
      return this.obtenerTodasLasPiezas().filter(p => p.obtenerTipo() === tipo);
    }

    // Reporte legible: avión → subsistema → componente → pieza
    generarReporte(): string {
      const a = this.aeronave;
      const lineas: string[] = [];
      lineas.push(`╔════════════════════════════════════════════════════════════╗`);
      lineas.push(`║ DIAGNÓSTICO: ${a.obtenerTipo()} ${a.matricula} (${a.modelo})`);
      lineas.push(`║ Año ${a.anioFabricacion} · ${this.contarPiezasTotales()} piezas · ${this.pesoTotalKg().toFixed(2)}kg`);
      lineas.push(`╚════════════════════════════════════════════════════════════╝`);

      for (const s of a.subsistemas) {
        lineas.push(`├─ ${s.describir()}`);
        for (const c of s.getComponentes()) {
          lineas.push(`│  ├─ ${c.describir()}`);
          for (const p of c.getPiezas()) {
            lineas.push(`│  │  └─ ${p.describir()}`);
          }
        }
      }
      return lineas.join("\n");
    }
  };
}
