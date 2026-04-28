/* ================================================================
   OOP Aerolínea — Frontend SPA
   Patrón paralelo al backend: clases por responsabilidad.
   ================================================================ */

// =========================================================================
// ApiService — wrapper de fetch a todos los endpoints del backend
// =========================================================================
class ApiService {
  constructor(baseUrl) { this.base = baseUrl; }

  async _fetch(path, options = {}) {
    const res = await fetch(this.base + path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.mensaje || `HTTP ${res.status}`);
      err.codigo = data.error;
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // Aerolíneas
  listarAerolineas()           { return this._fetch("/aerolineas"); }
  obtenerAerolinea(id)         { return this._fetch(`/aerolineas/${id}/miembros`); }

  // Aeronaves
  listarAeronaves()            { return this._fetch("/aeronaves"); }
  obtenerArbol(matricula)      { return this._fetch(`/aeronaves/${matricula}/arbol`); }
  obtenerDiagnostico(matricula){ return this._fetch(`/aeronaves/${matricula}/diagnostico`); }

  // Personas
  listarPersonas(tipo) {
    const q = tipo ? `?tipo=${encodeURIComponent(tipo)}` : "";
    return this._fetch(`/personas${q}`);
  }
  obtenerSubordinados(jefeId)  { return this._fetch(`/personas/${jefeId}/subordinados`); }

  // Vuelos
  listarVuelos()               { return this._fetch("/vuelos"); }
  obtenerVuelo(numero)         { return this._fetch(`/vuelos/${numero}`); }
  crearVuelo(datos)            { return this._fetch("/vuelos", { method: "POST", body: JSON.stringify(datos) }); }
  cambiarEstadoVuelo(numero, estado) {
    return this._fetch(`/vuelos/${numero}/estado`, {
      method: "PUT", body: JSON.stringify({ estado }),
    });
  }
  eliminarVuelo(numero) {
    return this._fetch(`/vuelos/${numero}`, { method: "DELETE" });
  }
  embarcar(numero, pasajeroId, asiento) {
    return this._fetch(`/vuelos/${numero}/embarcar`, {
      method: "POST",
      body: JSON.stringify({ pasajeroId, asiento }),
    });
  }
  desembarcar(numero, pasajeroId) {
    return this._fetch(`/vuelos/${numero}/pasajeros/${pasajeroId}`, { method: "DELETE" });
  }

  // Aeronaves CRUD adicionales
  crearAeronave(datos) {
    return this._fetch("/aeronaves", { method: "POST", body: JSON.stringify(datos) });
  }
  eliminarAeronave(matricula) {
    return this._fetch(`/aeronaves/${matricula}`, { method: "DELETE" });
  }

  // Personas CRUD adicionales
  crearPasajero(datos) {
    return this._fetch("/personas/pasajeros", { method: "POST", body: JSON.stringify(datos) });
  }
  crearPiloto(datos) {
    return this._fetch("/personas/pilotos", { method: "POST", body: JSON.stringify(datos) });
  }
  crearMecanico(datos) {
    return this._fetch("/personas/mecanicos", { method: "POST", body: JSON.stringify(datos) });
  }
  crearJefe(datos) {
    return this._fetch("/personas/jefes", { method: "POST", body: JSON.stringify(datos) });
  }
  actualizarPersona(id, datos) {
    return this._fetch(`/personas/${id}`, { method: "PUT", body: JSON.stringify(datos) });
  }
  eliminarPersona(id) {
    return this._fetch(`/personas/${id}`, { method: "DELETE" });
  }

  // Servicios externos (DEPENDENCIA)
  autorizarDespegue(numeroVuelo, codigoIATA) {
    return this._fetch(`/torre/autorizar-despegue/${numeroVuelo}`, {
      method: "POST", body: JSON.stringify({ codigoIATA }),
    });
  }
  autorizarAterrizaje(numeroVuelo, codigoIATA) {
    return this._fetch(`/torre/autorizar-aterrizaje/${numeroVuelo}`, {
      method: "POST", body: JSON.stringify({ codigoIATA }),
    });
  }
  inspeccionar(matricula, nombreTaller, mecanicoId) {
    return this._fetch(`/taller/inspeccionar/${matricula}`, {
      method: "POST", body: JSON.stringify({ nombreTaller, mecanicoId }),
    });
  }
}

// =========================================================================
// Componentes UI reutilizables
// =========================================================================
class Toast {
  constructor(containerId) { this.container = document.getElementById(containerId); }
  show(message, type = "info", duration = 3000) {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    this.container.appendChild(el);
    requestAnimationFrame(() => el.classList.add("visible"));
    setTimeout(() => {
      el.classList.remove("visible");
      setTimeout(() => el.remove(), 300);
    }, duration);
  }
}

class TabManager {
  constructor(tabsId, onChange) {
    this.tabs = document.querySelectorAll(`#${tabsId} .tab`);
    this.panels = document.querySelectorAll(".panel");
    this.onChange = onChange;
    this.tabs.forEach(t => t.addEventListener("click", () => this.activate(t.dataset.tab)));
  }
  activate(name) {
    this.tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
    this.panels.forEach(p => p.classList.toggle("active", p.id === `panel-${name}`));
    this.onChange?.(name);
  }
}

class Modal {
  static prompt({ titulo, contenido, botones }) {
    return new Promise(resolve => {
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      const modal = document.createElement("div");
      modal.className = "modal";

      const h3 = document.createElement("h3");
      h3.textContent = titulo;
      modal.appendChild(h3);
      modal.appendChild(contenido);

      const actions = document.createElement("div");
      actions.className = "modal-actions";
      botones.forEach(b => {
        const btn = document.createElement("button");
        btn.className = `btn ${b.clase || "btn-ghost"}`;
        btn.textContent = b.texto;
        btn.addEventListener("click", () => {
          overlay.remove();
          resolve(b.valor);
        });
        actions.appendChild(btn);
      });
      modal.appendChild(actions);
      overlay.appendChild(modal);
      overlay.addEventListener("click", e => {
        if (e.target === overlay) { overlay.remove(); resolve(null); }
      });
      document.body.appendChild(overlay);
    });
  }
}

// =========================================================================
// Helpers de DOM
// =========================================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);

// Confirmación rápida con Modal.prompt
async function confirmar(mensaje, textoOk = "Eliminar") {
  const respuesta = await Modal.prompt({
    titulo: "¿Confirmar?",
    contenido: el("p", {}, mensaje),
    botones: [
      { texto: "Cancelar", valor: null, clase: "btn-ghost" },
      { texto: textoOk, valor: "ok", clase: "btn-danger" },
    ],
  });
  return respuesta === "ok";
}
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

// =========================================================================
// FlotaView — Cards de aeronaves con árbol expandible
// =========================================================================
class FlotaView {
  constructor(api, toast) {
    this.api = api;
    this.toast = toast;
    this.root = $("#panel-flota");
  }

