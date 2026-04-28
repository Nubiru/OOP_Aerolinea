import Database, { Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";
import { SCHEMA_SQL } from "./schema";

// Singleton: hay una sola conexión a la base SQLite por proceso.
// Reutiliza la misma instancia desde cualquier repositorio.
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: DatabaseType;

  private constructor() {
    const dataDir = path.join(__dirname, "../../data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const dbPath = path.join(dataDir, "aerolinea.db");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");

    // Aplica el esquema (idempotente: usa CREATE TABLE IF NOT EXISTS)
    this.db.exec(SCHEMA_SQL);
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  getDb(): DatabaseType { return this.db; }

  // Borra TODAS las tablas y las recrea. Usado por el seed para idempotencia.
  resetSchema(): void {
    const tablas = [
      "vuelo_pasajeros",
      "vuelos",
      "mecanico_certificaciones",
      "piezas",
      "componentes",
      "subsistemas",
      "personas",
      "aeronaves",
      "aerolineas",
    ];
    this.db.pragma("foreign_keys = OFF");
    for (const t of tablas) {
      this.db.exec(`DROP TABLE IF EXISTS ${t}`);
    }
    this.db.pragma("foreign_keys = ON");
    this.db.exec(SCHEMA_SQL);
  }

  close(): void {
    this.db.close();
  }
}
