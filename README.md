# Scopus Cert Frontend

Frontend en Next.js para generar y descargar certificados PDF consumiendo la Function App de `scopus-cert-generator`.

## Requisitos

- Node.js 20+
- Function App corriendo localmente en `http://localhost:7071` o desplegada en Azure

## Configuracion

1. Copia `.env.example` a `.env.local`.
2. Configura las variables:

```env
NEXT_PUBLIC_FUNCTION_API_URL=http://localhost:7071/api
NEXT_PUBLIC_FUNCTION_KEY=
```

Notas:
- `NEXT_PUBLIC_FUNCTION_API_URL` es la base del endpoint HTTP de la Function App.
- `NEXT_PUBLIC_FUNCTION_KEY` es opcional para local. En Azure, usar la key de la function cuando el nivel de auth sea `FUNCTION`.
- En Azure Static Web Apps, las variables `NEXT_PUBLIC_*` se inyectan en build. Si cambias `FUNCTION_KEY` en GitHub Secrets, debes volver a desplegar para que el frontend use el nuevo valor.

## Desarrollo

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```
