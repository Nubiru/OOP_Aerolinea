import { DatabaseConnection } from "../DatabaseConnection";
import { Subsistema } from "../../domain/subsistemas/Subsistema";
import { SubsistemaPropulsion } from "../../domain/subsistemas/SubsistemaPropulsion";
import { SubsistemaAterrizaje } from "../../domain/subsistemas/SubsistemaAterrizaje";
import { SubsistemaAerodinamico } from "../../domain/subsistemas/SubsistemaAerodinamico";
import { SubsistemaCabina } from "../../domain/subsistemas/SubsistemaCabina";
import { ComponenteRepository } from "./ComponenteRepository";

interface FilaSubsistema {
  id: number;
  codigo: string;
  nombre: string;
  tipo: "propulsion" | "aterrizaje" | "aerodinamico" | "cabina";
  aeronave_id: number;
}

export class SubsistemaRepository {
  private db = DatabaseConnection.getInstance().getDb();
  private componenteRepo = new ComponenteRepository();

  // Carga los subsistemas de una aeronave con su árbol completo
  // (componentes hidratados + piezas hidratadas).
  findByAeronaveConArbol(aeronaveId: number): Subsistema[] {
    const filas = this.db
      .prepare("SELECT * FROM subsistemas WHERE aeronave_id = ? ORDER BY id")
      .all(aeronaveId) as FilaSubsistema[];
    return filas.map(f => {
      const s = this.hidratar(f);
      const componentes = this.componenteRepo.findBySubsistemaConPiezas(f.id);
      for (const c of componentes) s.agregarComponente(c);
      return s;
    });
  }

  findByAeronave(aeronaveId: number): Subsistema[] {
    const filas = this.db
      .prepare("SELECT * FROM subsistemas WHERE aeronave_id = ? ORDER BY id")
      .all(aeronaveId) as FilaSubsistema[];
    return filas.map(f => this.hidratar(f));
  }

  guardar(subsistema: Subsistema, aeronaveId: number): Subsistema {
    const tipo = this.tipoDe(subsistema);
    const result = this.db
      .prepare(`
        INSERT INTO subsistemas (codigo, nombre, tipo, aeronave_id)
        VALUES (?, ?, ?, ?)
      `)
      .run(subsistema.getCodigo(), subsistema.getNombre(), tipo, aeronaveId);

    subsistema.setId(result.lastInsertRowid as number);

    // Cascada: persistir componentes (composición)
    for (const c of subsistema.getComponentes()) {
      this.componenteRepo.guardar(c, subsistema.getId());
    }
    return subsistema;
  }

  delete(id: number): boolean {
    const r = this.db.prepare("DELETE FROM subsistemas WHERE id = ?").run(id);
    return r.changes > 0;
  }

  private tipoDe(s: Subsistema): "propulsion" | "aterrizaje" | "aerodinamico" | "cabina" {
    if (s instanceof SubsistemaPropulsion) return "propulsion";
    if (s instanceof SubsistemaAterrizaje) return "aterrizaje";
    if (s instanceof SubsistemaAerodinamico) return "aerodinamico";
    if (s instanceof SubsistemaCabina) return "cabina";
    throw new Error(`Tipo de subsistema desconocido: ${s.constructor.name}`);
  }

  private hidratar(f: FilaSubsistema): Subsistema {
    let s: Subsistema;
    switch (f.tipo) {
      case "propulsion":   s = new SubsistemaPropulsion(f.codigo, f.nombre); break;
      case "aterrizaje":   s = new SubsistemaAterrizaje(f.codigo, f.nombre); break;
      case "aerodinamico": s = new SubsistemaAerodinamico(f.codigo, f.nombre); break;
      case "cabina":       s = new SubsistemaCabina(f.codigo, f.nombre); break;
      default: throw new Error(`Tipo de subsistema desconocido: ${f.tipo}`);
    }
    s.setId(f.id);
    return s;
  }
}
