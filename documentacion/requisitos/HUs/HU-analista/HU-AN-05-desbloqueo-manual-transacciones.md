<!--
  ¿Qué? Historia de usuario que describe el desbloqueo manual de transacciones bloqueadas automáticamente.
  ¿Para qué? Formalizar la necesidad de corregir falsos positivos sin afectar a clientes legítimos.
  ¿Impacto? Reduce el impacto operativo de los falsos positivos y mantiene la trazabilidad de cada decisión manual.
-->

# HU-AN-05 — Desbloqueo Manual de Transacciones

## Identificación

| Campo            | Valor                                  |
| ---------------- | -------------------------------------- |
| **ID**           | HU-AN-05                               |
| **Título**       | Desbloqueo manual de transacciones     |
| **Módulo**       | Analista de Seguridad                  |

---

## Historia

**Como** analista de seguridad,
**quiero** desbloquear manualmente transacciones bloqueadas automáticamente cuando determine que corresponden a un falso positivo,
**para** evitar afectaciones innecesarias a clientes legítimos y dejar evidencia del motivo del desbloqueo.

---

## Criterios de Aceptación

### CA-AN-05.1 — Opción de desbloqueo disponible en la alerta
- **Dado que** estoy en el detalle de una alerta con estado bloqueado,
- **cuando** visualizo las acciones disponibles,
- **entonces** debo ver la opción de desbloquear la transacción de forma explícita.

### CA-AN-05.2 — Justificación obligatoria para desbloquear
- **Dado que** seleccioné la opción de desbloqueo,
- **cuando** intento confirmar sin ingresar una justificación,
- **entonces** el sistema debe impedirlo y mostrar un mensaje indicando que el motivo del desbloqueo es obligatorio.

### CA-AN-05.3 — Desbloqueo exitoso de la transacción
- **Dado que** ingresé la justificación y confirmo el desbloqueo,
- **cuando** la acción se completa,
- **entonces** la transacción debe quedar desbloqueada y el estado de la alerta debe actualizarse a Falso Positivo.

### CA-AN-05.4 — Registro en auditoría del desbloqueo
- **Dado que** desbloqueé una transacción exitosamente,
- **cuando** se almacena el registro,
- **entonces** debe quedar en la auditoría con mi identidad, la justificación ingresada y la marca temporal de la acción.
