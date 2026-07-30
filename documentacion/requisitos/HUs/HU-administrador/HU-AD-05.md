<!--
  ¿Qué? Historia de usuario que describe la programación del reentrenamiento automático del modelo de ML.
  ¿Para qué? Formalizar la necesidad de mantener el modelo actualizado con datos reales validados de forma continua.
  ¿Impacto? Mejora progresiva de la precisión del modelo sin intervención manual constante.
-->

# HU-AD-05 — Programación del Reentrenamiento del Modelo

## Identificación

| Campo            | Valor                                          |
| ---------------- | ---------------------------------------------- |
| **ID**           | HU-AD-05                                       |
| **Título**       | Programación del reentrenamiento del modelo    |
| **Módulo**       | Administración                                 |

---

## Historia

**Como** administrador del sistema,
**quiero** programar el reentrenamiento periódico automático del modelo de Machine Learning (diario, semanal o mensual) utilizando las validaciones acumuladas de los analistas,
**para** que el modelo mejore continuamente su precisión con datos reales validados y se adapte a nuevas técnicas de fraude sin intervención manual constante.

---

## Criterios de Aceptación

### CA-AD-05.1 — Configuración de frecuencia de reentrenamiento
- **Dado que** soy administrador en el módulo de gestión del modelo,
- **cuando** accedo a la configuración de reentrenamiento automático,
- **entonces** debo poder seleccionar la frecuencia entre las opciones: diario, semanal o mensual.

### CA-AD-05.2 — Activación del reentrenamiento programado
- **Dado que** configuré una frecuencia de reentrenamiento,
- **cuando** guardo la configuración,
- **entonces** el sistema debe programar automáticamente la ejecución del reentrenamiento según la frecuencia definida.

### CA-AD-05.3 — Monitoreo de ejecución del reentrenamiento
- **Dado que** el reentrenamiento automático está en ejecución,
- **cuando** consulto el panel de gestión del modelo,
- **entonces** debo ver el estado actual del proceso (pendiente, en ejecución o completado) y el progreso.

### CA-AD-05.4 — Consulta de métricas del nuevo modelo
- **Dado que** el reentrenamiento automático finalizó,
- **cuando** reviso los resultados,
- **entonces** debo ver las métricas del nuevo modelo (Precisión, Recall y F1-Score) comparadas con la versión anterior antes de que entre en producción.

### CA-AD-05.5 — Notificación al finalizar el reentrenamiento
- **Dado que** el reentrenamiento automático finalizó,
- **cuando** el proceso termina (con éxito o con error),
- **entonces** debo recibir una notificación indicando el resultado y las métricas obtenidas.
