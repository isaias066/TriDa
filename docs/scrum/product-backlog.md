# Product Backlog de TriDa

## Product Backlog y orden propuesto

Este backlog reutiliza las historias funcionales existentes y las ordena por valor y dependencias, dando precedencia a los servicios backend y a los flujos financieros centrales. El orden es una **propuesta retrospectiva**, no el orden histórico de trabajo ni una priorización aprobada en una reunión.

| Prioridad | Interpretación |
| --- | --- |
| P0 | Base necesaria para que un cliente pueda autenticarse y registrar/revisar movimientos con aislamiento por usuario. |
| P1 | Funciones de control, análisis y orientación que amplían el valor financiero del producto. |
| P2 | Consulta geográfica, dispositivos y trazabilidad complementaria. |
| P3 | Retención/exportación avanzada, dependiente de movimientos existentes y de controles de seguridad. |

El código observable permite establecer trazabilidad técnica, no aceptación de producto. “Implementación observable” significa que existe una ruta o módulo relacionado; no demuestra que se cumplieran todos los criterios, que estuviera desplegado o que el Product Owner lo aceptara.

Las estimaciones y los puntos de historia están **sin registrar**. No usar prioridades como sustituto de Planning Poker. Historias que resulten demasiado grandes se deben dividir durante la planificación, conservando criterios verificables.

| Prioridad | Épica / alcance | Historias | Responsabilidad principal sugerida | Evidencia actual |
| --- | --- | --- | --- | --- |
| P0 | Autenticación y acceso | HU-01 Registrar usuario; HU-02 Verificar correo; HU-03 Iniciar sesión; HU-04 Cerrar sesión; HU-05 Solicitar recuperación; HU-06 Validar token; HU-07 Restablecer contraseña; HU-08 Cambiar contraseña | Angie: API; Juan Diego: base de datos e interfaz | Rutas y servicios `auth`, protección JWT y pantallas de autenticación. |
| P0 | Perfil y organización de datos | HU-09 Consultar perfil; HU-10 Actualizar perfil; HU-11 Consultar patrón financiero; HU-12 Gestionar cuentas; HU-13 Gestionar categorías | Angie: API; Juan Diego: modelo de datos e interfaz | Módulos `profile`, `account`, `categories` y sus pantallas. |
| P0 | Registro y revisión de movimientos | HU-14 Consultar transacciones; HU-15 Registrar manualmente; HU-16 Resolver pendientes; HU-17 Categorizar; HU-20 Consultar y resolver alertas | Angie: API; Juan Diego: base de datos e interfaz | Módulos `transactions` y `alerts`, rutas autenticadas y pantallas asociadas. |
| P0 | Ingesta y seguridad transaccional | HU-18 Ingresar movimientos externos; HU-19 Confirmar gasto por correo | Angie: backend e IA; Juan Diego: base de datos e interfaz de confirmación | Webhook con validación HMAC, protección de duplicados, tokens de confirmación y correo. |
| P1 | Presupuesto y ahorro | HU-21 Gestionar presupuestos; HU-22 Gestionar metas; HU-23 Registrar aportes | Angie: API; Juan Diego: datos e interfaz | Módulos `budgets`, `savings` y páginas de presupuesto/ahorro. |
| P1 | Consulta y recomendaciones | HU-24 Dashboard; HU-25 Marcar consejo leído; HU-26 Insights; HU-27 Analizar mensaje o enlace | Angie: backend/IA; Juan Diego: datos e interfaz | Módulos `dashboard`, `insights`; consumo de servicio IA con respaldo local para insights. |
| P1 | Reportes | HU-28 Resumen y desglose; HU-29 Reporte de movimientos | Angie: API; Juan Diego: consultas de datos e interfaz | Módulo `reports` y página de reportes. |
| P2 | Ubicación y dispositivos | HU-30 Mapa de movimientos; HU-31 Gestionar dispositivos | Angie: API; Juan Diego: datos e interfaz | Módulos `maps`, `devices` y páginas correspondientes. |
| P2 | Trazabilidad de actividad | HU-32 Consultar auditoría propia | Angie: API; Juan Diego: persistencia e interfaz | Módulo `audit`, consulta restringida al usuario autenticado. |
| P3 | Retención y archivo | HU-33 Preparar exportación; HU-34 Descargar CSV; HU-35 Purgar movimientos exportados | Angie: backend; Juan Diego: persistencia e integración de interfaz | Rutas de archivo en `transactions`, CSV y registro de exportación. |

