# RF-007 — Gestión de Notificaciones

**Descripción**

El sistema deberá emitir notificaciones cuando se genere una alerta
de riesgo, utilizando los mecanismos configurados por la entidad
financiera.

Las notificaciones permitirán informar oportunamente sobre eventos
que requieran revisión o intervención.

---

## Flujo

1. Se recibe una alerta desde RF-006.

2. Se determina el nivel de criticidad.

3. Se seleccionan los canales configurados.

4. Se envía la notificación.

5. Se registra el envío.

---

## Reglas

RN-039 Las notificaciones deberán asociarse a una alerta.

RN-040 Los canales utilizados serán configurables.

RN-041 Toda notificación deberá registrarse.

RN-042 El usuario autorizado podrá acceder directamente al caso desde la notificación.

RN-043 El sistema permitirá utilizar múltiples canales de notificación.

RN-044 La configuración de canales podrá modificarse sin alterar la lógica del sistema.notificación visual, push y correo electrónico al analista responsable. 
Para bloqueos automáticos (score > 95 %), se activan todos los canales 
de notificación de forma simultánea e inmediata.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El motor de notificaciones recibe la alerta generada por RF-006 con su nivel de criticidad. |
| 2 | Si la alerta es de nivel bajo (30–49 %), se muestra únicamente en el dashboard. |
| 3 | Si la alerta es de nivel medio (50–79 %), se muestra en el dashboard y se envía notificación push. |
| 4 | Si la alerta es de nivel alto (80–95 %), se muestra en el dashboard, se envía notificación push y correo electrónico al analista responsable. |
| 5 | Si es un bloqueo automático (> 95 %), se activan todos los canales simultáneamente. |
| 6 | Se registra la notificación enviada con canal, destinatario y marca temporal. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-039 | Nivel bajo (30–49 %): solo notificación visual en el dashboard. |
| RN-040 | Nivel medio (50–79 %): notificación visual en dashboard + notificación push. |
| RN-041 | Nivel alto (80–95 %): notificación visual + push + correo electrónico al analista responsable. |
| RN-042 | Bloqueo automático (> 95 %): todos los canales de notificación se activan simultáneamente. |
| RN-043 | Toda notificación enviada debe registrarse con canal utilizado, destinatario y marca temporal. |
| RN-044 | El usuario debe poder acceder al caso directamente desde la notificación recibida. |