  async load() {
    this.root.innerHTML = "";
    const header = el("div", { class: "panel-header" }, [
      el("h2", {}, "Flota"),
      el("div", { class: "controls" }, [
        el("button", {
          class: "btn btn-success btn-sm",
          onclick: () => this.crearAeronaveDialog(),
        }, "+ Crear aeronave"),
        el("button", { class: "btn btn-ghost btn-sm", onclick: () => this.load() }, "↻ Refrescar"),
      ])
    ]);
    this.root.appendChild(header);

    try {
      const aviones = await this.api.listarAeronaves();
      if (aviones.length === 0) {
        this.root.appendChild(el("p", { class: "empty" }, "No hay aeronaves cargadas. Corré npm run seed."));
        return;
      }
      for (const a of aviones) this.root.appendChild(this.renderAvionCard(a));
    } catch (e) {
      this.toast.show(`Error cargando flota: ${e.message}`, "error");
    }
  }

  async crearAeronaveDialog() {
    try {
      const aerolineas = await this.api.listarAerolineas();
      const inputs = {
        matricula: el("input", { type: "text", placeholder: "Ej: LV-XYZ" }),
        modelo:    el("input", { type: "text", placeholder: "Ej: Boeing 777" }),
        anio:      el("input", { type: "number", value: String(new Date().getFullYear()) }),
      };
      const selectTipo = el("select");
      selectTipo.appendChild(el("option", { value: "reactor" }, "Avión Reactor (turbinas)"));
      selectTipo.appendChild(el("option", { value: "aeroplano" }, "Aeroplano (hélices)"));

      const selectAerolinea = el("select");
      selectAerolinea.appendChild(el("option", { value: "" }, "(sin aerolínea)"));
      for (const a of aerolineas) {
        selectAerolinea.appendChild(el("option", { value: a.id }, a.nombre));
      }

      const contenido = el("div", {}, [
        el("div", { class: "form-row" }, [
          el("div", { class: "form-group" }, [el("label", {}, "Matrícula"), inputs.matricula]),
          el("div", { class: "form-group" }, [el("label", {}, "Año"), inputs.anio]),
        ]),
        el("div", { class: "form-row" }, [
          el("div", { class: "form-group" }, [el("label", {}, "Modelo"), inputs.modelo]),
          el("div", { class: "form-group" }, [el("label", {}, "Tipo"), selectTipo]),
        ]),
        el("div", { class: "form-row" }, [
          el("div", { class: "form-group" }, [el("label", {}, "Aerolínea"), selectAerolinea]),
        ]),
      ]);

      const accion = await Modal.prompt({
        titulo: "Crear nueva aeronave",
        contenido,
        botones: [
          { texto: "Cancelar", valor: null, clase: "btn-ghost" },
          { texto: "Crear", valor: "ok", clase: "btn-primary" },
        ],
      });
      if (accion !== "ok") return;

      const datos = {
        matricula: inputs.matricula.value.trim(),
        modelo: inputs.modelo.value.trim(),
        anioFabricacion: parseInt(inputs.anio.value),
        tipo: selectTipo.value,
      };
      if (selectAerolinea.value) datos.aerolineaId = parseInt(selectAerolinea.value);

      await this.api.crearAeronave(datos);
      this.toast.show(`Aeronave ${datos.matricula} creada`, "success");
      this.load();
    } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
  }

  async eliminarAeronave(matricula) {
    const ok = await confirmar(
      `¿Eliminar la aeronave ${matricula}? Borra en cascada todos sus subsistemas, componentes y piezas.`
    );
    if (!ok) return;
    try {
      await this.api.eliminarAeronave(matricula);
      this.toast.show(`Aeronave ${matricula} eliminada`, "success");
      this.load();
    } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
  }

  renderAvionCard(a) {
    const tipoBadge = el("span", { class: `badge badge-${a.tipo}` }, a.tipo === "reactor" ? "Avión Reactor" : "Aeroplano");

    const card = el("div", { class: "card" });

    const arbolContainer = el("div");

    card.appendChild(el("div", { class: "card-header" }, [
      el("div", {}, [
        el("div", { class: "card-title" }, [a.matricula, " ", tipoBadge]),
        el("div", { class: "card-meta" }, `${a.modelo} · año ${a.anioFabricacion}`),
      ]),
    ]));

    card.appendChild(el("div", { class: "card-stats" }, [
      this.statBox(a.cantidadSubsistemas, "Subsistemas"),
      this.statBox(a.cantidadPiezasTotales, "Piezas totales"),
      this.statBox(`${a.pesoTotalKg} kg`, "Peso"),
    ]));

    card.appendChild(el("div", { class: "card-actions" }, [
      el("button", {
        class: "btn btn-primary btn-sm",
        onclick: () => this.cargarArbol(a.matricula, arbolContainer),
      }, "▼ Ver árbol completo"),
      el("button", {
        class: "btn btn-ghost btn-sm",
        onclick: () => this.app?.irADiagnostico(a.matricula),
      }, "📊 Diagnóstico"),
      el("button", {
        class: "btn btn-danger btn-sm",
        onclick: () => this.eliminarAeronave(a.matricula),
      }, "🗑 Eliminar"),
    ]));

    card.appendChild(arbolContainer);
    return card;
  }

  statBox(value, label) {
    return el("div", { class: "stat" }, [
      el("span", { class: "stat-value" }, String(value)),
      el("span", { class: "stat-label" }, label),
    ]);
  }

  async cargarArbol(matricula, container) {
    if (container.dataset.cargado === "1") {
      container.style.display = container.style.display === "none" ? "" : "none";
      return;
    }
    try {
      const arbol = await this.api.obtenerArbol(matricula);
      container.appendChild(this.renderArbol(arbol));
      container.dataset.cargado = "1";
    } catch (e) {
      this.toast.show(`Error: ${e.message}`, "error");
    }
  }

  renderArbol(aeronave) {
    const tree = el("div", { class: "tree" });
    for (const sub of aeronave.subsistemas || []) {
      tree.appendChild(this.renderNodo({
        label: `📦 [${sub.tipo}] ${sub.nombre}`,
        meta: `${sub.cantidadComponentes} componentes · ${sub.cantidadPiezas} piezas`,
        children: sub.componentes,
        renderChild: c => this.renderNodo({
          label: `⚙ [${c.tipo}] ${c.nombre}`,
          meta: this.metaComponente(c),
          children: c.piezas,
          renderChild: p => this.renderNodo({
            label: `🔩 ${p.codigo}`,
            meta: this.metaPieza(p),
            tipoBadge: p.tipo,
          }),
        }),
      }));
    }
    return tree;
  }

