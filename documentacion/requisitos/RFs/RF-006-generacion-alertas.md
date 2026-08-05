# RF-006 — Generación Automática de Alertas

**Historias de usuario relacionadas:** HU-OP-02, HU-PR-06

## Descripción

El sistema deberá generar alertas automáticamente cuando la probabilidad
de fraude estimada por el modelo de Inteligencia Artificial supere los
umbrales de riesgo configurados por la entidad financiera.

Cada alerta incluirá la información necesaria para facilitar el análisis
de la transacción y estará disponible en el dashboard para su consulta
y seguimiento.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo recibe el score generado por el modelo de IA (RF-003). |
| 2 | El sistema compara el resultado con los umbrales de riesgo configurados. |
| 3 | Si el score supera un umbral, se genera la alerta correspondiente. |
| 4 | La alerta incorpora la información de la transacción, el score y la explicación generada. |
| 5 | La alerta queda disponible en el dashboard. |
| 6 | La alerta se almacena para auditoría y seguimiento. |
| 7 | Si corresponde, se activa el módulo de notificaciones (RF-007). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-032 | El sistema deberá generar alertas únicamente cuando el score supere un umbral configurado. |
| RN-033 | Los niveles de riesgo deberán ser configurables por la entidad financiera. |
| RN-034 | Cada alerta deberá incluir la información necesaria para facilitar su análisis. |
| RN-035 | La alerta deberá contener el score y su explicación asociada. |
| RN-036 | Las alertas deberán mostrarse en el dashboard. |
| RN-037 | Todas las alertas deberán almacenarse para auditoría. |
| RN-038 | La modificación de umbrales no requerirá cambios en el código fuente. |
