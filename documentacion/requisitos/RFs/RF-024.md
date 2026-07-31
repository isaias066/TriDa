<!--
  ¿Qué? Requisito funcional que describe la configuración de umbrales 
  de riesgo y reglas del motor de alertas.
  ¿Para qué? Definir cómo el administrador puede ajustar los parámetros 
  del sistema que determinan las acciones automáticas sin necesidad de 
  modificar el código fuente.
  ¿Impacto? Sin configuración dinámica de umbrales el sistema requiere 
  intervención técnica para adaptarse a nuevos patrones de fraude o 
  cambios en las políticas del banco, retrasando la respuesta operativa.
-->

# RF-024 — Configuración de Umbrales de Riesgo y Reglas de Alertas

**Historias de usuario relacionadas:** HU-AD-03, HU-AU-06

## Descripción

El administrador del sistema debe poder configurar y modificar los 
umbrales de score de riesgo que determinan las acciones automáticas 
del sistema: el umbral de bloqueo automático (por defecto > 95 %), 
los rangos de niveles de alerta (baja, media, alta) y las reglas 
específicas del motor de alertas. Estos parámetros deben poder 
ajustarse sin necesidad de modificar el código fuente, a través de 
la interfaz de administración. Cualquier cambio en la configuración 
debe quedar registrado en el módulo de auditoría.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El administrador accede al módulo de configuración del motor de riesgo. |
| 2 | El sistema muestra los umbrales y reglas actuales. |
| 3 | El administrador modifica los parámetros deseados: umbral de bloqueo, rangos de alerta o reglas del motor. |
| 4 | El sistema valida que los nuevos valores sean coherentes (ej: el umbral alto no puede ser mayor al de bloqueo). |
| 5 | Si la validación es correcta, los cambios se aplican en tiempo real. |
| 6 | Se registra el cambio en el módulo de auditoría (RF-015) con: parámetro modificado, valor anterior, valor nuevo, administrador responsable y marca temporal. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-143 | Solo el administrador del sistema puede modificar los umbrales de riesgo y reglas de alertas. |
| RN-144 | El umbral de bloqueo automático por defecto es > 95 %. |
| RN-145 | Los rangos de alerta por defecto son: bajo (30–49 %), medio (50–79 %) y alto (80–95 %). |
| RN-146 | Los cambios deben aplicarse en tiempo real sin necesidad de reiniciar el sistema. |
| RN-147 | Los cambios no deben requerir modificación del código fuente. |
| RN-148 | El sistema debe validar la coherencia de los nuevos valores antes de aplicarlos. |
| RN-149 | Cada cambio debe registrarse en auditoría con: parámetro, valor anterior, valor nuevo, administrador y marca temporal. |
