import express from "express";
import cors from "cors";
import path from "path";
import usuarioRoutes from "./routes/usuarioRoutes";

class App {
  private app = express();
  private port: number;

  constructor(port?: number) {
    this.port = port ?? (process.env.PORT ? parseInt(process.env.PORT) : 3000);
    this.middlewares();
    this.routes();
    this.staticFiles();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use("/api/usuarios", usuarioRoutes);
  }

  private staticFiles(): void {
    this.app.use(express.static(path.join(__dirname, "../frontend")));
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en http://localhost:${this.port}`);
    });
  }
}

const server = new App();
server.start();
