# Cuentas de prueba locales

La pantalla de acceso no muestra credenciales ni un selector de roles. Ingresa directamente con una de estas cuentas; se preparan automáticamente al iniciar sesión, sin sobrescribir cuentas existentes. Contraseña común: `Demo2026!`.

| Rol | Correo | Destino |
| --- | --- | --- |
| Cliente (Mi cuenta) | `cliente@demo.local` | `/mi-cuenta` |
| Administrador | `administrador@demo.local` | `/administrador` |
| Cajero | `caja@demo.local` | `/caja` |
| Mozo / salón | `mesera@demo.local` | `/mesera` |
| Cocina | `cocina@demo.local` | `/cocina` |
| Delivery | `delivery@demo.local` | `/delivery` |

Son cuentas ficticias de esta etapa frontend, guardadas en el navegador. No sirven como autenticación de producción. El registro público crea únicamente clientes. Los datos no se sincronizan entre dispositivos. Mi cuenta utiliza pedidos, direcciones y favoritos de la sesión; una cuenta nueva muestra estados vacíos.

## Vistas del prototipo

Se mantiene el estilo visual de la aplicación. El detalle de producto permite revisar fotos, guarniciones, observaciones y cantidad. El seguimiento distingue cada etapa y muestra notificaciones del pedido.

- `/checkout/entrega`: incluye consumo en local y selección visual de mesa.
- `/caja/ventas`: pedido de venta directa con catálogo, cantidades y método de pago.
- `/administrador`: ventas por hora y horas pico.
- `/administrador/reportes`: filtros por fechas, producto y modalidad, gráficos y detalle exportable.
- `/delivery`: selección de repartidor y filtros de entregas asignadas.

Consumo en local, venta directa, asignación y solicitud de cancelación son vistas previas: no registran ventas ni reservas, no realizan cobros y no cambian el estado de los pedidos. Las selecciones de personalización se conservan durante la navegación actual; se reinician al recargar. No se agregaron servicios de backend.
