import Database, { Database as DatabaseType } from "better-sqlite3";
import path from "path";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: DatabaseType;

  private constructor() {
    const dbPath = path.join(__dirname, "../data/usuarios.db");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.createTables();
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  getDb(): DatabaseType {
    return this.db;
  }

  private createTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL,
        edad INTEGER NOT NULL
      )
    `);
  }
}

export default DatabaseConnection;
