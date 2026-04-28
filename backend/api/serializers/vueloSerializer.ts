import { Vuelo } from "../../domain/operaciones/Vuelo";
import { AeronaveDTO, serializarAeronave } from "./aeronaveSerializer";
import { PersonaDTO, serializarPersona } from "./personaSerializer";

export interface VueloDTO {
  id: number;
  numero: string;
  origen: string;
  destino: string;
  fechaSalida: string;
  aeronave: AeronaveDTO;        // asociación
  piloto: PersonaDTO;            // asociación
  pasajeros: PersonaDTO[];       // agregación M:N
  cantidadPasajeros: number;
}

export function serializarVuelo(v: Vuelo): VueloDTO {
  return {
    id: v.getId(),
    numero: v.getNumero(),
    origen: v.getOrigen(),
    destino: v.getDestino(),
    fechaSalida: v.getFechaSalida().toISOString().slice(0, 10),
    aeronave: serializarAeronave(v.getAeronave()),
    piloto: serializarPersona(v.getPiloto()),
    pasajeros: v.getPasajeros().map(serializarPersona),
    cantidadPasajeros: v.getPasajeros().length,
  };
}
