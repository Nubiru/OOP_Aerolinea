import { Motor } from "./Motor";

export class Turbina extends Motor {
  private empujeKn: number;

  constructor(codigo: string, nombre: string, potenciaCV: number, empujeKn: number) {
    super(codigo, nombre, potenciaCV);
    this.empujeKn = empujeKn;
  }

  getEmpuje(): number { return this.empujeKn; }

  obtenerTipo(): string { return "Turbina"; }

  describir(): string {
    return `Turbina ${this.nombre} (${this.potenciaCV}CV / ${this.empujeKn}kN) — ${this.contarPiezas()} piezas`;
  }
}
