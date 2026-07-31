<!--
  ¿Qué? Historia de usuario que describe la gestión completa del ciclo de vida de usuarios y roles.
  ¿Para qué? Formalizar la necesidad del administrador de controlar quién accede al sistema y con qué permisos.
  ¿Impacto? Sin gestión de usuarios no hay control de acceso — es la base de la seguridad del sistema.
-->

# HU-AD-01 — Gestión de Usuarios y Roles

## Identificación

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **ID**           | HU-AD-01                       |
| **Título**       | Gestión de usuarios y roles    |
| **Módulo**       | Administración                 |

---

## Historia

**Como** administrador del sistema,
**quiero** crear, modificar, desactivar y eliminar cuentas de usuario asignando roles específicos (Administrador, Analista, Operador y Auditor),
**para** garantizar que cada persona acceda únicamente a las funciones y datos que le corresponden según su cargo, manteniendo la seguridad del sistema.

---

## Criterios de Aceptación

### CA-AD-01.1 — Creación de usuario con rol
- **Dado que** soy administrador autenticado en el sistema,
- **cuando** completo el formulario de creación con nombre completo, correo, contraseña y rol válido,
- **entonces** el usuario queda registrado en el sistema con el rol asignado y estado activo.

### CA-AD-01.2 — Rol inválido rechazado
- **Dado que** estoy creando un nuevo usuario,
- **cuando** ingreso un rol que no pertenece a la lista permitida (ADMINISTRADOR, ANALISTA, OPERADOR, AUDITOR),
- **entonces** el sistema debe rechazar la solicitud con un mensaje de error indicando los roles válidos.

### CA-AD-01.3 — Email duplicado
- **Dado que** estoy creando un nuevo usuario,
- **cuando** ingreso un correo electrónico que ya está registrado en el sistema,
- **entonces** debo ver un mensaje de error indicando que ya existe un usuario con ese email.

### CA-AD-01.4 — Modificación de datos de usuario
- **Dado que** soy administrador y selecciono un usuario existente,
- **cuando** modifico su nombre, rol o cualquier otro campo permitido y guardo los cambios,
- **entonces** los datos del usuario se actualizan correctamente en el sistema.

### CA-AD-01.5 — Desactivación de cuenta
- **Dado que** soy administrador y selecciono un usuario activo,
- **cuando** ejecuto la acción de desactivar la cuenta,
- **entonces** el usuario queda con estado inactivo y no puede iniciar sesión hasta ser reactivado.

### CA-AD-01.6 — Bloqueo de acceso a cuenta desactivada
- **Dado que** un usuario tiene su cuenta desactivada,
- **cuando** intenta iniciar sesión con sus credenciales,
- **entonces** el sistema debe retornar el mensaje: "Tu cuenta está desactivada. Contacta al administrador."

### CA-AD-01.7 — Listado de usuarios del sistema
- **Dado que** soy administrador autenticado,
- **cuando** accedo al módulo de gestión de usuarios,
- **entonces** debo ver la lista completa de usuarios del sistema con su nombre, correo, rol y estado.

### CA-AD-01.8 — Registro en auditoría
- **Dado que** realizo cualquier acción sobre un usuario (crear, modificar, desactivar o eliminar),
- **cuando** la acción se completa exitosamente,
- **entonces** debe quedar un registro en la auditoría del sistema con mi identidad y marca temporal.

### CA-AD-01.9 — Acceso restringido a no administradores
- **Dado que** un usuario con rol diferente a ADMINISTRADOR intenta acceder al módulo de gestión,
- **cuando** realiza la solicitud,
- **entonces** el sistema debe retornar un error 403 indicando que se requieren privilegios de administrador.
