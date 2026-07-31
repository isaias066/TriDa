<!--
  ¿Qué? Requisito funcional que describe el dashboard principal 
  para analistas y operadores de seguridad.
  ¿Para qué? Definir las características de la interfaz web 
  principal que permite visualizar en tiempo real el flujo de 
  transacciones, alertas activas y métricas clave del sistema.
  ¿Impacto? Sin el dashboard los analistas y operadores no tienen 
  visibilidad del estado del sistema ni pueden gestionar alertas 
  de forma eficiente.
-->

# RF-010 — Dashboard Principal para Analistas de Seguridad

**Historias de usuario relacionadas:** HU-OP-01, HU-OP-02, HU-AN-01

## Descripción

El sistema proporcionará una interfaz web intuitiva, responsiva y 
compatible con navegadores modernos (Chrome, Firefox, Edge, Safari). 
El dashboard mostrará en tiempo real: el flujo de transacciones 
procesadas, alertas activas organizadas por nivel de criticidad con 
código de color (verde para bajo, amarillo para medio, rojo para alto), 
métricas clave de rendimiento del sistema y estadísticas resumidas 
del estado actual. La interfaz será diseñada para ser usable sin 
entrenamiento prolongado, priorizando la claridad y la velocidad 
de acción.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario autenticado accede al dashboard desde un navegador moderno. |
| 2 | El sistema carga el flujo de transacciones procesadas en tiempo real. |
| 3 | Las alertas activas se muestran organizadas por nivel de criticidad con código de color. |
| 4 | Se muestran las métricas clave: total de transacciones, alertas por nivel, tasa de detección. |
| 5 | El dashboard se actualiza automáticamente sin necesidad de refrescar la página. |
| 6 | El usuario puede acceder al detalle de cualquier alerta con un solo clic (RF-011). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-057 | El dashboard debe ser responsivo y compatible con Chrome, Firefox, Edge y Safari en versiones recientes. |
| RN-058 | Las alertas deben mostrarse con código de color: verde (bajo), amarillo (medio) y rojo (alto). |
| RN-059 | El flujo de transacciones y alertas debe actualizarse en tiempo real sin intervención del usuario. |
| RN-060 | Las métricas clave deben incluir: total de transacciones procesadas, alertas por nivel y tasa de detección. |
| RN-061 | El usuario debe poder acceder al detalle de cualquier alerta con un solo clic. |
| RN-062 | La interfaz debe ser usable sin entrenamiento prolongado, priorizando claridad y velocidad de acción. |
| RN-063 | El frontend se implementa con React + Vite + Tailwind CSS. |
