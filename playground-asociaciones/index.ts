// ============================================================
// TAREA: Avión - Relaciones de Jerarquía y Asociación en OOP
// ============================================================
//
// RELACIONES IMPLEMENTADAS:
//
// 1. HERENCIA (is-a):
//    - SistemaPropulsion → Helice, Turbina
//    - Aeronave → Aeroplano, AvionReactor
//
// 2. COMPOSICIÓN (has-a fuerte):
//    - Aeronave COMPONE TrendeAterrizaje, Alas, Cubierta
//    - Las partes no existen sin la aeronave
//
// 3. AGREGACIÓN (has-a débil):
//    - Aeronave AGREGA Pasajero[]
//    - Los pasajeros existen independientemente del avión
//
// 4. ASOCIACIÓN SIMPLE (usa):
//    - Piloto está ASOCIADO con Aeronave
//    - Ambos existen independientemente
//
// 5. DEPENDENCIA (usa temporalmente):
//    - TorreDeControl DEPENDE de Aeronave (la recibe como parámetro)
//
// ============================================================

// ──────────────────────────────────────────────────────────────
// HERENCIA: Clase abstracta SistemaPropulsion
// Turbina y Helice heredan de ella (relación "is-a")
// ──────────────────────────────────────────────────────────────

abstract class SistemaPropulsion {
    protected tipo: string;

    constructor(tipo: string) {
        this.tipo = tipo;
    }

    abstract ToString(): string;
}

class Turbina extends SistemaPropulsion {
    private numTurbinas: number = 0;

    public constructor(n: number) {
        super("Turbina");
        this.numTurbinas = n;
    }

    public ToString(): string {
        return this.numTurbinas + " Turbina/s";
    }
}

class Helice extends SistemaPropulsion {
    private numHelices: number = 0;

    public constructor(n: number) {
        super("Hélice");
        this.numHelices = n;
    }

    public ToString(): string {
        return this.numHelices + " hélice/s";
    }
}

// ──────────────────────────────────────────────────────────────
// COMPOSICIÓN: Partes que no existen sin la aeronave
// ──────────────────────────────────────────────────────────────

class TrendeAterrizaje {
    private numNeumaticos: number = 0;
    private numAmortiguadores: number = 0;
    private fijoRetractil: boolean = false;

    public constructor(a: number, b: number, c: boolean) {
        this.numNeumaticos = a;
        this.numAmortiguadores = b;
        this.fijoRetractil = c;
    }

    public ToString(): string {
        let mensaje: string = "Tren de Aterrizaje compuesto por: ";
        if (this.fijoRetractil) {
            mensaje += " con Retractil fijo, ";
        }
        mensaje += this.numNeumaticos + " neumáticos, " + this.numAmortiguadores + " amortiguadores ";
        return mensaje;
    }
}

class Cubierta {
    private cabinaTripulacion: boolean = false;
    private cabinaVuelo: boolean = false;
    private sistemaEmergencia: boolean = false;
    private numTanquesCombustible: number = 0;
    private numPuertasSalidas: number = 0;

    public constructor(
        pCabinaTripulacion: boolean,
        pCabinaVuelo: boolean,
        pSistemaEmergencia: boolean,
        pTanquesCombustible: number,
        pPuertasSalida: number
    ) {
        this.cabinaTripulacion = pCabinaTripulacion;
        this.cabinaVuelo = pCabinaVuelo;
        this.sistemaEmergencia = pSistemaEmergencia;
        this.numTanquesCombustible = pTanquesCombustible;
        this.numPuertasSalidas = pPuertasSalida;
    }

    public ToString(): string {
        let mensaje = "Cubierta compuesta de: ";
        if (this.cabinaVuelo) {
            mensaje += " Cubierta de Vuelo, ";
        }
        if (this.cabinaTripulacion) {
            mensaje += " Cubierta de Tripulación, ";
        }
        if (this.sistemaEmergencia) {
            mensaje += " Sistema de Emergencia, ";
        }
        mensaje += this.numTanquesCombustible + " Tanques de Combustible, ";
        mensaje += this.numPuertasSalidas + " Puertas de Salida.";
        return mensaje;
    }
}

class Alas {
    private numAlasFrente: number = 0;
    private numAlasCola: number = 0;

    public constructor(mAlasFrente: number, nAlasCola: number) {
        this.numAlasFrente = mAlasFrente;
        this.numAlasCola = nAlasCola;
    }

