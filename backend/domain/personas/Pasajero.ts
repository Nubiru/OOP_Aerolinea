import { Persona } from "./Persona";

// HERENCIA: Pasajero es-una Persona (pero no es Empleado).
export class Pasajero extends Persona {
  private numeroTicket: string;
  private clase: "economica" | "ejecutiva" | "primera";

  constructor(
    id: number, nombre: string, dni: string, fechaNacimiento: Date,
    numeroTicket: string, clase: "economica" | "ejecutiva" | "primera"
  ) {
    super(id, nombre, dni, fechaNacimiento);
    this.numeroTicket = numeroTicket;
    this.clase = clase;
  }

  getNumeroTicket(): string { return this.numeroTicket; }
  getClase(): string { return this.clase; }

  describir(): string {
    return `Pasajero ${this.nombre} (DNI ${this.dni}) — Ticket ${this.numeroTicket} clase ${this.clase}`;
  }
}
