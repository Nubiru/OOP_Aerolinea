import { Motor } from "./Motor";

export class Helice extends Motor {
  private numPalas: number;
  private diametroM: number;

  constructor(id: string, nombre: string, potenciaCV: number, numPalas: number, diametroM: number) {
    super(id, nombre, potenciaCV);
    this.numPalas = numPalas;
    this.diametroM = diametroM;
  }

  obtenerTipo(): string { return "Hélice"; }

  describir(): string {
    return `Hélice ${this.nombre} (${this.potenciaCV}CV, ${this.numPalas} palas ø${this.diametroM}m) — ${this.contarPiezas()} piezas`;
  }
}
