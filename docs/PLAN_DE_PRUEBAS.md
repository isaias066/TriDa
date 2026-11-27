# Plan de Pruebas — Sistema TriDa

## 1. Objetivo y Alcance
Establecer la estrategia de verificación de calidad del sistema **TriDa** antes de su despliegue, asegurando que el cálculo financiero, la detección pasiva de fraude, los contratos de la API REST y la interfaz de usuario operen sin regresiones.

### Módulos dentro del alcance
* **Motor de Riesgo Conductual e IA Híbrida:** Evaluación de los 7 factores de riesgo, consistencia de umbrales entre TypeScript y SQL, y respaldo determinista ante caída del microservicio Python.
* **Core Financiero y Movimientos:** Precisión decimal en centavos, resolución de transacciones en estado `PENDIENTE` (`CONFIRMADA` / `RECHAZADA`), metas de ahorro y exportación CSV.
* **Seguridad y Control de Acceso:** Tokens firmados con expiración (15 min), invalidación al cambiar contraseña, *rate limiting* por usuario/correo y auditoría de intentos fallidos (retención de 90 días).
* **Contratos API y OpenAPI:** Cumplimiento de esquemas `snake_case`, manejo estandarizado de errores sin fuga de trazas internas y validación con Swagger Parser.
* **Frontend y Asistente TriDa IA:** Navegación, filtros globales por cuenta/periodo y respuestas multi-intención del widget conversacional.

### Fuera del alcance
* Pruebas de carga masiva distribuida (estrés > 10.000 usuarios concurrentes) y pasarelas bancarias externas reales (simuladas mediante eventos idempotentes).

---

## 2. Niveles de Prueba
1. **Pruebas Unitarias Automatizadas:** Validación aislada de reglas de negocio, validadores Zod, cálculo de riesgo y generación de tokens mediante el runner nativo de Node (`node --import tsx --test`).
2. **Pruebas de Integración y Contratos API:** Verificación de coherencia entre los esquemas del backend, el manejador global de errores y la especificación OpenAPI (`swagger-parser`).
3. **Pruebas de Sistema / UI (Funcionales):** Validación manual guiada sobre el flujo completo navegador → Express → PostgreSQL (registro de gastos atípicos, generación de alerta y consulta en TriDa IA).

---

## 3. Separación de Ambientes (Desarrollo vs. Pruebas)
Para evitar que las pruebas contaminen los registros financieros o disparen falsas alertas sobre los datos de trabajo, el proyecto mantiene entornos independientes:

* **Ambiente de Desarrollo (`development`):**
  * **Variables:** Configuradas en `backend/.env` y `frontend/.env` con puertos locales (`3000` y `5173`).
  * **Persistencia:** Instancia PostgreSQL de desarrollo inspeccionable mediante Prisma Studio.
  * **Comportamiento:** Recarga en caliente (`tsx watch`) y logs detallados para depuración.
* **Ambiente de Pruebas (`test`):**
  * **Variables:** Ejecución aislada con `NODE_ENV=test` mediante `npm test`.
  * **Persistencia:** Datos sintéticos controlados en memoria por cada caso de prueba; nunca modifica cuentas, saldos ni alertas de la base de datos de desarrollo.
  * **Comportamiento:** Validación estricta de sobres de error (ocultando *stack traces* internos) y contratos OpenAPI.
* **Ambiente Contenerizado (`docker`):**
  * **Orquestación:** Definida en `docker-compose.yml` con red interna aislada para validar el despliegue integrado de servicios.

---

## 4. Criterios de Entrada y Salida
* **Entrada:** Compilación limpia en TypeScript (`npx tsc --noEmit` sin errores) y variables de entorno configuradas.
* **Salida:** 100% de las pruebas unitarias y de contrato aprobadas (40/40) y validación estructural de OpenAPI exitosa.

