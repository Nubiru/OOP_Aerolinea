// HERENCIA (raíz de jerarquía de piezas físicas).
// Una Pieza es la unidad atómica del inventario: tornillos, tuercas, etc.
export abstract class Pieza {
  protected id: number = 0;  // 0 = no persistida
  protected codigo: string;
  protected material: string;
  protected pesoGramos: number;

  constructor(codigo: string, material: string, pesoGramos: number) {
    this.codigo = codigo;
    this.material = material;
    this.pesoGramos = pesoGramos;
  }

  getId(): number { return this.id; }
  setId(id: number): void { this.id = id; }
  getCodigo(): string { return this.codigo; }
  getMaterial(): string { return this.material; }
  getPeso(): number { return this.pesoGramos; }

  abstract obtenerTipo(): string;

  describir(): string {
    return `[${this.obtenerTipo()}] ${this.codigo} — ${this.material}, ${this.pesoGramos}g`;
  }
}
