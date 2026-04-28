import { Aeronave } from "./Aeronave";

// HERENCIA: AvionReactor es-una Aeronave (la que usa turbinas).
export class AvionReactor extends Aeronave {
  obtenerTipo(): string { return "Avión Reactor"; }
}
