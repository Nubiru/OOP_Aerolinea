import { Motor } from "./Motor";

export class Helice extends Motor {
  private numPalas: number;
  private diametroM: number;

  constructor(codigo: string, nombre: string, potenciaCV: number, numPalas: number, diametroM: number) {
    super(codigo, nombre, potenciaCV);
    this.numPalas = numPalas;
    this.diametroM = diametroM;
  }

  getNumPalas(): number { return this.numPalas; }
  getDiametro(): number { return this.diametroM; }

  obtenerTipo(): string { return "Hélice"; }

  describir(): string {
    return `Hélice ${this.nombre} (${this.potenciaCV}CV, ${this.numPalas} palas ø${this.diametroM}m) — ${this.contarPiezas()} piezas`;
  }
}
