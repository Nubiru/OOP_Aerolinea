// Máquina de estados de un Vuelo. Los nombres en español aplanados (sin acentos
// ni espacios) para facilitar persistencia y URLs.
export type EstadoVuelo =
  | "programado"      // creado, sin actividad aún
  | "embarcando"      // pasajeros subiendo
  | "en_vuelo"        // en aire
  | "aterrizado"      // llegó a destino
  | "cancelado";      // se canceló

export const ESTADOS_VUELO: EstadoVuelo[] = [
  "programado", "embarcando", "en_vuelo", "aterrizado", "cancelado",
];

// Transiciones permitidas. Definir las reglas centraliza la lógica de
// validación: un vuelo aterrizado no puede volver a embarcar, uno cancelado
// es terminal, etc.
const TRANSICIONES: Record<EstadoVuelo, EstadoVuelo[]> = {
  programado:  ["embarcando", "cancelado"],
  embarcando:  ["en_vuelo", "cancelado"],
  en_vuelo:    ["aterrizado"],
  aterrizado:  [],
  cancelado:   [],
};

export function esTransicionValida(actual: EstadoVuelo, nuevo: EstadoVuelo): boolean {
  return TRANSICIONES[actual].includes(nuevo);
}

export function transicionesPermitidas(actual: EstadoVuelo): EstadoVuelo[] {
  return [...TRANSICIONES[actual]];
}
