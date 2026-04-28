import { Subsistema } from "./Subsistema";

export class SubsistemaAerodinamico extends Subsistema {
  describir(): string {
    return `Subsistema Aerodinámico "${this.nombre}" — ${this.contarComponentes()} ala(s), ${this.contarPiezasTotales()} piezas`;
  }
}
