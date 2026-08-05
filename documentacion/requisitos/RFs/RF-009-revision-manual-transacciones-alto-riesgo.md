# RF-009 — Revisión Manual de Transacciones de Alto Riesgo

## Descripción

El sistema permitirá que un analista autorizado revise aquellas
transacciones que hayan sido marcadas con riesgo crítico por TriDa.

Durante la revisión, el analista podrá validar o descartar la
recomendación emitida por el sistema, registrando obligatoriamente la
justificación de su decisión.

Las decisiones tomadas quedarán disponibles para auditoría y podrán
utilizarse posteriormente como información de apoyo durante el
reentrenamiento del modelo de Inteligencia Artificial.

---

## Flujo

1. El analista accede al caso.

2. Revisa la información.

3. Consulta el score y explicación.

4. Registra su decisión.

5. El sistema almacena la justificación.

6. La decisión queda disponible para auditoría.

7. El caso podrá utilizarse posteriormente para el proceso de entrenamiento.

---

## Reglas

RN-052 Solo usuarios autorizados podrán revisar casos.

RN-053 Toda decisión deberá incluir una justificación.

RN-054 La revisión deberá quedar registrada.

RN-055 El historial será trazable.

RN-056 Los casos validados podrán incorporarse posteriormente al conjunto de entrenamiento, el proceso de desbloqueo requerirá que el analista justifique la decisión 
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
