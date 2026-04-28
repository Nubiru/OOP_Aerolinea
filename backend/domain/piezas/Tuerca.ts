import { Pieza } from "./Pieza";

export class Tuerca extends Pieza {
  private medidaMm: number;
  private tipoRosca: "metrica" | "imperial";

  constructor(
    codigo: string, material: string, pesoGramos: number,
    medidaMm: number, tipoRosca: "metrica" | "imperial"
  ) {
    super(codigo, material, pesoGramos);
    this.medidaMm = medidaMm;
    this.tipoRosca = tipoRosca;
  }

  obtenerTipo(): string { return "Tuerca"; }

  describir(): string {
    return `${super.describir()}, M${this.medidaMm} rosca ${this.tipoRosca}`;
  }
}
