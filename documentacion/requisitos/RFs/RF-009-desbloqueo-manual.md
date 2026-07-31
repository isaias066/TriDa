<!--
  ¿Qué? Requisito funcional que describe el desbloqueo manual de 
  transacciones bloqueadas por parte de un analista autorizado.
  ¿Para qué? Definir cómo un analista puede revertir un bloqueo 
  automático cuando determina que se trata de un falso positivo, 
  documentando su decisión con trazabilidad completa.
  ¿Impacto? Sin desbloqueo manual los falsos positivos afectan 
  permanentemente a clientes legítimos, degradando la experiencia 
  de usuario y generando desconfianza en el banco.
-->

# RF-009 — Desbloqueo Manual de Transacciones por Analista Autorizado

**Historias de usuario relacionadas:** HU-AN-05

## Descripción

El sistema permitirá que un analista de seguridad autorizado pueda 
desbloquear manualmente una transacción previamente bloqueada de forma 
automática, cuando determine que se trata de un falso positivo. El 
proceso de desbloqueo requerirá que el analista justifique la decisión 
con un comentario obligatorio. El desbloqueo quedará registrado en 
el módulo de auditoría y esta acción activará el reentrenamiento 
del modelo con el caso validado.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El analista accede a la transacción bloqueada desde el dashboard (RF-011). |
| 2 | El analista revisa los datos completos de la transacción, el score y la explicación. |
| 3 | El analista determina que la transacción es un falso positivo. |
| 4 | El analista ingresa un comentario obligatorio justificando el desbloqueo. |
| 5 | El sistema desbloquea la transacción y la envía al Core Banking para su autorización. |
| 6 | El desbloqueo se registra en auditoría (RF-015) con nombre del analista, fecha, hora y justificación. |
| 7 | El caso se marca como falso positivo y se incorpora al conjunto de datos para reentrenamiento (RF-020). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-052 | Solo analistas de seguridad autorizados pueden desbloquear transacciones. |
| RN-053 | El desbloqueo requiere un comentario obligatorio que justifique la decisión. |
| RN-054 | El desbloqueo debe registrarse en auditoría con: nombre del analista, rol, fecha, hora y justificación. |
| RN-055 | El registro de desbloqueo es inmutable y trazable. |
| RN-056 | El caso validado como falso positivo se incorpora automáticamente al conjunto de datos para reentrenamiento del modelo. |
