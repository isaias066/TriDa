<!--
  ¿Qué? Historia de usuario que describe la exportación de reportes del sistema en múltiples formatos.
  ¿Para qué? Formalizar la necesidad del analista de compartir información con otras áreas y cumplir requerimientos regulatorios.
  ¿Impacto? Permite entregar información estructurada a auditorías, áreas legales y entes reguladores sin reprocesos.
-->

# HU-AN-10 — Exportación de Reportes

## Identificación

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **ID**           | HU-AN-10                   |
| **Título**       | Exportación de reportes    |
| **Módulo**       | Analista de Seguridad      |

---

## Historia

**Como** analista de seguridad,
**quiero** exportar los reportes del sistema en formatos PDF, Excel (XLSX) o CSV,
**para** compartir información con otras áreas y cumplir requerimientos regulatorios.

---

## Criterios de Aceptación

### CA-AN-10.1 — Selección del formato de exportación
- **Dado que** voy a exportar un reporte,
- **cuando** accedo a la opción de exportación,
- **entonces** debo poder elegir entre los formatos PDF, Excel (XLSX) y CSV antes de descargar.

### CA-AN-10.2 — Definición del rango de fechas
- **Dado que** estoy configurando la exportación,
- **cuando** defino los parámetros del reporte,
- **entonces** debo poder establecer el rango de fechas que abarcará el archivo exportado.

### CA-AN-10.3 — Definición del nivel de detalle
- **Dado que** estoy configurando la exportación,
- **cuando** selecciono el nivel de detalle,
- **entonces** debo poder elegir entre un resumen ejecutivo o el detalle completo de los registros incluidos.

### CA-AN-10.4 — Contenido completo en el archivo descargado
- **Dado que** ejecuté la exportación con los parámetros definidos,
- **cuando** abro el archivo descargado,
- **entonces** debe contener únicamente la información correspondiente al rango de fechas y nivel de detalle que seleccioné.
