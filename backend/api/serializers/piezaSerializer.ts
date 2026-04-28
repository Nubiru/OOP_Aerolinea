import { Pieza } from "../../domain/piezas/Pieza";
import { Tornillo } from "../../domain/piezas/Tornillo";
import { Tuerca } from "../../domain/piezas/Tuerca";
import { Arandela } from "../../domain/piezas/Arandela";
import { Resorte } from "../../domain/piezas/Resorte";

export interface PiezaDTO {
  id: number;
  codigo: string;
  material: string;
  pesoG: number;
  tipo: "tornillo" | "tuerca" | "arandela" | "resorte";
  // específicos según tipo
  longitudMm?: number;
  diametroMm?: number;
  tipoCabeza?: "hexagonal" | "phillips" | "torx" | "allen";
  medidaMm?: number;
  tipoRosca?: "metrica" | "imperial";
  diametroIntMm?: number;
  diametroExtMm?: number;
  constanteElastica?: number;
  longitudReposoMm?: number;
}

// Convierte una Pieza polimórfica en su DTO. Incluye solo los campos
// específicos de la subclase concreta.
export function serializarPieza(p: Pieza): PiezaDTO {
  const base: PiezaDTO = {
    id: p.getId(),
    codigo: p.getCodigo(),
    material: p.getMaterial(),
    pesoG: p.getPeso(),
    tipo: p.obtenerTipo().toLowerCase() as PiezaDTO["tipo"],
  };

  if (p instanceof Tornillo) {
    return {
      ...base,
      longitudMm: p.getLongitud(),
      diametroMm: p.getDiametro(),
      tipoCabeza: p.getTipoCabeza(),
    };
  }
  if (p instanceof Tuerca) {
    return { ...base, medidaMm: p.getMedida(), tipoRosca: p.getTipoRosca() };
  }
  if (p instanceof Arandela) {
    return {
      ...base,
      diametroIntMm: p.getDiametroInterno(),
      diametroExtMm: p.getDiametroExterno(),
    };
  }
  if (p instanceof Resorte) {
    return {
      ...base,
      constanteElastica: p.getConstanteElastica(),
      longitudReposoMm: p.getLongitudReposo(),
    };
  }
  return base;
}
