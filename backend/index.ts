import express from "express";
import cors from "cors";
import path from "path";
import { DatabaseConnection } from "./persistence/DatabaseConnection";

// Servidor Express. Por ahora sin rutas API (Fase 3 las agrega).
// Su responsabilidad inmediata: inicializar la base SQLite (singleton)
// y servir el frontend estático.
class App {
  private app = express();
  private port: number;

  constructor(port?: number) {
    this.port = port ?? (process.env.PORT ? parseInt(process.env.PORT) : 3000);
    DatabaseConnection.getInstance();   // crea/abre aerolinea.db
    this.middlewares();
    this.staticFiles();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private staticFiles(): void {
    this.app.use(express.static(path.join(__dirname, "../frontend")));
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor OOP_Aerolinea corriendo en http://localhost:${this.port}`);
    });
  }
}

const server = new App();
server.start();
