<!--
  ¿Qué? Requisito funcional que describe la gestión y validación 
  manual de alertas por parte de los analistas de seguridad.
  ¿Para qué? Definir cómo los analistas revisan, clasifican y 
  documentan cada alerta generada por el sistema, alimentando 
  el ciclo de mejora continua del modelo de IA.
  ¿Impacto? Sin validación manual el sistema no puede distinguir 
  entre detecciones correctas y falsos positivos, impidiendo el 
  reentrenamiento del modelo y la mejora de su precisión.
-->

# RF-013 — Gestión y Validación Manual de Alertas por Analistas

**Historias de usuario relacionadas:** HU-AN-04

## Descripción

El sistema permitirá que los analistas autorizados revisen, validen 
y gestionen manualmente las alertas generadas. Los analistas podrán 
clasificar cada alerta en cuatro estados: «Fraude Confirmado» (se 
confirma que es fraudulenta), «Falso Positivo» (la transacción es 
legítima), «Pendiente de Investigación» (requiere más análisis) y 
«Requiere Contacto con Cliente» (necesita verificación directa con 
el cliente antes de decidir). Cada clasificación requiere un comentario 
que documente el razonamiento.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El analista accede a la alerta desde el dashboard (RF-010) o desde la vista detallada (RF-011). |
| 2 | El analista revisa los datos completos de la transacción, el score y la explicación. |
| 3 | El analista selecciona la clasificación correspondiente. |
| 4 | El analista ingresa un comentario justificando su decisión. |
| 5 | El sistema registra la clasificación con los datos del analista (RF-014). |
| 6 | Si la clasificación es «Fraude Confirmado» o «Falso Positivo», el caso se incorpora al conjunto de datos para reentrenamiento (RF-020). |
| 7 | El estado de la alerta se actualiza en el dashboard en tiempo real. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-075 | Solo analistas de seguridad autorizados pueden clasificar alertas. |
| RN-076 | Los estados de clasificación son: «Fraude Confirmado», «Falso Positivo», «Pendiente de Investigación» y «Requiere Contacto con Cliente». |
| RN-077 | Cada clasificación requiere un comentario que documente el razonamiento del analista. |
| RN-078 | Las clasificaciones «Fraude Confirmado» y «Falso Positivo» se incorporan automáticamente al conjunto de reentrenamiento del modelo. |
| RN-079 | El estado de la alerta debe actualizarse en tiempo real en el dashboard tras la clasificación. |
