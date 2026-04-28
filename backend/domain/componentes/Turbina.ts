import { Motor } from "./Motor";

export class Turbina extends Motor {
  private empujeKn: number;

  constructor(id: string, nombre: string, potenciaCV: number, empujeKn: number) {
    super(id, nombre, potenciaCV);
    this.empujeKn = empujeKn;
  }

  obtenerTipo(): string { return "Turbina"; }

  describir(): string {
    return `Turbina ${this.nombre} (${this.potenciaCV}CV / ${this.empujeKn}kN) — ${this.contarPiezas()} piezas`;
  }
}
