import { Request, Response } from "express";
import { UsuarioRepository } from "../models/Usuario";

type Params = { id: string };

export class UsuarioController {
  private repository: UsuarioRepository;

  constructor() {
    this.repository = new UsuarioRepository();
  }

  getAll = (_req: Request, res: Response): void => {
    const usuarios = this.repository.getAll();
    res.json(usuarios);
  };

  getById = (req: Request<Params>, res: Response): void => {
    const usuario = this.repository.getById(parseInt(req.params.id));

    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json(usuario);
  };

  create = (req: Request, res: Response): void => {
    const { nombre, email, edad } = req.body;

    if (!nombre || !email || edad === undefined) {
      res.status(400).json({ error: "Faltan campos requeridos: nombre, email, edad" });
      return;
    }

    const usuario = this.repository.create({ nombre, email, edad });
    res.status(201).json(usuario);
  };

  update = (req: Request<Params>, res: Response): void => {
    const usuario = this.repository.update(parseInt(req.params.id), req.body);

    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json(usuario);
  };

  delete = (req: Request<Params>, res: Response): void => {
    const deleted = this.repository.delete(parseInt(req.params.id));

    if (!deleted) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.status(204).send();
  };
}
