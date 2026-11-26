# Sprint 4 — Seguridad operativa, auditoría y retención

> **Reconstrucción propuesta, no registro histórico confirmado.** Ventana de referencia: 12–25 de noviembre de 2026.

## Sprint Goal propuesto

Completar capacidades complementarias de seguridad y retención, y cerrar la revisión de calidad/documentación del producto. El trabajo de purga debe proteger los datos del cliente y no cambiar saldos al eliminar registros antiguos.

## Sprint Backlog candidato

HU-31 a HU-35: gestión de dispositivos, auditoría propia y exportación/descarga/purga.
Esta selección es propuesta; confirmar capacidad y riesgos antes de comprometerla como sprint real.

## Desglose de trabajo sugerido

| Trabajo | Responsable principal | Resultado verificable en el código actual |
| --- | --- | --- |
| Mantener relaciones y persistencia de dispositivos, auditoría y exportaciones. | Juan Diego Morales | Modelos de Prisma y SQL complementario. |
| Implementar registro/actualización de dispositivos y consulta de auditoría propia. | Angie Bueno | Módulos `devices` y `audit`. |
| Implementar preparación, descarga CSV y purga con revalidación de elegibilidad. | Angie Bueno | Rutas y servicios de archivo en `transactions`. |
| Integrar las interfaces de dispositivos, auditoría y exportación disponibles en el alcance del frontend. | Juan Diego Morales | Revisar páginas y componentes actuales; el repositorio por sí solo no confirma aceptación del flujo. |
| Verificar pruebas, contratos, errores y actualización de documentación. | Ambos Developers | Tests y documentación existen; fecha y resultado de ejecución no constan. |

## Decisiones observables relevantes

- La exportación es temporal y la purga requiere haber descargado el CSV.
- La purga revalida elegibilidad; los movimientos que dejaron de cumplirla pueden omitirse, y la operación registra el resultado.
- Las consultas de auditoría devuelven únicamente el historial del usuario autenticado.

## Planificación y asignación propuesta

- Angie Bueno: endpoints/servicios de dispositivos, auditoría, exportación, descarga, purga y estabilización backend.
- Juan Diego Morales: persistencia, relaciones, frontend de dispositivos y revisión de flujos existentes.
- Ambos Developers: regresión, criterios de aceptación, documentación y preparación de demo.
- Capacidad, votos Poker, puntos comprometidos, tareas ejecutadas y velocidad: **Sin registro**. Ver [Planning Poker](./planning-poker.md).

## Incremento observable hoy

- Módulos de dispositivos y auditoría propia.
- Preparación de exportación, descarga CSV y purga condicionada a descarga previa, con revalidación de elegibilidad.
- Esquemas, pruebas y documentación asociada en el repositorio.

La existencia actual de estas funciones no demuestra que fueran terminadas o aceptadas en noviembre ni que este fuera el último sprint ejecutado.

## Revisión de Sprint — escenario de demo propuesto

1. Registrar/actualizar un dispositivo y consultar el historial propio.
2. Preparar una exportación anual, descargar CSV y comprobar que la purga exige descarga previa.
3. Mostrar que la purga omite movimientos que ya no son elegibles e informa el resultado.
4. Ejecutar regresión y mostrar documentación actualizada.

Resultado histórico de Review, feedback, aceptación y defectos abiertos: **Sin registro**.

## Retrospectiva

No hay notas históricas. Acciones de cierre propuestas para validar:

| Tema a revisar | Acción propuesta (no acuerdo histórico) |
| --- | --- |
| Funcionalidades críticas requieren evidencia de aceptación | Adjuntar prueba o demo a cada historia marcada `Validada`. |
| Exportación y purga son flujos destructivos | Verificar permisos, expiración, descarga previa, omisiones y consistencia antes de aceptar. |
| Documentación de proceso no cuenta con actas | Empezar a guardar objetivo, compromiso, Poker, Review y Retrospective desde el siguiente sprint real. |

Acuerdos originales, responsables y seguimiento: **Sin registro**.

## Métricas que faltan

| Dato | Registro |
| --- | --- |
| Puntos comprometidos / terminados | Sin registro |
| Historias aceptadas al Review | Sin registro |
| Carry-over | Sin registro |
| Bloqueos y defectos abiertos | Sin registro |

## Cierre documental

Este documento no afirma que el Sprint 4 fuera aceptado ni que el proyecto se desplegara. Para declarar un sprint terminado, confirmar criterios, evidencia de prueba y decisión del Product Owner; después actualizar el estado del backlog.
