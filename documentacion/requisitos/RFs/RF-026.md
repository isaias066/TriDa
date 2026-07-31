<!--
  ¿Qué? Requisito funcional que describe la integración del sistema 
  con el Core Banking mediante APIs seguras.
  ¿Para qué? Definir los requisitos técnicos y de seguridad para la 
  comunicación entre TriDa y el sistema bancario central que 
  garanticen la recepción continua y confiable de datos transaccionales.
  ¿Impacto? Sin integración segura con el Core Banking el sistema no 
  puede recibir transacciones reales, imposibilitando su función 
  principal de detección de fraude en tiempo real.
-->

# RF-026 — Integración con el Sistema Bancario Central mediante API

**Historias de usuario relacionadas:** HU-AD-07, HU-PR-08

## Descripción

El sistema debe integrarse con el sistema bancario central (Core 
Banking) mediante APIs estandarizadas y seguras para recibir el flujo 
continuo de datos transaccionales en tiempo real. La integración debe 
implementar validación de integridad de los datos recibidos, manejo 
de errores y reconexión automática ante interrupciones de la conexión. 
Las comunicaciones deben estar encriptadas mediante HTTPS/TLS 1.3 y 
autenticadas con certificados digitales con validación mutua (Mutual 
TLS). El sistema no puede modificar ni interactuar directamente con 
la base de datos del Core Banking.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El sistema establece conexión con el Core Banking mediante HTTPS/TLS 1.3 con Mutual TLS. |
| 2 | Se validan los certificados digitales en ambos extremos de la conexión. |
| 3 | El Core Banking emite el flujo continuo de datos transaccionales. |
| 4 | El sistema valida la integridad de cada paquete de datos recibido. |
| 5 | Si la validación falla, se registra el error y se solicita retransmisión. |
| 6 | Si la conexión se interrumpe, se activa el mecanismo de reconexión automática. |
| 7 | Durante la reconexión, se identifican y recuperan las transacciones que pudieron perderse. |
| 8 | Los datos recibidos se envían al módulo de ingesta (RF-001). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-156 | Las comunicaciones deben estar encriptadas mediante HTTPS/TLS 1.3. |
| RN-157 | La autenticación debe realizarse mediante Mutual TLS con certificados digitales válidos. |
| RN-158 | El sistema debe validar la integridad de cada paquete de datos recibido. |
| RN-159 | Ante interrupciones de conexión, el sistema debe reconectarse automáticamente sin intervención manual. |
| RN-160 | Durante la reconexión no se deben perder transacciones pendientes de procesamiento. |
| RN-161 | El sistema no puede modificar ni interactuar directamente con la base de datos del Core Banking. |
| RN-162 | Los errores de comunicación deben registrarse en el módulo de auditoría. |
