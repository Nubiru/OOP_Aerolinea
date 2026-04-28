import { Pieza } from "./Pieza";

export class Tornillo extends Pieza {
  private longitudMm: number;
  private diametroMm: number;
  private tipoCabeza: "hexagonal" | "phillips" | "torx" | "allen";

  constructor(
    codigo: string, material: string, pesoGramos: number,
    longitudMm: number, diametroMm: number,
    tipoCabeza: "hexagonal" | "phillips" | "torx" | "allen"
  ) {
    super(codigo, material, pesoGramos);
    this.longitudMm = longitudMm;
    this.diametroMm = diametroMm;
    this.tipoCabeza = tipoCabeza;
  }

  getLongitud(): number { return this.longitudMm; }
  getDiametro(): number { return this.diametroMm; }
  getTipoCabeza(): "hexagonal" | "phillips" | "torx" | "allen" { return this.tipoCabeza; }

  obtenerTipo(): string { return "Tornillo"; }

  describir(): string {
    return `${super.describir()}, M${this.diametroMm}x${this.longitudMm} ${this.tipoCabeza}`;
  }
}
