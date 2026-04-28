import { DatabaseConnection } from "../DatabaseConnection";
import { Componente } from "../../domain/componentes/Componente";
import { Turbina } from "../../domain/componentes/Turbina";
import { Helice } from "../../domain/componentes/Helice";
import { TrenAterrizaje } from "../../domain/componentes/TrenAterrizaje";
import { Ala } from "../../domain/componentes/Ala";
import { Cubierta } from "../../domain/componentes/Cubierta";
import { PiezaRepository } from "./PiezaRepository";

interface FilaComponente {
  id: number;
  codigo: string;
  nombre: string;
  tipo: "turbina" | "helice" | "tren" | "ala" | "cubierta";
  potencia_cv: number | null;
  empuje_kn: number | null;
  num_palas: number | null;
  diametro_m: number | null;
  num_neumaticos: number | null;
  es_retractil: 0 | 1 | null;
  envergadura_m: number | null;
  posicion: "principal" | "estabilizador" | null;
  capacidad_pasajeros: number | null;
  num_puertas: number | null;
  subsistema_id: number;
}

export class ComponenteRepository {
  private db = DatabaseConnection.getInstance().getDb();
  private piezaRepo = new PiezaRepository();

  // Carga los componentes de un subsistema, cada uno con sus piezas hidratadas.
  findBySubsistemaConPiezas(subsistemaId: number): Componente[] {
    const filas = this.db
      .prepare("SELECT * FROM componentes WHERE subsistema_id = ? ORDER BY id")
      .all(subsistemaId) as FilaComponente[];
    return filas.map(f => {
      const c = this.hidratar(f);
      const piezas = this.piezaRepo.findByComponente(f.id);
      for (const p of piezas) c.agregarPieza(p);
      return c;
    });
  }

  // Versión liviana: sin piezas (para listados)
  findBySubsistema(subsistemaId: number): Componente[] {
    const filas = this.db
      .prepare("SELECT * FROM componentes WHERE subsistema_id = ? ORDER BY id")
      .all(subsistemaId) as FilaComponente[];
    return filas.map(f => this.hidratar(f));
  }

  // Persiste el componente y todas sus piezas (composición → CASCADE).
  guardar(componente: Componente, subsistemaId: number): Componente {
    const tipo = this.tipoDe(componente);
    const params: Record<string, unknown> = {
      codigo: componente.getCodigo(),
      nombre: componente.getNombre(),
      tipo,
      potencia_cv: null,
      empuje_kn: null,
      num_palas: null,
      diametro_m: null,
      num_neumaticos: null,
      es_retractil: null,
      envergadura_m: null,
      posicion: null,
      capacidad_pasajeros: null,
      num_puertas: null,
      subsistema_id: subsistemaId,
    };

    if (componente instanceof Turbina) {
      params.potencia_cv = componente.getPotencia();
      params.empuje_kn = componente.getEmpuje();
    } else if (componente instanceof Helice) {
      params.potencia_cv = componente.getPotencia();
      params.num_palas = componente.getNumPalas();
      params.diametro_m = componente.getDiametro();
    } else if (componente instanceof TrenAterrizaje) {
      params.num_neumaticos = componente.getNumNeumaticos();
      params.es_retractil = componente.getEsRetractil() ? 1 : 0;
    } else if (componente instanceof Ala) {
      params.envergadura_m = componente.getEnvergadura();
      params.posicion = componente.getPosicion();
    } else if (componente instanceof Cubierta) {
      params.capacidad_pasajeros = componente.getCapacidad();
      params.num_puertas = componente.getNumPuertas();
    }

    const result = this.db
      .prepare(`
        INSERT INTO componentes (
          codigo, nombre, tipo,
          potencia_cv, empuje_kn, num_palas, diametro_m,
          num_neumaticos, es_retractil,
          envergadura_m, posicion,
          capacidad_pasajeros, num_puertas,
          subsistema_id
        ) VALUES (
          @codigo, @nombre, @tipo,
          @potencia_cv, @empuje_kn, @num_palas, @diametro_m,
          @num_neumaticos, @es_retractil,
          @envergadura_m, @posicion,
          @capacidad_pasajeros, @num_puertas,
          @subsistema_id
        )
      `)
      .run(params);

    componente.setId(result.lastInsertRowid as number);

    // Cascada de guardado: las piezas pertenecen al componente (composición)
    for (const pieza of componente.getPiezas()) {
      this.piezaRepo.guardar(pieza, componente.getId());
    }

    return componente;
  }

  delete(id: number): boolean {
    const r = this.db.prepare("DELETE FROM componentes WHERE id = ?").run(id);
    return r.changes > 0;
  }

  private tipoDe(c: Componente): "turbina" | "helice" | "tren" | "ala" | "cubierta" {
    if (c instanceof Turbina) return "turbina";
    if (c instanceof Helice) return "helice";
    if (c instanceof TrenAterrizaje) return "tren";
    if (c instanceof Ala) return "ala";
    if (c instanceof Cubierta) return "cubierta";
    throw new Error(`Tipo de componente desconocido: ${c.constructor.name}`);
  }

  private hidratar(f: FilaComponente): Componente {
    let c: Componente;
    switch (f.tipo) {
      case "turbina":
        c = new Turbina(f.codigo, f.nombre, f.potencia_cv!, f.empuje_kn!);
        break;
      case "helice":
        c = new Helice(f.codigo, f.nombre, f.potencia_cv!, f.num_palas!, f.diametro_m!);
        break;
      case "tren":
        c = new TrenAterrizaje(f.codigo, f.nombre, f.num_neumaticos!, f.es_retractil === 1);
        break;
      case "ala":
        c = new Ala(f.codigo, f.nombre, f.envergadura_m!, f.posicion! as "principal" | "estabilizador");
        break;
      case "cubierta":
        c = new Cubierta(f.codigo, f.nombre, f.capacidad_pasajeros!, f.num_puertas!);
        break;
      default:
        throw new Error(`Tipo de componente desconocido: ${f.tipo}`);
    }
    c.setId(f.id);
    return c;
  }
}
