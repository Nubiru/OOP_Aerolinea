import { Request, Response } from "express";
import { AerolineaRepository } from "../../persistence/repositorios/AerolineaRepository";
import { Aerolinea } from "../../domain/operaciones/Aerolinea";
import { serializarAerolinea } from "../serializers/aerolineaSerializer";
import { NotFoundError } from "../errors/HttpError";
import { exigirString, exigirFecha, parsearIdParam } from "../validators/comunes";

// Controller como clase: agrupa endpoints y dependencias (Repos) por recurso.
// Usamos arrow methods para que `this` quede correctamente bound al pasarlos
// como handlers de Express.
export class AerolineaController {
  private repo = new AerolineaRepository();

  listar = (_req: Request, res: Response): void => {
    const filas = this.repo.getAllConContadores();
    res.json(filas.map(f => serializarAerolinea(f.aerolinea, false, {
      cantAeronaves: f.cantAeronaves,
      cantEmpleados: f.cantEmpleados,
    })));
  };

  obtener = (req: Request, res: Response): void => {
    const id = parsearIdParam(req.params.id);
    const aerolinea = this.repo.findById(id);
    if (!aerolinea) throw new NotFoundError("Aerolínea", id);
    res.json(serializarAerolinea(aerolinea));
  };

  obtenerConMiembros = (req: Request, res: Response): void => {
    const id = parsearIdParam(req.params.id);
    const aerolinea = this.repo.findByIdConMiembros(id);
    if (!aerolinea) throw new NotFoundError("Aerolínea", id);
    res.json(serializarAerolinea(aerolinea, /* incluirMiembros */ true));
  };

  crear = (req: Request, res: Response): void => {
    const nombre = exigirString(req.body?.nombre, "nombre", { minLen: 2, maxLen: 100 });
    const fechaFundacion = exigirFecha(req.body?.fechaFundacion, "fechaFundacion");
    const aerolinea = this.repo.guardar(new Aerolinea(0, nombre), fechaFundacion);
    res.status(201).json(serializarAerolinea(aerolinea));
  };

  actualizar = (req: Request, res: Response): void => {
    const id = parsearIdParam(req.params.id);
    const aerolinea = this.repo.findById(id);
    if (!aerolinea) throw new NotFoundError("Aerolínea", id);

    const datos: { nombre?: string; fechaFundacion?: Date } = {};
    if (req.body?.nombre !== undefined)
      datos.nombre = exigirString(req.body.nombre, "nombre", { minLen: 2, maxLen: 100 });
    if (req.body?.fechaFundacion !== undefined)
      datos.fechaFundacion = exigirFecha(req.body.fechaFundacion, "fechaFundacion");

    this.repo.actualizar(id, datos);
    const actualizada = this.repo.findById(id)!;
    res.json(serializarAerolinea(actualizada));
  };

  eliminar = (req: Request, res: Response): void => {
    const id = parsearIdParam(req.params.id);
    const ok = this.repo.delete(id);
    if (!ok) throw new NotFoundError("Aerolínea", id);
    res.status(204).send();
  };
}
