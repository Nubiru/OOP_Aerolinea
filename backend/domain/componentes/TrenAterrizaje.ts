import { Componente } from "./Componente";

export class TrenAterrizaje extends Componente {
  private numNeumaticos: number;
  private esRetractil: boolean;

  constructor(codigo: string, nombre: string, numNeumaticos: number, esRetractil: boolean) {
    super(codigo, nombre);
    this.numNeumaticos = numNeumaticos;
    this.esRetractil = esRetractil;
  }

  getNumNeumaticos(): number { return this.numNeumaticos; }
  getEsRetractil(): boolean { return this.esRetractil; }

  describir(): string {
    return `Tren de Aterrizaje ${this.nombre} (${this.numNeumaticos} neumáticos, ${this.esRetractil ? "retráctil" : "fijo"}) — ${this.contarPiezas()} piezas`;
  }
}
