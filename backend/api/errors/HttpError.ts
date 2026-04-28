// HERENCIA aplicada a errores HTTP: una clase base + subclases por tipo de fallo.
// Los controllers tiran estos errores y un middleware central los traduce a
// respuestas JSON con el código HTTP correcto.
export class HttpError extends Error {
  public readonly status: number;
  public readonly codigo: string;
  public readonly detalles?: unknown;

  constructor(status: number, codigo: string, mensaje: string, detalles?: unknown) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
    // Restaurar el prototipo (necesario al heredar Error en TS targeting ES5+)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends HttpError {
  constructor(recurso: string, identificador?: string | number) {
    const id = identificador !== undefined ? ` (id=${identificador})` : "";
    super(404, "RECURSO_NO_ENCONTRADO", `${recurso} no encontrado${id}`);
  }
}

export class ValidationError extends HttpError {
  constructor(mensaje: string, detalles?: unknown) {
    super(400, "VALIDACION", mensaje, detalles);
  }
}

export class ConflictError extends HttpError {
  constructor(mensaje: string, detalles?: unknown) {
    super(409, "CONFLICTO", mensaje, detalles);
  }
}