  metaComponente(c) {
    if (c.tipo === "turbina") return `${c.potenciaCv} CV · ${c.empujeKn} kN · ${c.cantidadPiezas} piezas`;
    if (c.tipo === "helice")  return `${c.numPalas} palas ø${c.diametroM}m · ${c.cantidadPiezas} piezas`;
    if (c.tipo === "tren")    return `${c.numNeumaticos} neumáticos · ${c.esRetractil ? "retráctil" : "fijo"} · ${c.cantidadPiezas} piezas`;
    if (c.tipo === "ala")     return `${c.envergaduraM}m · ${c.posicion} · ${c.cantidadPiezas} piezas`;
    if (c.tipo === "cubierta") return `cap. ${c.capacidadPasajeros} pax · ${c.numPuertas} puertas · ${c.cantidadPiezas} piezas`;
    return `${c.cantidadPiezas} piezas`;
  }

  metaPieza(p) {
    if (p.tipo === "tornillo") return `M${p.diametroMm}x${p.longitudMm} ${p.tipoCabeza} · ${p.material} · ${p.pesoG}g`;
    if (p.tipo === "tuerca")   return `M${p.medidaMm} ${p.tipoRosca} · ${p.material} · ${p.pesoG}g`;
    if (p.tipo === "arandela") return `ø${p.diametroIntMm}-${p.diametroExtMm}mm · ${p.material} · ${p.pesoG}g`;
    if (p.tipo === "resorte")  return `k=${p.constanteElastica}N/m · L₀=${p.longitudReposoMm}mm · ${p.pesoG}g`;
    return `${p.material} · ${p.pesoG}g`;
  }

  // Renderiza un nodo con toggle expandir/colapsar.
  renderNodo({ label, meta, children, renderChild, tipoBadge }) {
    const tieneHijos = Array.isArray(children) && children.length > 0;

    const node = el("div", { class: "tree-node" });
    const labelLine = el("div", { class: "tree-label" });

    const toggle = el("span", { class: "tree-toggle" }, tieneHijos ? "▼" : "·");
    labelLine.appendChild(toggle);
    labelLine.appendChild(document.createTextNode(label + " "));
    if (tipoBadge) {
      labelLine.appendChild(el("span", { class: `badge badge-${tipoBadge}` }, tipoBadge));
    }
    if (meta) {
      labelLine.appendChild(el("span", { class: "pieza-detalle" }, ` ${meta}`));
    }
    node.appendChild(labelLine);

    if (tieneHijos) {
      const childrenContainer = el("div", { class: "tree-children" });
      for (const c of children) childrenContainer.appendChild(renderChild(c));
      node.appendChild(childrenContainer);

      toggle.addEventListener("click", () => {
        const colapsado = childrenContainer.classList.toggle("collapsed");
        toggle.textContent = colapsado ? "▶" : "▼";
      });
    }
    return node;
  }
}

// =========================================================================
// EmpleadosView — tabla con filtros polimórficos + subordinados
// =========================================================================
class EmpleadosView {
  constructor(api, toast) {
    this.api = api;
    this.toast = toast;
    this.root = $("#panel-empleados");
    this.tipoActivo = null;       // null = todos
  }

  async load() {
    this.root.innerHTML = "";
    this.root.appendChild(el("div", { class: "panel-header" }, [
      el("h2", {}, "Empleados y Pasajeros"),
      el("div", { class: "controls" }, [
        el("button", {
          class: "btn btn-success btn-sm",
          onclick: () => this.crearPersonaDialog(),
        }, "+ Crear persona"),
      ]),
    ]));

    const filtros = el("div", { class: "filter-group" });
    const tipos = [
      { v: null, t: "Todos" },
      { v: "jefe", t: "Jefes" },
      { v: "mecanico", t: "Mecánicos" },
      { v: "piloto", t: "Pilotos" },
      { v: "pasajero", t: "Pasajeros" },
    ];
    for (const opt of tipos) {
      const btn = el("button", {
        class: "filter-pill" + (this.tipoActivo === opt.v ? " active" : ""),
        onclick: () => { this.tipoActivo = opt.v; this.load(); },
      }, opt.t);
      filtros.appendChild(btn);
    }
    this.root.appendChild(filtros);
    this.root.appendChild(el("div", { style: "height: 1rem;" }));

    try {
      const personas = await this.api.listarPersonas(this.tipoActivo);
      if (personas.length === 0) {
        this.root.appendChild(el("p", { class: "empty" }, "Sin resultados."));
        return;
      }
      this.root.appendChild(this.renderTabla(personas));
    } catch (e) {
      this.toast.show(`Error: ${e.message}`, "error");
    }
  }

  renderTabla(personas) {
    const table = el("table");
    table.appendChild(el("thead", { html: `
      <tr><th>Tipo</th><th>Nombre</th><th>DNI</th><th>Edad</th><th>Cargo / Detalle</th><th>Específico</th><th></th></tr>
    `}));
    const tbody = el("tbody");
    for (const p of personas) tbody.appendChild(this.renderFila(p));
    table.appendChild(tbody);
    return table;
  }

  renderFila(p) {
    const tipoBadge = el("span", { class: `badge badge-${p.tipo}` }, p.tipo);
    const tr = el("tr");
    tr.appendChild(el("td", {}, tipoBadge));
    tr.appendChild(el("td", { class: "bold" }, p.nombre));
    tr.appendChild(el("td", {}, p.dni));
    tr.appendChild(el("td", {}, String(p.edad)));
    tr.appendChild(el("td", {}, p.cargo || "—"));
    tr.appendChild(this.celdaEspecifico(p));
    tr.appendChild(this.celdaAcciones(p));
    return tr;
  }

  celdaEspecifico(p) {
    if (p.tipo === "piloto") {
      return el("td", {}, `Lic. ${p.licencia} · ${p.horasVuelo}h vuelo`);
    }
    if (p.tipo === "mecanico") {
      const ul = el("ul", { class: "list-inline" });
      for (const c of p.certificaciones || []) ul.appendChild(el("li", { class: "tag" }, c));
      return el("td", {}, [`${p.especialidad} `, ul]);
    }
    if (p.tipo === "jefe") {
      return el("td", {}, `Depto. ${p.departamento}`);
    }
    if (p.tipo === "pasajero") {
      return el("td", {}, `🎫 ${p.numeroTicket} (${p.clase})`);
    }
    return el("td", {}, "—");
  }

