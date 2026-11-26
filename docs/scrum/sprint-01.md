# Sprint 1 — Reorientación de producto y base de usuario

> **Reconstrucción propuesta, no registro histórico confirmado.** Ventana de referencia: 1–14 de octubre de 2026. La fecha inicial corresponde al periodo informado; la división quincenal es la organización solicitada.

## Sprint Goal propuesto

Después del cambio de enfoque a clientes, habilitar una primera base usable para crear una cuenta TriDa y administrar sus datos financieros iniciales. El valor esperado es que un cliente pueda identificarse y empezar a organizar sus recursos financieros.

## Sprint Backlog candidato

HU-01 a HU-13: registro, verificación, autenticación, perfil, patrón, cuentas y categorías. Esta selección es una propuesta de alcance: el equipo debe refinar y reducirla según capacidad y estimaciones antes de llamarla compromiso del sprint.

## Desglose de trabajo sugerido

| Trabajo | Responsable principal | Resultado verificable en el código actual |
| --- | --- | --- |
| Definir y mantener modelos de usuario, perfil, cuenta y categoría en Prisma/PostgreSQL. | Juan Diego Morales | Modelos relacionales en `backend/prisma/schema.prisma`; SQL complementario en `database/schema.sql`. |
| Implementar endpoints de registro, verificación, login, logout y recuperación. | Angie Bueno | Rutas y servicios en `backend/src/modules/auth/`. |
| Implementar consulta y actualización del perfil y patrón financiero. | Angie Bueno | Módulo `backend/src/modules/profile/`. |
| Implementar operaciones de cuentas y categorías con propiedad por usuario. | Angie Bueno | Módulos `account` y `categories`. |
| Integrar pantallas de registro, login, recuperación, perfil, cuentas y categorías. | Juan Diego Morales | Páginas React en `frontend/src/pages/` y componentes relacionados. |
| Validar criterios, errores y contratos entre API e interfaz. | Ambos Developers | Hay pruebas y contratos en el repositorio; no consta qué tareas se ejecutaron en esta ventana. |

## Planificación y asignación propuesta

- Product Owner: Angie Bueno; Developers: Angie Bueno y Juan Diego Morales.
- Scrum Master: Juan Diego Morales; Developers: Angie Bueno y Juan Diego Morales.
- Angie dirige tareas backend; Juan Diego dirige datos y frontend. Ambos colaboran en contratos, integración y pruebas.
- Capacidad real, puntos aceptados, votos Poker y tareas terminadas durante la ventana: **Sin registro**. Ver [Planning Poker](./planning-poker.md).

## Incremento observable hoy

- Registro/login y módulos de autenticación.
- Perfil, cuentas y categorías con rutas backend y páginas frontend asociadas.
- Modelos de usuario, perfil financiero, cuenta y categoría en el esquema relacional.

Esta evidencia del repositorio no fecha el trabajo ni confirma que el Product Owner lo aceptara al cierre de esta ventana.

## Revisión de Sprint — escenario de demo propuesto

1. Registrar un cliente y mostrar la respuesta según entorno.
2. Iniciar/cerrar sesión y comprobar acceso a rutas protegidas.
3. Consultar y actualizar perfil; crear/consultar cuenta y categoría propia.
4. Verificar el aislamiento de datos entre usuarios y presentar pruebas aplicables.

Resultado histórico de Review, feedback y aceptación: **Sin registro**.

## Retrospectiva

No hay notas históricas. Temas que el equipo debe validar en una retrospectiva de reconstrucción:

| Pregunta | Acción de mejora propuesta (no acuerdo histórico) |
| --- | --- |
| ¿El cambio de bancos a clientes dejó claros los límites del producto? | Mantener alcance, supuestos y funciones excluidas visibles junto al Product Goal. |
| ¿El modelo de datos y el contrato API se acordaron antes de integrar la UI? | Registrar cambios de contrato y validar un flujo vertical completo por historia. |

Acuerdos originales, responsables y seguimiento: **Sin registro**.

## Métricas que faltan

| Dato | Registro |
| --- | --- |
| Puntos comprometidos / terminados | Sin registro |
| Historias aceptadas al Review | Sin registro |
| Carry-over al Sprint 2 | Sin registro |
| Bloqueos y defectos abiertos | Sin registro |

El estado presente de código no permite calcular velocidad ni afirmar el resultado de este sprint.
