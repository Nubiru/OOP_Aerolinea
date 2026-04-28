import { Router } from "express";
import { ServicioController } from "../controllers/ServicioController";

const torreRouter = Router();
const tallerRouter = Router();
const c = new ServicioController();

torreRouter.post("/autorizar-despegue/:numeroVuelo", c.autorizarDespegue);
torreRouter.post("/autorizar-aterrizaje/:numeroVuelo", c.autorizarAterrizaje);

tallerRouter.post("/inspeccionar/:matricula", c.inspeccionar);
tallerRouter.get("/tornillos-a-revisar/:matricula", c.tornillosARevisar);

export { torreRouter, tallerRouter };
