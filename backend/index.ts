import express from "express";
import cors from "cors";
import path from "path";
import { DatabaseConnection } from "./persistence/DatabaseConnection";
import aerolineaRoutes from "./api/routes/aerolineaRoutes";
import aeronaveRoutes from "./api/routes/aeronaveRoutes";
import personaRoutes from "./api/routes/personaRoutes";
import vueloRoutes from "./api/routes/vueloRoutes";
import { torreRouter, tallerRouter } from "./api/routes/servicioRoutes";
import { errorHandler, notFoundApi } from "./api/middleware/errorHandler";

class App {
  private app = express();
  private port: number;

  constructor(port?: number) {
    this.port = port ?? (process.env.PORT ? parseInt(process.env.PORT) : 3000);
    DatabaseConnection.getInstance();   // crea/abre aerolinea.db
    this.middlewares();
    this.routes();
    this.staticFiles();
    this.errorHandling();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.get("/api/health", (_req, res) => {
      res.json({ status: "ok", servicio: "OOP_Aerolinea API" });
    });
    this.app.use("/api/aerolineas", aerolineaRoutes);
    this.app.use("/api/aeronaves", aeronaveRoutes);
    this.app.use("/api/personas", personaRoutes);
    this.app.use("/api/vuelos", vueloRoutes);
    this.app.use("/api/torre", torreRouter);
    this.app.use("/api/taller", tallerRouter);
  }

  private staticFiles(): void {
    this.app.use(express.static(path.join(__dirname, "../frontend")));
  }

  // Tiene que ir AL FINAL: 404 para /api/* + handler central de errores.
  private errorHandling(): void {
    this.app.use("/api", notFoundApi);
    this.app.use(errorHandler);
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor OOP_Aerolinea corriendo en http://localhost:${this.port}`);
      console.log(`API en http://localhost:${this.port}/api/health`);
    });
  }
}

const server = new App();
server.start();
