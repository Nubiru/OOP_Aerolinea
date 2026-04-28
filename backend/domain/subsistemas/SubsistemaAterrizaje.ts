import { Subsistema } from "./Subsistema";

export class SubsistemaAterrizaje extends Subsistema {
  describir(): string {
    return `Subsistema de Aterrizaje "${this.nombre}" — ${this.contarComponentes()} tren(es), ${this.contarPiezasTotales()} piezas`;
  }
}
