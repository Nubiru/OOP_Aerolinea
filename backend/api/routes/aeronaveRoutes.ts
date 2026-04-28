import { Router } from "express";
import { AeronaveController } from "../controllers/AeronaveController";

const router = Router();
const c = new AeronaveController();

router.get("/", c.listar);
router.get("/:matricula", c.obtener);
router.get("/:matricula/arbol", c.obtenerArbol);
router.get("/:matricula/diagnostico", c.diagnostico);
router.post("/", c.crear);
router.put("/:matricula", c.actualizar);
router.delete("/:matricula", c.eliminar);

export default router;
