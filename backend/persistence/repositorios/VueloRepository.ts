import { DatabaseConnection } from "../DatabaseConnection";
import { Vuelo } from "../../domain/operaciones/Vuelo";
import { Aeronave } from "../../domain/aeronaves/Aeronave";
import { Piloto } from "../../domain/personas/Piloto";
import { Pasajero } from "../../domain/personas/Pasajero";
import { AeronaveRepository } from "./AeronaveRepository";
import { PersonaRepository } from "./PersonaRepository";

interface FilaVuelo {
  id: number;
  numero: string;
  origen: string;
  destino: string;
  fecha_salida: string;
  aeronave_id: number;
  piloto_id: number;
}

// Repositorio de Vuelos.
// Las asociaciones (aeronave, piloto) se resuelven hidratando referencias
// vía los repos correspondientes. La agregación con pasajeros se almacena en
// la tabla puente vuelo_pasajeros.
export class VueloRepository {
  private db = DatabaseConnection.getInstance().getDb();
  private aeronaveRepo = new AeronaveRepository();
  private personaRepo = new PersonaRepository();

  getAll(): Vuelo[] {
    const filas = this.db
      .prepare("SELECT * FROM vuelos ORDER BY fecha_salida")
      .all() as FilaVuelo[];
    return filas
      .map(f => this.hidratar(f))
      .filter((v): v is Vuelo => v !== null);
  }

  findByNumero(numero: string): Vuelo | null {
    const fila = this.db
      .prepare("SELECT * FROM vuelos WHERE numero = ?")
      .get(numero) as FilaVuelo | undefined;
    return fila ? this.hidratar(fila) : null;
  }

  guardar(vuelo: Vuelo): Vuelo {
    const transaccion = this.db.transaction(() => {
      const result = this.db
        .prepare(`
          INSERT INTO vuelos (numero, origen, destino, fecha_salida, aeronave_id, piloto_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(
          vuelo.getNumero(),
          vuelo.getOrigen(),
          vuelo.getDestino(),
          vuelo.getFechaSalida().toISOString().slice(0, 10),
          vuelo.getAeronave().getId(),
          vuelo.getPiloto().getId()
        );

      vuelo.setId(result.lastInsertRowid as number);

      // Agregación: relación M:N con pasajeros vía tabla puente
      for (const pasajero of vuelo.getPasajeros()) {
        this.embarcar(vuelo.getId(), pasajero.getId());
      }
    });
    transaccion();
    return vuelo;
  }

  embarcar(vueloId: number, pasajeroId: number, asiento: string | null = null): void {
    this.db
      .prepare("INSERT OR IGNORE INTO vuelo_pasajeros (vuelo_id, pasajero_id, asiento) VALUES (?, ?, ?)")
      .run(vueloId, pasajeroId, asiento);
  }

  desembarcar(vueloId: number, pasajeroId: number): boolean {
    const r = this.db
      .prepare("DELETE FROM vuelo_pasajeros WHERE vuelo_id = ? AND pasajero_id = ?")
      .run(vueloId, pasajeroId);
    return r.changes > 0;
  }

  listarPasajeros(vueloId: number): Pasajero[] {
    const ids = this.db
      .prepare("SELECT pasajero_id FROM vuelo_pasajeros WHERE vuelo_id = ?")
      .all(vueloId) as Array<{ pasajero_id: number }>;
    return ids
      .map(r => this.personaRepo.findById(r.pasajero_id))
      .filter((p): p is Pasajero => p instanceof Pasajero);
  }

  delete(id: number): boolean {
    // ON DELETE CASCADE en vuelo_pasajeros se encarga del puente
    const r = this.db.prepare("DELETE FROM vuelos WHERE id = ?").run(id);
    return r.changes > 0;
  }

  private hidratar(f: FilaVuelo): Vuelo | null {
    const aeronave: Aeronave | null = this.aeronaveRepo.findById(f.aeronave_id);
    const piloto = this.personaRepo.findById(f.piloto_id);

    if (!aeronave || !(piloto instanceof Piloto)) return null;

    const vuelo = new Vuelo(
      f.numero, f.origen, f.destino,
      new Date(f.fecha_salida),
      aeronave, piloto
    );
    vuelo.setId(f.id);

    // Cargar pasajeros (agregación)
    for (const p of this.listarPasajeros(f.id)) {
      vuelo.embarcar(p);
    }
    return vuelo;
  }
}
