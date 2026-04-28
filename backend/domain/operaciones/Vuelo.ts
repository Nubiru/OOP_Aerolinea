import { Aeronave } from "../aeronaves/Aeronave";
import { Piloto } from "../personas/Piloto";
import { Pasajero } from "../personas/Pasajero";
import { EstadoVuelo, esTransicionValida } from "./EstadoVuelo";

// ASOCIACIÓN: el Vuelo se asocia con una Aeronave y un Piloto, pero ambos
// existen independientemente del vuelo y pueden estar asignados a otros
// vuelos en otro momento.
//
// AGREGACIÓN: el Vuelo agrega Pasajeros. Los pasajeros existen antes de
// embarcar y siguen existiendo al desembarcar.
//
// MÁQUINA DE ESTADOS: programado → embarcando → en_vuelo → aterrizado.
// Desde cualquier estado activo se puede ir a cancelado. Aterrizado y
// cancelado son terminales.
export class Vuelo {
  private id: number = 0;
  private numero: string;
  private origen: string;
  private destino: string;
  private fechaSalida: Date;
  private aeronave: Aeronave;
  private piloto: Piloto;
  private pasajeros: Pasajero[] = [];
  private estado: EstadoVuelo;

  constructor(
    numero: string, origen: string, destino: string, fechaSalida: Date,
    aeronave: Aeronave, piloto: Piloto,
    estado: EstadoVuelo = "programado"
  ) {
    this.numero = numero;
    this.origen = origen;
    this.destino = destino;
    this.fechaSalida = fechaSalida;
    this.aeronave = aeronave;
    this.piloto = piloto;
    this.estado = estado;
  }

  getId(): number { return this.id; }
  setId(id: number): void { this.id = id; }
  getNumero(): string { return this.numero; }
  getOrigen(): string { return this.origen; }
  getDestino(): string { return this.destino; }
  getFechaSalida(): Date { return this.fechaSalida; }
  getAeronave(): Aeronave { return this.aeronave; }
  getPiloto(): Piloto { return this.piloto; }
  getPasajeros(): Pasajero[] { return [...this.pasajeros]; }
  getEstado(): EstadoVuelo { return this.estado; }

  // Cambia el estado validando la transición. Tira si no es válida.
  cambiarEstado(nuevo: EstadoVuelo): void {
    if (this.estado === nuevo) return;
    if (!esTransicionValida(this.estado, nuevo)) {
      throw new Error(`Transición inválida: ${this.estado} → ${nuevo}`);
    }
    this.estado = nuevo;
  }

  // Setter sin validación, solo para uso del repositorio al hidratar
  // (la DB ya tiene el estado actual válido).
  setEstadoSinValidar(estado: EstadoVuelo): void {
    this.estado = estado;
  }

  embarcar(p: Pasajero): void {
    this.pasajeros.push(p);
  }

  desembarcarTodos(): Pasajero[] {
    const lista = this.pasajeros;
    this.pasajeros = [];
    return lista;
  }

  describir(): string {
    return `Vuelo ${this.numero} [${this.estado}]: ${this.origen} → ${this.destino} ` +
      `(${this.fechaSalida.toISOString().slice(0, 10)}) — ` +
      `${this.aeronave.getMatricula()}, comandante ${this.piloto.getNombre()}, ` +
      `${this.pasajeros.length} pasajeros`;
  }
}
