# Marco Scrum e informes de TriDa

## Product Goal

Entregar una aplicación para que clientes organicen sus finanzas, registren y consulten movimientos, identifiquen actividad de riesgo y reciban orientación financiera, manteniendo sus datos aislados por usuario. El flujo actual contempla movimientos manuales y eventos externos autorizados mediante webhook.

## Periodo y reconstrucción

El equipo sitúa el trabajo entre el **1 de octubre y el 25 de noviembre de 2026** y solicita organizarlo en cuatro sprints quincenales. Los informes de sprint son una **reconstrucción retrospectiva basada en el alcance del código**, no minutas ni evidencia de que esas ceremonias, compromisos o fechas ocurrieran exactamente así.

La revisión del historial Git disponible muestra cambios fechados el 25 de noviembre de 2026, pero no evidencia de commits entre el 1 de octubre y el 24 de noviembre. Esto no demuestra que no hubiera trabajo; significa que el repositorio no permite reconstruir por sí solo el progreso diario, entregas o fechas de cada historia. El cambio de enfoque de bancos a clientes fue informado por el equipo; su fecha exacta no consta.

## Equipo y responsabilidades informadas

| Persona | Responsabilidad Scrum | Área de desarrollo informada |
| --- | --- | --- |
| Angie Bueno | Product Owner y Developer | Prioridad/valor del producto, backend y modelo IA. |
| Juan Diego Morales | Scrum Master y Developer | Facilitación del proceso, base de datos y frontend. |

Es un equipo de dos personas con responsabilidades combinadas. Para decisiones de alcance, Angie confirma el valor/prioridad como Product Owner; para estimaciones, Angie y Juan Diego participan como Developers y registran sus votos antes de discutirlos.

## Cadencia propuesta

- Sprint de dos semanas, con objetivo único y Sprint Backlog acordado al inicio.
- Sprint Planning: definir por qué el sprint es valioso, qué trabajo cabe según capacidad real y cómo se construirá.
- Daily Scrum: revisar avance hacia el Sprint Goal, plan del día y bloqueos.
- Sprint Review: mostrar el incremento ejecutable y recoger comentarios del Product Owner.
- Sprint Retrospective: acordar una mejora pequeña, observable y verificable para el siguiente sprint.

Esta cadencia es una propuesta para formalizar el proceso; no afirma que las ceremonias se hayan realizado históricamente.

## Definition of Done propuesta

Una historia solo se considera terminada cuando:

1. Cumple sus criterios de aceptación y reglas de negocio.
2. Backend, persistencia e interfaz necesarios están integrados.
3. Las validaciones de propiedad del usuario y errores relevantes están cubiertas.
4. Las pruebas aplicables pasan y existe evidencia reproducible.
5. La documentación relacionada y los contratos API quedan actualizados.
6. El incremento puede demostrarse sin depender de datos o servicios no declarados.

La presencia de código no basta por sí sola para declarar una historia aceptada.

## Paquete de informes

- [Product Backlog](./product-backlog.md): orden propuesto, dependencias, responsables sugeridos y estado de evidencia de las 35 historias.
- [Registro de decisiones](./decision-log.md): separa hechos informados, decisiones inferidas y evidencia.
- [Planning Poker](./planning-poker.md): protocolo y registro para estimaciones, sin votos fabricados.
- [Sprint 1](./sprint-01.md): reorientación, base de datos y capacidades de cuenta.
- [Sprint 2](./sprint-02.md): transacciones, riesgo y alertas.
- [Sprint 3](./sprint-03.md): finanzas personales, dashboard, IA y reportes.
- [Sprint 4](./sprint-04.md): mapa, dispositivos, auditoría, archivo y estabilización.

## Trazabilidad del producto

- [Historias de usuario](../Historias-de-usuario-TriDa.md)
- [Requisitos funcionales](../RF01-24.md)
- [Requisitos no funcionales](../RNF01-14.md)
- [Índice de modelado](../Indice-modelado-TriDa.md)
- API: `backend/src/modules/` y `backend/src/app.ts`
- Datos: `backend/prisma/schema.prisma` y `database/schema.sql`
- Servicio IA: `modulo-ia/`

## Reglas de integridad del informe

- `Confirmado por el equipo`: dato proporcionado directamente por Angie o Juan Diego.
- `Evidencia actual`: existe código o documentación relacionada; no implica que se completara en una fecha concreta.
- `Propuesta`: organización para hacer el proceso legible; debe aprobarse antes de tratarla como plan ejecutado.
- `Sin registro`: no hay fuente para afirmar el dato.

Si aparece evidencia original (tablero, actas, issues, tareas o estimaciones), actualizar el informe con fuente y fecha; conservar como reconstrucción cualquier dato que no se pueda verificar.
