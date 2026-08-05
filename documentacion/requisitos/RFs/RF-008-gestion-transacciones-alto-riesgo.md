# RF-008 — Gestión de Transacciones de Alto Riesgo

**Historias de usuario relacionadas:** HU-OP-05, HU-PR-07

## Descripción

Cuando una transacción alcance un nivel de riesgo definido como crítico,
TriDa deberá generar una recomendación de bloqueo dirigida al sistema
bancario.

La decisión final sobre aprobar, bloquear o solicitar una verificación
adicional será ejecutada por el sistema bancario de acuerdo con sus
políticas internas.

---

## Flujo

| Paso | Descripción |
|------|-------------|
| 1 | El sistema recibe el score generado por el modelo de IA. |
| 2 | Se compara con el umbral crítico configurado. |
| 3 | Si el umbral es superado, TriDa genera una recomendación de bloqueo. |
| 4 | La recomendación se registra para auditoría. |
| 5 | El sistema bancario recibe la recomendación y ejecuta la acción correspondiente. |
| 6 | El resultado queda disponible para consulta posterior. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-045 | Las recomendaciones de bloqueo se emitirán cuando el score supere el umbral crítico configurado. |
| RN-046 | TriDa no ejecutará directamente acciones sobre el Core Banking. |
| RN-047 | Toda recomendación deberá quedar registrada para auditoría. |
| RN-048 | La respuesta enviada al sistema bancario incluirá el score y su explicación. |
| RN-049 | El umbral crítico será configurable. |
| RN-050 | Las recomendaciones podrán ser revisadas posteriormente por usuarios autorizados. |
| RN-051 | El sistema conservará el historial de recomendaciones emitidas. |
