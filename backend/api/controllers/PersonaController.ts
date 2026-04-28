import { Request, Response } from "express";
import { PersonaRepository } from "../../persistence/repositorios/PersonaRepository";
import { AerolineaRepository } from "../../persistence/repositorios/AerolineaRepository";
import { AeronaveRepository } from "../../persistence/repositorios/AeronaveRepository";
import { Piloto } from "../../domain/personas/Piloto";
import { Mecanico } from "../../domain/personas/Mecanico";
import { Jefe } from "../../domain/personas/Jefe";
import { Pasajero } from "../../domain/personas/Pasajero";
import { serializarPersona } from "../serializers/personaSerializer";
import { NotFoundError, ValidationError } from "../errors/HttpError";
import {
  exigirString, exigirNumero, exigirEntero, exigirFecha, exigirEnum, parsearIdParam,
} from "../validators/comunes";

const TIPOS_PERSONA = ["piloto", "mecanico", "jefe", "pasajero"] as const;
const CLASES_PASAJERO = ["economica", "ejecutiva", "primera"] as const;

export class PersonaController {
  private repo = new PersonaRepository();
  private aerolineaRepo = new AerolineaRepository();
  private aeronaveRepo = new AeronaveRepository();

  // GET /api/personas?tipo=piloto
  listar = (req: Request, res: Response): void => {
    const tipoQ = req.query.tipo;
    if (tipoQ === undefined) {
      // Listar todas (por cada tipo)
      const todas = TIPOS_PERSONA.flatMap(t => this.repo.findByTipo(t));
      res.json(todas.map(serializarPersona));
      return;
    }
    const tipo = exigirEnum(tipoQ, "tipo", TIPOS_PERSONA);
    res.json(this.repo.findByTipo(tipo).map(serializarPersona));
  };

  obtener = (req: Request, res: Response): void => {
    const id = parsearIdParam(req.params.id);
    const persona = this.repo.findById(id);
    if (!persona) throw new NotFoundError("Persona", id);
    res.json(serializarPersona(persona));
  };

  // GET /api/personas/:id/subordinados — para jefes
  subordinados = (req: Request, res: Response): void => {
    const id = parsearIdParam(req.params.id);
    const jefe = this.repo.findById(id);
    if (!jefe) throw new NotFoundError("Persona", id);
    if (!(jefe instanceof Jefe)) {
      throw new ValidationError(`La persona ${id} no es un Jefe`);
    }
    const subs = this.repo.findSubordinadosDe(id);
    res.json(subs.map(serializarPersona));
  };

  // ─────────── Creaciones polimórficas ────────────────────────────────

  crearPiloto = (req: Request, res: Response): void => {
    const datos = this.parsearEmpleadoBase(req.body);
    const licencia = exigirString(req.body?.licencia, "licencia", { minLen: 3, maxLen: 30 });
    const horasVuelo = exigirNumero(req.body?.horasVuelo, "horasVuelo", { min: 0 });

    let aeronaveAsignadaId: number | undefined;
    if (req.body?.aeronaveAsignadaId !== undefined && req.body.aeronaveAsignadaId !== null) {
      aeronaveAsignadaId = exigirEntero(req.body.aeronaveAsignadaId, "aeronaveAsignadaId", { min: 1 });
      if (!this.aeronaveRepo.findById(aeronaveAsignadaId)) {
        throw new ValidationError(`Aeronave ${aeronaveAsignadaId} no existe`);
      }
    }

    const piloto = new Piloto(
      0, datos.nombre, datos.dni, datos.fechaNacimiento,
      datos.legajo, datos.fechaIngreso, datos.salario,
      licencia, horasVuelo
    );
    this.repo.guardar(piloto, { aerolineaId: datos.aerolineaId, aeronaveAsignadaId });
    res.status(201).json(serializarPersona(piloto));
  };

  crearMecanico = (req: Request, res: Response): void => {
    const datos = this.parsearEmpleadoBase(req.body);
    const especialidad = exigirString(req.body?.especialidad, "especialidad", { minLen: 2, maxLen: 50 });
    const certificaciones: string[] = Array.isArray(req.body?.certificaciones)
      ? req.body.certificaciones.map((c: unknown, i: number) => exigirString(c, `certificaciones[${i}]`))
      : [];

    const mecanico = new Mecanico(
      0, datos.nombre, datos.dni, datos.fechaNacimiento,
      datos.legajo, datos.fechaIngreso, datos.salario,
      especialidad, certificaciones
    );
    this.repo.guardar(mecanico, { aerolineaId: datos.aerolineaId });
    res.status(201).json(serializarPersona(mecanico));
  };

  crearJefe = (req: Request, res: Response): void => {
    const datos = this.parsearEmpleadoBase(req.body);
    const departamento = exigirString(req.body?.departamento, "departamento", { minLen: 2, maxLen: 50 });

    const jefe = new Jefe(
      0, datos.nombre, datos.dni, datos.fechaNacimiento,
      datos.legajo, datos.fechaIngreso, datos.salario,
      departamento
    );
    this.repo.guardar(jefe, { aerolineaId: datos.aerolineaId });
    res.status(201).json(serializarPersona(jefe));
  };

