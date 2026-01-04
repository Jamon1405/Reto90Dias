# TITAN OMEGA v2.0

TITAN OMEGA es un sistema diario de control de corte/recomp basado en Next.js con persistencia local (IndexedDB) y zona horaria fija `America/Mexico_City`.

## Stack
- Next.js 14 (App Router)
- React + Tailwind + shadcn/ui
- Persistencia local con IndexedDB (Dexie)

## Requisitos
- Node.js 18+

## Configuración local
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Levanta la app:
   ```bash
   npm run dev
   ```

## Notas clave
- La fecha es la llave primaria (`dateISO`) con formato `YYYY-MM-DD`.
- Zona horaria fija: `America/Mexico_City`.
- No se permiten registros en fechas futuras.
- Backup/restore desde el panel “Backup local”.
