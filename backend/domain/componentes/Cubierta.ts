import { Componente } from "./Componente";

export class Cubierta extends Componente {
  private capacidadPasajeros: number;
  private numPuertas: number;

  constructor(id: string, nombre: string, capacidadPasajeros: number, numPuertas: number) {
    super(id, nombre);
    this.capacidadPasajeros = capacidadPasajeros;
    this.numPuertas = numPuertas;
  }

  getCapacidad(): number { return this.capacidadPasajeros; }

  describir(): string {
    return `Cubierta ${this.nombre} (${this.capacidadPasajeros} pax, ${this.numPuertas} puertas) — ${this.contarPiezas()} piezas`;
  }
}
