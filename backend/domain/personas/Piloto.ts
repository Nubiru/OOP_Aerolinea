import { Empleado } from "./Empleado";
import type { Aeronave } from "../aeronaves/Aeronave";

// HERENCIA: Piloto es-un Empleado.
// ASOCIACIÓN: Piloto se asigna a una Aeronave; ambos existen independientemente.
export class Piloto extends Empleado {
  private licencia: string;
  private horasVuelo: number;
  private aeronaveAsignada: Aeronave | null = null;

  constructor(
    id: number, nombre: string, dni: string, fechaNacimiento: Date,
    legajo: string, fechaIngreso: Date, salario: number,
    licencia: string, horasVuelo: number
  ) {
    super(id, nombre, dni, fechaNacimiento, legajo, fechaIngreso, salario);
    this.licencia = licencia;
    this.horasVuelo = horasVuelo;
  }

  getLicencia(): string { return this.licencia; }
  getHorasVuelo(): number { return this.horasVuelo; }
  getAeronaveAsignada(): Aeronave | null { return this.aeronaveAsignada; }

  asignarAeronave(aeronave: Aeronave): void {
    this.aeronaveAsignada = aeronave;
  }

  desasignar(): void {
    this.aeronaveAsignada = null;
  }

  registrarHorasVuelo(horas: number): void {
    this.horasVuelo += horas;
  }

  obtenerCargo(): string { return "Piloto"; }
}
