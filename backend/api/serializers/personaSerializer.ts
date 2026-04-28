import { Persona } from "../../domain/personas/Persona";
import { Empleado } from "../../domain/personas/Empleado";
import { Piloto } from "../../domain/personas/Piloto";
import { Mecanico } from "../../domain/personas/Mecanico";
import { Jefe } from "../../domain/personas/Jefe";
import { Pasajero } from "../../domain/personas/Pasajero";

export interface PersonaDTO {
  id: number;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  edad: number;
  tipo: "piloto" | "mecanico" | "jefe" | "pasajero";
  // empleado
  legajo?: string;
  fechaIngreso?: string;
  salario?: number;
  cargo?: string;
  // piloto
  licencia?: string;
  horasVuelo?: number;
  // mecanico
  especialidad?: string;
  certificaciones?: string[];
  // jefe
  departamento?: string;
  // pasajero
  numeroTicket?: string;
  clase?: "economica" | "ejecutiva" | "primera";
}

function fmt(d: Date): string { return d.toISOString().slice(0, 10); }

export function serializarPersona(p: Persona): PersonaDTO {
  let tipo: PersonaDTO["tipo"];
  if (p instanceof Piloto) tipo = "piloto";
  else if (p instanceof Mecanico) tipo = "mecanico";
  else if (p instanceof Jefe) tipo = "jefe";
  else if (p instanceof Pasajero) tipo = "pasajero";
  else throw new Error(`Tipo desconocido: ${p.constructor.name}`);

  const dto: PersonaDTO = {
    id: p.getId(),
    nombre: p.getNombre(),
    dni: p.getDni(),
    fechaNacimiento: fmt(p.getFechaNacimiento()),
    edad: p.getEdad(),
    tipo,
  };

  if (p instanceof Empleado) {
    dto.legajo = p.getLegajo();
    dto.fechaIngreso = fmt(p.getFechaIngreso());
    dto.salario = p.getSalario();
    dto.cargo = p.obtenerCargo();
  }

  if (p instanceof Piloto) {
    dto.licencia = p.getLicencia();
    dto.horasVuelo = p.getHorasVuelo();
  } else if (p instanceof Mecanico) {
    dto.especialidad = p.getEspecialidad();
    dto.certificaciones = p.getCertificaciones();
  } else if (p instanceof Jefe) {
    dto.departamento = p.getDepartamento();
  } else if (p instanceof Pasajero) {
    dto.numeroTicket = p.getNumeroTicket();
    dto.clase = p.getClase() as "economica" | "ejecutiva" | "primera";
  }
  return dto;
}
