import { Componente } from "../../domain/componentes/Componente";
import { Turbina } from "../../domain/componentes/Turbina";
import { Helice } from "../../domain/componentes/Helice";
import { TrenAterrizaje } from "../../domain/componentes/TrenAterrizaje";
import { Ala } from "../../domain/componentes/Ala";
import { Cubierta } from "../../domain/componentes/Cubierta";
import { PiezaDTO, serializarPieza } from "./piezaSerializer";

export interface ComponenteDTO {
  id: number;
  codigo: string;
  nombre: string;
  tipo: "turbina" | "helice" | "tren" | "ala" | "cubierta";
  // específicos
  potenciaCv?: number;
  empujeKn?: number;
  numPalas?: number;
  diametroM?: number;
  numNeumaticos?: number;
  esRetractil?: boolean;
  envergaduraM?: number;
  posicion?: "principal" | "estabilizador";
  capacidadPasajeros?: number;
  numPuertas?: number;
  // resumen
  cantidadPiezas: number;
  pesoTotalG: number;
  // árbol opcional
  piezas?: PiezaDTO[];
}

function tipoDe(c: Componente): ComponenteDTO["tipo"] {
  if (c instanceof Turbina) return "turbina";
  if (c instanceof Helice) return "helice";
  if (c instanceof TrenAterrizaje) return "tren";
  if (c instanceof Ala) return "ala";
  if (c instanceof Cubierta) return "cubierta";
  throw new Error(`Tipo desconocido: ${c.constructor.name}`);
}

export function serializarComponente(c: Componente, incluirPiezas = false): ComponenteDTO {
  const base: ComponenteDTO = {
    id: c.getId(),
    codigo: c.getCodigo(),
    nombre: c.getNombre(),
    tipo: tipoDe(c),
    cantidadPiezas: c.contarPiezas(),
    pesoTotalG: c.pesoTotal(),
  };

  if (c instanceof Turbina) {
    base.potenciaCv = c.getPotencia();
    base.empujeKn = c.getEmpuje();
  } else if (c instanceof Helice) {
    base.potenciaCv = c.getPotencia();
    base.numPalas = c.getNumPalas();
    base.diametroM = c.getDiametro();
  } else if (c instanceof TrenAterrizaje) {
    base.numNeumaticos = c.getNumNeumaticos();
    base.esRetractil = c.getEsRetractil();
  } else if (c instanceof Ala) {
    base.envergaduraM = c.getEnvergadura();
    base.posicion = c.getPosicion();
  } else if (c instanceof Cubierta) {
    base.capacidadPasajeros = c.getCapacidad();
    base.numPuertas = c.getNumPuertas();
  }

  if (incluirPiezas) {
    base.piezas = c.getPiezas().map(serializarPieza);
  }
  return base;
}