  crearPasajero = (req: Request, res: Response): void => {
    const nombre = exigirString(req.body?.nombre, "nombre", { minLen: 2, maxLen: 100 });
    const dni = exigirString(req.body?.dni, "dni", { minLen: 6, maxLen: 20 });
    const fechaNacimiento = exigirFecha(req.body?.fechaNacimiento, "fechaNacimiento");
    const numeroTicket = exigirString(req.body?.numeroTicket, "numeroTicket", { minLen: 3, maxLen: 30 });
    const clase = exigirEnum(req.body?.clase, "clase", CLASES_PASAJERO);

    const pasajero = new Pasajero(0, nombre, dni, fechaNacimiento, numeroTicket, clase);
    this.repo.guardar(pasajero);
    res.status(201).json(serializarPersona(pasajero));
  };

  // PUT /api/personas/:id   body: campos editables según tipo
  actualizar = (req: Request, res: Response): void => {
    const id = parsearIdParam(req.params.id);
    const persona = this.repo.findById(id);
    if (!persona) throw new NotFoundError("Persona", id);

    const datos: Parameters<PersonaRepository["actualizar"]>[1] = {};
    if (req.body?.nombre !== undefined)
      datos.nombre = exigirString(req.body.nombre, "nombre", { minLen: 2, maxLen: 100 });
    if (req.body?.salario !== undefined)
      datos.salario = exigirNumero(req.body.salario, "salario", { min: 0 });
    if (req.body?.horasVuelo !== undefined)
      datos.horasVuelo = exigirNumero(req.body.horasVuelo, "horasVuelo", { min: 0 });
    if (req.body?.especialidad !== undefined)
      datos.especialidad = exigirString(req.body.especialidad, "especialidad", { minLen: 2, maxLen: 50 });
    if (req.body?.departamento !== undefined)
      datos.departamento = exigirString(req.body.departamento, "departamento", { minLen: 2, maxLen: 50 });
    if (req.body?.clase !== undefined)
      datos.clase = exigirEnum(req.body.clase, "clase", ["economica", "ejecutiva", "primera"] as const);

    this.repo.actualizar(id, datos);
    const actualizada = this.repo.findById(id)!;
    res.json(serializarPersona(actualizada));
  };

  // PUT /api/personas/:id/asignar-aeronave   body: { aeronaveId: number | null }
  asignarAeronave = (req: Request, res: Response): void => {
    const id = parsearIdParam(req.params.id);
    const persona = this.repo.findById(id);
    if (!persona) throw new NotFoundError("Persona", id);
    if (!(persona instanceof Piloto)) {
      throw new ValidationError(`La persona ${id} no es un Piloto`);
    }
    let aeronaveId: number | null = null;
    if (req.body?.aeronaveId !== undefined && req.body.aeronaveId !== null) {
      aeronaveId = exigirEntero(req.body.aeronaveId, "aeronaveId", { min: 1 });
      if (!this.aeronaveRepo.findById(aeronaveId)) {
        throw new ValidationError(`Aeronave ${aeronaveId} no existe`);
      }
    }
    this.repo.asignarAeronave(id, aeronaveId);
    const actualizada = this.repo.findById(id)!;
    res.json(serializarPersona(actualizada));
  };

  // PUT /api/personas/:id/jefe   body: { jefeId: number | null }
  asignarJefe = (req: Request, res: Response): void => {
    const id = parsearIdParam(req.params.id);
    const persona = this.repo.findById(id);
    if (!persona) throw new NotFoundError("Persona", id);

    let jefeId: number | null = null;
    if (req.body?.jefeId !== undefined && req.body.jefeId !== null) {
      jefeId = exigirEntero(req.body.jefeId, "jefeId", { min: 1 });
      const jefe = this.repo.findById(jefeId);
      if (!jefe) throw new ValidationError(`Persona id=${jefeId} no existe`);
      if (!(jefe instanceof Jefe)) throw new ValidationError(`La persona id=${jefeId} no es un Jefe`);
    }
    this.repo.setJefe(id, jefeId);
    const actualizada = this.repo.findById(id)!;
    res.json(serializarPersona(actualizada));
  };

  eliminar = (req: Request, res: Response): void => {
    const id = parsearIdParam(req.params.id);
    const ok = this.repo.delete(id);
    if (!ok) throw new NotFoundError("Persona", id);
    res.status(204).send();
  };

  // ─────────── Helpers privados ───────────────────────────────────────

  private parsearEmpleadoBase(body: any) {
    const nombre = exigirString(body?.nombre, "nombre", { minLen: 2, maxLen: 100 });
    const dni = exigirString(body?.dni, "dni", { minLen: 6, maxLen: 20 });
    const fechaNacimiento = exigirFecha(body?.fechaNacimiento, "fechaNacimiento");
    const legajo = exigirString(body?.legajo, "legajo", { minLen: 2, maxLen: 30 });
    const fechaIngreso = exigirFecha(body?.fechaIngreso, "fechaIngreso");
    const salario = exigirNumero(body?.salario, "salario", { min: 0 });

    let aerolineaId: number | undefined;
    if (body?.aerolineaId !== undefined && body.aerolineaId !== null) {
      aerolineaId = exigirEntero(body.aerolineaId, "aerolineaId", { min: 1 });
      if (!this.aerolineaRepo.findById(aerolineaId)) {
        throw new ValidationError(`Aerolínea ${aerolineaId} no existe`);
      }
    }
    return { nombre, dni, fechaNacimiento, legajo, fechaIngreso, salario, aerolineaId };
  }
}
