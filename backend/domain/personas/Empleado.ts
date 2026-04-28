import { Persona } from "./Persona";

// HERENCIA: Empleado extiende Persona; sigue siendo abstracta porque cada
// rol (Piloto, Mecánico, Jefe) define su cargo específico.
export abstract class Empleado extends Persona {
  protected legajo: string;
  protected fechaIngreso: Date;
  protected salario: number;

  constructor(
    id: number,
    nombre: string,
    dni: string,
    fechaNacimiento: Date,
    legajo: string,
    fechaIngreso: Date,
    salario: number
  ) {
    super(id, nombre, dni, fechaNacimiento);
    this.legajo = legajo;
    this.fechaIngreso = fechaIngreso;
    this.salario = salario;
  }

  getLegajo(): string { return this.legajo; }
  getSalario(): number { return this.salario; }

  abstract obtenerCargo(): string;

  describir(): string {
    return `${this.nombre} (DNI ${this.dni}) — Legajo ${this.legajo} — ${this.obtenerCargo()}`;
  }
}