    public ToString(): string {
        return "Alas Frontales: " + this.numAlasFrente + " Alas Posteriores: " + this.numAlasCola;
    }
}

// ──────────────────────────────────────────────────────────────
// AGREGACIÓN: Pasajero existe independientemente del avión
// ──────────────────────────────────────────────────────────────

class Pasajero {
    private nombre: string;
    private asiento: string;

    public constructor(nombre: string, asiento: string) {
        this.nombre = nombre;
        this.asiento = asiento;
    }

    public ToString(): string {
        return this.nombre + " (Asiento: " + this.asiento + ")";
    }
}

// ──────────────────────────────────────────────────────────────
// ASOCIACIÓN SIMPLE: Piloto existe independientemente del avión
// ──────────────────────────────────────────────────────────────

class Piloto {
    private nombre: string;
    private licencia: string;
    private aeronaveAsignada: Aeronave | null = null;

    public constructor(nombre: string, licencia: string) {
        this.nombre = nombre;
        this.licencia = licencia;
    }

    // Asociación: el piloto se asigna a una aeronave, pero ambos existen por separado
    public asignarAeronave(aeronave: Aeronave): void {
        this.aeronaveAsignada = aeronave;
    }

    public ToString(): string {
        let mensaje = "Piloto: " + this.nombre + " (Licencia: " + this.licencia + ")";
        if (this.aeronaveAsignada) {
            mensaje += " - Asignado a aeronave";
        }
        return mensaje;
    }
}

// ──────────────────────────────────────────────────────────────
// HERENCIA: Aeronave es la clase base abstracta
// Aeroplano y AvionReactor heredan de ella (relación "is-a")
//
// COMPOSICIÓN: Aeronave compone TrendeAterrizaje, Alas, Cubierta
// AGREGACIÓN: Aeronave agrega Pasajero[]
// ──────────────────────────────────────────────────────────────

abstract class Aeronave {
    // COMPOSICIÓN: estas partes se crean con la aeronave y mueren con ella
    protected propulsion: SistemaPropulsion;
    protected trenAterrizaje: TrendeAterrizaje;
    protected alas: Alas;
    protected cubierta: Cubierta;

    // AGREGACIÓN: los pasajeros existen independientemente
    protected pasajeros: Pasajero[] = [];

    constructor(
        propulsion: SistemaPropulsion,
        trenAterrizaje: TrendeAterrizaje,
        alas: Alas,
        cubierta: Cubierta
    ) {
        this.propulsion = propulsion;
        this.trenAterrizaje = trenAterrizaje;
        this.alas = alas;
        this.cubierta = cubierta;
    }

    // AGREGACIÓN: agregar/quitar pasajeros
    public embarcarPasajero(pasajero: Pasajero): void {
        this.pasajeros.push(pasajero);
    }

    public desembarcarPasajeros(): Pasajero[] {
        const desembarcados = this.pasajeros;
        this.pasajeros = [];
        return desembarcados; // los pasajeros siguen existiendo fuera del avión
    }

    public abstract ToString(): string;
}

// Aeroplano: usa Hélice como sistema de propulsión
class Aeroplano extends Aeronave {
    constructor(
        helice: Helice,
        trenAterrizaje: TrendeAterrizaje,
        alas: Alas,
        cubierta: Cubierta
    ) {
        super(helice, trenAterrizaje, alas, cubierta);
    }

    public ToString(): string {
        let mensaje = "=== AEROPLANO (con hélice) ===\n";
        mensaje += "  Propulsión: " + this.propulsion.ToString() + "\n";
        mensaje += "  " + this.alas.ToString() + "\n";
        mensaje += "  " + this.trenAterrizaje.ToString() + "\n";
        mensaje += "  " + this.cubierta.ToString() + "\n";
        if (this.pasajeros.length > 0) {
            mensaje += "  Pasajeros (" + this.pasajeros.length + "):\n";
            for (const p of this.pasajeros) {
                mensaje += "    - " + p.ToString() + "\n";
            }
        }
        return mensaje;
    }
}

// AvionReactor: usa Turbina como sistema de propulsión
class AvionReactor extends Aeronave {
    constructor(
        turbina: Turbina,
        trenAterrizaje: TrendeAterrizaje,
        alas: Alas,
        cubierta: Cubierta
    ) {
        super(turbina, trenAterrizaje, alas, cubierta);
    }

