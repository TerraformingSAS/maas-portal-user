# Terra - Portal de Clientes

Portal de Gestión Inmobiliaria para clientes de Terra. Permite consultar compras, estado de cuenta y proceso inmobiliario.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Compilación para producción

```bash
npm run build
npm start
```

## Pruebas

```bash
npx vitest run
```

## Cuentas disponibles

| Cliente | Correo | Contraseña | Perfil |
|---|---|---|---|
| Carolina Mejía Restrepo | carolina.mejia@correo.com | Terra2025* | Compra financiada con cuotas generadas, pago parcial |
| Andrés Suárez Ospina | andres.suarez@correo.com | Terra2025* | Compra de contado |
| María Isabel Cardona López | maria.cardona@correo.com | Terra2025* | Varias compras (financiada con cuotas, separada sin cuotas, en negociación) |
| Jorge Enrique Pérez Villamil | jorge.perez@correo.com | Terra2025* | Sin compras |

## Estructura del proyecto

```
src/
  app/
    (portal)/          # Páginas protegidas (inicio, mis-compras, mis-pagos)
    login/             # Pantalla de acceso
    api/               # Route handlers (auth, cliente, pedidos)
  components/
    layout/            # Header, Footer, PortalLayout
    ui/                # Componentes shadcn/ui
  data/
    fixtures/          # Datos locales simulados
  services/
    adapters/          # Adaptadores de datos (local-adapter)
    api/               # Servicio de API para el frontend
  types/               # Definiciones TypeScript
  lib/                 # Utilidades (format, auth)
  __tests__/           # Pruebas
```

## Arquitectura

El portal sigue una arquitectura en capas:

```
Componentes React → Servicio API → Route Handlers → Adaptador → Datos locales
```

Los componentes React NO importan directamente los datos locales. Consultan los Route Handlers de Next.js, que a su vez utilizan adaptadores para obtener la información. Esto permite reemplazar el adaptador local por uno conectado a Dynamics 365 sin modificar las pantallas.

## Tecnologías

- Next.js 16 (App Router)
- React
- TypeScript
- Tailwind CSS v4
- itc-frontend-base (componentes: ItcButton, ItcButtonCard, ItcTable, ItcInput, ItcForm, ItcBanner, ItcMenu, ItcTabs, ItcModal)
- shadcn/ui (base-ui) — componentes complementarios
- Lucide React
- jose (JWT para sesión)
- Vitest (pruebas)

## Componentes itc-frontend-base

El portal utiliza los componentes de `itc-frontend-base` como biblioteca principal de interfaz:

- **ItcButton** — Botones con variantes (primary, secondary, danger, etc.)
- **ItcButtonCard** — Tarjetas interactivas con título, subtítulo, badge, acciones
- **ItcTable** — Tablas con paginación, búsqueda y ordenamiento
- **ItcInput** — Campos de entrada con label, validación, íconos
- **ItcForm** — Formularios con layout y validación
- **ItcBanner** — Banners promocionales con imagen y overlay
- **ItcMenu** — Menús de navegación horizontal/vertical
- **ItcTabs** — Pestañas con múltiples variantes visuales
- **ItcModal** — Diálogos modales

Los estilos CSS de itc-frontend-base se cargan desde `src/styles/vendor/itc-frontend-base.css` e importan en `globals.css` para que el pipeline de PostCSS/Tailwind los procese correctamente.
