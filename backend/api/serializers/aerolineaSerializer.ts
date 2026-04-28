import { Aerolinea } from "../../domain/operaciones/Aerolinea";
import { AeronaveDTO, serializarAeronave } from "./aeronaveSerializer";
import { PersonaDTO, serializarPersona } from "./personaSerializer";

export interface AerolineaDTO {
  id: number;
  nombre: string;
  cantidadAeronaves: number;
  cantidadEmpleados: number;
  flota?: AeronaveDTO[];
  empleados?: PersonaDTO[];
}

export function serializarAerolinea(
  a: Aerolinea,
  incluirMiembros = false,
  contadores?: { cantAeronaves: number; cantEmpleados: number }
): AerolineaDTO {
  return {
    id: a.getId(),
    nombre: a.getNombre(),
    // Si vienen contadores explícitos los usamos (cuando el agregado se carga
    // sin miembros); si no, contamos sobre los miembros agregados.
    cantidadAeronaves: contadores?.cantAeronaves ?? a.getFlota().length,
    cantidadEmpleados: contadores?.cantEmpleados ?? a.getEmpleados().length,
    flota: incluirMiembros ? a.getFlota().map(av => serializarAeronave(av)) : undefined,
    empleados: incluirMiembros ? a.getEmpleados().map(serializarPersona) : undefined,
  };
}
