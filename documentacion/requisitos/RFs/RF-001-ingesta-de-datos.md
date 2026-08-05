<!--
  ¿Qué? Requisito funcional que describe la recepción y procesamiento
  inicial de las transacciones provenientes del sistema bancario.
  ¿Para qué? Definir cómo TriDa recibe, valida y prepara la información
  necesaria para iniciar el proceso de evaluación de riesgo.
  ¿Impacto? Constituye la puerta de entrada del sistema; sin este
  proceso no es posible realizar el análisis de fraude.
-->

# RF-001 — Ingesta y Procesamiento de Datos Transaccionales

**Historias de usuario relacionadas:** HU-OP-01, HU-PR-01

## Descripción

El sistema debe recibir las transacciones generadas por el sistema
bancario en tiempo real a través del Worker de integración. Cada
transacción será validada, normalizada y preparada para continuar
con el proceso de análisis de riesgo dentro de TriDa.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El sistema bancario envía la información de la transacción al Worker de integración. |
| 2 | El Worker recibe la transacción y verifica la integridad de la comunicación. |
| 3 | Si la validación falla, el sistema registra la incidencia y finaliza el procesamiento de la transacción. |
| 4 | Se extraen los campos necesarios para el análisis. |
| 5 | Los datos se normalizan al formato estándar utilizado por TriDa. |
| 6 | La transacción normalizada se envía al módulo de extracción de características (RF-002). |
| 7 | El evento queda registrado para efectos de auditoría. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-001 | Toda transacción recibida deberá ser validada antes de iniciar su procesamiento. |
| RN-002 | Los campos obligatorios incluyen: monto, cuenta origen, cuenta destino, tipo de transacción, dispositivo, ubicación, fecha y hora. |
| RN-003 | Si la información recibida es inconsistente o incompleta, la transacción no continuará el proceso y se registrará la incidencia. |
| RN-004 | La información deberá normalizarse al formato interno definido por TriDa antes de continuar el flujo. |
| RN-005 | La comunicación entre el sistema bancario y TriDa deberá realizarse mediante mecanismos seguros definidos por la entidad financiera. |
| RN-006 | TriDa no modificará directamente la información almacenada por el sistema bancario. |
| RN-007 | Una vez normalizada, la transacción será enviada al módulo de extracción de características. |
