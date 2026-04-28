import { Aeronave } from "../../domain/aeronaves/Aeronave";
import { AvionReactor } from "../../domain/aeronaves/AvionReactor";
import { SubsistemaDTO, serializarSubsistema } from "./subsistemaSerializer";

export interface AeronaveDTO {
  id: number;
  matricula: string;
  modelo: string;
  anioFabricacion: number;
  tipo: "aeroplano" | "reactor";
  // resumen calculado
  cantidadSubsistemas: number;
  cantidadPiezasTotales: number;
  pesoTotalKg: number;
  // árbol opcional
  subsistemas?: SubsistemaDTO[];
}

export function serializarAeronave(
  a: Aeronave,
  incluirArbol = false,
  contadores?: { cantSubsistemas: number; cantPiezas: number; pesoG: number }
): AeronaveDTO {
  const cantSubsistemas = contadores?.cantSubsistemas ?? a.getSubsistemas().length;
  const cantPiezas = contadores?.cantPiezas ?? a.crearDiagnostico().contarPiezasTotales();
  const pesoKg = contadores
    ? Number((contadores.pesoG / 1000).toFixed(3))
    : Number(a.crearDiagnostico().pesoTotalKg().toFixed(3));

  return {
    id: a.getId(),
    matricula: a.getMatricula(),
    modelo: a.getModelo(),
    anioFabricacion: a.getAnio(),
    tipo: a instanceof AvionReactor ? "reactor" : "aeroplano",
    cantidadSubsistemas: cantSubsistemas,
    cantidadPiezasTotales: cantPiezas,
    pesoTotalKg: pesoKg,
    subsistemas: incluirArbol
      ? a.getSubsistemas().map(s => serializarSubsistema(s, true))
      : undefined,
  };
}
