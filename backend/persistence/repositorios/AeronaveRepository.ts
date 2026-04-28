import { DatabaseConnection } from "../DatabaseConnection";
import { Aeronave } from "../../domain/aeronaves/Aeronave";
import { Aeroplano } from "../../domain/aeronaves/Aeroplano";
import { AvionReactor } from "../../domain/aeronaves/AvionReactor";
import { SubsistemaRepository } from "./SubsistemaRepository";

interface FilaAeronave {
  id: number;
  matricula: string;
  modelo: string;
  anio_fabricacion: number;
  tipo: "aeroplano" | "reactor";
  aerolinea_id: number | null;
}

// Repositorio agregado raíz para Aeronaves.
//
// `findByMatriculaConArbol()` carga el árbol completo:
//   Aeronave → Subsistemas → Componentes → Piezas
//
// `guardarConArbol()` lo persiste atómicamente en una transacción.
export class AeronaveRepository {
  private db = DatabaseConnection.getInstance().getDb();
  private subsistemaRepo = new SubsistemaRepository();

  // Listado liviano (sin árbol)
  getAll(): Aeronave[] {
    const filas = this.db
      .prepare("SELECT * FROM aeronaves ORDER BY matricula")
      .all() as FilaAeronave[];
    return filas.map(f => this.hidratar(f));
  }

  findByMatricula(matricula: string): Aeronave | null {
    const fila = this.db
      .prepare("SELECT * FROM aeronaves WHERE matricula = ?")
      .get(matricula) as FilaAeronave | undefined;
    return fila ? this.hidratar(fila) : null;
  }

  findById(id: number): Aeronave | null {
    const fila = this.db
      .prepare("SELECT * FROM aeronaves WHERE id = ?")
      .get(id) as FilaAeronave | undefined;
    return fila ? this.hidratar(fila) : null;
  }

  // Carga aeronave con TODO el árbol jerárquico hidratado.
  findByMatriculaConArbol(matricula: string): Aeronave | null {
    const fila = this.db
      .prepare("SELECT * FROM aeronaves WHERE matricula = ?")
      .get(matricula) as FilaAeronave | undefined;
    if (!fila) return null;

    const aeronave = this.hidratar(fila);
    const subsistemas = this.subsistemaRepo.findByAeronaveConArbol(fila.id);
    for (const s of subsistemas) aeronave.agregarSubsistema(s);
    return aeronave;
  }

  findByAerolinea(aerolineaId: number): Aeronave[] {
    const filas = this.db
      .prepare("SELECT * FROM aeronaves WHERE aerolinea_id = ? ORDER BY matricula")
      .all(aerolineaId) as FilaAeronave[];
    return filas.map(f => this.hidratar(f));
  }

  // Persiste el agregado entero en una transacción.
  guardarConArbol(aeronave: Aeronave, aerolineaId: number | null = null): Aeronave {
    const transaccion = this.db.transaction(() => {
      const tipo = aeronave instanceof AvionReactor ? "reactor" : "aeroplano";
      const result = this.db
        .prepare(`
          INSERT INTO aeronaves (matricula, modelo, anio_fabricacion, tipo, aerolinea_id)
          VALUES (?, ?, ?, ?, ?)
        `)
        .run(aeronave.getMatricula(), aeronave.getModelo(), aeronave.getAnio(), tipo, aerolineaId);

      aeronave.setId(result.lastInsertRowid as number);

      for (const s of aeronave.getSubsistemas()) {
        this.subsistemaRepo.guardar(s, aeronave.getId());
      }
    });
    transaccion();
    return aeronave;
  }

  asignarAerolinea(aeronaveId: number, aerolineaId: number | null): boolean {
    const r = this.db
      .prepare("UPDATE aeronaves SET aerolinea_id = ? WHERE id = ?")
      .run(aerolineaId, aeronaveId);
    return r.changes > 0;
  }

  delete(matricula: string): boolean {
    // ON DELETE CASCADE en subsistemas → componentes → piezas se encarga del resto
    const r = this.db.prepare("DELETE FROM aeronaves WHERE matricula = ?").run(matricula);
    return r.changes > 0;
  }

  private hidratar(f: FilaAeronave): Aeronave {
    const a: Aeronave = f.tipo === "reactor"
      ? new AvionReactor(f.matricula, f.modelo, f.anio_fabricacion)
      : new Aeroplano(f.matricula, f.modelo, f.anio_fabricacion);
    a.setId(f.id);
    return a;
  }
}
