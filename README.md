# TITAN OMEGA (ERP Biométrico)

TITAN OMEGA es un sistema ejecutivo de control diario P&L (Calorías IN vs OUT), gobernanza de fechas estricta y auditoría de datos con puntuación Titan Score.

## Requisitos
- Node.js 18+
- Navegador moderno con IndexedDB (Dexie)

## Setup
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Corre el servidor:
   ```bash
   npm run dev
   ```

## Persistencia local
- IndexedDB con Dexie (tabla `days` y `state`).
- Export/Import JSON desde la pestaña DATA para respaldo.

## Notas de gobernanza
- Zona horaria fija: `America/Mexico_City`.
- La fecha es la llave primaria con formato `YYYY-MM-DD`.
- Guardado modular: BIO/GYM/FUEL sólo actualizan sus propios campos.
