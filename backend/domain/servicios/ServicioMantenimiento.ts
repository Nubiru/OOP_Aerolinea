import { Aeronave } from "../aeronaves/Aeronave";
import { Mecanico } from "../personas/Mecanico";

// DEPENDENCIA: el servicio recibe la Aeronave como parámetro temporal en sus
// métodos. No la guarda. Tampoco guarda al Mecánico — solo lo usa para firmar
// el reporte. Si dejara de existir el servicio, ni la aeronave ni el mecánico
// se verían afectados.
export class ServicioMantenimiento {
  private nombreTaller: string;

  constructor(nombreTaller: string) {
    this.nombreTaller = nombreTaller;
  }

  inspeccionar(aeronave: Aeronave, mecanicoFirmante: Mecanico): string {
    const diag = aeronave.crearDiagnostico();
    const reporte = diag.generarReporte();
    return `${reporte}\n\n` +
      `[${this.nombreTaller}] Inspección firmada por ${mecanicoFirmante.getNombre()} ` +
      `(${mecanicoFirmante.getEspecialidad()})`;
  }

  contarTornillosFlojos(aeronave: Aeronave): number {
    // Imagina que el 5% de los tornillos requieren ajuste tras 1000 horas.
    const diag = aeronave.crearDiagnostico();
    const tornillos = diag.listarPiezasPorTipo("Tornillo");
    return Math.floor(tornillos.length * 0.05);
  }
}
