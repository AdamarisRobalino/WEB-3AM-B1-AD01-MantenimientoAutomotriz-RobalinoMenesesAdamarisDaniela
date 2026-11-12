# AutoService XYZ — Mantenimiento automotriz

Proyecto de frontend para **Programación Web 1, Unidad 1, Práctica 1**. Incluye página institucional, registro e inicio de sesión, solicitudes de mantenimiento para clientes y un panel administrativo.

## Ejecutar

Abre `index.html` en el navegador o ejecuta el proyecto con Live Server desde Visual Studio Code. Los datos se guardan en `localStorage`, por lo que debes usar el mismo navegador y origen para registro, solicitudes y administración.

## Cuentas para demostración

- Administrador: `admin` / `Admin123`
- Cliente: `cliente` / `Cliente123`

El inicio de sesión crea la cuenta de cliente de ejemplo si aún no existe. Para probar la lista con al menos tres cuentas, registra otro cliente desde **Registrarme como cliente**.

## Funciones

- Página institucional con inicio, acerca de, servicios y contacto.
- Registro e inicio de sesión por roles.
- Solicitud con información del cliente y vehículo, servicio, fecha, prioridad y autorización de contacto.
- Validación de campos, teléfono, correo, placa, año y fecha.
- Cliente: registra solicitudes y consulta solo las propias.
- Administrador: crea solicitudes para clientes, consulta, edita, cambia el estado, elimina solicitudes y habilita o deshabilita cuentas.
- Persistencia de clientes y solicitudes en arrays de objetos serializados en `localStorage`.

## Pruebas manuales sugeridas

1. Inicia sesión como `cliente` y confirma que los campos personales aparecen desde el perfil.
2. Intenta iniciar sesión con credenciales incorrectas y con una cuenta deshabilitada.
3. Prueba la solicitud con placa inválida y fecha pasada; no debe guardarse.
4. Registra una solicitud válida y confirma que aparece en **Mis solicitudes** con su código y estado.
5. Inicia sesión como administrador y confirma que un cliente no puede abrir `admin.html`.
6. Crea una solicitud para un cliente, edítala, cambia su estado y elimínala.
7. Deshabilita una cuenta de cliente y verifica que no pueda volver a iniciar sesión; luego habilítala.

## Estructura

Los archivos se mantienen en la raíz del proyecto como estructura equivalente a la organización propuesta en la práctica: `index.html`, `styles.css`, `script.js`, `login.html`, `registro.html`, `formulario.html` y `admin.html`.

Consulta [FUENTES_Y_USO_IA.md](FUENTES_Y_USO_IA.md) para el registro de asistencia de IA y recursos externos.

> Esta versión es una demostración de frontend. `localStorage` no es una base de datos compartida ni protege contraseñas; no debe utilizarse para cuentas o datos reales.
