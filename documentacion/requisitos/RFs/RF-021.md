<!--
  ¿Qué? Requisito funcional que describe el reentrenamiento manual 
  del modelo de IA iniciado por el administrador.
  ¿Para qué? Definir cómo el administrador puede ejecutar un 
  reentrenamiento bajo demanda ante la detección de nuevos patrones 
  de fraude, comparar versiones y revertir cambios si el nuevo 
  modelo presenta peor desempeño.
  ¿Impacto? Sin reentrenamiento manual el sistema no puede responder 
  rápidamente ante amenazas emergentes, dependiendo exclusivamente 
  del ciclo automático programado.
-->

# RF-021 — Reentrenamiento Manual del Modelo de IA

**Historias de usuario relacionadas:** HU-AD-06, HU-AU-09, HU-PR-10

## Descripción

El administrador del sistema podrá iniciar manualmente un proceso de 
reentrenamiento del modelo de IA en cualquier momento, por ejemplo 
ante la detección de nuevos patrones de fraude no contemplados en el 
entrenamiento actual. El sistema evaluará el nuevo modelo mediante 
métricas de validación (Precisión, Recall, F1-Score) antes de 
implementarlo en producción, comparándolo con la versión anterior. 
Se mantendrá un historial de versiones del modelo para poder revertir 
a una versión anterior si el nuevo modelo presenta peor desempeño.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El administrador accede al módulo de gestión del modelo de IA desde la interfaz de administración. |
| 2 | El administrador selecciona la opción de reentrenamiento manual. |
| 3 | El sistema recopila las validaciones acumuladas de los analistas. |
| 4 | Se ejecuta el pipeline de reentrenamiento con los datos recopilados. |
| 5 | Se evalúa el nuevo modelo mediante Precisión, Recall y F1-Score. |
| 6 | Se presentan las métricas del nuevo modelo comparadas con la versión en producción. |
| 7 | El administrador decide si despliega el nuevo modelo o lo descarta. |
| 8 | Si se despliega, la versión anterior se conserva en el historial de versiones. |
| 9 | Si el nuevo modelo presenta peor desempeño, el administrador puede ejecutar rollback. |
| 10 | Se registra el evento completo en el módulo de auditoría (RF-015). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-120 | Solo el administrador del sistema puede iniciar un reentrenamiento manual. |
| RN-121 | El nuevo modelo debe evaluarse mediante Precisión, Recall y F1-Score antes de cualquier decisión. |
| RN-122 | Las métricas del nuevo modelo deben compararse explícitamente con la versión en producción. |
| RN-123 | El administrador debe aprobar el despliegue del nuevo modelo de forma explícita. |
| RN-124 | El sistema debe mantener un historial completo de versiones del modelo con sus métricas. |
| RN-125 | El administrador puede ejecutar rollback a cualquier versión anterior desde la interfaz. |
| RN-126 | Cada reentrenamiento manual debe registrarse en auditoría con: fecha, administrador responsable, métricas obtenidas y decisión tomada. |
