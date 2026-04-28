import { Componente } from "./Componente";

export class Ala extends Componente {
  private envergaduraM: number;
  private posicion: "principal" | "estabilizador";

  constructor(id: string, nombre: string, envergaduraM: number, posicion: "principal" | "estabilizador") {
    super(id, nombre);
    this.envergaduraM = envergaduraM;
    this.posicion = posicion;
  }

  describir(): string {
    return `Ala ${this.nombre} (${this.posicion}, ${this.envergaduraM}m) — ${this.contarPiezas()} piezas`;
  }
}