  celdaAcciones(p) {
    const td = el("td");
    if (p.tipo === "jefe") {
      td.appendChild(el("button", {
        class: "btn btn-ghost btn-sm",
        onclick: () => this.mostrarSubordinados(p),
      }, "Ver subordinados"));
    }
    td.appendChild(document.createTextNode(" "));
    td.appendChild(el("button", {
      class: "btn btn-danger btn-sm",
      onclick: () => this.eliminarPersona(p),
    }, "🗑"));
    return td;
  }

  async eliminarPersona(p) {
    const ok = await confirmar(`¿Eliminar a ${p.nombre} (${p.tipo})?`);
    if (!ok) return;
    try {
      await this.api.eliminarPersona(p.id);
      this.toast.show("Persona eliminada", "success");
      this.load();
    } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
  }

  async crearPersonaDialog() {
    // Selector de tipo primero
    const selectTipo = el("select");
    for (const t of ["pasajero", "piloto", "mecanico", "jefe"]) {
      selectTipo.appendChild(el("option", { value: t }, t));
    }

    // Campos comunes
    const inputs = {
      nombre: el("input", { type: "text" }),
      dni:    el("input", { type: "text" }),
      fecha:  el("input", { type: "date" }),
    };

    // Campos específicos (mostramos según tipo)
    const camposEsp = el("div");

    const renderCamposEspecificos = () => {
      camposEsp.innerHTML = "";
      const t = selectTipo.value;
      if (t === "pasajero") {
        camposEsp._inputs = {
          numeroTicket: el("input", { type: "text", placeholder: "Ej: TKT-2000" }),
          clase: (() => {
            const s = el("select");
            for (const c of ["economica", "ejecutiva", "primera"]) s.appendChild(el("option", { value: c }, c));
            return s;
          })(),
        };
        camposEsp.appendChild(el("div", { class: "form-row" }, [
          el("div", { class: "form-group" }, [el("label", {}, "N° Ticket"), camposEsp._inputs.numeroTicket]),
          el("div", { class: "form-group" }, [el("label", {}, "Clase"), camposEsp._inputs.clase]),
        ]));
      } else {
        // empleado base
        camposEsp._inputs = {
          legajo:       el("input", { type: "text", placeholder: "Ej: EMP-300" }),
          fechaIngreso: el("input", { type: "date" }),
          salario:      el("input", { type: "number", value: "5000", min: "0" }),
        };
        camposEsp.appendChild(el("div", { class: "form-row" }, [
          el("div", { class: "form-group" }, [el("label", {}, "Legajo"), camposEsp._inputs.legajo]),
          el("div", { class: "form-group" }, [el("label", {}, "Fecha ingreso"), camposEsp._inputs.fechaIngreso]),
          el("div", { class: "form-group" }, [el("label", {}, "Salario"), camposEsp._inputs.salario]),
        ]));
        if (t === "piloto") {
          camposEsp._inputs.licencia    = el("input", { type: "text", placeholder: "Ej: ATP-AR-99999" });
          camposEsp._inputs.horasVuelo  = el("input", { type: "number", value: "100", min: "0" });
          camposEsp.appendChild(el("div", { class: "form-row" }, [
            el("div", { class: "form-group" }, [el("label", {}, "Licencia"), camposEsp._inputs.licencia]),
            el("div", { class: "form-group" }, [el("label", {}, "Horas de vuelo"), camposEsp._inputs.horasVuelo]),
          ]));
        } else if (t === "mecanico") {
          camposEsp._inputs.especialidad = el("input", { type: "text", placeholder: "Ej: Aviónica" });
          camposEsp.appendChild(el("div", { class: "form-row" }, [
            el("div", { class: "form-group" }, [el("label", {}, "Especialidad"), camposEsp._inputs.especialidad]),
          ]));
        } else if (t === "jefe") {
          camposEsp._inputs.departamento = el("input", { type: "text", placeholder: "Ej: Operaciones" });
          camposEsp.appendChild(el("div", { class: "form-row" }, [
            el("div", { class: "form-group" }, [el("label", {}, "Departamento"), camposEsp._inputs.departamento]),
          ]));
        }
      }
    };

    selectTipo.addEventListener("change", renderCamposEspecificos);
    renderCamposEspecificos();

    const aerolineas = await this.api.listarAerolineas().catch(() => []);
    const selectAerolinea = el("select");
    selectAerolinea.appendChild(el("option", { value: "" }, "(sin aerolínea)"));
    for (const a of aerolineas) selectAerolinea.appendChild(el("option", { value: a.id }, a.nombre));

    const contenido = el("div", {}, [
      el("div", { class: "form-row" }, [
        el("div", { class: "form-group" }, [el("label", {}, "Tipo"), selectTipo]),
      ]),
      el("div", { class: "form-row" }, [
        el("div", { class: "form-group" }, [el("label", {}, "Nombre"), inputs.nombre]),
        el("div", { class: "form-group" }, [el("label", {}, "DNI"), inputs.dni]),
        el("div", { class: "form-group" }, [el("label", {}, "Fecha nacimiento"), inputs.fecha]),
      ]),
      camposEsp,
      el("div", { class: "form-row" }, [
        el("div", { class: "form-group" }, [el("label", {}, "Aerolínea"), selectAerolinea]),
      ]),
    ]);

    const accion = await Modal.prompt({
      titulo: "Crear nueva persona",
      contenido,
      botones: [
        { texto: "Cancelar", valor: null, clase: "btn-ghost" },
        { texto: "Crear", valor: "ok", clase: "btn-primary" },
      ],
    });
    if (accion !== "ok") return;

    try {
      const t = selectTipo.value;
      const base = {
        nombre: inputs.nombre.value.trim(),
        dni: inputs.dni.value.trim(),
        fechaNacimiento: inputs.fecha.value,
      };
      const aerolineaId = selectAerolinea.value ? parseInt(selectAerolinea.value) : undefined;

      if (t === "pasajero") {
        await this.api.crearPasajero({
          ...base,
          numeroTicket: camposEsp._inputs.numeroTicket.value.trim(),
          clase: camposEsp._inputs.clase.value,
        });
      } else {
        const empleadoBase = {
          ...base,
          legajo: camposEsp._inputs.legajo.value.trim(),
          fechaIngreso: camposEsp._inputs.fechaIngreso.value,
          salario: parseFloat(camposEsp._inputs.salario.value),
          aerolineaId,
        };
        if (t === "piloto") {
          await this.api.crearPiloto({
            ...empleadoBase,
            licencia: camposEsp._inputs.licencia.value.trim(),
            horasVuelo: parseFloat(camposEsp._inputs.horasVuelo.value),
          });
        } else if (t === "mecanico") {
          await this.api.crearMecanico({
            ...empleadoBase,
            especialidad: camposEsp._inputs.especialidad.value.trim(),
          });
        } else if (t === "jefe") {
          await this.api.crearJefe({
            ...empleadoBase,
            departamento: camposEsp._inputs.departamento.value.trim(),
          });
        }
      }
      this.toast.show("Persona creada", "success");
      this.load();
    } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
  }

