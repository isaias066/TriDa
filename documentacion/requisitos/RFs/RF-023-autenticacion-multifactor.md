<!--
  ¿Qué? Requisito funcional que describe la autenticación segura 
  con soporte para autenticación multifactor.
  ¿Para qué? Definir los mecanismos de autenticación que protegen 
  el acceso al sistema, incluyendo requisitos de complejidad de 
  contraseña, MFA y cierre automático de sesiones inactivas.
  ¿Impacto? Sin autenticación segura cualquier persona puede acceder 
  al sistema, comprometiendo la seguridad de los datos financieros 
  y el cumplimiento de PCI-DSS e ISO 27001.
-->

# RF-023 — Autenticación Segura con Soporte para Multifactor

**Historias de usuario relacionadas:** HU-AD-02

## Descripción

El sistema debe implementar un mecanismo de autenticación seguro 
para todos los usuarios. Como mínimo, se requerirá usuario y 
contraseña con requisitos de complejidad (mínimo 8 caracteres, 
combinación de mayúsculas, minúsculas, números y símbolos). El 
sistema soportará autenticación multifactor (MFA) para cuentas de 
analistas y administradores, añadiendo una segunda capa de verificación 
mediante código temporal (TOTP) o mensaje SMS. Las sesiones inactivas 
se cerrarán automáticamente tras un tiempo configurable.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario accede a la pantalla de inicio de sesión del sistema. |
| 2 | El usuario ingresa su correo electrónico y contraseña. |
| 3 | El sistema valida las credenciales contra la base de datos. |
| 4 | Si las credenciales son inválidas, se retorna un error genérico (anti-enumeración). |
| 5 | Si el usuario tiene MFA habilitado, se solicita el segundo factor de verificación (TOTP o SMS). |
| 6 | El usuario ingresa el código temporal de verificación. |
| 7 | Si el código es válido, se genera el token JWT y se inicia la sesión. |
| 8 | Si el código es inválido, se deniega el acceso y se registra el intento fallido. |
| 9 | Durante la sesión, el sistema monitorea la inactividad del usuario. |
| 10 | Si la sesión supera el tiempo de inactividad configurado, se cierra automáticamente. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-136 | La contraseña debe tener mínimo 8 caracteres con combinación de mayúsculas, minúsculas, números y símbolos. |
| RN-137 | La autenticación multifactor (MFA) es obligatoria para administradores y analistas. |
| RN-138 | Los métodos MFA soportados son: código temporal TOTP y mensaje SMS. |
| RN-139 | Los mensajes de error de autenticación deben ser genéricos para prevenir enumeración de usuarios. |
| RN-140 | Las sesiones inactivas se cierran automáticamente tras un tiempo configurable por el administrador. |
| RN-141 | Los intentos fallidos de autenticación deben registrarse en el módulo de auditoría. |
| RN-142 | La autenticación se implementa mediante tokens JWT. |
