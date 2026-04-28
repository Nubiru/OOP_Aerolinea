import { Componente } from "./Componente";

export class Ala extends Componente {
  private envergaduraM: number;
  private posicion: "principal" | "estabilizador";

  constructor(codigo: string, nombre: string, envergaduraM: number, posicion: "principal" | "estabilizador") {
    super(codigo, nombre);
    this.envergaduraM = envergaduraM;
    this.posicion = posicion;
  }

  getEnvergadura(): number { return this.envergaduraM; }
  getPosicion(): "principal" | "estabilizador" { return this.posicion; }

  describir(): string {
    return `Ala ${this.nombre} (${this.posicion}, ${this.envergaduraM}m) — ${this.contarPiezas()} piezas`;
  }
}
