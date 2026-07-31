<!--
  ¿Qué? Requisito funcional que describe la vista detallada de 
  alertas y transacciones sospechosas.
  ¿Para qué? Definir qué información completa debe mostrar el 
  sistema al seleccionar una alerta específica para que el analista 
  u operador pueda tomar decisiones fundamentadas.
  ¿Impacto? Sin la vista detallada los analistas deben consultar 
  múltiples fuentes externas para contextualizar cada caso, 
  retrasando la respuesta ante fraudes activos.
-->

# RF-011 — Vista Detallada de Alertas y Transacciones Sospechosas

**Historias de usuario relacionadas:** HU-AN-02, HU-OP-06

## Descripción

Al seleccionar una alerta específica en el dashboard, el sistema 
desplegará una vista detallada que incluye: datos completos del 
cliente (nombre, identificación, perfil de riesgo histórico), 
detalles de la transacción (monto, origen, destino, canal, dispositivo, 
ubicación geográfica en mapa), score de riesgo con explicación de los 
factores que lo determinaron, historial de las últimas transacciones 
del cliente con sus scores y dispositivos utilizados anteriormente.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario selecciona una alerta desde el dashboard (RF-010). |
| 2 | El sistema carga los datos completos del cliente asociado a la transacción. |
| 3 | Se muestran los detalles de la transacción: monto, origen, destino, canal, dispositivo y ubicación geográfica en mapa. |
| 4 | Se muestra el score de riesgo junto con la explicación generada por RF-005. |
| 5 | Se carga el historial de las últimas transacciones del cliente con sus scores respectivos. |
| 6 | Se muestran los dispositivos utilizados anteriormente por el cliente. |
| 7 | El analista puede tomar acciones directamente desde esta vista: clasificar (RF-013), desbloquear (RF-009) o escalar (RF-029). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-064 | La vista detallada debe incluir datos completos del cliente: nombre, identificación y perfil de riesgo histórico. |
| RN-065 | Los detalles de la transacción deben incluir: monto, origen, destino, canal, dispositivo y ubicación geográfica en mapa. |
| RN-066 | El score de riesgo debe mostrarse junto con la explicación en lenguaje natural generada por RF-005. |
| RN-067 | El historial debe mostrar las últimas transacciones del cliente con sus scores y dispositivos. |
| RN-068 | Toda la información debe estar disponible en una única pantalla sin necesidad de consultar sistemas externos. |
| RN-069 | El analista debe poder tomar acciones directamente desde la vista detallada. |
