import { Empleado } from "./Empleado";

// HERENCIA: Jefe es-un Empleado.
// ASOCIACIÓN: Jefe gestiona empleados; los subordinados existen
// independientemente del jefe (no es composición).
export class Jefe extends Empleado {
  private departamento: string;
  private subordinados: Empleado[] = [];

  constructor(
    id: number, nombre: string, dni: string, fechaNacimiento: Date,
    legajo: string, fechaIngreso: Date, salario: number,
    departamento: string
  ) {
    super(id, nombre, dni, fechaNacimiento, legajo, fechaIngreso, salario);
    this.departamento = departamento;
  }

  getDepartamento(): string { return this.departamento; }
  getSubordinados(): Empleado[] { return [...this.subordinados]; }

  agregarSubordinado(emp: Empleado): void {
    if (!this.subordinados.includes(emp)) this.subordinados.push(emp);
  }

  removerSubordinado(emp: Empleado): void {
    this.subordinados = this.subordinados.filter(e => e !== emp);
  }

  obtenerCargo(): string { return `Jefe de ${this.departamento}`; }
}
