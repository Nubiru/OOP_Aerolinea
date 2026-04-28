import { Aeronave } from "../aeronaves/Aeronave";
import { Empleado } from "../personas/Empleado";

// AGREGACIÓN: la Aerolínea agrega Aeronaves y Empleados. Son entidades que
// existen independientemente: si la aerolínea cierra, los aviones se venden
// y los empleados buscan trabajo en otro lado. No mueren con ella.
export class Aerolinea {
  private id: number;
  private nombre: string;
  private flota: Aeronave[] = [];
  private empleados: Empleado[] = [];

  constructor(id: number, nombre: string) {
    this.id = id;
    this.nombre = nombre;
  }

  getId(): number { return this.id; }
  getNombre(): string { return this.nombre; }
  getFlota(): Aeronave[] { return [...this.flota]; }
  getEmpleados(): Empleado[] { return [...this.empleados]; }

  agregarAeronave(a: Aeronave): void {
    if (!this.flota.includes(a)) this.flota.push(a);
  }

  contratar(e: Empleado): void {
    if (!this.empleados.includes(e)) this.empleados.push(e);
  }

  // El avión deja la flota pero sigue existiendo (agregación).
  retirarAeronave(matricula: string): Aeronave | null {
    const idx = this.flota.findIndex(a => a.getMatricula() === matricula);
    if (idx < 0) return null;
    return this.flota.splice(idx, 1)[0];
  }
}