## Inventario de historias

Los criterios de aceptación completos se mantienen en [Historias de usuario TriDa](../Historias-de-usuario-TriDa.md); se evita duplicarlos aquí.

| ID | Historia | Prioridad |
| --- | --- | --- |
| HU-01 | Registrar usuario | P0 |
| HU-02 | Verificar correo | P0 |
| HU-03 | Iniciar sesión | P0 |
| HU-04 | Cerrar sesión | P0 |
| HU-05 | Solicitar recuperación de contraseña | P0 |
| HU-06 | Validar token de recuperación | P0 |
| HU-07 | Restablecer contraseña | P0 |
| HU-08 | Cambiar contraseña autenticado | P0 |
| HU-09 | Consultar perfil propio | P0 |
| HU-10 | Actualizar perfil propio | P0 |
| HU-11 | Consultar patrón financiero | P0 |
| HU-12 | Gestionar cuentas financieras | P0 |
| HU-13 | Gestionar categorías | P0 |
| HU-14 | Consultar transacciones | P0 |
| HU-15 | Registrar transacción manual | P0 |
| HU-16 | Resolver movimiento pendiente | P0 |
| HU-17 | Categorizar transacción | P0 |
| HU-18 | Registrar movimientos recibidos automáticamente | P0 |
| HU-19 | Confirmar gasto desde correo | P0 |
| HU-20 | Consultar y resolver alertas | P0 |
| HU-21 | Gestionar presupuestos | P1 |
| HU-22 | Gestionar metas de ahorro | P1 |
| HU-23 | Aportar a una meta | P1 |
| HU-24 | Consultar dashboard | P1 |
| HU-25 | Marcar consejo como leído | P1 |
| HU-26 | Consultar insights | P1 |
| HU-27 | Analizar mensaje o enlace | P1 |
| HU-28 | Consultar resumen y desglose financiero | P1 |
| HU-29 | Consultar reporte de movimientos | P1 |
| HU-30 | Consultar mapa de movimientos | P2 |
| HU-31 | Gestionar dispositivos | P2 |
| HU-32 | Consultar auditoría propia | P2 |
| HU-33 | Preparar exportación anual | P3 |
| HU-34 | Descargar CSV anual | P3 |
| HU-35 | Purgar movimientos exportados | P3 |

## Dependencias principales

- Las historias de cuentas y categorías sustentan el registro y clasificación de transacciones.
- El flujo de movimientos habilita evaluación de riesgo, alertas, estadísticas, insights y reportes.
- La preparación y descarga del archivo preceden a la purga; la purga requiere una descarga previa.
- El desarrollo de interfaz depende de contratos estables de API y de los modelos de datos acordados.

## Priorización y refinamiento

Refinar en conjunto con el Product Owner antes de planificar: aclarar valor, criterios de aceptación, riesgos, dependencias, datos requeridos y prueba de aceptación. Mantener el Product Backlog ordenado; el Sprint Backlog se selecciona según capacidad real de ambos Developers, no solo por la prioridad de este documento.

## Registro de estado y estimación

No se recibieron estados históricos ni estimaciones por historia. Para evitar atribuir resultados a sprints sin evidencia, registrar por historia:

| Campo | Qué documentar |
| --- | --- |
| Estado | `Pendiente`, `En progreso`, `Implementación observable`, `Validada` o `Bloqueada`. |
| Puntos | Solo completar después de una sesión real de estimación; registrar los dos votos y el consenso. |
| Evidencia | Pull request/commit, prueba ejecutada, demo o aceptación verificable. |
| Responsable | Persona que toma la tarea; puede haber colaboración y revisores. |
| Sprint | Sprint realmente comprometido; no completar por inferencia de la presencia en código. |
