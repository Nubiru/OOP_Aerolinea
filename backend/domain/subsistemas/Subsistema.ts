import { Componente } from "../componentes/Componente";
import { Pieza } from "../piezas/Pieza";

// HERENCIA (raíz): clase base de todos los subsistemas de una aeronave.
//
// COMPOSICIÓN: un Subsistema compone Componentes. Cada subsistema agrupa los
// componentes que cumplen una función (propulsión, aterrizaje, etc.).
export abstract class Subsistema {
  protected id: number = 0;       // PK numérico (0 = no persistido)
  protected codigo: string;        // clave natural (ej. "SUB-PROP")
  protected nombre: string;
  protected componentes: Componente[] = [];

  constructor(codigo: string, nombre: string) {
    this.codigo = codigo;
    this.nombre = nombre;
  }

  getId(): number { return this.id; }
  setId(id: number): void { this.id = id; }
  getCodigo(): string { return this.codigo; }
  getNombre(): string { return this.nombre; }
  getComponentes(): Componente[] { return [...this.componentes]; }

  agregarComponente(c: Componente): void {
    this.componentes.push(c);
  }

  contarComponentes(): number { return this.componentes.length; }

  contarPiezasTotales(): number {
    return this.componentes.reduce((sum, c) => sum + c.contarPiezas(), 0);
  }

  pesoTotal(): number {
    return this.componentes.reduce((sum, c) => sum + c.pesoTotal(), 0);
  }

  obtenerTodasLasPiezas(): Pieza[] {
    return this.componentes.flatMap(c => c.getPiezas());
  }

  abstract describir(): string;
}
