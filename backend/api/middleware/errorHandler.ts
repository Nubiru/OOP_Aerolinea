import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError";

// Middleware central de manejo de errores.
// - HttpError → respuesta JSON con su status/codigo
// - SqliteError de constraint → 409 Conflict
// - Cualquier otro Error → 500
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.codigo,
      mensaje: err.message,
      detalles: err.detalles,
    });
    return;
  }

  // better-sqlite3 lanza SqliteError con código `SQLITE_CONSTRAINT_*`
  const e = err as { code?: string; message?: string };
  if (e?.code?.startsWith("SQLITE_CONSTRAINT")) {
    res.status(409).json({
      error: "CONFLICTO_DB",
      mensaje: "Restricción de la base de datos violada",
      detalles: e.message,
    });
    return;
  }

  // Logear y retornar 500 genérico
  console.error("[errorHandler] error inesperado:", err);
  res.status(500).json({
    error: "ERROR_INTERNO",
    mensaje: e?.message ?? "Error interno del servidor",
  });
}

// 404 para rutas API que no existen
export function notFoundApi(_req: Request, res: Response): void {
  res.status(404).json({ error: "RUTA_NO_ENCONTRADA", mensaje: "Endpoint no existe" });
}
