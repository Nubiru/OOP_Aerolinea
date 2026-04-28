import { Request, Response } from "express";
import { AeronaveRepository } from "../../persistence/repositorios/AeronaveRepository";
import { VueloRepository } from "../../persistence/repositorios/VueloRepository";
import { PersonaRepository } from "../../persistence/repositorios/PersonaRepository";
import { TorreDeControl } from "../../domain/servicios/TorreDeControl";
import { ServicioMantenimiento } from "../../domain/servicios/ServicioMantenimiento";
import { Mecanico } from "../../domain/personas/Mecanico";
import { NotFoundError, ValidationError } from "../errors/HttpError";
import { exigirString, exigirEntero, param } from "../validators/comunes";

// Endpoints que usan los servicios externos (DEPENDENCIA en el modelo OOP).
// Cada operación instancia un Servicio, lo invoca con la entidad cargada de
// la DB y retorna el resultado. Los servicios no se persisten — son objetos
// transitorios que se crean por request.
export class ServicioController {
  private aeronaveRepo = new AeronaveRepository();
  private vueloRepo = new VueloRepository();
  private personaRepo = new PersonaRepository();

  // POST /api/torre/autorizar-despegue/:numeroVuelo
  // body: { codigoIATA: "EZE" }
  autorizarDespegue = (req: Request, res: Response): void => {
    const codigoIATA = exigirString(req.body?.codigoIATA, "codigoIATA", { minLen: 3, maxLen: 4 });
    const vuelo = this.vueloRepo.findByNumero(param(req.params.numeroVuelo, "numeroVuelo"));
    if (!vuelo) throw new NotFoundError("Vuelo", param(req.params.numeroVuelo, "numeroVuelo"));

    const torre = new TorreDeControl(codigoIATA);
    res.json({
      autorizacion: torre.autorizarDespegue(vuelo),
      vueloNumero: vuelo.getNumero(),
      torre: codigoIATA,
    });
  };

  // POST /api/torre/autorizar-aterrizaje/:numeroVuelo
  // body: { codigoIATA: "MAD" }
  autorizarAterrizaje = (req: Request, res: Response): void => {
    const codigoIATA = exigirString(req.body?.codigoIATA, "codigoIATA", { minLen: 3, maxLen: 4 });
    const vuelo = this.vueloRepo.findByNumero(param(req.params.numeroVuelo, "numeroVuelo"));
    if (!vuelo) throw new NotFoundError("Vuelo", param(req.params.numeroVuelo, "numeroVuelo"));

    const torre = new TorreDeControl(codigoIATA);
    res.json({
      autorizacion: torre.autorizarAterrizaje(vuelo),
      vueloNumero: vuelo.getNumero(),
      torre: codigoIATA,
    });
  };

  // POST /api/taller/inspeccionar/:matricula
  // body: { nombreTaller: "Taller EZE", mecanicoId: 5 }
  inspeccionar = (req: Request, res: Response): void => {
    const nombreTaller = exigirString(req.body?.nombreTaller, "nombreTaller", { minLen: 2 });
    const mecanicoId = exigirEntero(req.body?.mecanicoId, "mecanicoId", { min: 1 });

    const aeronave = this.aeronaveRepo.findByMatriculaConArbol(param(req.params.matricula, "matricula"));
    if (!aeronave) throw new NotFoundError("Aeronave", param(req.params.matricula, "matricula"));

    const persona = this.personaRepo.findById(mecanicoId);
    if (!persona) throw new ValidationError(`Persona id=${mecanicoId} no existe`);
    if (!(persona instanceof Mecanico)) {
      throw new ValidationError(`La persona id=${mecanicoId} no es un Mecánico`);
    }

    const taller = new ServicioMantenimiento(nombreTaller);
    const reporte = taller.inspeccionar(aeronave, persona);
    const tornillosARevisar = taller.contarTornillosFlojos(aeronave);

    res.json({
      taller: nombreTaller,
      mecanicoFirmante: persona.getNombre(),
      aeronaveMatricula: aeronave.getMatricula(),
      tornillosARevisar,
      reporte,
    });
  };

  // GET /api/taller/tornillos-a-revisar/:matricula
  tornillosARevisar = (req: Request, res: Response): void => {
    const aeronave = this.aeronaveRepo.findByMatriculaConArbol(param(req.params.matricula, "matricula"));
    if (!aeronave) throw new NotFoundError("Aeronave", param(req.params.matricula, "matricula"));

    const taller = new ServicioMantenimiento("Estimación");
    res.json({
      matricula: aeronave.getMatricula(),
      tornillosARevisar: taller.contarTornillosFlojos(aeronave),
    });
  };
}
