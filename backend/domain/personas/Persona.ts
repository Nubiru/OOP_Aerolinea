// HERENCIA (raíz): clase base abstracta para toda persona del sistema
export abstract class Persona {
  protected id: number;
  protected nombre: string;
  protected dni: string;
  protected fechaNacimiento: Date;

  constructor(id: number, nombre: string, dni: string, fechaNacimiento: Date) {
    this.id = id;
    this.nombre = nombre;
    this.dni = dni;
    this.fechaNacimiento = fechaNacimiento;
  }

  getId(): number { return this.id; }
  getNombre(): string { return this.nombre; }
  getDni(): string { return this.dni; }

  getEdad(): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - this.fechaNacimiento.getFullYear();
    const m = hoy.getMonth() - this.fechaNacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < this.fechaNacimiento.getDate())) edad--;
    return edad;
  }

  abstract describir(): string;
}