    public ToString(): string {
        let mensaje = "=== AVIÓN REACTOR (con turbinas) ===\n";
        mensaje += "  Propulsión: " + this.propulsion.ToString() + "\n";
        mensaje += "  " + this.alas.ToString() + "\n";
        mensaje += "  " + this.trenAterrizaje.ToString() + "\n";
        mensaje += "  " + this.cubierta.ToString() + "\n";
        if (this.pasajeros.length > 0) {
            mensaje += "  Pasajeros (" + this.pasajeros.length + "):\n";
            for (const p of this.pasajeros) {
                mensaje += "    - " + p.ToString() + "\n";
            }
        }
        return mensaje;
    }
}

// ──────────────────────────────────────────────────────────────
// DEPENDENCIA: TorreDeControl usa Aeronave como parámetro
// No la almacena, solo la usa temporalmente en sus métodos
// ──────────────────────────────────────────────────────────────

class TorreDeControl {
    private nombre: string;

    public constructor(nombre: string) {
        this.nombre = nombre;
    }

    // DEPENDENCIA: recibe aeronave como parámetro, la usa y la suelta
    public autorizarDespegue(aeronave: Aeronave): string {
        return "Torre " + this.nombre + " autoriza despegue de:\n" + aeronave.ToString();
    }

    public autorizarAterrizaje(aeronave: Aeronave): string {
        return "Torre " + this.nombre + " autoriza aterrizaje de:\n" + aeronave.ToString();
    }
}

// ============================================================
// PROGRAMA PRINCIPAL - Demostración de todas las relaciones
// ============================================================

console.log("╔══════════════════════════════════════════════════╗");
console.log("║   DEMOSTRACIÓN DE RELACIONES OOP - AVIÓN        ║");
console.log("╚══════════════════════════════════════════════════╝\n");

// --- 1. HERENCIA + COMPOSICIÓN: Crear un Aeroplano (con hélice) ---
console.log("─── 1. HERENCIA + COMPOSICIÓN ───");
console.log("SistemaPropulsion → Helice/Turbina (herencia)");
console.log("Aeronave → Aeroplano/AvionReactor (herencia)");
console.log("Aeronave COMPONE sus partes (composición)\n");

const helice = new Helice(3);
const trenAterrizaje1 = new TrendeAterrizaje(2, 3, true);
const alas1 = new Alas(2, 3);
const cubierta1 = new Cubierta(true, true, true, 4, 4);

const aeroplano = new Aeroplano(helice, trenAterrizaje1, alas1, cubierta1);
console.log(aeroplano.ToString());

// --- Crear un AvionReactor (con turbinas) ---
const turbina = new Turbina(4);
const trenAterrizaje2 = new TrendeAterrizaje(6, 8, true);
const alas2 = new Alas(2, 1);
const cubierta2 = new Cubierta(true, true, true, 8, 6);

const avionReactor = new AvionReactor(turbina, trenAterrizaje2, alas2, cubierta2);
console.log(avionReactor.ToString());

// --- 2. AGREGACIÓN: Los pasajeros existen independientemente ---
console.log("─── 2. AGREGACIÓN ───");
console.log("Los pasajeros existen antes de subir y después de bajar del avión\n");

const p1 = new Pasajero("Ana García", "1A");
const p2 = new Pasajero("Carlos López", "2B");
const p3 = new Pasajero("María Torres", "3C");

avionReactor.embarcarPasajero(p1);
avionReactor.embarcarPasajero(p2);
avionReactor.embarcarPasajero(p3);

console.log("Después de embarcar pasajeros:");
console.log(avionReactor.ToString());

const desembarcados = avionReactor.desembarcarPasajeros();
console.log("Pasajeros desembarcados (siguen existiendo):");
for (const p of desembarcados) {
    console.log("  - " + p.ToString());
}
console.log();

// --- 3. ASOCIACIÓN SIMPLE: Piloto se asocia con Aeronave ---
console.log("─── 3. ASOCIACIÓN SIMPLE ───");
console.log("El piloto y la aeronave existen independientemente\n");

const piloto = new Piloto("Juan Pérez", "ATP-12345");
piloto.asignarAeronave(avionReactor);
console.log(piloto.ToString());
console.log();

// --- 4. DEPENDENCIA: TorreDeControl usa Aeronave temporalmente ---
console.log("─── 4. DEPENDENCIA ───");
console.log("La torre usa la aeronave como parámetro, no la almacena\n");

const torre = new TorreDeControl("Madrid-Barajas");
console.log(torre.autorizarDespegue(aeroplano));
console.log(torre.autorizarAterrizaje(avionReactor));
