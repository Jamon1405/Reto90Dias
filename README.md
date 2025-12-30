# TITAN OMEGA (ERP Biométrico)

TITAN OMEGA es un sistema ejecutivo de control diario P&L (Calorías IN vs OUT), gobernanza de fechas estricta y auditoría de datos con puntuación Titan Score.

## Requisitos
- Node.js 18+
- Base de datos Postgres (recomendado: Neon)

## Setup
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Configura variables de entorno:
   ```bash
   cp .env.example .env
   ```
3. Ejecuta migraciones:
   ```bash
   npx prisma migrate dev
   ```
4. Corre el servidor:
   ```bash
   npm run dev
   ```

## Variables de entorno
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB"
NEXT_PUBLIC_APP_NAME="TITAN OMEGA"
```

## Deploy en Vercel + Neon
1. Crea una base de datos en Neon y copia `DATABASE_URL`.
2. En Vercel, configura `DATABASE_URL` (y opcional `NEXT_PUBLIC_APP_NAME`).
3. En el proyecto local, ejecuta:
   ```bash
   npx prisma migrate deploy
   ```
4. Despliega con Vercel.

## Migraciones
- Desarrollo: `npx prisma migrate dev`
- Producción: `npx prisma migrate deploy`

## Notas de gobernanza
- Zona horaria fija: `America/Mexico_City`.
- La fecha es la llave primaria con formato `YYYY-MM-DD`.
- Guardado modular: BIO/GYM/FUEL sólo actualizan sus propios campos.
