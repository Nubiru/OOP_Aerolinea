import { Vuelo } from "../operaciones/Vuelo";

// DEPENDENCIA: la torre usa el Vuelo solo durante la llamada al método.
// No mantiene referencia a vuelos.
export class TorreDeControl {
  private codigoIATA: string;

  constructor(codigoIATA: string) {
    this.codigoIATA = codigoIATA;
  }

  autorizarDespegue(vuelo: Vuelo): string {
    return `[Torre ${this.codigoIATA}] Autorizado despegue de ${vuelo.describir()}`;
  }

  autorizarAterrizaje(vuelo: Vuelo): string {
    return `[Torre ${this.codigoIATA}] Autorizado aterrizaje de ${vuelo.describir()}`;
  }
}
