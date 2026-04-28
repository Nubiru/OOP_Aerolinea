import { Pieza } from "./Pieza";

export class Resorte extends Pieza {
  private constanteElastica: number;  // N/m
  private longitudReposoMm: number;

  constructor(
    codigo: string, material: string, pesoGramos: number,
    constanteElastica: number, longitudReposoMm: number
  ) {
    super(codigo, material, pesoGramos);
    this.constanteElastica = constanteElastica;
    this.longitudReposoMm = longitudReposoMm;
  }

  obtenerTipo(): string { return "Resorte"; }

  describir(): string {
    return `${super.describir()}, k=${this.constanteElastica}N/m, L₀=${this.longitudReposoMm}mm`;
  }
}
