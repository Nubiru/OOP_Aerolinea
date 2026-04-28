import { DatabaseConnection } from "../DatabaseConnection";
import { Pieza } from "../../domain/piezas/Pieza";
import { Tornillo } from "../../domain/piezas/Tornillo";
import { Tuerca } from "../../domain/piezas/Tuerca";
import { Arandela } from "../../domain/piezas/Arandela";
import { Resorte } from "../../domain/piezas/Resorte";

interface FilaPieza {
  id: number;
  codigo: string;
  material: string;
  peso_g: number;
  tipo: "tornillo" | "tuerca" | "arandela" | "resorte";
  longitud_mm: number | null;
  diametro_mm: number | null;
  tipo_cabeza: "hexagonal" | "phillips" | "torx" | "allen" | null;
  medida_mm: number | null;
  tipo_rosca: "metrica" | "imperial" | null;
  diametro_int_mm: number | null;
  diametro_ext_mm: number | null;
  constante_elastica: number | null;
  longitud_reposo_mm: number | null;
  componente_id: number;
}

// Repositorio polimórfico para Piezas.
// HIDRATACIÓN: el método `hidratar` reconstruye la subclase concreta correcta
// según el discriminador `tipo` de la fila.
export class PiezaRepository {
  private db = DatabaseConnection.getInstance().getDb();

  findByComponente(componenteId: number): Pieza[] {
    const filas = this.db
      .prepare("SELECT * FROM piezas WHERE componente_id = ? ORDER BY id")
      .all(componenteId) as FilaPieza[];
    return filas.map(f => this.hidratar(f));
  }

  findById(id: number): Pieza | null {
    const fila = this.db
      .prepare("SELECT * FROM piezas WHERE id = ?")
      .get(id) as FilaPieza | undefined;
    return fila ? this.hidratar(fila) : null;
  }

  // Inserta la pieza y le setea el id generado por la DB.
  // Las columnas no aplicables al tipo quedan NULL.
  guardar(pieza: Pieza, componenteId: number): Pieza {
    const tipo = pieza.obtenerTipo().toLowerCase();
    const params: Record<string, unknown> = {
      codigo: pieza.getCodigo(),
      material: pieza.getMaterial(),
      peso_g: pieza.getPeso(),
      tipo,
      longitud_mm: null,
      diametro_mm: null,
      tipo_cabeza: null,
      medida_mm: null,
      tipo_rosca: null,
      diametro_int_mm: null,
      diametro_ext_mm: null,
      constante_elastica: null,
      longitud_reposo_mm: null,
      componente_id: componenteId,
    };

    if (pieza instanceof Tornillo) {
      params.longitud_mm = pieza.getLongitud();
      params.diametro_mm = pieza.getDiametro();
      params.tipo_cabeza = pieza.getTipoCabeza();
    } else if (pieza instanceof Tuerca) {
      params.medida_mm = pieza.getMedida();
      params.tipo_rosca = pieza.getTipoRosca();
    } else if (pieza instanceof Arandela) {
      params.diametro_int_mm = pieza.getDiametroInterno();
      params.diametro_ext_mm = pieza.getDiametroExterno();
    } else if (pieza instanceof Resorte) {
      params.constante_elastica = pieza.getConstanteElastica();
      params.longitud_reposo_mm = pieza.getLongitudReposo();
    }

    const result = this.db
      .prepare(`
        INSERT INTO piezas (
          codigo, material, peso_g, tipo,
          longitud_mm, diametro_mm, tipo_cabeza,
          medida_mm, tipo_rosca,
          diametro_int_mm, diametro_ext_mm,
          constante_elastica, longitud_reposo_mm,
          componente_id
        ) VALUES (
          @codigo, @material, @peso_g, @tipo,
          @longitud_mm, @diametro_mm, @tipo_cabeza,
          @medida_mm, @tipo_rosca,
          @diametro_int_mm, @diametro_ext_mm,
          @constante_elastica, @longitud_reposo_mm,
          @componente_id
        )
      `)
      .run(params);

    pieza.setId(result.lastInsertRowid as number);
    return pieza;
  }

  delete(id: number): boolean {
    const r = this.db.prepare("DELETE FROM piezas WHERE id = ?").run(id);
    return r.changes > 0;
  }

  // Reconstruye la subclase concreta de Pieza según el discriminador.
  private hidratar(f: FilaPieza): Pieza {
    let pieza: Pieza;
    switch (f.tipo) {
      case "tornillo":
        pieza = new Tornillo(
          f.codigo, f.material, f.peso_g,
          f.longitud_mm!, f.diametro_mm!,
          f.tipo_cabeza! as "hexagonal" | "phillips" | "torx" | "allen"
        );
        break;
      case "tuerca":
        pieza = new Tuerca(
          f.codigo, f.material, f.peso_g,
          f.medida_mm!, f.tipo_rosca! as "metrica" | "imperial"
        );
        break;
      case "arandela":
        pieza = new Arandela(
          f.codigo, f.material, f.peso_g,
          f.diametro_int_mm!, f.diametro_ext_mm!
        );
        break;
      case "resorte":
        pieza = new Resorte(
          f.codigo, f.material, f.peso_g,
          f.constante_elastica!, f.longitud_reposo_mm!
        );
        break;
      default:
        throw new Error(`Tipo de pieza desconocido: ${f.tipo}`);
    }
    pieza.setId(f.id);
    return pieza;
  }
}
