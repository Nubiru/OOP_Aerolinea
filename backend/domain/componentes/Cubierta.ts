import { Componente } from "./Componente";

export class Cubierta extends Componente {
  private capacidadPasajeros: number;
  private numPuertas: number;

  constructor(codigo: string, nombre: string, capacidadPasajeros: number, numPuertas: number) {
    super(codigo, nombre);
    this.capacidadPasajeros = capacidadPasajeros;
    this.numPuertas = numPuertas;
  }

  getCapacidad(): number { return this.capacidadPasajeros; }
  getNumPuertas(): number { return this.numPuertas; }

  describir(): string {
    return `Cubierta ${this.nombre} (${this.capacidadPasajeros} pax, ${this.numPuertas} puertas) — ${this.contarPiezas()} piezas`;
  }
}