  async mostrarSubordinados(jefe) {
    try {
      const subs = await this.api.obtenerSubordinados(jefe.id);
      const contenido = el("div");
      if (subs.length === 0) {
        contenido.appendChild(el("p", { class: "muted" }, "Sin subordinados asignados."));
      } else {
        const ul = el("ul", { style: "list-style:none;padding:0;" });
        for (const s of subs) {
          ul.appendChild(el("li", { style: "padding:.4rem 0;border-bottom:1px solid var(--border);" }, [
            el("span", { class: `badge badge-${s.tipo}` }, s.tipo),
            ` ${s.nombre} — ${s.cargo}`,
          ]));
        }
        contenido.appendChild(ul);
      }
      Modal.prompt({
        titulo: `Subordinados de ${jefe.nombre} (${jefe.departamento})`,
        contenido,
        botones: [{ texto: "Cerrar", clase: "btn-primary", valor: true }],
      });
    } catch (e) {
      this.toast.show(`Error: ${e.message}`, "error");
    }
  }
}

// =========================================================================
// VuelosView — vuelos con estados + embarque + cambio de estado + CRUD
// =========================================================================
class VuelosView {
  constructor(api, toast) {
    this.api = api;
    this.toast = toast;
    this.root = $("#panel-vuelos");
    this.estadoFiltro = null;   // null = todos
  }

  async load() {
    this.root.innerHTML = "";
    this.root.appendChild(el("div", { class: "panel-header" }, [
      el("h2", {}, "Vuelos"),
      el("div", { class: "controls" }, [
        el("button", {
          class: "btn btn-success btn-sm",
          onclick: () => this.crearVueloDialog(),
        }, "+ Crear vuelo"),
        el("button", { class: "btn btn-ghost btn-sm", onclick: () => this.load() }, "↻ Refrescar"),
      ]),
    ]));

    // Filtros por estado
    const filtros = el("div", { class: "filter-group", style: "margin-bottom: 1rem;" });
    const estados = [
      { v: null,         t: "Todos",       c: null },
      { v: "programado", t: "Programados", c: "programado" },
      { v: "embarcando", t: "Embarcando",  c: "embarcando" },
      { v: "en_vuelo",   t: "En vuelo",    c: "en_vuelo" },
      { v: "aterrizado", t: "Aterrizados", c: "aterrizado" },
      { v: "cancelado",  t: "Cancelados",  c: "cancelado" },
    ];
    for (const e of estados) {
      filtros.appendChild(el("button", {
        class: "filter-pill" + (this.estadoFiltro === e.v ? " active" : ""),
        onclick: () => { this.estadoFiltro = e.v; this.load(); },
      }, e.t));
    }
    this.root.appendChild(filtros);

    try {
      let vuelos = await this.api.listarVuelos();
      if (this.estadoFiltro) vuelos = vuelos.filter(v => v.estado === this.estadoFiltro);
      if (vuelos.length === 0) {
        this.root.appendChild(el("p", { class: "empty" }, "Sin vuelos en este estado."));
        return;
      }
      for (const v of vuelos) this.root.appendChild(this.renderVuelo(v));
    } catch (e) {
      this.toast.show(`Error: ${e.message}`, "error");
    }
  }

  renderVuelo(v) {
    const card = el("div", { class: "card" });
    card.appendChild(el("div", { class: "card-header" }, [
      el("div", {}, [
        el("div", { class: "card-title" }, [
          `Vuelo ${v.numero}: ${v.origen} → ${v.destino} `,
          el("span", { class: `badge badge-${v.estado}` }, v.estado.replace("_", " ")),
        ]),
        el("div", { class: "card-meta" }, `Salida ${v.fechaSalida}`),
      ]),
      el("div", {}, [
        el("span", { class: `badge badge-${v.aeronave.tipo}` }, v.aeronave.matricula),
      ]),
    ]));

    card.appendChild(el("div", { class: "card-stats" }, [
      el("div", { class: "stat" }, [
        el("span", { class: "stat-value" }, String(v.cantidadPasajeros)),
        el("span", { class: "stat-label" }, "Pasajeros"),
      ]),
      el("div", { class: "stat" }, [
        el("span", { class: "stat-value" }, v.aeronave.modelo),
        el("span", { class: "stat-label" }, "Aeronave"),
      ]),
      el("div", { class: "stat" }, [
        el("span", { class: "stat-value" }, v.piloto.nombre),
        el("span", { class: "stat-label" }, "Comandante"),
      ]),
    ]));

    if (v.pasajeros.length > 0) {
      const lista = el("table", { style: "margin-top: 1rem;" });
      lista.appendChild(el("thead", { html: `<tr><th>Nombre</th><th>DNI</th><th>Ticket</th><th>Clase</th><th></th></tr>` }));
      const tb = el("tbody");
      for (const p of v.pasajeros) {
        const tr = el("tr");
        tr.appendChild(el("td", {}, p.nombre));
        tr.appendChild(el("td", {}, p.dni));
        tr.appendChild(el("td", {}, el("span", { class: "tag" }, p.numeroTicket)));
        tr.appendChild(el("td", {}, p.clase));
        tr.appendChild(el("td", {}, el("button", {
          class: "btn btn-danger btn-sm",
          onclick: async () => {
            try {
              await this.api.desembarcar(v.numero, p.id);
              this.toast.show(`${p.nombre} desembarcado`, "success");
              this.load();
            } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
          },
        }, "✕")));
        tb.appendChild(tr);
      }
      lista.appendChild(tb);
      card.appendChild(lista);
    }

    // Acciones por vuelo
    const acciones = el("div", { class: "card-actions" });

    if (v.estado !== "aterrizado" && v.estado !== "cancelado") {
      acciones.appendChild(el("button", {
        class: "btn btn-success btn-sm",
        onclick: () => this.embarcarPasajeroDialog(v),
      }, "+ Embarcar pasajero"));
    }

    // Botones de transición de estado
    for (const t of v.transicionesPermitidas) {
      acciones.appendChild(el("button", {
        class: "btn btn-warning btn-sm",
        onclick: () => this.cambiarEstado(v.numero, t),
      }, `→ ${t.replace("_", " ")}`));
    }

    acciones.appendChild(el("button", {
      class: "btn btn-danger btn-sm",
      onclick: () => this.eliminarVuelo(v),
    }, "🗑 Eliminar"));

    card.appendChild(acciones);
    return card;
  }

