<!--
  ¿Qué? Historia de usuario que describe la configuración de autenticación multifactor y control de sesiones.
  ¿Para qué? Formalizar la necesidad de añadir capas de seguridad adicionales al acceso del sistema.
  ¿Impacto? Reduce drásticamente el riesgo de acceso no autorizado ante credenciales comprometidas.
-->

# HU-AD-02 — Configuración de Autenticación Multifactor

## Identificación

| Campo            | Valor                                          |
| ---------------- | ---------------------------------------------- |
| **ID**           | HU-AD-02                                       |
| **Título**       | Configuración de autenticación multifactor     |
| **Módulo**       | Administración                                 |

---

## Historia

**Como** administrador del sistema,
**quiero** configurar y habilitar la autenticación multifactor (MFA) para los usuarios del sistema, incluyendo TOTP o SMS, y definir el tiempo de sesión inactiva,
**para** añadir una capa adicional de seguridad que proteja el acceso al sistema ante credenciales comprometidas.

---

## Criterios de Aceptación

### CA-AD-02.1 — Activación de MFA por rol
- **Dado que** soy administrador en el módulo de configuración de seguridad,
- **cuando** habilito MFA para un rol específico (ej. ANALISTA),
- **entonces** todos los usuarios con ese rol deben requerir el segundo factor al iniciar sesión.

### CA-AD-02.2 — Métodos MFA disponibles
- **Dado que** estoy configurando MFA para un rol,
- **cuando** selecciono el método de verificación,
- **entonces** debo poder elegir entre TOTP (aplicación autenticadora) o SMS.

### CA-AD-02.3 — Definición de tiempo de sesión inactiva
- **Dado que** soy administrador en la configuración de sesiones,
- **cuando** establezco un tiempo máximo de inactividad,
- **entonces** el sistema debe cerrar automáticamente la sesión de cualquier usuario que supere ese tiempo sin actividad.

### CA-AD-02.4 — Cierre automático de sesión inactiva
- **Dado que** un usuario tiene una sesión abierta y no ha realizado ninguna acción,
- **cuando** se supera el tiempo de inactividad configurado,
- **entonces** la sesión debe cerrarse automáticamente y el usuario debe ser redirigido al login.

### CA-AD-02.5 — Registro en auditoría de cambios de configuración
- **Dado que** modifico cualquier parámetro de MFA o de sesión,
- **cuando** guardo los cambios,
- **entonces** debe quedar registrado en la auditoría con mi identidad, el valor anterior, el nuevo valor y la marca temporal.
