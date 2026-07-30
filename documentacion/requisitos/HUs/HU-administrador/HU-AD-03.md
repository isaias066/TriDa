<!--
  ¿Qué? Historia de usuario que describe la configuración de umbrales y reglas del motor de detección de riesgo.
  ¿Para qué? Formalizar la necesidad del administrador de ajustar el comportamiento del sistema sin intervención técnica.
  ¿Impacto? Permite adaptar el sistema a nuevos patrones de fraude de forma inmediata y autónoma.
-->

# HU-AD-03 — Configuración del Motor de Riesgo

## Identificación

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **ID**           | HU-AD-03                           |
| **Título**       | Configuración del motor de riesgo  |
| **Módulo**       | Administración                     |

---

## Historia

**Como** administrador del sistema,
**quiero** configurar los umbrales del score de riesgo (bloqueo automático >95%, nivel bajo 30–49%, medio 50–79% y alto 80–95%) y las reglas del motor de alertas desde la interfaz sin modificar código,
**para** ajustar el comportamiento del sistema ante nuevos patrones de fraude o cambios en las políticas del banco sin depender del equipo técnico.

---

## Criterios de Aceptación

### CA-AD-03.1 — Visualización de umbrales actuales
- **Dado que** soy administrador en el módulo de configuración del motor de riesgo,
- **cuando** accedo a la pantalla de configuración,
- **entonces** debo ver los umbrales actuales definidos para cada nivel (bajo, medio, alto y bloqueo automático).

### CA-AD-03.2 — Modificación de umbrales de riesgo
- **Dado que** estoy en la configuración del motor de riesgo,
- **cuando** modifico los valores de los umbrales y guardo los cambios,
- **entonces** el motor de detección debe aplicar los nuevos umbrales en tiempo real sin necesidad de reiniciar el sistema.

### CA-AD-03.3 — Validación de rangos coherentes
- **Dado que** estoy modificando los umbrales,
- **cuando** ingreso valores que se solapan o son incoherentes entre niveles,
- **entonces** el sistema debe mostrar un error descriptivo e impedir guardar la configuración inválida.

### CA-AD-03.4 — Registro en auditoría de cambios
- **Dado que** modifico cualquier umbral o regla del motor,
- **cuando** guardo los cambios exitosamente,
- **entonces** debe quedar registrado en la auditoría con mi nombre, los valores anteriores, los nuevos valores y la marca temporal.

### CA-AD-03.5 — Aplicación en tiempo real
- **Dado que** guardé una nueva configuración de umbrales,
- **cuando** el motor procesa una nueva transacción,
- **entonces** debe clasificarla usando los umbrales recién configurados sin demora.
