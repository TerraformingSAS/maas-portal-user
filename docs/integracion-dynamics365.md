# Documentación Técnica - Integración con Dynamics 365

## Estado actual

El portal funciona con datos locales simulados almacenados en `src/data/fixtures/`. No existe conexión real con Microsoft Dynamics 365 ni con Dataverse.

## Arquitectura de servicios

La capa de servicios está diseñada para permitir el reemplazo del origen de datos sin modificar las pantallas.

### Adaptador actual

El archivo `src/services/adapters/local-adapter.ts` contiene los adaptadores que leen los datos locales:

- `ClienteAdapter` — Autenticación y consulta de clientes
- `CompraAdapter` — Consulta de compras y resumen financiero
- `PagoAdapter` — Consulta de pagos, cuotas y estado de cuenta
- `ProyectoAdapter` — Consulta de proyectos
- `LoteAdapter` — Consulta de lotes
- `NotificacionAdapter` — Consulta de notificaciones

### Contratos de servicio

Para conectar con Dynamics 365, se debe crear un nuevo adaptador que implemente los mismos métodos. Ejemplo conceptual:

```typescript
// src/services/adapters/dynamics-adapter.ts

export const ClienteAdapter = {
  async authenticate(email: string, password: string) {
    // Consultar contacto en Dataverse por email
    // Validar credenciales contra Azure AD B2C
  },

  async getById(id: string) {
    // GET /api/data/v9.2/contacts(contactid={id})
  },
};

export const CompraAdapter = {
  async getByCliente(clienteId: string) {
    // GET /api/data/v9.2/salesorders?$filter=_customerid_value eq {clienteId}
  },

  async getById(id: string, clienteId: string) {
    // GET /api/data/v9.2/salesorders({id}) con verificación de pertenencia
  },

  async getResumenFinanciero(clienteId: string) {
    // Agregar consultas a pagos y cuotas del cliente
  },
};
```

### Pasos para la integración

1. **Autenticación**: Reemplazar la autenticación local por Azure AD B2C o Entra ID. Modificar `src/lib/auth.ts` para emitir tokens JWT verificados contra el proveedor de identidad de Microsoft.

2. **Adaptador de datos**: Crear `src/services/adapters/dynamics-adapter.ts` implementando los mismos métodos que `local-adapter.ts`. Cada método debe consultar las tablas correspondientes en Dataverse usando la Web API de Dynamics 365.

3. **Configuración**: Agregar variables de entorno para la URL de Dataverse, el client ID y el client secret de la aplicación registrada en Azure AD.

4. **Route Handlers**: Los Route Handlers en `src/app/api/` no necesitan cambios. Solo deben importar el nuevo adaptador en lugar del local.

5. **Middleware**: El middleware de autenticación (`src/middleware.ts`) debe validar tokens emitidos por el proveedor real en lugar de los tokens locales.

### Entidades esperadas en Dynamics 365

Las siguientes entidades de Dataverse son las más probables para la integración:

| Entidad local | Tabla Dataverse (referencia) | Campos principales |
|---|---|---|
| Cliente | contacts | contactid, emailaddress1, firstname, lastname |
| Proyecto | Entidad personalizada | ID, nombre, descripción, ubicación |
| Lote | Entidad personalizada | ID, identificador, área, valor, proyecto |
| Compra/Pedido | salesorders | salesorderid, _customerid_value, totalamount, statuscode |
| Pago | Entidad personalizada o salesorderdetail | ID, tipo, valor, estado, fechas |
| Cuota | Entidad personalizada | ID, número, valor, estado, vencimiento |

### Consideraciones

- La autenticación actual con JWT local y cookies HttpOnly es solo para desarrollo. No es segura para producción.
- Los datos locales son ficticios y no representan información real de Terra.
- La integración con Dynamics 365 requiere acceso a la instancia del CRM y permisos de aplicación en Azure AD.
- Se recomienda usar Server-Side Rendering para las consultas a Dynamics 365 y no exponer tokens de acceso al cliente.
