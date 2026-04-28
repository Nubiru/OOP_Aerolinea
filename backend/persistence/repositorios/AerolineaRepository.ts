import { DatabaseConnection } from "../DatabaseConnection";
import { Aerolinea } from "../../domain/operaciones/Aerolinea";
import { AeronaveRepository } from "./AeronaveRepository";
import { PersonaRepository } from "./PersonaRepository";

interface FilaAerolinea {
  id: number;
  nombre: string;
  fecha_fundacion: string;
}

// La aerolínea agrega aviones y empleados, así que el repo expone variantes
// con/sin carga de los miembros agregados (para evitar cargas innecesarias).
export class AerolineaRepository {
  private db = DatabaseConnection.getInstance().getDb();
  private aeronaveRepo = new AeronaveRepository();
  private personaRepo = new PersonaRepository();

  getAll(): Aerolinea[] {
    const filas = this.db
      .prepare("SELECT * FROM aerolineas ORDER BY nombre")
      .all() as FilaAerolinea[];
    return filas.map(f => this.hidratar(f));
  }

  // Igual que getAll pero pre-carga listas vacías con el count correcto
  // poblado vía agregaciones SQL (evita N+1 al listar).
  getAllConContadores(): Array<{ aerolinea: Aerolinea; cantAeronaves: number; cantEmpleados: number }> {
    const filas = this.db
      .prepare(`
        SELECT
          a.*,
          (SELECT COUNT(*) FROM aeronaves WHERE aerolinea_id = a.id) AS cant_aeronaves,
          (SELECT COUNT(*) FROM personas
              WHERE aerolinea_id = a.id AND tipo IN ('piloto','mecanico','jefe')) AS cant_empleados
        FROM aerolineas a
        ORDER BY a.nombre
      `)
      .all() as Array<FilaAerolinea & { cant_aeronaves: number; cant_empleados: number }>;
    return filas.map(f => ({
      aerolinea: this.hidratar(f),
      cantAeronaves: f.cant_aeronaves,
      cantEmpleados: f.cant_empleados,
    }));
  }

  findById(id: number): Aerolinea | null {
    const fila = this.db
      .prepare("SELECT * FROM aerolineas WHERE id = ?")
      .get(id) as FilaAerolinea | undefined;
    return fila ? this.hidratar(fila) : null;
  }

  // Hidrata la aerolínea con flota y empleados.
  // (La flota se carga sin árbol — usar AeronaveRepo.findByMatriculaConArbol
  // si querés profundidad para una aeronave específica.)
  findByIdConMiembros(id: number): Aerolinea | null {
    const aerolinea = this.findById(id);
    if (!aerolinea) return null;
    const flota = this.aeronaveRepo.findByAerolinea(id);
    for (const a of flota) aerolinea.agregarAeronave(a);
    const empleados = this.personaRepo.findEmpleadosByAerolinea(id);
    for (const e of empleados) aerolinea.contratar(e);
    return aerolinea;
  }

  guardar(aerolinea: Aerolinea, fechaFundacion: Date): Aerolinea {
    const result = this.db
      .prepare("INSERT INTO aerolineas (nombre, fecha_fundacion) VALUES (?, ?)")
      .run(aerolinea.getNombre(), fechaFundacion.toISOString().slice(0, 10));
    aerolinea.setId(result.lastInsertRowid as number);
    return aerolinea;
  }

  delete(id: number): boolean {
    const r = this.db.prepare("DELETE FROM aerolineas WHERE id = ?").run(id);
    return r.changes > 0;
  }

  private hidratar(f: FilaAerolinea): Aerolinea {
    return new Aerolinea(f.id, f.nombre);
  }
}
