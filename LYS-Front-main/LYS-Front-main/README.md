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
