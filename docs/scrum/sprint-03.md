# Sprint 3 — Gestión financiera, dashboard e insights

> **Reconstrucción propuesta, no registro histórico confirmado.** Ventana de referencia: 29 de octubre–11 de noviembre de 2026.

## Sprint Goal propuesto

Dar al cliente herramientas para establecer objetivos, controlar gastos y entender tendencias recientes a través de un dashboard, insights y reportes. La IA aporta orientación; los cálculos financieros se mantienen explicables desde los datos disponibles.

## Sprint Backlog candidato

HU-21 a HU-30: presupuestos, metas, dashboard, consejos, insights, análisis de mensajes, reportes y mapa.
Esta selección es propuesta; debe reducirse o dividirse si Planning Poker y la capacidad del equipo muestran que no cabe en dos semanas.

## Desglose de trabajo sugerido

| Trabajo | Responsable principal | Resultado verificable en el código actual |
| --- | --- | --- |
| Implementar almacenamiento y reglas de presupuestos, metas y aportes. | Angie Bueno | Módulos backend `budgets` y `savings`. |
| Implementar métricas del dashboard, consultas de reportes e insights. | Angie Bueno | Módulos `dashboard`, `reports` e `insights`. |
| Integrar el servicio IA para recomendaciones y análisis de mensajes, con sus políticas de error/respaldo. | Angie Bueno | Cliente HTTP en `insights`; escaneo de mensajes y recomendaciones. |
| Definir o ajustar consultas, relaciones y tipos requeridos por los reportes. | Juan Diego Morales | Esquemas PostgreSQL/Prisma y consultas SQL del backend. |
| Integrar pantallas de presupuesto, metas, dashboard, insights, reportes y mapa. | Juan Diego Morales | Páginas correspondientes bajo `frontend/src/pages/`. |
| Revisar criterios de aceptación con datos vacíos, filtros y propiedad del usuario. | Ambos Developers | Pruebas puntuales existentes; no consta qué se ejecutó en esta ventana. |

## Decisiones observables relevantes

- Los insights pueden usar consejos locales si el servicio IA no entrega recomendaciones.
- El análisis de mensaje depende del microservicio; el backend informa error en vez de fabricar un resultado.
- Los reportes y el mapa consultan datos asociados al usuario autenticado.

## Planificación y asignación propuesta

- Angie Bueno: API de presupuesto/ahorro, dashboard, insights, reportes e integración IA.
- Juan Diego Morales: persistencia/consultas de datos y páginas del frontend para presupuesto, ahorro, dashboard, insights, reportes y mapa.
- Ambos Developers: integración vertical, filtros, privacidad y validación de escenarios sin datos.
- Capacidad, votos Poker, puntos comprometidos, tareas ejecutadas y velocidad: **Sin registro**. Ver [Planning Poker](./planning-poker.md).

## Incremento observable hoy

- Módulos de presupuesto y ahorro con operaciones de creación/consulta/actualización y aportes.
- APIs de dashboard, insights y reportes; escaneo de mensaje con el servicio IA.
- Consultas de mapa y pantallas frontend para las áreas indicadas.

Esta inspección del repositorio no confirma aceptación, fecha de integración o despliegue durante el sprint propuesto.

## Revisión de Sprint — escenario de demo propuesto

1. Crear presupuesto y meta, agregar un aporte y comprobar el progreso.
2. Consultar estadísticas filtradas por periodo/cuenta y mostrar estados vacíos.
3. Consultar insights con IA disponible y, en entorno de prueba, sin IA disponible.
4. Generar el resumen/reporte y visualizar ubicaciones propias en mapa.

Resultado histórico de Review, feedback y aceptación: **Sin registro**.

## Retrospectiva

No hay notas históricas. Propuestas de reflexión y mejora para validar con el equipo:

| Tema a revisar | Acción propuesta (no acuerdo histórico) |
| --- | --- |
| Métricas que agregan varias fuentes de datos | Documentar fuente, filtros y significado de cada indicador antes de presentar la pantalla. |
| Recomendaciones IA y modo degradado | Distinguir resultados de IA, fallback local y error de análisis; probar cada escenario. |
| Alcance amplio del sprint | Refinar y priorizar el Sprint Backlog según capacidad, no comprometer el conjunto completo por defecto. |

Acuerdos originales, responsables y seguimiento: **Sin registro**.

## Métricas que faltan

| Dato | Registro |
| --- | --- |
| Puntos comprometidos / terminados | Sin registro |
| Historias aceptadas al Review | Sin registro |
| Carry-over al Sprint 4 | Sin registro |
| Bloqueos y defectos abiertos | Sin registro |
