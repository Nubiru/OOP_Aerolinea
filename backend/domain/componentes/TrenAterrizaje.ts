import { Componente } from "./Componente";

export class TrenAterrizaje extends Componente {
  private numNeumaticos: number;
  private esRetractil: boolean;

  constructor(id: string, nombre: string, numNeumaticos: number, esRetractil: boolean) {
    super(id, nombre);
    this.numNeumaticos = numNeumaticos;
    this.esRetractil = esRetractil;
  }

  describir(): string {
    return `Tren de Aterrizaje ${this.nombre} (${this.numNeumaticos} neumáticos, ${this.esRetractil ? "retráctil" : "fijo"}) — ${this.contarPiezas()} piezas`;
  }
}
