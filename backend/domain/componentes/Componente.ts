import { Pieza } from "../piezas/Pieza";

// HERENCIA (raíz): clase base de todos los componentes físicos
// (motores, trenes de aterrizaje, alas, cubiertas).
//
// COMPOSICIÓN: un Componente compone Piezas. Si el componente se desecha,
// sus piezas se van con él (a inventario de chatarra). Las piezas no tienen
// sentido como "miembro suelto" del componente fuera de su contexto.
export abstract class Componente {
  protected id: number = 0;       // PK numérico de DB (0 = no persistido)
  protected codigo: string;        // clave natural (ej. "TUR-CFM56-A")
  protected nombre: string;
  protected piezas: Pieza[] = [];

  constructor(codigo: string, nombre: string) {
    this.codigo = codigo;
    this.nombre = nombre;
  }

  getId(): number { return this.id; }
  setId(id: number): void { this.id = id; }
  getCodigo(): string { return this.codigo; }
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
