import { Subsistema } from "../../domain/subsistemas/Subsistema";
import { SubsistemaPropulsion } from "../../domain/subsistemas/SubsistemaPropulsion";
import { SubsistemaAterrizaje } from "../../domain/subsistemas/SubsistemaAterrizaje";
import { SubsistemaAerodinamico } from "../../domain/subsistemas/SubsistemaAerodinamico";
import { SubsistemaCabina } from "../../domain/subsistemas/SubsistemaCabina";
import { ComponenteDTO, serializarComponente } from "./componenteSerializer";

export interface SubsistemaDTO {
  id: number;
  codigo: string;
  nombre: string;
  tipo: "propulsion" | "aterrizaje" | "aerodinamico" | "cabina";
  cantidadComponentes: number;
  cantidadPiezas: number;
  pesoTotalG: number;
  componentes?: ComponenteDTO[];
}

function tipoDe(s: Subsistema): SubsistemaDTO["tipo"] {
  if (s instanceof SubsistemaPropulsion) return "propulsion";
  if (s instanceof SubsistemaAterrizaje) return "aterrizaje";
  if (s instanceof SubsistemaAerodinamico) return "aerodinamico";
  if (s instanceof SubsistemaCabina) return "cabina";
  throw new Error(`Subsistema desconocido: ${s.constructor.name}`);
}

export function serializarSubsistema(s: Subsistema, incluirArbol = false): SubsistemaDTO {
  return {
    id: s.getId(),
    codigo: s.getCodigo(),
    nombre: s.getNombre(),
    tipo: tipoDe(s),
    cantidadComponentes: s.contarComponentes(),
    cantidadPiezas: s.contarPiezasTotales(),
    pesoTotalG: s.pesoTotal(),
    componentes: incluirArbol
      ? s.getComponentes().map(c => serializarComponente(c, true))
      : undefined,
  };
}
