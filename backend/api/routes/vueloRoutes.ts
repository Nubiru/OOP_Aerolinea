import { Router } from "express";
import { VueloController } from "../controllers/VueloController";

const router = Router();
const c = new VueloController();

router.get("/", c.listar);
router.get("/:numero", c.obtener);
router.post("/", c.crear);
router.post("/:numero/embarcar", c.embarcar);
router.delete("/:numero/pasajeros/:pasajeroId", c.desembarcar);
router.delete("/:numero", c.eliminar);

export default router;
