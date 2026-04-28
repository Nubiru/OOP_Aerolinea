import { ValidationError } from "../errors/HttpError";

// Helpers de validación reutilizables. Tiran ValidationError → 400.

export function exigirString(v: unknown, campo: string, opciones?: { minLen?: number; maxLen?: number }): string {
  if (typeof v !== "string") {
    throw new ValidationError(`Campo "${campo}" debe ser string`);
  }
  if (opciones?.minLen !== undefined && v.length < opciones.minLen) {
    throw new ValidationError(`Campo "${campo}" debe tener al menos ${opciones.minLen} caracteres`);
  }
  if (opciones?.maxLen !== undefined && v.length > opciones.maxLen) {
    throw new ValidationError(`Campo "${campo}" supera el largo máximo (${opciones.maxLen})`);
  }
  return v;
}

export function exigirNumero(v: unknown, campo: string, opciones?: { min?: number; max?: number }): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) {
    throw new ValidationError(`Campo "${campo}" debe ser un número`);
  }
  if (opciones?.min !== undefined && n < opciones.min) {
    throw new ValidationError(`Campo "${campo}" debe ser >= ${opciones.min}`);
  }
  if (opciones?.max !== undefined && n > opciones.max) {
    throw new ValidationError(`Campo "${campo}" debe ser <= ${opciones.max}`);
  }
  return n;
}

export function exigirEntero(v: unknown, campo: string, opciones?: { min?: number; max?: number }): number {
  const n = exigirNumero(v, campo, opciones);
  if (!Number.isInteger(n)) {
    throw new ValidationError(`Campo "${campo}" debe ser entero`);
  }
  return n;
}

export function exigirFecha(v: unknown, campo: string): Date {
  const s = exigirString(v, campo);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    throw new ValidationError(`Campo "${campo}" debe ser una fecha válida (ISO yyyy-mm-dd)`);
  }
  return d;
}

export function exigirEnum<T extends string>(v: unknown, campo: string, valores: readonly T[]): T {
  const s = exigirString(v, campo);
  if (!valores.includes(s as T)) {
    throw new ValidationError(`Campo "${campo}" debe ser uno de: ${valores.join(", ")}`);
  }
  return s as T;
}

// Extrae un path param como string (Express 5 los tipa como string | string[]).
export function param(raw: string | string[] | undefined, campo: string): string {
  if (raw === undefined || Array.isArray(raw)) {
    throw new ValidationError(`Parámetro "${campo}" inválido`);
  }
  return raw;
}

// Útil para parsear :id de la URL.
// Express 5 tipa params como string | string[]; en runtime siempre es string
// para path params simples, pero aceptamos ambos por seguridad.
export function parsearIdParam(raw: string | string[] | undefined, campo = "id"): number {
  if (raw === undefined || Array.isArray(raw)) {
    throw new ValidationError(`Parámetro "${campo}" requerido`);
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ValidationError(`Parámetro "${campo}" debe ser un entero positivo`);
  }
  return n;
}
