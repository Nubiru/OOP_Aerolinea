import { Request, Response } from "express";
import { VueloRepository } from "../../persistence/repositorios/VueloRepository";
import { AeronaveRepository } from "../../persistence/repositorios/AeronaveRepository";
import { PersonaRepository } from "../../persistence/repositorios/PersonaRepository";
import { Vuelo } from "../../domain/operaciones/Vuelo";
import { Piloto } from "../../domain/personas/Piloto";
import { Pasajero } from "../../domain/personas/Pasajero";
import { serializarVuelo } from "../serializers/vueloSerializer";
import { NotFoundError, ValidationError, ConflictError } from "../errors/HttpError";
import {
  exigirString, exigirEntero, exigirFecha, parsearIdParam, param,
} from "../validators/comunes";

export class VueloController {
  private vueloRepo = new VueloRepository();
  private aeronaveRepo = new AeronaveRepository();
  private personaRepo = new PersonaRepository();

  listar = (_req: Request, res: Response): void => {
    res.json(this.vueloRepo.getAll().map(serializarVuelo));
  };

  obtener = (req: Request, res: Response): void => {
    const vuelo = this.vueloRepo.findByNumero(param(req.params.numero, "numero"));
    if (!vuelo) throw new NotFoundError("Vuelo", param(req.params.numero, "numero"));
    res.json(serializarVuelo(vuelo));
  };

  crear = (req: Request, res: Response): void => {
    const numero = exigirString(req.body?.numero, "numero", { minLen: 3, maxLen: 20 });
    const origen = exigirString(req.body?.origen, "origen", { minLen: 3, maxLen: 5 });
    const destino = exigirString(req.body?.destino, "destino", { minLen: 3, maxLen: 5 });
    const fechaSalida = exigirFecha(req.body?.fechaSalida, "fechaSalida");

    const aeronaveMatricula = exigirString(req.body?.aeronaveMatricula, "aeronaveMatricula");
    const pilotoId = exigirEntero(req.body?.pilotoId, "pilotoId", { min: 1 });

    const aeronave = this.aeronaveRepo.findByMatricula(aeronaveMatricula);
    if (!aeronave) throw new ValidationError(`Aeronave "${aeronaveMatricula}" no existe`);

    const piloto = this.personaRepo.findById(pilotoId);
    if (!piloto) throw new ValidationError(`Piloto id=${pilotoId} no existe`);
    if (!(piloto instanceof Piloto)) {
      throw new ValidationError(`La persona id=${pilotoId} no es un Piloto`);
    }

    const vuelo = new Vuelo(numero, origen, destino, fechaSalida, aeronave, piloto);
    this.vueloRepo.guardar(vuelo);
    res.status(201).json(serializarVuelo(vuelo));
  };

  // POST /api/vuelos/:numero/embarcar  body: { pasajeroId, asiento? }
  embarcar = (req: Request, res: Response): void => {
    const vuelo = this.vueloRepo.findByNumero(param(req.params.numero, "numero"));
    if (!vuelo) throw new NotFoundError("Vuelo", param(req.params.numero, "numero"));

    const pasajeroId = exigirEntero(req.body?.pasajeroId, "pasajeroId", { min: 1 });
    const asiento = req.body?.asiento !== undefined
      ? exigirString(req.body.asiento, "asiento", { maxLen: 10 })
      : null;

    const pasajero = this.personaRepo.findById(pasajeroId);
    if (!pasajero) throw new ValidationError(`Pasajero id=${pasajeroId} no existe`);
    if (!(pasajero instanceof Pasajero)) {
      throw new ValidationError(`La persona id=${pasajeroId} no es un Pasajero`);
    }

    // Detectar duplicado antes de insertar
    if (vuelo.getPasajeros().some(p => p.getId() === pasajeroId)) {
      throw new ConflictError(`Pasajero ${pasajeroId} ya está embarcado en el vuelo ${vuelo.getNumero()}`);
    }

    this.vueloRepo.embarcar(vuelo.getId(), pasajeroId, asiento);
    const actualizado = this.vueloRepo.findByNumero(vuelo.getNumero())!;
    res.status(201).json(serializarVuelo(actualizado));
  };

  // DELETE /api/vuelos/:numero/pasajeros/:pasajeroId
  desembarcar = (req: Request, res: Response): void => {
    const vuelo = this.vueloRepo.findByNumero(param(req.params.numero, "numero"));
    if (!vuelo) throw new NotFoundError("Vuelo", param(req.params.numero, "numero"));

    const pasajeroId = parsearIdParam(req.params.pasajeroId, "pasajeroId");
    const ok = this.vueloRepo.desembarcar(vuelo.getId(), pasajeroId);
    if (!ok) {
      throw new NotFoundError(`Embarque (vuelo ${vuelo.getNumero()}, pasajero)`, pasajeroId);
    }
    res.status(204).send();
  };

  eliminar = (req: Request, res: Response): void => {
    const vuelo = this.vueloRepo.findByNumero(param(req.params.numero, "numero"));
    if (!vuelo) throw new NotFoundError("Vuelo", param(req.params.numero, "numero"));
    this.vueloRepo.delete(vuelo.getId());
    res.status(204).send();
  };
}
