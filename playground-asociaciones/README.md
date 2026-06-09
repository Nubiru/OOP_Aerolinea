# Playground de Asociaciones OOP — Avión

Modelo **standalone** del aeroplano que sirvió de base conceptual para este proyecto.
Corresponde a la actividad del **14/04/2026**: tomar el código del aeroplano desde el
playground de TypeScript e implementarlo localmente, identificando las relaciones de
jerarquía e implementando **todas las formas de asociación**.

Mientras que el sistema completo (`backend/`) modela una aerolínea entera con API REST,
persistencia y Docker, este playground es un único archivo (`index.ts`) que demuestra de
forma aislada y didáctica las 5 relaciones entre clases.

## Ejecutar

```bash
npm install
npm start        # equivale a: npx ts-node index.ts
```

## Las 5 relaciones demostradas

| # | Relación | Definición | Ejemplo en el modelo |
|---|----------|------------|----------------------|
| 1 | **Herencia** (is-a) | Una clase especializa a otra | `Helice`/`Turbina` → `SistemaPropulsion`; `Aeroplano`/`AvionReactor` → `Aeronave` |
| 2 | **Composición** (has-a fuerte) | La parte no existe sin el todo; se crea y muere con él | `Aeronave` ◆ `TrenAterrizaje`, `Alas`, `Cubierta` |
| 3 | **Agregación** (has-a débil) | La parte existe independientemente del todo | `Aeronave` ◇ `Pasajero[]` (los pasajeros existen antes y después del vuelo) |
| 4 | **Asociación simple** (usa) | Dos objetos se relacionan pero viven por separado | `Piloto` ↔ `Aeronave` |
| 5 | **Dependencia** (usa temporalmente) | Un objeto recibe a otro como parámetro y lo suelta | `TorreDeControl` usa `Aeronave` |

## Diferencia Composición vs. Agregación en tiempo de ejecución

- **Composición:** al destruir la `Aeronave`, sus partes (`TrenAterrizaje`, `Alas`,
  `Cubierta`) dejan de existir — fueron instanciadas dentro/junto con ella.
- **Agregación:** al destruir la `Aeronave`, los `Pasajero` siguen existiendo, porque
  fueron creados fuera y solo se "agregaron" a la aeronave durante el vuelo.

Esta es la respuesta a la pregunta 5 de la consigna ("¿Cuál es la diferencia en tiempo
de ejecución de la asociación por Composición y la asociación por Agregación?"): la
composición ata el ciclo de vida de las partes al del todo; la agregación no.

## Archivos

- `index.ts` — modelo completo con las 5 relaciones + demostración por consola.
- `classes.md` — versión inicial simple del modelo (composición pura).
- `diagrama.mmd` / `diagrama.svg` / `diagrama.png` — diagrama UML de clases (Mermaid).
