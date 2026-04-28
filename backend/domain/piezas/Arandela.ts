import { Pieza } from "./Pieza";

export class Arandela extends Pieza {
  private diametroInternoMm: number;
  private diametroExternoMm: number;

  constructor(
    codigo: string, material: string, pesoGramos: number,
    diametroInternoMm: number, diametroExternoMm: number
  ) {
    super(codigo, material, pesoGramos);
    this.diametroInternoMm = diametroInternoMm;
    this.diametroExternoMm = diametroExternoMm;
  }

  getDiametroInterno(): number { return this.diametroInternoMm; }
  getDiametroExterno(): number { return this.diametroExternoMm; }

  obtenerTipo(): string { return "Arandela"; }

  describir(): string {
    return `${super.describir()}, ø${this.diametroInternoMm}-${this.diametroExternoMm}mm`;
  }
}
