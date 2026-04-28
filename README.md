# OOP_Aerolinea

Sistema de gestión de aerolínea construido como práctica universitaria de **Programación Orientada a Objetos**. El objetivo es ejercitar el espectro completo de relaciones OOP en un dominio realista: una aerolínea que gestiona su flota y rastrea cada avión hasta el último tornillo.

## Relaciones OOP cubiertas

| Relación | Ejemplo |
|---|---|
| **Herencia** | `Persona → Empleado → {Piloto, Mecánico, Jefe}` / `Pieza → {Tornillo, Tuerca, Arandela, Resorte}` |
| **Composición** | `Aeronave ◆── Subsistema ◆── Componente ◆── Pieza` (5 niveles) |
| **Agregación** | `Aerolínea ◇── Avión[]` / `Vuelo ◇── Pasajero[]` |
| **Asociación** | `Piloto ── Aeronave` (asignación) |
| **Dependencia** | `ServicioMantenimiento ··> Aeronave` |
| **Clase anidada** | `Aeronave.Diagnostico` (clase estática anidada) |

## Stack

- **Backend**: Node.js + TypeScript + Express + better-sqlite3
- **Frontend**: HTML + vanilla JS
- **Patrones**: Singleton (DB), Repository, Composite (jerarquía de partes)

## Estructura

```
oop/
├── backend/
│   ├── domain/          # Modelo de dominio puro (Fase 1)
│   ├── models/          # Repositorios (Fase 2)
│   ├── controllers/     # API (Fase 3)
│   ├── routes/
│   ├── database.ts
│   ├── demo.ts          # Demo de consola
│   └── index.ts         # Servidor Express
├── frontend/
│   └── index.html       # UI con vista jerárquica
└── data/                # SQLite (gitignored)
```

## Comandos

```bash
npm install
npm run dev              # backend (3000) + frontend (5173) en paralelo
npm run demo             # ejecuta demo de consola del modelo de dominio
```
