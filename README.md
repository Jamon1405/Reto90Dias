# TITAN OMEGA v2.0

TITAN OMEGA es un sistema diario de control de corte/recomp basado en Next.js + Prisma, con zona horaria fija `America/Mexico_City`.

## Stack
- Next.js 14 (App Router)
- React + Tailwind + shadcn/ui
- Prisma + SQLite (dev) con switch fácil a Postgres

## Requisitos
- Node.js 18+

## Configuración local
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Crea el archivo `.env`:
   ```bash
   echo "DATABASE_URL=\"file:./dev.db\"" > .env
   ```
3. Genera el cliente y aplica migraciones:
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```
4. Levanta la app:
   ```bash
   npm run dev
   ```

## Notas clave
- La fecha es la llave primaria (`dateISO`) con formato `YYYY-MM-DD`.
- Zona horaria fija: `America/Mexico_City`.
- No se permiten registros en fechas futuras.
