import { Empleado } from "./Empleado";

// HERENCIA: Mecánico es-un Empleado.
export class Mecanico extends Empleado {
  private especialidad: string;
  private certificaciones: string[];

  constructor(
    id: number, nombre: string, dni: string, fechaNacimiento: Date,
    legajo: string, fechaIngreso: Date, salario: number,
    especialidad: string, certificaciones: string[] = []
  ) {
    super(id, nombre, dni, fechaNacimiento, legajo, fechaIngreso, salario);
    this.especialidad = especialidad;
    this.certificaciones = certificaciones;
  }

  getEspecialidad(): string { return this.especialidad; }
  getCertificaciones(): string[] { return [...this.certificaciones]; }

  agregarCertificacion(cert: string): void {
    this.certificaciones.push(cert);
  }

  obtenerCargo(): string { return `Mecánico (${this.especialidad})`; }
}
