import { Subsistema } from "./Subsistema";
import { Cubierta } from "../componentes/Cubierta";

export class SubsistemaCabina extends Subsistema {
  capacidadTotal(): number {
    return this.componentes
      .filter((c): c is Cubierta => c instanceof Cubierta)
      .reduce((sum, c) => sum + c.getCapacidad(), 0);
  }

  describir(): string {
    return `Subsistema Cabina "${this.nombre}" — ${this.contarComponentes()} cubierta(s), capacidad ${this.capacidadTotal()} pax`;
  }
}
