import DatabaseConnection from "../database";

export interface IUsuario {
  id: number;
  nombre: string;
  email: string;
  edad: number;
}

export class Usuario {
  public id: number;
  public nombre: string;
  public email: string;
  public edad: number;

  constructor(data: IUsuario) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.email = data.email;
    this.edad = data.edad;
  }
}

export class UsuarioRepository {
  private db = DatabaseConnection.getInstance().getDb();

  getAll(): Usuario[] {
    const rows = this.db.prepare("SELECT * FROM usuarios").all() as IUsuario[];
    return rows.map((row) => new Usuario(row));
  }

  getById(id: number): Usuario | null {
    const row = this.db.prepare("SELECT * FROM usuarios WHERE id = ?").get(id) as IUsuario | undefined;
    return row ? new Usuario(row) : null;
  }

  create(data: Omit<IUsuario, "id">): Usuario {
    const result = this.db
      .prepare("INSERT INTO usuarios (nombre, email, edad) VALUES (?, ?, ?)")
      .run(data.nombre, data.email, data.edad);
    return new Usuario({ id: result.lastInsertRowid as number, ...data });
  }

  update(id: number, data: Partial<Omit<IUsuario, "id">>): Usuario | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const nombre = data.nombre ?? existing.nombre;
    const email = data.email ?? existing.email;
    const edad = data.edad ?? existing.edad;

    this.db
      .prepare("UPDATE usuarios SET nombre = ?, email = ?, edad = ? WHERE id = ?")
      .run(nombre, email, edad, id);

    return new Usuario({ id, nombre, email, edad });
  }

  delete(id: number): boolean {
    const result = this.db.prepare("DELETE FROM usuarios WHERE id = ?").run(id);
    return result.changes > 0;
  }
}