  async cambiarEstado(numero, nuevoEstado) {
    try {
      await this.api.cambiarEstadoVuelo(numero, nuevoEstado);
      this.toast.show(`Vuelo ${numero} → ${nuevoEstado}`, "success");
      this.load();
    } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
  }

  async eliminarVuelo(v) {
    const ok = await confirmar(`¿Eliminar el vuelo ${v.numero} (${v.origen}→${v.destino})?`);
    if (!ok) return;
    try {
      await this.api.eliminarVuelo(v.numero);
      this.toast.show(`Vuelo ${v.numero} eliminado`, "success");
      this.load();
    } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
  }

  async embarcarPasajeroDialog(vuelo) {
    try {
      const pasajeros = await this.api.listarPersonas("pasajero");
      const embarcadosIds = new Set(vuelo.pasajeros.map(p => p.id));
      const disponibles = pasajeros.filter(p => !embarcadosIds.has(p.id));

      if (disponibles.length === 0) {
        this.toast.show("No hay pasajeros disponibles para embarcar", "info");
        return;
      }

      const select = el("select");
      for (const p of disponibles) {
        select.appendChild(el("option", { value: p.id },
          `${p.nombre} — ${p.numeroTicket} (${p.clase})`));
      }
      const inputAsiento = el("input", { type: "text", placeholder: "Ej: 12A (opcional)" });

      const contenido = el("div", {}, [
        el("div", { class: "form-row" }, [
          el("div", { class: "form-group" }, [el("label", {}, "Pasajero"), select]),
        ]),
        el("div", { class: "form-row" }, [
          el("div", { class: "form-group" }, [el("label", {}, "Asiento"), inputAsiento]),
        ]),
      ]);

      const accion = await Modal.prompt({
        titulo: `Embarcar pasajero al vuelo ${vuelo.numero}`,
        contenido,
        botones: [
          { texto: "Cancelar", valor: null, clase: "btn-ghost" },
          { texto: "Embarcar", valor: "ok", clase: "btn-success" },
        ],
      });
      if (accion !== "ok") return;

      await this.api.embarcar(vuelo.numero, parseInt(select.value), inputAsiento.value || null);
      this.toast.show("Pasajero embarcado", "success");
      this.load();
    } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
  }

  async crearVueloDialog() {
    try {
      const [aeronaves, pilotos] = await Promise.all([
        this.api.listarAeronaves(),
        this.api.listarPersonas("piloto"),
      ]);
      if (aeronaves.length === 0 || pilotos.length === 0) {
        this.toast.show("Necesitás aeronaves y pilotos cargados", "error");
        return;
      }

      const inputs = {
        numero:   el("input", { type: "text", placeholder: "Ej: OOP-999" }),
        origen:   el("input", { type: "text", placeholder: "Ej: EZE", maxlength: "5" }),
        destino:  el("input", { type: "text", placeholder: "Ej: MAD", maxlength: "5" }),
        fecha:    el("input", { type: "date" }),
      };
      const selectAvion = el("select");
      for (const a of aeronaves) {
        selectAvion.appendChild(el("option", { value: a.matricula }, `${a.matricula} — ${a.modelo}`));
      }
      const selectPiloto = el("select");
      for (const p of pilotos) {
        selectPiloto.appendChild(el("option", { value: p.id }, `${p.nombre} (${p.licencia})`));
      }

      const contenido = el("div", {}, [
        el("div", { class: "form-row" }, [
          el("div", { class: "form-group" }, [el("label", {}, "Número"), inputs.numero]),
          el("div", { class: "form-group" }, [el("label", {}, "Fecha de salida"), inputs.fecha]),
        ]),
        el("div", { class: "form-row" }, [
          el("div", { class: "form-group" }, [el("label", {}, "Origen (IATA)"), inputs.origen]),
          el("div", { class: "form-group" }, [el("label", {}, "Destino (IATA)"), inputs.destino]),
        ]),
        el("div", { class: "form-row" }, [
          el("div", { class: "form-group" }, [el("label", {}, "Aeronave"), selectAvion]),
          el("div", { class: "form-group" }, [el("label", {}, "Piloto"), selectPiloto]),
        ]),
      ]);

      const accion = await Modal.prompt({
        titulo: "Crear nuevo vuelo",
        contenido,
        botones: [
          { texto: "Cancelar", valor: null, clase: "btn-ghost" },
          { texto: "Crear", valor: "ok", clase: "btn-primary" },
        ],
      });
      if (accion !== "ok") return;

      await this.api.crearVuelo({
        numero:           inputs.numero.value.trim(),
        origen:           inputs.origen.value.trim().toUpperCase(),
        destino:          inputs.destino.value.trim().toUpperCase(),
        fechaSalida:      inputs.fecha.value,
        aeronaveMatricula: selectAvion.value,
        pilotoId:         parseInt(selectPiloto.value),
      });
      this.toast.show("Vuelo creado", "success");
      this.load();
    } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
  }
}

// =========================================================================
// DiagnosticoView — barras de piezas por tipo + reporte completo
// =========================================================================
class DiagnosticoView {
  constructor(api, toast) {
    this.api = api;
    this.toast = toast;
    this.root = $("#panel-diagnostico");
    this.matriculaSeleccionada = null;
  }

  async load() {
    this.root.innerHTML = "";
    this.root.appendChild(el("div", { class: "panel-header" }, [
      el("h2", {}, "Diagnóstico"),
      el("p", { class: "muted" }, "Genera un reporte completo de todas las piezas usando la clase anidada Aeronave.Diagnostico"),
    ]));

    try {
      const aviones = await this.api.listarAeronaves();
      if (aviones.length === 0) {
        this.root.appendChild(el("p", { class: "empty" }, "Sin aeronaves."));
        return;
      }

      const select = el("select");
      for (const a of aviones) {
        select.appendChild(el("option", { value: a.matricula }, `${a.matricula} — ${a.modelo}`));
      }
      if (this.matriculaSeleccionada && aviones.some(a => a.matricula === this.matriculaSeleccionada)) {
        select.value = this.matriculaSeleccionada;
      } else {
        this.matriculaSeleccionada = aviones[0].matricula;
        select.value = this.matriculaSeleccionada;
      }

      const reportContainer = el("div");

      const formRow = el("div", { class: "form-row" }, [
        el("div", { class: "form-group" }, [el("label", {}, "Aeronave"), select]),
        el("div", {}, [
          el("button", {
            class: "btn btn-primary",
            onclick: async () => {
              this.matriculaSeleccionada = select.value;
              await this.renderReporte(reportContainer, select.value);
            },
          }, "Generar diagnóstico"),
        ]),
      ]);
      this.root.appendChild(formRow);
      this.root.appendChild(reportContainer);

      // auto-cargar
      await this.renderReporte(reportContainer, select.value);
    } catch (e) {
      this.toast.show(`Error: ${e.message}`, "error");
    }
  }

