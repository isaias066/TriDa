<!--
  ¿Qué? Historia de usuario que describe la implementación del 
  mecanismo de bloqueo automático de transacciones de alto riesgo.
  ¿Para qué? Formalizar la necesidad del programador de detener 
  transacciones con score superior al 95 % antes de su autorización 
  en el Core Banking, registrando el evento y notificando al cliente.
  ¿Impacto? Sin el bloqueo automático el sistema solo detecta fraudes 
  de forma reactiva, permitiendo que las pérdidas económicas se 
  materialicen antes de cualquier intervención.
-->

# HU-PR-07 — Implementación del Bloqueo Automático

## Identificación

| Campo      | Valor                                      |
|------------|--------------------------------------------|
| **ID**     | HU-PR-07                                   |
| **Título** | Implementación del bloqueo automático      |
| **Módulo** | Programador                                |

---

## Historia

**Como** programador,
**quiero** implementar el mecanismo de bloqueo automático e inmediato 
de transacciones con score superior al 95 %, registrando el evento en 
auditoría y notificando al cliente en un máximo de 30 segundos,
**para** evitar pérdidas económicas derivadas de fraudes de alto riesgo 
y mantener la trazabilidad completa del proceso.

---

## Criterios de Aceptación

### CA-PR-07.1 — Bloqueo previo a la autorización en Core Banking
- **Dado que** una transacción obtiene un score superior al 95 %,
- **cuando** el sistema procesa el resultado,
- **entonces** debe bloquear la transacción antes de que se complete 
  la autorización en el Core Banking.

### CA-PR-07.2 — Registro inmediato en auditoría
- **Dado que** se ejecuta un bloqueo automático,
- **cuando** el evento ocurre,
- **entonces** debe quedar registrado inmediatamente en el módulo 
  de auditoría con todos los detalles de la transacción bloqueada.

### CA-PR-07.3 — Notificación al cliente en tiempo definido
- **Dado que** una transacción fue bloqueada automáticamente,
- **cuando** el sistema activa el proceso de comunicación,
- **entonces** el cliente debe recibir la notificación a través 
  de los canales oficiales en un máximo de 30 segundos.
