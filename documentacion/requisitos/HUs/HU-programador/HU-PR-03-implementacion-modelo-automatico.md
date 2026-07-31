<!--
  ¿Qué? Historia de usuario que describe la implementación del modelo 
  de Machine Learning para el cálculo del score de riesgo.
  ¿Para qué? Formalizar la necesidad del programador de integrar el 
  modelo que analiza cada transacción enriquecida y genera un score 
  de riesgo en tiempo real.
  ¿Impacto? Es el núcleo del sistema de detección: sin el modelo no 
  es posible clasificar transacciones ni generar alertas o bloqueos.
-->

# HU-PR-03 — Implementación del Modelo de Machine Learning

## Identificación

| Campo      | Valor                                          |
|------------|------------------------------------------------|
| **ID**     | HU-PR-03                                       |
| **Título** | Implementación del modelo de Machine Learning  |
| **Módulo** | Programador                                    |

---

## Historia

**Como** programador,
**quiero** implementar el modelo de Machine Learning que analiza cada 
transacción enriquecida y calcula un score de riesgo entre 0 % y 100 % 
con un decimal, generando el resultado en menos de 500 milisegundos,
**para** que el sistema pueda tomar decisiones automatizadas en tiempo 
real sin afectar la experiencia del cliente.

---

## Criterios de Aceptación

### CA-PR-03.1 — Generación del score en tiempo definido
- **Dado que** el modelo recibe una transacción enriquecida,
- **cuando** ejecuta el análisis,
- **entonces** debe retornar el score de riesgo en menos de 500 ms 
  expresado con un decimal (ej: 85,5 %).

### CA-PR-03.2 — Correspondencia con el modelo entrenado
- **Dado que** el modelo está en producción,
- **cuando** analiza una transacción,
- **entonces** el score generado debe corresponder al modelo 
  entrenado y validado actualmente activo en el sistema.

### CA-PR-03.3 — Rendimiento bajo carga de producción
- **Dado que** el sistema procesa múltiples transacciones simultáneas,
- **cuando** la carga alcanza niveles de producción,
- **entonces** el modelo debe mantener la latencia por debajo de 
  500 ms sin degradación del rendimiento.