  async renderReporte(container, matricula) {
    container.innerHTML = "";
    try {
      const d = await this.api.obtenerDiagnostico(matricula);

      const card = el("div", { class: "card" });
      card.appendChild(el("div", { class: "card-header" }, [
        el("div", {}, [
          el("div", { class: "card-title" }, [
            d.matricula, " ",
            el("span", { class: `badge badge-${d.tipo}` }, d.tipo),
          ]),
          el("div", { class: "card-meta" }, d.modelo),
        ]),
      ]));

      card.appendChild(el("div", { class: "card-stats" }, [
        el("div", { class: "stat" }, [
          el("span", { class: "stat-value" }, String(d.totalPiezas)),
          el("span", { class: "stat-label" }, "Piezas totales"),
        ]),
        el("div", { class: "stat" }, [
          el("span", { class: "stat-value" }, `${d.pesoTotalKg} kg`),
          el("span", { class: "stat-label" }, "Peso"),
        ]),
      ]));

      // Barras por tipo de pieza
      const grid = el("div", { class: "diag-grid" });
      grid.appendChild(this.renderBarras(d.piezasPorTipo, d.totalPiezas));
      grid.appendChild(el("pre", { class: "report-pre" }, d.reporteTextual));
      card.appendChild(grid);

      container.appendChild(card);
    } catch (e) {
      container.appendChild(el("p", { class: "empty" }, `Error: ${e.message}`));
    }
  }

  renderBarras(piezasPorTipo, total) {
    const cont = el("div");
    cont.appendChild(el("h3", {}, "Distribución de piezas"));
    const bars = el("div", { class: "bars" });
    const tipos = ["tornillo", "tuerca", "arandela", "resorte"];
    for (const t of tipos) {
      const lista = piezasPorTipo[t] || [];
      const count = lista.length;
      const pct = total > 0 ? (count / total) * 100 : 0;
      const row = el("div", { class: "bar-row" }, [
        el("span", {}, [el("span", { class: `badge badge-${t}` }, t)]),
        el("div", { class: "bar-track" }, [
          el("div", {
            class: "bar-fill",
            style: `width: ${pct}%; background: var(--c-${t});`,
          }),
        ]),
        el("span", { class: "bar-count" }, `${count} (${pct.toFixed(0)}%)`),
      ]);
      bars.appendChild(row);
    }
    cont.appendChild(bars);
    return cont;
  }
}

// =========================================================================
// OperacionesView — Torre de Control + Servicio Mantenimiento (DEPENDENCIA)
// =========================================================================
class OperacionesView {
  constructor(api, toast) {
    this.api = api;
    this.toast = toast;
    this.root = $("#panel-operaciones");
  }

  async load() {
    this.root.innerHTML = "";
    this.root.appendChild(el("div", { class: "panel-header" }, [
      el("h2", {}, "Operaciones (servicios externos)"),
      el("p", { class: "muted" }, "Servicios que dependen de aeronaves/vuelos por método (relación de DEPENDENCIA)"),
    ]));

    try {
      const [vuelos, aviones, mecanicos] = await Promise.all([
        this.api.listarVuelos(),
        this.api.listarAeronaves(),
        this.api.listarPersonas("mecanico"),
      ]);

      this.root.appendChild(this.renderTorre(vuelos));
      this.root.appendChild(this.renderTaller(aviones, mecanicos));
    } catch (e) {
      this.toast.show(`Error: ${e.message}`, "error");
    }
  }

  renderTorre(vuelos) {
    const card = el("div", { class: "card" });
    card.appendChild(el("div", { class: "card-title" }, "🗼 Torre de Control"));
    card.appendChild(el("p", { class: "muted" }, "TorreDeControl recibe el Vuelo como parámetro de método (no lo guarda)."));

    const selectVuelo = el("select");
    for (const v of vuelos) {
      selectVuelo.appendChild(el("option", { value: v.numero },
        `${v.numero} — ${v.origen} → ${v.destino}`));
    }
    const inputIATA = el("input", { type: "text", value: "EZE", maxlength: "4" });
    const output = el("div");

    const botonera = el("div", { class: "card-actions" }, [
      el("button", {
        class: "btn btn-primary btn-sm",
        onclick: async () => {
          try {
            const r = await this.api.autorizarDespegue(selectVuelo.value, inputIATA.value);
            this.mostrarRespuesta(output, "✈ Despegue", r.autorizacion);
          } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
        },
      }, "Autorizar despegue"),
      el("button", {
        class: "btn btn-success btn-sm",
        onclick: async () => {
          try {
            const r = await this.api.autorizarAterrizaje(selectVuelo.value, inputIATA.value);
            this.mostrarRespuesta(output, "🛬 Aterrizaje", r.autorizacion);
          } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
        },
      }, "Autorizar aterrizaje"),
    ]);

    card.appendChild(el("div", { class: "form-row" }, [
      el("div", { class: "form-group" }, [el("label", {}, "Vuelo"), selectVuelo]),
      el("div", { class: "form-group" }, [el("label", {}, "Código IATA torre"), inputIATA]),
    ]));
    card.appendChild(botonera);
    card.appendChild(output);
    return card;
  }

