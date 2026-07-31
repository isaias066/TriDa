<!--
  ¿Qué? Requisito funcional que describe la detección de patrones 
  anómalos y técnicas de fraude conocidas en las transacciones.
  ¿Para qué? Definir qué patrones específicos el modelo de IA debe 
  identificar para detectar fraudes sofisticados en la banca digital.
  ¿Impacto? Sin la detección de patrones específicos el sistema no 
  puede identificar técnicas avanzadas como botnets, ataques 
  coordinados o simulación de comportamiento legítimo.
-->

# RF-004 — Detección de Patrones Anómalos y Técnicas de Fraude Conocidas

**Historias de usuario relacionadas:** HU-PR-04

## Descripción

El modelo de IA debe identificar específicamente situaciones de riesgo 
como: transacciones en ubicaciones geográficas inusuales, montos 
atípicos respecto al comportamiento histórico, uso de dispositivos 
no reconocidos, velocidad transaccional sospechosa, secuencias que 
coincidan con técnicas fraudulentas conocidas (botnets, ataques 
coordinados de microtransacciones) y patrones que simulen 
comportamiento legítimo del cliente.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El modelo de IA recibe la transacción enriquecida con contexto completo. |
| 2 | Se compara la ubicación geográfica con las ubicaciones frecuentes del cliente. |
| 3 | Se compara el monto con el historial de montos típicos del cliente. |
| 4 | Se verifica si el dispositivo está registrado en el perfil del cliente. |
| 5 | Se analiza la velocidad transaccional (múltiples operaciones en segundos). |
| 6 | Se compara la secuencia de transacciones con patrones de fraude conocidos (botnets, microtransacciones coordinadas). |
| 7 | Se evalúa si el patrón simula comportamiento legítimo del cliente. |
| 8 | Los patrones detectados alimentan el cálculo del score de riesgo (RF-003). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-020 | El modelo debe detectar transacciones en ubicaciones geográficas inusuales para el cliente. |
| RN-021 | El modelo debe detectar montos atípicos respecto al comportamiento histórico del cliente. |
| RN-022 | El modelo debe detectar uso de dispositivos no reconocidos previamente por el cliente. |
| RN-023 | El modelo debe detectar velocidad transaccional sospechosa (múltiples operaciones en intervalos de segundos). |
| RN-024 | El modelo debe detectar secuencias que coincidan con botnets y ataques coordinados de microtransacciones. |
| RN-025 | El modelo debe detectar patrones que simulen comportamiento legítimo del cliente. |
| RN-026 | Cada patrón anómalo detectado debe reflejarse en el score de riesgo y en la explicabilidad (RF-005). |
