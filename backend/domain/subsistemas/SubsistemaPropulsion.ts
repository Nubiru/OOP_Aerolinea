import { Subsistema } from "./Subsistema";

export class SubsistemaPropulsion extends Subsistema {
  describir(): string {
    return `Subsistema de Propulsión "${this.nombre}" — ${this.contarComponentes()} motor(es), ${this.contarPiezasTotales()} piezas, ${this.pesoTotal()}g`;
  }
}