  renderTaller(aviones, mecanicos) {
    const card = el("div", { class: "card" });
    card.appendChild(el("div", { class: "card-title" }, "🔧 Taller de Mantenimiento"));
    card.appendChild(el("p", { class: "muted" }, "ServicioMantenimiento.inspeccionar(aeronave, mecánico) — usa Aeronave.Diagnostico internamente."));

    const selectAvion = el("select");
    for (const a of aviones) {
      selectAvion.appendChild(el("option", { value: a.matricula }, `${a.matricula} — ${a.modelo}`));
    }

    const selectMec = el("select");
    for (const m of mecanicos) {
      selectMec.appendChild(el("option", { value: m.id }, `${m.nombre} (${m.especialidad})`));
    }

    const inputTaller = el("input", { type: "text", value: "Taller Central EZE" });
    const output = el("div");

    card.appendChild(el("div", { class: "form-row" }, [
      el("div", { class: "form-group" }, [el("label", {}, "Aeronave"), selectAvion]),
      el("div", { class: "form-group" }, [el("label", {}, "Mecánico firmante"), selectMec]),
      el("div", { class: "form-group" }, [el("label", {}, "Taller"), inputTaller]),
    ]));

    card.appendChild(el("div", { class: "card-actions" }, [
      el("button", {
        class: "btn btn-primary btn-sm",
        onclick: async () => {
          try {
            const r = await this.api.inspeccionar(
              selectAvion.value, inputTaller.value, parseInt(selectMec.value));
            output.innerHTML = "";
            output.appendChild(el("div", { class: "card-stats", style: "margin-top:1rem;" }, [
              el("div", { class: "stat" }, [
                el("span", { class: "stat-value" }, r.aeronaveMatricula),
                el("span", { class: "stat-label" }, "Aeronave inspeccionada"),
              ]),
              el("div", { class: "stat" }, [
                el("span", { class: "stat-value" }, r.mecanicoFirmante),
                el("span", { class: "stat-label" }, "Firmante"),
              ]),
              el("div", { class: "stat" }, [
                el("span", { class: "stat-value" }, String(r.tornillosARevisar)),
                el("span", { class: "stat-label" }, "Tornillos a revisar"),
              ]),
            ]));
            output.appendChild(el("pre", { class: "report-pre" }, r.reporte));
          } catch (e) { this.toast.show(`Error: ${e.message}`, "error"); }
        },
      }, "Ejecutar inspección"),
    ]));

    card.appendChild(output);
    return card;
  }

  mostrarRespuesta(container, titulo, mensaje) {
    container.innerHTML = "";
    container.appendChild(el("div", { class: "card-stats", style: "margin-top:1rem;" }, [
      el("div", { class: "stat" }, [
        el("span", { class: "stat-value" }, titulo),
        el("span", { class: "stat-label" }, "Respuesta"),
      ]),
    ]));
    container.appendChild(el("pre", { class: "report-pre" }, mensaje));
  }
}

// =========================================================================
// OopView — descripción del modelo OOP (lectura para el profe)
// =========================================================================
class OopView {
  constructor() { this.root = $("#panel-oop"); this.cargado = false; }

  load() {
    if (this.cargado) return;
    this.cargado = true;
    this.root.innerHTML = "";
    this.root.appendChild(el("div", { class: "panel-header" }, [
      el("h2", {}, "Modelo OOP del sistema"),
      el("p", { class: "muted" }, "Las cinco relaciones implementadas en este proyecto"),
    ]));

    const card = el("div", { class: "card" });
    const tabla = el("table", { class: "relation-table" });
    tabla.appendChild(el("thead", { html: `
      <tr><th>Relación</th><th>Símbolo UML</th><th>Ejemplo en este sistema</th></tr>
    `}));
    const tbody = el("tbody");
    const filas = [
      ["Herencia (is-a)", "◁——", "Persona → Empleado → {Piloto, Mecánico, Jefe} · Pieza → {Tornillo, Tuerca, Arandela, Resorte}"],
      ["Composición (has-a fuerte)", "◆——", "Aeronave ◆ Subsistema ◆ Componente ◆ Pieza (4 niveles, ON DELETE CASCADE)"],
      ["Agregación (has-a débil)", "◇——", "Aerolínea ◇ Aeronave[] · Vuelo ◇ Pasajero[] (los miembros sobreviven al agregador)"],
      ["Asociación", "——", "Piloto ↔ Aeronave (asignación) · Jefe ↔ Subordinados[] · Vuelo ↔ Aeronave/Piloto"],
      ["Dependencia", "··>", "TorreDeControl.autorizar(vuelo) · ServicioMantenimiento.inspeccionar(aeronave)"],
      ["Clase anidada", "(static)", "Aeronave.Diagnostico — opera sobre la aeronave que la creó"],
    ];
    for (const [rel, sym, ej] of filas) {
      tbody.appendChild(el("tr", {}, [
        el("td", { class: "bold" }, rel),
        el("td", { class: "symbol" }, sym),
        el("td", {}, ej),
      ]));
    }
    tabla.appendChild(tbody);
    card.appendChild(tabla);
    this.root.appendChild(card);

    const card2 = el("div", { class: "card" });
    card2.appendChild(el("div", { class: "card-title" }, "Comandos del proyecto"));
    card2.appendChild(el("pre", { class: "report-pre" }, [
      "npm run demo     # demo del modelo de dominio puro (sin DB)\n",
      "npm run seed     # poblar SQLite con datos de demostración\n",
      "npm run verify   # round-trip DB → dominio (Diagnóstico anidado sobre datos de DB)\n",
      "npm run dev      # backend + frontend\n",
    ].join("")));
    this.root.appendChild(card2);
  }
}

// =========================================================================
// App — orquestador
// =========================================================================
class App {
  constructor() {
    const apiBase = window.location.port === "5173"
      ? "http://localhost:3000/api"
      : window.location.origin + "/api";

    this.api = new ApiService(apiBase);
    this.toast = new Toast("toast-container");

    this.flota = new FlotaView(this.api, this.toast);
    this.flota.app = this;   // necesario para "ir a diagnóstico"
    this.empleados = new EmpleadosView(this.api, this.toast);
    this.vuelos = new VuelosView(this.api, this.toast);
    this.diagnostico = new DiagnosticoView(this.api, this.toast);
    this.operaciones = new OperacionesView(this.api, this.toast);
    this.oop = new OopView();

    this.tabs = new TabManager("tabs", name => this.onTabChange(name));
  }

  async start() {
    await this.cargarHeader();
    this.flota.load();   // tab por defecto
  }

  async cargarHeader() {
    try {
      const aerolineas = await this.api.listarAerolineas();
      if (aerolineas.length > 0) {
        const a = aerolineas[0];
        $("#header-info").innerHTML = `
          <div class="bold">${a.nombre}</div>
          <div>${a.cantidadAeronaves} aeronaves · ${a.cantidadEmpleados} empleados</div>
        `;
      }
    } catch (e) {
      $("#header-info").textContent = "API no responde — ¿corriste npm run dev?";
    }
  }

  onTabChange(name) {
    if (name === "flota")        this.flota.load();
    if (name === "empleados")    this.empleados.load();
    if (name === "vuelos")       this.vuelos.load();
    if (name === "diagnostico")  this.diagnostico.load();
    if (name === "operaciones")  this.operaciones.load();
    if (name === "oop")          this.oop.load();
  }

  irADiagnostico(matricula) {
    this.diagnostico.matriculaSeleccionada = matricula;
    this.tabs.activate("diagnostico");
  }
}

// =========================================================================
// Entrada
// =========================================================================
const app = new App();
app.start();
