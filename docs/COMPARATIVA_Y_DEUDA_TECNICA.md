# COMPARATIVA DE BACKENDS Y DEUDA TÉCNICA — TRIDA v2.0

## 1. Reflexión Comparativa de los 4 Enfoques de Backend

| Dimensión técnica | 1. PHP (Laravel / MVC) | 2. Java (Spring Boot) | 3. Python (FastAPI / Flask) | 4. Node.js + Express + TypeScript (Núcleo TriDa) |
| :--- | :--- | :--- | :--- | :--- |
| **Modelo de ejecución y tipado** | Síncrono por petición; tipado gradual (PHP 8+). | Multihilo empresarial; tipado estático fuerte con alta verbosidad. | Dinámico con validación por *type hints* (Pydantic en FastAPI). | Asíncrono orientado a eventos; tipado estático estricto en compilación con TypeScript. |
| **Concurrencia e I/O** | Requiere extensiones externas (Octane/Swoole) para alta concurrencia. | Alta capacidad de carga, pero mayor consumo de RAM y tiempo de arranque. | Muy eficiente en cómputo numérico e inferencia estadística. | Alto rendimiento en operaciones I/O no bloqueantes (API REST, JSONB, chat) con bajo consumo de memoria. |
| **Ecosistema y contratos API** | Eloquent ORM maduro; OpenAPI requiere paquetes de terceros. | JPA/Hibernate robusto; configuración extensa de DTOs y seguridad. | SQLAlchemy; generación automática de OpenAPI en FastAPI. | Prisma ORM con migraciones tipadas + Zod para validación sincronizada con OpenAPI 3.0. |
| **Decisión en TriDa** | Descartado por menor agilidad al integrar pipelines de Machine Learning en tiempo real. | Descartado por sobreingeniería frente al alcance de un copiloto financiero ligero. | **Adoptado como microservicio satélite** (`modulo-ia`) para ejecutar el modelo **Random Forest**. | **Adoptado como núcleo principal**: unifica el lenguaje con React/TypeScript, valida contratos estrictos y orquesta la arquitectura híbrida sin bloqueos. |

**Síntesis arquitectónica:** TriDa implementa una **arquitectura híbrida** que combina **Node.js + Express + TypeScript** como puerta de enlace transaccional de baja latencia y **Python** como servicio especializado de inferencia estadística (*Random Forest*), respaldado por reglas deterministas locales para mantener continuidad operativa.

## 2. Matriz de Deuda Técnica Documentada y Priorizada

| ID | Deuda técnica identificada | Módulo afectado | Prioridad | Impacto / Riesgo técnico | Plan de mitigación |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **DT-01** | **Almacenamiento en memoria del *Rate Limiter*:** El conteo de intentos fallidos reside en la memoria local del proceso Node. | Seguridad / Auth (`rateLimit`) | **Alta** | Al escalar a múltiples instancias o reiniciar el servicio, los contadores de bloqueo se reinician. | Migrar el almacén de contadores a una instancia compartida de **Redis**. |
| **DT-02** | **Clasificador del asistente basado en reglas regex:** `insights.service.ts` resuelve intenciones mediante expresiones regulares multi-etapa. | Asistente **TriDa IA** | **Media** | Aunque soporta consultas compuestas y errores ortográficos frecuentes, preguntas muy abiertas pueden caer en respuesta genérica. | Incorporar búsqueda semántica ligera (*embeddings* locales) manteniendo los datos reales de PostgreSQL como contexto (*RAG*). |
| **DT-03** | **Reentrenamiento estático del modelo Random Forest:** El clasificador de anomalías en Python no se recalibra automáticamente con nuevos eventos. | Microservicio IA (`modulo-ia`) | **Media** | Posible degradación progresiva (*concept drift*) ante cambios en los hábitos financieros del usuario. | Automatizar un *job* periódico de reentrenamiento usando las alertas marcadas como `CONFIRMADA` o `RECHADA`. |
| **DT-04** | **Ausencia de pruebas E2E automatizadas en Frontend:** Las 40 pruebas automatizadas cubren backend y contratos OpenAPI, mientras UI se verifica manualmente. | Frontend React | **Baja** | Cambios futuros en componentes visuales podrían introducir regresiones silenciosas. | Añadir pruebas de componentes con Vitest + Testing Library y flujo crítico E2E con Playwright. |
