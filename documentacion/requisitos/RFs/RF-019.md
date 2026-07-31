<!--
  ¿Qué? Requisito funcional que describe la visualización de métricas 
  mediante gráficos interactivos en el dashboard.
  ¿Para qué? Definir qué gráficos interactivos debe presentar el 
  sistema para que los usuarios puedan explorar visualmente los datos 
  operativos e identificar patrones y tendencias.
  ¿Impacto? Sin gráficos interactivos los usuarios dependen de datos 
  tabulares para analizar tendencias, dificultando la detección visual 
  de anomalías operativas y patrones de fraude emergentes.
-->

# RF-019 — Visualización de Métricas mediante Gráficos Interactivos

**Historias de usuario relacionadas:** HU-OP-08, HU-AN-09

## Descripción

El dashboard debe presentar métricas clave mediante gráficos 
interactivos que permitan al usuario explorar los datos visualmente. 
Los gráficos requeridos incluyen: línea de tiempo de transacciones 
procesadas vs. alertas generadas, distribución de alertas por nivel 
de criticidad (gráfico circular), mapa de calor de transacciones 
por canal y horario, evolución histórica de la tasa de detección 
de fraudes y comparativa de falsos positivos vs. verdaderos positivos 
por período. Los gráficos deben actualizarse en tiempo real.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario accede a la sección de métricas del dashboard. |
| 2 | El sistema carga los gráficos interactivos con los datos actualizados. |
| 3 | El usuario puede interactuar con los gráficos: hacer zoom, seleccionar rangos temporales y filtrar datos. |
| 4 | Los gráficos se actualizan en tiempo real con los nuevos datos procesados. |
| 5 | El usuario puede modificar el período de visualización. |
| 6 | El usuario puede exportar las visualizaciones si tiene permisos (RF-018). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-109 | Los gráficos obligatorios son: línea de tiempo (transacciones vs. alertas), distribución por criticidad (circular), mapa de calor (canal y horario), evolución de tasa de detección y comparativa falsos positivos vs. verdaderos positivos. |
| RN-110 | Los gráficos deben ser interactivos: zoom, selección de rangos y filtrado de datos. |
| RN-111 | Los gráficos deben actualizarse en tiempo real sin intervención del usuario. |
| RN-112 | El usuario debe poder modificar el período de visualización. |
| RN-113 | Las visualizaciones deben poder exportarse en formatos estándar. |
