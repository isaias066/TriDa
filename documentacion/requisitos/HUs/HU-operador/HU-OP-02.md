<!--
  ¿Qué? Historia de usuario que describe la visualización de alertas activas clasificadas por criticidad.
  ¿Para qué? Formalizar la necesidad del operador de priorizar su atención según la urgencia de cada alerta.
  ¿Impacto? Permite una respuesta ordenada y eficiente ante múltiples alertas simultáneas.
-->

# HU-OP-02 — Visualización de Alertas Activas

## Identificación

| Campo            | Valor                                |
| ---------------- | ------------------------------------ |
| **ID**           | HU-OP-02                             |
| **Título**       | Visualización de alertas activas     |
| **Módulo**       | Operador de Monitoreo                |

---

## Historia

**Como** operador de monitoreo,
**quiero** visualizar todas las alertas activas clasificadas por nivel de criticidad (bajo, medio y alto) mediante códigos de color y métricas resumidas del estado del sistema,
**para** priorizar mi atención en los casos más urgentes y mantener una visión clara del estado general de la operación.

---

## Criterios de Aceptación

### CA-OP-02.1 — Alertas ordenadas por criticidad
- **Dado que** accedo al panel de alertas activas,
- **cuando** visualizo la lista,
- **entonces** las alertas deben estar ordenadas por nivel de criticidad de mayor a menor para facilitar la priorización.

### CA-OP-02.2 — Identificación por código de color
- **Dado que** estoy viendo las alertas activas,
- **cuando** observo cada alerta,
- **entonces** debe estar visualmente diferenciada mediante código de color: verde (bajo), amarillo (medio) y rojo (alto).

### CA-OP-02.3 — Métricas resumidas del estado del sistema
- **Dado que** estoy en el panel de alertas,
- **cuando** visualizo la cabecera o sección de resumen,
- **entonces** debo ver métricas como el total de alertas activas, la distribución por nivel y el tiempo promedio de atención.

### CA-OP-02.4 — Acceso al detalle con un clic
- **Dado que** estoy viendo una alerta en la lista,
- **cuando** hago clic sobre ella,
- **entonces** debo ser redirigido a la vista detallada de esa alerta con toda su información.
