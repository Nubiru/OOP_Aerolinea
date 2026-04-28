import { Router } from "express";
import { AerolineaController } from "../controllers/AerolineaController";

const router = Router();
const c = new AerolineaController();

router.get("/", c.listar);
router.get("/:id", c.obtener);
router.get("/:id/miembros", c.obtenerConMiembros);
router.post("/", c.crear);
router.delete("/:id", c.eliminar);

export default router;
