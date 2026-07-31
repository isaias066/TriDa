<!--
  ¿Qué? Historia de usuario que describe la generación y exportación de reportes regulatorios.
  ¿Para qué? Formalizar la necesidad de cumplir con las exigencias de la Superintendencia Financiera de Colombia.
  ¿Impacto? Garantiza el cumplimiento normativo y evita sanciones durante auditorías y supervisiones regulatorias.
-->

# HU-AD-08 — Generación de Reportes Regulatorios

## Identificación

| Campo            | Valor                                  |
| ---------------- | -------------------------------------- |
| **ID**           | HU-AD-08                               |
| **Título**       | Generación de reportes regulatorios    |
| **Módulo**       | Administración                         |

---

## Historia

**Como** administrador del sistema,
**quiero** generar y exportar reportes regulatorios en los formatos exigidos por la Superintendencia Financiera de Colombia, cumpliendo con PCI-DSS, ISO 27001 y la Ley 1581 de 2012,
**para** garantizar el cumplimiento normativo durante auditorías y supervisiones regulatorias.

---

## Criterios de Aceptación

### CA-AD-08.1 — Selección de rango de fechas
- **Dado que** soy administrador en el módulo de reportes,
- **cuando** genero un reporte regulatorio,
- **entonces** debo poder definir el rango de fechas requerido para el período a reportar.

### CA-AD-08.2 — Exportación en formato requerido
- **Dado que** generé un reporte con el rango de fechas definido,
- **cuando** ejecuto la exportación,
- **entonces** debo poder descargarlo en el formato exigido por la normativa aplicable.

### CA-AD-08.3 — Contenido completo según normativa
- **Dado que** descargué un reporte regulatorio,
- **cuando** lo reviso,
- **entonces** debe contener toda la información exigida por PCI-DSS, ISO 27001 y la Ley 1581 de 2012 sin omisiones.

### CA-AD-08.4 — Registro en auditoría de reportes generados
- **Dado que** generé y exporté un reporte regulatorio,
- **cuando** la acción se completa,
- **entonces** debe quedar registrado en la auditoría con mi identidad, el rango de fechas del reporte y la marca temporal de generación.

### CA-AD-08.5 — Acceso restringido a administradores
- **Dado que** un usuario con rol diferente a ADMINISTRADOR intenta generar un reporte regulatorio,
- **cuando** realiza la solicitud,
- **entonces** el sistema debe rechazarla con un error 403 indicando que no tiene permisos suficientes.
