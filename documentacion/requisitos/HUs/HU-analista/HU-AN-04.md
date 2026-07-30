<!--
  ¿Qué? Historia de usuario que describe la clasificación de alertas por parte del analista.
  ¿Para qué? Formalizar la necesidad de gestionar el ciclo de vida de cada caso y alimentar el reentrenamiento del modelo.
  ¿Impacto? Cada clasificación mejora la calidad del modelo y garantiza el cierre correcto de los casos de fraude.
-->

# HU-AN-04 — Clasificación de Alertas

## Identificación

| Campo            | Valor                    |
| ---------------- | ------------------------ |
| **ID**           | HU-AN-04                 |
| **Título**       | Clasificación de alertas |
| **Módulo**       | Analista de Seguridad    |

---

## Historia

**Como** analista de seguridad,
**quiero** clasificar cada alerta como Fraude Confirmado, Falso Positivo, Pendiente de Investigación o Requiere Contacto con Cliente, registrando un comentario justificativo,
**para** gestionar correctamente el ciclo de vida de cada caso y alimentar el reentrenamiento del modelo.

---

## Criterios de Aceptación

### CA-AN-04.1 — Opciones de clasificación disponibles
- **Dado que** estoy en el detalle de una alerta,
- **cuando** voy a clasificarla,
- **entonces** debo ver las cuatro opciones disponibles: Fraude Confirmado, Falso Positivo, Pendiente de Investigación y Requiere Contacto con Cliente.

### CA-AN-04.2 — Justificación obligatoria
- **Dado que** seleccioné una clasificación para una alerta,
- **cuando** intento guardar sin ingresar un comentario justificativo,
- **entonces** el sistema debe impedirlo y mostrar un mensaje indicando que la justificación es obligatoria.

### CA-AN-04.3 — Cambio de estado exitoso
- **Dado que** seleccioné una clasificación e ingresé la justificación,
- **cuando** guardo los cambios,
- **entonces** el estado de la alerta debe actualizarse correctamente y reflejarse de inmediato en el dashboard.

### CA-AN-04.4 — Registro con identidad y marca temporal
- **Dado que** classifiqué una alerta exitosamente,
- **cuando** se almacena el registro,
- **entonces** debe quedar guardado con mi nombre de usuario, mi rol y la fecha y hora exacta de la clasificación.

### CA-AN-04.5 — Clasificación disponible para reentrenamiento
- **Dado que** registré la clasificación de una alerta,
- **cuando** el sistema ejecuta el reentrenamiento del modelo,
- **entonces** esa clasificación debe estar disponible como dato de entrenamiento validado.
