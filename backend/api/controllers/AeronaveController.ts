import { Request, Response } from "express";
import { AeronaveRepository } from "../../persistence/repositorios/AeronaveRepository";
import { AerolineaRepository } from "../../persistence/repositorios/AerolineaRepository";
import { Aeroplano } from "../../domain/aeronaves/Aeroplano";
import { AvionReactor } from "../../domain/aeronaves/AvionReactor";
import { Aeronave } from "../../domain/aeronaves/Aeronave";
import { serializarAeronave } from "../serializers/aeronaveSerializer";
import { serializarPieza } from "../serializers/piezaSerializer";
import { NotFoundError, ValidationError } from "../errors/HttpError";
import {
  exigirString, exigirEntero, exigirEnum, param,
} from "../validators/comunes";

export class AeronaveController {
  private repo = new AeronaveRepository();
  private aerolineaRepo = new AerolineaRepository();

  listar = (req: Request, res: Response): void => {
    const aerolineaIdRaw = req.query.aerolineaId;
    if (aerolineaIdRaw !== undefined) {
      const aerolineaId = exigirEntero(aerolineaIdRaw, "aerolineaId", { min: 1 });
      const aeronaves = this.repo.findByAerolinea(aerolineaId);
      res.json(aeronaves.map(a => serializarAeronave(a)));
      return;
    }
    // Sin filtro: usamos el listado con contadores agregados via SQL
    const filas = this.repo.getAllConContadores();
    res.json(filas.map(f => serializarAeronave(f.aeronave, false, {
      cantSubsistemas: f.cantSubsistemas,
      cantPiezas: f.cantPiezas,
      pesoG: f.pesoG,
    })));
  };

  obtener = (req: Request, res: Response): void => {
    const aeronave = this.repo.findByMatricula(param(req.params.matricula, "matricula"));
    if (!aeronave) throw new NotFoundError("Aeronave", param(req.params.matricula, "matricula"));
    res.json(serializarAeronave(aeronave));
  };

  // Árbol completo: subsistemas → componentes → piezas
  obtenerArbol = (req: Request, res: Response): void => {
    const aeronave = this.repo.findByMatriculaConArbol(param(req.params.matricula, "matricula"));
    if (!aeronave) throw new NotFoundError("Aeronave", param(req.params.matricula, "matricula"));
    res.json(serializarAeronave(aeronave, /* incluirArbol */ true));
  };

  // Reporte completo + agrupación por tipo de pieza, generado por la
  // CLASE ANIDADA Aeronave.Diagnostico.
  diagnostico = (req: Request, res: Response): void => {
    const aeronave = this.repo.findByMatriculaConArbol(param(req.params.matricula, "matricula"));
    if (!aeronave) throw new NotFoundError("Aeronave", param(req.params.matricula, "matricula"));

    const diag = aeronave.crearDiagnostico();

    const tipos = ["Tornillo", "Tuerca", "Arandela", "Resorte"] as const;
    const piezasPorTipo: Record<string, ReturnType<typeof serializarPieza>[]> = {};
    for (const t of tipos) {
      piezasPorTipo[t.toLowerCase()] = diag.listarPiezasPorTipo(t).map(serializarPieza);
    }

    res.json({
      matricula: aeronave.getMatricula(),
      modelo: aeronave.getModelo(),
      tipo: aeronave instanceof AvionReactor ? "reactor" : "aeroplano",
      totalPiezas: diag.contarPiezasTotales(),
      pesoTotalKg: Number(diag.pesoTotalKg().toFixed(3)),
      piezasPorTipo,
      reporteTextual: diag.generarReporte(),
    });
  };

  // Crea solo el "esqueleto" de la aeronave (sin árbol). Para construir el
  // árbol completo se usa el seed o endpoints específicos por subsistema
  // (fuera del alcance de Fase 3).
  crear = (req: Request, res: Response): void => {
    const matricula = exigirString(req.body?.matricula, "matricula", { minLen: 3, maxLen: 20 });
    const modelo = exigirString(req.body?.modelo, "modelo", { minLen: 2, maxLen: 100 });
    const anio = exigirEntero(req.body?.anioFabricacion, "anioFabricacion", {
      min: 1900, max: new Date().getFullYear() + 1,
    });
    const tipo = exigirEnum(req.body?.tipo, "tipo", ["aeroplano", "reactor"] as const);

    let aerolineaId: number | null = null;
    if (req.body?.aerolineaId !== undefined && req.body.aerolineaId !== null) {
      aerolineaId = exigirEntero(req.body.aerolineaId, "aerolineaId", { min: 1 });
      if (!this.aerolineaRepo.findById(aerolineaId)) {
        throw new ValidationError(`Aerolínea ${aerolineaId} no existe`);
      }
    }

    const aeronave: Aeronave = tipo === "reactor"
      ? new AvionReactor(matricula, modelo, anio)
      : new Aeroplano(matricula, modelo, anio);

    this.repo.guardarConArbol(aeronave, aerolineaId);
    res.status(201).json(serializarAeronave(aeronave));
  };

  // PUT /api/aeronaves/:matricula  body: { modelo?, anioFabricacion?, aerolineaId? }
  actualizar = (req: Request, res: Response): void => {
    const matricula = param(req.params.matricula, "matricula");
    const aeronave = this.repo.findByMatricula(matricula);
    if (!aeronave) throw new NotFoundError("Aeronave", matricula);

    const datos: { modelo?: string; anioFabricacion?: number } = {};
    if (req.body?.modelo !== undefined)
      datos.modelo = exigirString(req.body.modelo, "modelo", { minLen: 2, maxLen: 100 });
    if (req.body?.anioFabricacion !== undefined)
      datos.anioFabricacion = exigirEntero(req.body.anioFabricacion, "anioFabricacion", {
        min: 1900, max: new Date().getFullYear() + 1,
      });
    this.repo.actualizar(aeronave.getId(), datos);

    if (req.body?.aerolineaId !== undefined) {
      const aerolineaId = req.body.aerolineaId === null
        ? null
        : exigirEntero(req.body.aerolineaId, "aerolineaId", { min: 1 });
      if (aerolineaId !== null && !this.aerolineaRepo.findById(aerolineaId)) {
        throw new ValidationError(`Aerolínea ${aerolineaId} no existe`);
      }
      this.repo.asignarAerolinea(aeronave.getId(), aerolineaId);
    }

    const actualizada = this.repo.findByMatricula(matricula)!;
    res.json(serializarAeronave(actualizada));
  };

  eliminar = (req: Request, res: Response): void => {
    const ok = this.repo.delete(param(req.params.matricula, "matricula"));
    if (!ok) throw new NotFoundError("Aeronave", param(req.params.matricula, "matricula"));
    res.status(204).send();
  };
}
