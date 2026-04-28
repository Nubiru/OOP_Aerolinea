import { Aeronave } from "../aeronaves/Aeronave";
import { Piloto } from "../personas/Piloto";
import { Pasajero } from "../personas/Pasajero";

// ASOCIACIÓN: el Vuelo se asocia con una Aeronave y un Piloto, pero ambos
// existen independientemente del vuelo y pueden estar asignados a otros
// vuelos en otro momento.
//
// AGREGACIÓN: el Vuelo agrega Pasajeros. Los pasajeros existen antes de
// embarcar y siguen existiendo al desembarcar.
export class Vuelo {
  private numero: string;
  private origen: string;
  private destino: string;
  private fechaSalida: Date;
  private aeronave: Aeronave;
  private piloto: Piloto;
  private pasajeros: Pasajero[] = [];

  constructor(
    numero: string, origen: string, destino: string, fechaSalida: Date,
    aeronave: Aeronave, piloto: Piloto
  ) {
    this.numero = numero;
    this.origen = origen;
    this.destino = destino;
    this.fechaSalida = fechaSalida;
    this.aeronave = aeronave;
    this.piloto = piloto;
  }

  getNumero(): string { return this.numero; }
  getOrigen(): string { return this.origen; }
  getDestino(): string { return this.destino; }
  getFechaSalida(): Date { return this.fechaSalida; }
  getAeronave(): Aeronave { return this.aeronave; }
  getPiloto(): Piloto { return this.piloto; }
  getPasajeros(): Pasajero[] { return [...this.pasajeros]; }

  embarcar(p: Pasajero): void {
    this.pasajeros.push(p);
  }

  // Devuelve los pasajeros, que siguen existiendo fuera del vuelo.
  desembarcarTodos(): Pasajero[] {
    const lista = this.pasajeros;
    this.pasajeros = [];
    return lista;
  }

  describir(): string {
    return `Vuelo ${this.numero}: ${this.origen} → ${this.destino} ` +
      `(${this.fechaSalida.toISOString().slice(0, 10)}) — ` +
      `${this.aeronave.getMatricula()}, comandante ${this.piloto.getNombre()}, ` +
      `${this.pasajeros.length} pasajeros`;
  }
}
