import { Aeronave } from "./Aeronave";

// HERENCIA: Aeroplano es-una Aeronave (la que usa hélices).
export class Aeroplano extends Aeronave {
  obtenerTipo(): string { return "Aeroplano"; }
}
