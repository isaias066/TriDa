<!--
  ¿Qué? Requisito funcional que describe la gestión de perfiles de 
  riesgo dinámicos por cliente.
  ¿Para qué? Definir cómo el sistema mantiene y actualiza 
  automáticamente un perfil de comportamiento y riesgo para cada 
  cliente, permitiendo personalizar la detección de anomalías.
  ¿Impacto? Sin perfiles dinámicos el modelo aplica los mismos 
  criterios a todos los clientes, generando falsos positivos 
  excesivos en clientes con patrones legítimos atípicos y reduciendo 
  la confianza en el sistema.
-->

# RF-028 — Gestión de Perfiles de Riesgo por Cliente

**Historias de usuario relacionadas:** HU-OP-06, HU-OP-09

## Descripción

El sistema debe mantener un perfil de riesgo dinámico para cada 
cliente, que se actualice automáticamente con cada transacción 
procesada y cada validación del analista. Este perfil incluirá: 
historial de scores de riesgo, patrones de comportamiento habituales 
(horarios, montos típicos, canales preferidos, ubicaciones frecuentes), 
dispositivos registrados y número de alertas previas. Los perfiles de 
clientes con múltiples validaciones como «Falso Positivo» deben 
ajustar automáticamente sus umbrales de riesgo para reducir bloqueos 
incorrectos repetidos.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | Se procesa una nueva transacción asociada a un cliente. |
| 2 | El sistema actualiza automáticamente el perfil de riesgo del cliente con los datos de la transacción. |
| 3 | Se recalculan los patrones de comportamiento habituales: horarios, montos típicos, canales preferidos y ubicaciones frecuentes. |
| 4 | Se actualiza el historial de scores de riesgo del cliente. |
| 5 | Si un analista valida una alerta como «Falso Positivo», el perfil ajusta los umbrales de sensibilidad del cliente. |
| 6 | Si un analista valida una alerta como «Fraude Confirmado», el perfil incrementa la sensibilidad del cliente. |
| 7 | El perfil actualizado queda disponible para consulta desde la vista detallada de alertas (RF-011). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-170 | Todo cliente debe tener un perfil de riesgo dinámico que se actualice automáticamente. |
| RN-171 | El perfil debe incluir: historial de scores, patrones de comportamiento, dispositivos registrados y alertas previas. |
| RN-172 | Los patrones de comportamiento incluyen: horarios habituales, montos típicos, canales preferidos y ubicaciones frecuentes. |
| RN-173 | Múltiples validaciones como «Falso Positivo» deben ajustar automáticamente los umbrales de sensibilidad del cliente. |
| RN-174 | Las validaciones como «Fraude Confirmado» deben incrementar la sensibilidad del perfil. |
| RN-175 | El perfil debe estar disponible para consulta desde la vista detallada de alertas y desde el módulo de monitoreo. |
