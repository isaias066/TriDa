# Reporte de ejecución y defectos

**Fecha de corte:** 25 de noviembre de 2026  
**Alcance:** validaciones automatizadas y hallazgos reproducibles en el código actual de frontend, backend y servicio IA.

## Resumen ejecutivo

- **92 pruebas automatizadas aprobadas en la ejecución registrada:** 40 de backend y 52 de frontend.
- Type-check, lint y builds de backend y frontend aprobados con la configuración requerida.
- Se registró **un hallazgo de severidad baja**, relacionado con un parámetro sin uso; no afecta el comportamiento de la aplicación.
- La suite de integración quedó **bloqueada** por falta de `TEST_DATABASE_URL`; por ello, no se verificaron en esa ejecución la idempotencia real del webhook ni la purga transaccional.
- No existe suite automatizada de Python y no se midió cobertura; el parseo sintáctico no sustituye pruebas de comportamiento.
- No se reprodujeron defectos funcionales en las pruebas ejecutadas. Esto no equivale a una garantía de ausencia de defectos fuera de su cobertura.

## Registro de defectos

| ID | Hallazgo | Severidad | Estado | Evidencia e impacto |
| --- | --- | --- | --- | --- |
| DEF-001 | El parámetro `res` no se utiliza en el middleware `requireRoles`. | Baja | Abierto | El chequeo adicional de TypeScript con `--noUnusedParameters` lo reporta como `TS6133` en [`auth.middleware.ts`](../backend/src/middlewares/auth.middleware.ts#L90). No afecta las solicitudes; la posición del parámetro permite que `next` siga siendo el tercer argumento de Express. Puede renombrarse a `_res` para declarar explícitamente que no se usa. |

## Observaciones no clasificadas como defectos

| ID | Observación | Severidad | Estado | Evidencia |
| --- | --- | --- | --- | --- |
| OBS-001 | El bundle de `InteractiveExpenseMap` supera el umbral de tamaño de Vite. | Baja | Monitorear | El build reportó **1,083.10 kB** minificados frente al umbral de 500 kB. El componente se carga con `lazy()` desde [`MapPage.tsx`](../frontend/src/pages/MapPage.tsx), por lo que corresponde al flujo del mapa y no necesariamente a la carga inicial. |
| OBS-002 | El build de producción necesita `VITE_API_BASE_URL` configurada. | Informativa | Requiere configuración | Sin la variable, Vite aborta por diseño. El build se completó al definir una URL HTTPS de prueba; para despliegue se debe proporcionar la URL pública real. |

## Ejecución de validaciones

| Validación | Resultado | Detalle |
| --- | --- | --- |
| `pnpm --filter trida-backend test` | Aprobada | 40 pruebas. Reejecutadas con `DATABASE_URL` y `JWT_SECRET` ficticios de prueba; no se conectó a una base de datos. |
| `pnpm --filter trida-frontend test` | Aprobada | 52 pruebas en 29 archivos. Reejecutadas; hubo avisos informativos de React Router sobre cambios futuros, sin fallos. |
| `pnpm --filter trida-backend typecheck` | Aprobada | `tsc --noEmit`. |
| `pnpm --filter trida-frontend type-check` | Aprobada | Type-check de aplicación y configuración Vite. |
| `pnpm --filter trida-backend lint` | Aprobada | Sin errores. |
| `pnpm --filter trida-frontend lint` | Aprobada | Sin errores. |
| `pnpm --filter trida-backend build` | Aprobada | Generación de Prisma y compilación TypeScript. |
| `pnpm --filter trida-frontend build` | Aprobada con observación | Requirió `VITE_API_BASE_URL`; Vite informó el tamaño elevado del bundle del mapa. |
| Parseo sintáctico de `modulo-ia/api.py`, `risk_engine.py` y `train_model.py` | Aprobado | No se configuró un suite de pruebas automatizadas de Python. |
| `pnpm --filter trida-backend test:integration` | Bloqueado | Requiere `TEST_DATABASE_URL` apuntando a una base PostgreSQL exclusiva de pruebas; no estaba configurada. La idempotencia del webhook y la purga quedan sin validar por integración. |
| Chequeo adicional de declaraciones sin uso en backend | 1 hallazgo | `tsc --noEmit --noUnusedLocals --noUnusedParameters`; detectó DEF-001. No forma parte del script estándar `typecheck`. |

## Contexto y cobertura

| Dato | Valor |
| --- | --- |
| Commit de la ejecución originalmente registrada | No quedó capturado en la evidencia original. |
| Reejecución de las suites frontend/backend | 25 de noviembre de 2026, sobre `HEAD` `ec460ea`; 52 pruebas frontend y 40 backend aprobadas. |
| Versiones de la reejecución | Node.js `v24.20.0` y pnpm `12.11.2`. Python `3.14.7` fue observada en el entorno, pero no se ejecutó una suite Python. |
| Cobertura de código | No medida; los comandos registrados no generaron un informe de cobertura. |
| Pruebas de Python | No hay suite automatizada documentada; solo se reporta parseo sintáctico. |

## Riesgos de validación pendientes

| Riesgo | Impacto | Seguimiento |
| --- | --- | --- |
| Integración PostgreSQL no ejecutada | No hay evidencia de extremo a extremo para deduplicación del webhook ni para atomicidad de la purga anual. | Configurar una base exclusiva con `TEST_DATABASE_URL` y ejecutar `pnpm --filter trida-backend test:integration`. |
| Sin pruebas de comportamiento de Python | El parseo no verifica resultados, errores ni interacción HTTP del servicio IA. | Añadir y ejecutar pruebas del servicio Python antes de considerar cubierto ese componente. |

## Criterios de seguimiento

- **Crítica:** caída general, pérdida de datos o exposición grave; corregir de inmediato.
- **Alta:** flujo esencial roto o impacto amplio; priorizar para la siguiente entrega.
- **Media:** flujo parcial o impacto limitado con alternativa; planificar corrección.
- **Baja:** impacto menor, deuda técnica o limpieza sin bloqueo funcional.
- **Informativa:** dato de contexto que no representa un defecto ni requiere acción correctiva por sí solo.
- **Requiere configuración:** validación o build que solo puede completarse al proporcionar una variable/servicio requerido.
- **Abierto:** hallazgo reproducible pendiente de corregir.
- **Bloqueado:** validación o corrección impedida por una dependencia o entorno faltante.
- **Monitorear:** observación que requiere medición antes de decidir una corrección.
- **Aprobada con observación:** validación completada con una advertencia no bloqueante.
- **Hallazgo:** defecto u observación identificada; cuando se indica un número, es el conteo, no un estado de ejecución.

Los enlaces a fuentes de código son relativos a la ubicación de este archivo bajo `docs/`. Los requisitos documentales que aún no estén implementados no se registran aquí como defectos del código. Actualizar los resultados y su contexto después de repetir las validaciones.
