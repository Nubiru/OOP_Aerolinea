import { Router } from "express";
import { PersonaController } from "../controllers/PersonaController";

const router = Router();
const c = new PersonaController();

router.get("/", c.listar);
router.get("/:id", c.obtener);
router.get("/:id/subordinados", c.subordinados);

router.post("/pilotos", c.crearPiloto);
router.post("/mecanicos", c.crearMecanico);
router.post("/jefes", c.crearJefe);
router.post("/pasajeros", c.crearPasajero);

router.delete("/:id", c.eliminar);

export default router;
