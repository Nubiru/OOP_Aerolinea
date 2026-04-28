import { Componente } from "./Componente";

// HERENCIA: Motor es-un Componente. Sigue siendo abstracto porque
// existen distintos tipos de motor (Turbina, Hélice).
export abstract class Motor extends Componente {
  protected potenciaCV: number;

  constructor(id: string, nombre: string, potenciaCV: number) {
    super(id, nombre);
    this.potenciaCV = potenciaCV;
  }

  getPotencia(): number { return this.potenciaCV; }

  abstract obtenerTipo(): string;
}
