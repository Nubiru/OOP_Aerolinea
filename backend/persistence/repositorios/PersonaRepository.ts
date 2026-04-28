import { DatabaseConnection } from "../DatabaseConnection";
import { Persona } from "../../domain/personas/Persona";
import { Empleado } from "../../domain/personas/Empleado";
import { Piloto } from "../../domain/personas/Piloto";
import { Mecanico } from "../../domain/personas/Mecanico";
import { Jefe } from "../../domain/personas/Jefe";
import { Pasajero } from "../../domain/personas/Pasajero";

interface FilaPersona {
  id: number;
  nombre: string;
  dni: string;
  fecha_nacimiento: string;
  tipo: "piloto" | "mecanico" | "jefe" | "pasajero";
  legajo: string | null;
  fecha_ingreso: string | null;
  salario: number | null;
  licencia: string | null;
  horas_vuelo: number | null;
  aeronave_asignada_id: number | null;
  especialidad: string | null;
  departamento: string | null;
  jefe_id: number | null;
  numero_ticket: string | null;
  clase: "economica" | "ejecutiva" | "primera" | null;
  aerolinea_id: number | null;
}

// Repositorio polimórfico para Personas.
// La hidratación reconstruye Piloto / Mecánico / Jefe / Pasajero según `tipo`.
//
// La asociación Piloto↔Aeronave y la asociación Jefe↔Subordinados son IDs en
// la tabla; el caller puede resolverlas con repos auxiliares (la jerarquía de
// supervisión se resuelve en una segunda pasada para evitar cargas circulares).
export class PersonaRepository {
  private db = DatabaseConnection.getInstance().getDb();

  // ─────────────── Búsquedas ────────────────────────────────────────────

  findById(id: number): Persona | null {
    const fila = this.db
      .prepare("SELECT * FROM personas WHERE id = ?")
      .get(id) as FilaPersona | undefined;
    return fila ? this.hidratar(fila) : null;
  }

  findByDni(dni: string): Persona | null {
    const fila = this.db
      .prepare("SELECT * FROM personas WHERE dni = ?")
      .get(dni) as FilaPersona | undefined;
    return fila ? this.hidratar(fila) : null;
  }

  findEmpleadosByAerolinea(aerolineaId: number): Empleado[] {
    const filas = this.db
      .prepare(`
        SELECT * FROM personas
        WHERE aerolinea_id = ? AND tipo IN ('piloto','mecanico','jefe')
        ORDER BY tipo, nombre
      `)
      .all(aerolineaId) as FilaPersona[];
    return filas.map(f => this.hidratar(f) as Empleado);
  }

  findByTipo(tipo: "piloto" | "mecanico" | "jefe" | "pasajero"): Persona[] {
    const filas = this.db
      .prepare("SELECT * FROM personas WHERE tipo = ? ORDER BY nombre")
      .all(tipo) as FilaPersona[];
    return filas.map(f => this.hidratar(f));
  }

  findSubordinadosDe(jefeId: number): Empleado[] {
    const filas = this.db
      .prepare("SELECT * FROM personas WHERE jefe_id = ? ORDER BY nombre")
      .all(jefeId) as FilaPersona[];
    return filas.map(f => this.hidratar(f) as Empleado);
  }

  // ─────────────── Inserciones ──────────────────────────────────────────

