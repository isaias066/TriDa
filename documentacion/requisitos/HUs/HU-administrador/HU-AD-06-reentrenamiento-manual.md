<!--
  ¿Qué? Historia de usuario que describe el reentrenamiento manual del modelo de IA y la gestión de versiones.
  ¿Para qué? Formalizar la necesidad de responder de forma inmediata ante nuevos patrones de fraude.
  ¿Impacto? Permite actualizar el modelo en cualquier momento sin esperar al ciclo automático programado.
-->

# HU-AD-06 — Reentrenamiento Manual del Modelo

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-AD-06                           |
| **Título**       | Reentrenamiento manual del modelo  |
| **Módulo**       | Administración                     |

---

## Historia

**Como** administrador del sistema,
**quiero** iniciar manualmente un reentrenamiento del modelo de IA en cualquier momento, comparar el nuevo modelo con la versión anterior mediante métricas (Precisión, Recall y F1-Score) y revertir a una versión anterior si el rendimiento es inferior,
**para** responder rápidamente ante nuevos patrones de fraude no contemplados en el entrenamiento vigente.

---

## Criterios de Aceptación

### CA-AD-06.1 — Inicio manual del reentrenamiento
- **Dado que** soy administrador en el módulo de gestión del modelo,
- **cuando** ejecuto la acción de reentrenamiento manual,
- **entonces** el sistema debe iniciar el proceso inmediatamente y mostrar su progreso en tiempo real.

### CA-AD-06.2 — Comparación de métricas entre versiones
- **Dado que** el reentrenamiento manual finalizó,
- **cuando** reviso los resultados,
- **entonces** debo ver una comparación lado a lado entre el modelo nuevo y el anterior con sus métricas de Precisión, Recall y F1-Score.

### CA-AD-06.3 — Historial de versiones del modelo
- **Dado que** soy administrador en el módulo de gestión del modelo,
- **cuando** accedo al historial,
- **entonces** debo ver todas las versiones anteriores del modelo con su fecha de entrenamiento y métricas registradas.

### CA-AD-06.4 — Rollback a versión anterior
- **Dado que** el nuevo modelo tiene un rendimiento inferior al anterior,
- **cuando** ejecuto la acción de rollback seleccionando una versión anterior,
- **entonces** el sistema debe restaurar esa versión como el modelo activo en producción.

### CA-AD-06.5 — Confirmación antes del rollback
- **Dado que** voy a ejecutar un rollback,
- **cuando** selecciono la versión destino y confirmo la acción,
- **entonces** el sistema debe solicitar una confirmación explícita antes de proceder con el cambio.

### CA-AD-06.6 — Registro en auditoría
- **Dado que** inicié un reentrenamiento manual o un rollback,
- **cuando** la acción se completa,
- **entonces** debe quedar registrado en la auditoría con mi identidad, la versión involucrada y la marca temporal.
