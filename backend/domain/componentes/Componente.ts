import { Pieza } from "../piezas/Pieza";

// HERENCIA (raíz): clase base de todos los componentes físicos
// (motores, trenes de aterrizaje, alas, cubiertas).
//
// COMPOSICIÓN: un Componente compone Piezas. Si el componente se desecha,
// sus piezas se van con él (a inventario de chatarra). Las piezas no tienen
// sentido como "miembro suelto" del componente fuera de su contexto.
export abstract class Componente {
  protected id: string;
  protected nombre: string;
  protected piezas: Pieza[] = [];

  constructor(id: string, nombre: string) {
    this.id = id;
    this.nombre = nombre;
  }

  getId(): string { return this.id; }
  getNombre(): string { return this.nombre; }
  getPiezas(): Pieza[] { return [...this.piezas]; }

  agregarPieza(pieza: Pieza): void {
    this.piezas.push(pieza);
  }

  contarPiezas(): number { return this.piezas.length; }

  pesoTotal(): number {
    return this.piezas.reduce((sum, p) => sum + p.getPeso(), 0);
  }

  abstract describir(): string;
}