  guardar(persona: Persona, contexto: GuardarContexto = {}): Persona {
    const tipo = this.tipoDe(persona);
    const params: Record<string, unknown> = {
      nombre: persona.getNombre(),
      dni: persona.getDni(),
      fecha_nacimiento: this.formatearFecha(persona.getFechaNacimiento()),
      tipo,
      legajo: null, fecha_ingreso: null, salario: null,
      licencia: null, horas_vuelo: null, aeronave_asignada_id: null,
      especialidad: null,
      departamento: null, jefe_id: null,
      numero_ticket: null, clase: null,
      aerolinea_id: contexto.aerolineaId ?? null,
    };

    if (persona instanceof Empleado) {
      params.legajo = persona.getLegajo();
      params.fecha_ingreso = this.formatearFecha(persona.getFechaIngreso());
      params.salario = persona.getSalario();
    }

    if (persona instanceof Piloto) {
      params.licencia = persona.getLicencia();
      params.horas_vuelo = persona.getHorasVuelo();
      params.aeronave_asignada_id = contexto.aeronaveAsignadaId ?? null;
    } else if (persona instanceof Mecanico) {
      params.especialidad = persona.getEspecialidad();
    } else if (persona instanceof Jefe) {
      params.departamento = persona.getDepartamento();
      params.jefe_id = null;  // jefe top-level
    } else if (persona instanceof Pasajero) {
      params.numero_ticket = persona.getNumeroTicket();
      params.clase = persona.getClase();
    }

    const result = this.db
      .prepare(`
        INSERT INTO personas (
          nombre, dni, fecha_nacimiento, tipo,
          legajo, fecha_ingreso, salario,
          licencia, horas_vuelo, aeronave_asignada_id,
          especialidad,
          departamento, jefe_id,
          numero_ticket, clase,
          aerolinea_id
        ) VALUES (
          @nombre, @dni, @fecha_nacimiento, @tipo,
          @legajo, @fecha_ingreso, @salario,
          @licencia, @horas_vuelo, @aeronave_asignada_id,
          @especialidad,
          @departamento, @jefe_id,
          @numero_ticket, @clase,
          @aerolinea_id
        )
      `)
      .run(params);

    const id = result.lastInsertRowid as number;
    persona.setId(id);

    // Composición: certificaciones del mecánico se persisten en tabla dedicada
    if (persona instanceof Mecanico) {
      for (const cert of persona.getCertificaciones()) {
        this.db
          .prepare("INSERT INTO mecanico_certificaciones (mecanico_id, certificacion) VALUES (?, ?)")
          .run(id, cert);
      }
    }
    return persona;
  }

  // Para el caso especial: asignar jefe a un empleado ya guardado
  setJefe(empleadoId: number, jefeId: number | null): void {
    this.db.prepare("UPDATE personas SET jefe_id = ? WHERE id = ?").run(jefeId, empleadoId);
  }

  // Asignar piloto a una aeronave (asociación)
  asignarAeronave(pilotoId: number, aeronaveId: number | null): void {
    this.db.prepare("UPDATE personas SET aeronave_asignada_id = ? WHERE id = ?")
      .run(aeronaveId, pilotoId);
  }

  delete(id: number): boolean {
    const r = this.db.prepare("DELETE FROM personas WHERE id = ?").run(id);
    return r.changes > 0;
  }

  // ─────────────── Hidratación polimórfica ──────────────────────────────

  private tipoDe(p: Persona): "piloto" | "mecanico" | "jefe" | "pasajero" {
    if (p instanceof Piloto) return "piloto";
    if (p instanceof Mecanico) return "mecanico";
    if (p instanceof Jefe) return "jefe";
    if (p instanceof Pasajero) return "pasajero";
    throw new Error(`Tipo de persona desconocido: ${p.constructor.name}`);
  }

  private hidratar(f: FilaPersona): Persona {
    const fechaNac = new Date(f.fecha_nacimiento);
    let p: Persona;

    switch (f.tipo) {
      case "piloto": {
        const piloto = new Piloto(
          f.id, f.nombre, f.dni, fechaNac,
          f.legajo!, new Date(f.fecha_ingreso!), f.salario!,
          f.licencia!, f.horas_vuelo!
        );
        p = piloto;
        break;
      }
      case "mecanico": {
        const certs = this.db
          .prepare("SELECT certificacion FROM mecanico_certificaciones WHERE mecanico_id = ?")
          .all(f.id) as Array<{ certificacion: string }>;
        p = new Mecanico(
          f.id, f.nombre, f.dni, fechaNac,
          f.legajo!, new Date(f.fecha_ingreso!), f.salario!,
          f.especialidad!, certs.map(c => c.certificacion)
        );
        break;
      }
      case "jefe":
        p = new Jefe(
          f.id, f.nombre, f.dni, fechaNac,
          f.legajo!, new Date(f.fecha_ingreso!), f.salario!,
          f.departamento!
        );
        break;
      case "pasajero":
        p = new Pasajero(f.id, f.nombre, f.dni, fechaNac, f.numero_ticket!, f.clase!);
        break;
      default:
        throw new Error(`Tipo de persona desconocido: ${f.tipo}`);
    }
    return p;
  }

  private formatearFecha(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}

export interface GuardarContexto {
  aerolineaId?: number;
  aeronaveAsignadaId?: number;
}
