<!--
  ¿Qué? Requisito funcional que describe el reentrenamiento periódico 
  automático del modelo de IA.
  ¿Para qué? Definir cómo el sistema recopila las validaciones de los 
  analistas y ejecuta automáticamente el reentrenamiento del modelo 
  para mejorar su precisión de forma continua.
  ¿Impacto? Sin reentrenamiento periódico el modelo permanece estático 
  y pierde efectividad ante nuevas técnicas de fraude, degradando 
  progresivamente la tasa de detección del sistema.
-->

# RF-020 — Reentrenamiento Periódico del Modelo de IA

**Historias de usuario relacionadas:** HU-AD-05, HU-PR-10

## Descripción

El sistema permitirá el reentrenamiento periódico del modelo de Machine 
Learning utilizando los nuevos datos de transacciones validadas por los 
analistas (fraudes confirmados y falsos positivos). El proceso recopilará 
automáticamente las validaciones realizadas, las incorporará al conjunto 
de entrenamiento y ejecutará el reentrenamiento para mejorar la precisión 
del modelo. El reentrenamiento podrá programarse periódicamente de forma 
automática o ejecutarse manualmente por el administrador del sistema 
cuando sea necesario.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El sistema detecta que se ha alcanzado el intervalo configurado para el reentrenamiento (diario, semanal o mensual). |
| 2 | Se recopilan automáticamente las validaciones acumuladas de los analistas: fraudes confirmados y falsos positivos. |
| 3 | Las validaciones se incorporan al conjunto de datos de entrenamiento. |
| 4 | Se ejecuta el pipeline de reentrenamiento del modelo. |
| 5 | Se evalúa el nuevo modelo mediante métricas de validación: Precisión, Recall y F1-Score. |
| 6 | Se comparan las métricas del nuevo modelo con la versión actualmente en producción. |
| 7 | Si el nuevo modelo presenta métricas superiores, se despliega en producción previa aprobación. |
| 8 | La versión anterior se conserva en el historial de versiones para posible rollback. |
| 9 | Se registra el evento de reentrenamiento en el módulo de auditoría (RF-015). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-114 | El reentrenamiento debe ser programable en intervalos automáticos: diario, semanal o mensual. |
| RN-115 | El conjunto de datos de reentrenamiento se compone exclusivamente de validaciones confirmadas por analistas. |
| RN-116 | El nuevo modelo debe evaluarse mediante Precisión, Recall y F1-Score antes de su despliegue. |
| RN-117 | El nuevo modelo solo se despliega si sus métricas son superiores a la versión en producción. |
| RN-118 | La versión anterior del modelo debe conservarse para posible rollback. |
| RN-119 | Cada reentrenamiento debe registrarse en el módulo de auditoría con fecha, métricas y responsable. |
