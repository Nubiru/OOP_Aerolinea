import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController";

const router = Router();
const controller = new UsuarioController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
