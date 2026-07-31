<!--
  ¿Qué? Requisito funcional que describe la generación automática 
  de alertas categorizadas por nivel de riesgo.
  ¿Para qué? Definir cómo el sistema clasifica las transacciones 
  según su score y genera alertas visibles en el dashboard con 
  toda la información relevante para los analistas y operadores.
  ¿Impacto? Sin alertas automáticas los analistas no reciben 
  información oportuna sobre transacciones sospechosas, retrasando 
  la respuesta ante fraudes.
-->

# RF-006 — Generación Automática de Alertas por Nivel de Riesgo

**Historias de usuario relacionadas:** HU-OP-02, HU-PR-06

## Descripción

El sistema generará alertas automáticas cuando una transacción supere 
los umbrales configurados. Las alertas se categorizarán en tres niveles: 
baja (30–49 %), media (50–79 %) y alta (80–95 %). Cada alerta contendrá: 
datos completos de la transacción, score de riesgo calculado con su 
explicación, factores sospechosos detectados, historial reciente del 
cliente y marca temporal precisa. Las alertas se enviarán en tiempo real 
al dashboard y se almacenarán para consulta posterior.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El motor de alertas recibe el score de riesgo calculado desde RF-003. |
| 2 | Se compara el score con los umbrales configurados (RF-024). |
| 3 | Si el score es inferior al 30 %, la transacción se registra como legítima sin generar alerta. |
| 4 | Si el score está entre 30 % y 49 %, se genera una alerta de nivel bajo. |
| 5 | Si el score está entre 50 % y 79 %, se genera una alerta de nivel medio. |
| 6 | Si el score está entre 80 % y 95 %, se genera una alerta de nivel alto. |
| 7 | La alerta se enriquece con los datos completos de la transacción, la explicación del score y el historial reciente del cliente. |
| 8 | La alerta se envía al dashboard en tiempo real y se almacena en la base de datos. |
| 9 | Se activa el módulo de notificaciones (RF-007) según el nivel de criticidad. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-032 | Los umbrales de alerta por defecto son: bajo (30–49 %), medio (50–79 %) y alto (80–95 %). |
| RN-033 | Transacciones con score inferior al 30 % no generan alerta. |
| RN-034 | Transacciones con score superior al 95 % no generan alerta sino bloqueo automático (RF-008). |
| RN-035 | Cada alerta debe contener: datos completos de la transacción, score, explicación, historial reciente del cliente y marca temporal. |
| RN-036 | Las alertas se envían al dashboard en tiempo real. |
| RN-037 | Todas las alertas generadas se almacenan para consulta posterior e histórico de casos. |
| RN-038 | Los umbrales son configurables por el administrador sin modificar código (RF-024). |
