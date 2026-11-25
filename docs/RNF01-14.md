<!--
  ¿Qué? Requisito no funcional que establece los tiempos máximos de 
  procesamiento para la ingesta de eventos y el cálculo del score de riesgo.
  ¿Para qué? Garantizar que el análisis de transacciones y notificaciones 
  ocurra en tiempo real sin retrasar la experiencia del usuario.
  ¿Impacto? Si el análisis es lento, las alertas preventivas llegarían 
  después de que el usuario ya haya caído en una estafa o confirmado un pago.
-->

# RNF-001 — Rendimiento de Ingesta y Cálculo de Score en Tiempo Real

**Requisitos funcionales relacionados:** RF-001, RF-002, RF-003

## Descripción

El pipeline de procesamiento en tiempo real (ingesta, normalización, 
enriquecimiento contextual y cálculo del score de riesgo con IA) debe 
ejecutarse con una latencia máxima de 500 milisegundos por evento en el 
percentil 95 (p95) bajo condiciones normales de operación.

---

## Métricas y Criterios de Aceptación

| Métrica | Objetivo / Umbral | Método de Verificación |
|---------|-------------------|------------------------|
| Latencia de ingesta y normalización | ≤ 150 ms | Logs de telemetría del backend |
| Latencia de enriquecimiento contextual | ≤ 150 ms | Pruebas de carga y APM |
| Latencia total hasta cálculo de score | < 500 ms (p95) | Pruebas de rendimiento (k6 / JMeter) |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-001 | El tiempo total desde la recepción del evento hasta la emisión del score no debe superar los 500 ms en el 95 % de las peticiones. |
| RT-002 | Las consultas al perfil histórico del usuario deben estar indexadas en PostgreSQL para resolverse en menos de 50 ms. |
| RT-003 | El procesamiento de eventos debe ejecutarse de forma asíncrona para no bloquear el hilo principal de la interfaz de usuario. |

<!--
  ¿Qué? Requisito no funcional que define los tiempos de respuesta para la 
  verificación de sitios web y la generación de planes personalizados con IA.
  ¿Para qué? Asegurar fluidez cuando el usuario consulta un enlace sospechoso 
  o solicita la generación/actualización de su Plan de Protección y Ahorro.
  ¿Impacto? Tiempos de espera prolongados desincentivan que el usuario 
  verifique enlaces antes de abrirlos.
-->

# RNF-002 — Tiempos de Respuesta de Verificación Web y Planes de IA

**Requisitos funcionales relacionados:** RF-005, RF-012, RF-013, RF-015

## Descripción

Las operaciones analíticas bajo demanda deben ofrecer tiempos de respuesta 
ágiles: la verificación de seguridad de una URL o sitio web debe completarse 
en un máximo de 2 segundos, mientras que la generación o recalibración 
integral de los planes personalizados de Protección y Ahorro con IA debe 
resolverse en menos de 5 segundos.

---

## Métricas y Criterios de Aceptación

| Operación | Tiempo Máximo Esperado | Comportamiento en Interfaz |
|-----------|------------------------|----------------------------|
| Verificación de sitio web / URL | ≤ 2,0 segundos | Indicador de progreso inmediato |
| Generación de Plan de Protección / Ahorro | ≤ 5,0 segundos | Renderizado progresivo o skeleton UI |
| Carga del Reporte Mensual del Guardián | ≤ 1,5 segundos | Datos precalculados al cierre de ciclo |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-004 | El análisis de seguridad de URLs debe implementar caché temporal (TTL configurable) para dominios ya verificados recientemente. |
| RT-005 | La generación de planes con IA debe contar con un timeout máximo de 8 segundos y manejo controlado de reintentos. |
| RT-006 | Los indicadores del Reporte Mensual del Guardián deben consolidarse de forma incremental para evitar consultas pesadas en tiempo real. |

<!--
  ¿Qué? Requisito no funcional que garantiza la entrega oportuna de alertas 
  cuando se activa el protocolo de Escudo Crítico (> 95 %).
  ¿Para qué? Asegurar que las advertencias de estafa inminente o phishing 
  lleguen al usuario en segundos por todos los canales disponibles.
  ¿Impacto? La ventana de oportunidad para detener una transferencia fraudulenta 
  o el robo de credenciales es de pocos segundos.
-->

# RNF-003 — Oportunidad y Latencia de Notificaciones Críticas

**Requisitos funcionales relacionados:** RF-008, RF-009

## Descripción

Cuando el sistema detecte una amenaza con score superior al 95 % y active 
el protocolo de Escudo Crítico, el despacho multicanal (notificación push, 
correo electrónico y SMS) debe iniciarse de forma inmediata, garantizando 
la entrega al proveedor de mensajería en un tiempo máximo de 30 segundos.

---

## Métricas y Criterios de Aceptación

| Nivel de Alerta | Canal | Tiempo Máximo de Despacho |
|-----------------|-------|---------------------------|
| Medio (50–79 %) | Push en app | ≤ 10 segundos |
| Alto (80–95 %) | Push + Correo | ≤ 15 segundos |
| Crítico (> 95 %) | Push + Correo + SMS simultáneo | ≤ 30 segundos |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-007 | Las notificaciones de Escudo Crítico deben procesarse en una cola de alta prioridad independiente de las notificaciones informativas. |
| RT-008 | El despacho multicanal debe ejecutarse en paralelo para evitar que el fallo o latencia de un canal retrase a los demás. |

<!--
  ¿Qué? Requisito no funcional que establece los estándares criptográficos 
  para proteger la información financiera, crediticia y personal del usuario.
  ¿Para qué? Evitar la interceptación o exposición de datos sensibles tanto 
  en la red como en el almacenamiento persistente.
  ¿Impacto? Como Guardián financiero, una brecha de confidencialidad destruiría 
  la confianza del usuario y expondría su patrimonio.
-->

# RNF-004 — Cifrado de Datos en Tránsito y en Reposo

**Requisitos funcionales relacionados:** RF-001, RF-011, RF-022

## Descripción

Toda comunicación entre el cliente web/móvil, el backend de TriDa y los 
servicios externos debe viajar cifrada mediante HTTPS con protocolo TLS 1.3. 
En reposo, los datos financieros sensibles, historiales crediticios, tokens 
de vinculación de cuentas y registros de notificaciones deben almacenarse 
cifrados utilizando el estándar AES-256.

---

## Métricas y Criterios de Aceptación

| Capa | Estándar Obligatorio | Alcance |
|------|----------------------|---------|
| Comunicación en red | HTTPS / TLS 1.3 | 100 % de endpoints y webhooks |
| Almacenamiento en base de datos | AES-256 | Tokens, cuentas vinculadas, datos crediticios |
| Credenciales de acceso | Argon2id o bcrypt (coste ≥ 12) | 100 % de contraseñas de usuarios |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-009 | Se prohíbe cualquier comunicación HTTP sin cifrar; toda petición insegura debe redirigirse o rechazarse automáticamente. |
| RT-010 | Las llaves de cifrado y secretos de aplicación deben gestionarse mediante variables de entorno seguras o gestores de secretos, nunca en el código fuente. |
| RT-011 | Los tokens de vinculación financiera deben cifrarse a nivel de campo antes de persistirse en PostgreSQL. |

<!--
  ¿Qué? Requisito no funcional que define los controles de identidad, 
  gestión de sesiones y principio de mínimo privilegio.
  ¿Para qué? Asegurar que solo el titular pueda acceder a su información 
  y que TriDa nunca almacene contraseñas bancarias del usuario.
  ¿Impacto? Reduce drásticamente el riesgo de suplantación de cuenta y 
  limita el impacto ante un eventual compromiso de credenciales.
-->

# RNF-005 — Autenticación Robusta y Principio de Mínimo Privilegio

**Requisitos funcionales relacionados:** RF-001, RF-023, RF-024

## Descripción

El sistema debe implementar autenticación basada en tokens JWT firmados 
de corta duración con rotación de refresh tokens, soporte para MFA (TOTP) 
y control de acceso estricto por propiedad de recurso (un usuario solo puede 
consultar sus propios datos). Asimismo, bajo el principio de mínimo privilegio, 
TriDa nunca solicitará ni almacenará contraseñas de banca en línea del usuario.

---

## Métricas y Criterios de Aceptación

| Control de Seguridad | Especificación |
|----------------------|----------------|
| Expiración de Access Token (JWT) | ≤ 15 minutos (con Refresh Token seguro) |
| Protección contra fuerza bruta | Bloqueo temporal tras 5 intentos fallidos |
| Acceso a cuentas bancarias | Exclusivamente lectura vía tokens revocables / notificaciones |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-012 | Ningún endpoint debe permitir acceso a datos de otro usuario mediante manipulación de identificadores (prevención de IDOR). |
| RT-013 | TriDa tiene estrictamente prohibido solicitar, procesar o almacenar claves transaccionales o contraseñas bancarias de los usuarios. |
| RT-014 | Los tokens JWT deben transmitirse mediante cabeceras Authorization Bearer o cookies HttpOnly + Secure + SameSite=Strict. |

<!--
  ¿Qué? Requisito no funcional que garantiza el cumplimiento legal de 
  protección de datos personales y privacidad por diseño.
  ¿Para qué? Asegurar que el tratamiento de datos financieros y notificaciones 
  cumpla la Ley 1581 de 2012 (Colombia) y lineamientos de ISO 27001.
  ¿Impacto? Garantiza la legalidad operativa del sistema y otorga al usuario 
  control soberano sobre su información personal.
-->

# RNF-006 — Privacidad por Diseño y Cumplimiento Normativo (Ley 1581)

**Requisitos funcionales relacionados:** RF-001, RF-022, RF-024

## Descripción

TriDa debe operar bajo el principio de privacidad por diseño en cumplimiento 
de la Ley 1581 de 2012 (Habeas Data en Colombia) y controles de seguridad de 
la información alineados con ISO 27001. Toda recolección de notificaciones o 
datos financieros requiere autorización explícita, y cualquier dato utilizado 
para mejorar o reentrenar los modelos globales de IA debe pasar previamente 
por un proceso irreversible de anonimización.

---

## Métricas y Criterios de Aceptación

| Aspecto Normativo | Criterio de Cumplimiento |
|-------------------|--------------------------|
| Consentimiento informado | Registro auditado antes de activar vinculación o lectura |
| Ejercicio de derechos ARCO | Ejecución automatizada desde el panel de privacidad en < 24 h |
| Anonimización para IA | 0 % de datos personales identificables (PII) en datasets de entrenamiento |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-015 | Antes de enviar contexto a proveedores externos de IA (como Gemini API), el Adapter debe enmascarar nombres, números de documento y números de cuenta. |
| RT-016 | Al ejecutar el derecho de Cancelación (eliminación de cuenta), los datos personales del usuario deben purgarse de forma definitiva e irreversible. |

<!--
  ¿Qué? Requisito no funcional que asegura la inmutabilidad y verificabilidad 
  de los registros críticos de seguridad del sistema.
  ¿Para qué? Evitar que eventos de acceso, alertas críticas o cambios de 
  privacidad puedan ser alterados o borrados sin dejar rastro.
  ¿Impacto? Provee evidencia confiable para el usuario y garantiza la 
  integridad forense de la bitácora del Guardián.
-->

# RNF-007 — Integridad e Inmutabilidad de Registros de Seguridad

**Requisitos funcionales relacionados:** RF-022, RF-024

## Descripción

Todos los eventos críticos de seguridad (inicios de sesión, activación de 
Escudo Crítico, desvinculación de cuentas, cambios de configuración y 
operaciones administrativas) deben almacenarse con una firma criptográfica 
(hash SHA-256 encadenado) que permita verificar que los registros no han 
sido alterados de forma no autorizada.

---

## Métricas y Criterios de Aceptación

| Propiedad | Especificación Técnica |
|-----------|------------------------|
| Algoritmo de integridad | SHA-256 sobre payload + marca temporal UTC |
| Permisos de escritura | Solo inserción (Append-Only); sin permisos de UPDATE/DELETE |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-017 | La tabla de bitácora de seguridad debe operar bajo política Append-Only a nivel de aplicación y base de datos. |
| RT-018 | Toda marca temporal en registros de auditoría debe almacenarse sincronizada en formato estándar ISO 8601 (UTC). |

<!--
  ¿Qué? Requisito no funcional que define la disponibilidad del servicio 
  y su capacidad de operar ante fallos de servicios externos.
  ¿Para qué? Evitar que una caída en la API de IA externa o en un servicio 
  de reputación web deje al usuario completamente desprotegido.
  ¿Impacto? Un guardián de seguridad debe mantenerse operativo de forma 
  continua y degradarse con elegancia ante fallos de terceros.
-->

# RNF-008 — Disponibilidad del Sistema y Tolerancia a Fallos

**Requisitos funcionales relacionados:** RF-002, RF-003, RF-005, RF-024

## Descripción

La plataforma TriDa debe garantizar una disponibilidad operativa mínima del 
99,5 % mensual. Ante fallos o lentitud en proveedores externos (Gemini API, 
servicios de geolocalización o listas de reputación web), el sistema debe 
aplicar patrones de resiliencia (Circuit Breaker y colas de reintento) y 
contar con reglas heurísticas locales de respaldo para no detener la 
protección básica del usuario.

---

## Métricas y Criterios de Aceptación

| Indicador | Objetivo |
|-----------|----------|
| Disponibilidad mensual (SLA) | ≥ 99,5 % (máximo ~3,6 horas de inactividad al mes) |
| Recuperación ante fallo de API externa | Degradación controlada con reglas heurísticas locales |
| Tasa de pérdida de eventos en cola | 0 % (persistencia en cola hasta procesamiento exitoso) |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-019 | La integración con proveedores de IA y reputación externa debe implementar el patrón Circuit Breaker con reintentos exponenciales. |
| RT-020 | Si el motor de IA externo no responde, el sistema debe aplicar reglas heurísticas locales para detectar amenazas críticas conocidas y encolar el evento para análisis completo posterior. |

<!--
  ¿Qué? Requisito no funcional que establece las políticas de copias de 
  seguridad y recuperación ante desastres.
  ¿Para qué? Proteger el historial financiero, los planes activos y las 
  configuraciones de los usuarios frente a fallos de infraestructura.
  ¿Impacto? Garantiza la continuidad del servicio y evita la pérdida de 
  información histórica de los usuarios.
-->

# RNF-009 — Respaldo Automático y Recuperación ante Desastres

**Requisitos funcionales relacionados:** RF-015, RF-022

## Descripción

La base de datos principal (PostgreSQL) debe contar con respaldos automáticos 
diarios cifrados y replicación de registros de transacciones (WAL), garantizando 
un Objetivo de Punto de Recuperación (RPO) máximo de 24 horas y un Objetivo de 
Tiempo de Recuperación (RTO) inferior a 2 horas ante fallos graves.

---

## Métricas y Criterios de Aceptación

| Parámetro | Umbral Establecido |
|-----------|--------------------|
| Frecuencia de respaldo completo | Cada 24 horas (automático y cifrado con AES-256) |
| RPO (Pérdida máxima de datos tolerable) | ≤ 24 horas (≤ 1 hora con archivado WAL) |
| RTO (Tiempo máximo de restauración) | ≤ 2 horas |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-021 | Todas las copias de seguridad deben almacenarse cifradas en una ubicación separada del servidor principal de producción. |
| RT-022 | Deben ejecutarse pruebas periódicas de restauración para verificar la integridad real de los respaldos. |

<!--
  ¿Qué? Requisito no funcional que define los criterios de experiencia de 
  usuario, diseño responsivo y claridad comunicativa.
  ¿Para qué? Asegurar que cualquier persona, sin conocimientos técnicos ni 
  financieros avanzados, entienda las alertas y planes del Guardián.
  ¿Impacto? Si la interfaz es compleja o alarmista, los usuarios ignorarán 
  las recomendaciones de seguridad y ahorro.
-->

# RNF-010 — Usabilidad, Diseño Responsivo y Baja Carga Cognitiva

**Requisitos funcionales relacionados:** RF-006, RF-012, RF-013, RF-016

## Descripción

La interfaz web de TriDa (construida con React, Vite y Tailwind CSS) debe ser 
completamente responsiva (adaptable a pantallas móviles desde 360 px hasta 
monitores de escritorio) y compatible con las últimas versiones de Chrome, 
Firefox, Edge y Safari. Toda explicación de riesgo o recomendación financiera 
debe redactarse en español claro, empático y accionable, permitiendo que un 
usuario nuevo comprenda su estado de protección y finanzas en menos de 2 minutos.

---

## Métricas y Criterios de Aceptación

| Criterio de UX | Objetivo |
|----------------|----------|
| Compatibilidad de resolución | Desde 360×800 px (móvil) hasta 1920×1080 px+ (escritorio) |
| Flujo de acciones principales | Máximo 2 clics para verificar URL o revisar una alerta |
| Comprensión de mensajes | Lenguaje cotidiano sin jerga técnica ni tono culpabilizador |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-023 | La interfaz debe seguir un enfoque Mobile-First dado que la mayoría de notificaciones y enlaces sospechosos se reciben en el teléfono. |
| RT-024 | Ningún mensaje de alerta o recomendación financiera puede emplear lenguaje técnico críptico ni responsabilizar al usuario por amenazas recibidas. |

<!--
  ¿Qué? Requisito no funcional que establece los estándares mínimos de 
  accesibilidad web de la aplicación.
  ¿Para qué? Garantizar que personas con dificultades visuales o motoras 
  puedan navegar el dashboard y distinguir alertas sin depender solo del color.
  ¿Impacto? Amplía la inclusión del producto y evita que alertas críticas 
  pasen desapercibidas por problemas de contraste o daltonismo.
-->

# RNF-011 — Accesibilidad Web (Estándar WCAG 2.1 Nivel AA)

**Requisitos funcionales relacionados:** RF-016, RF-017, RF-019

## Descripción

La aplicación web debe cumplir con las pautas de accesibilidad WCAG 2.1 en 
nivel AA, asegurando contraste mínimo de 4.5:1 en textos, navegación completa 
mediante teclado y acompañamiento de iconos y etiquetas textuales junto a 
los códigos de color (verde, amarillo, rojo) de las alertas.

---

## Métricas y Criterios de Aceptación

| Criterio WCAG | Estándar Mínimo |
|---------------|-----------------|
| Relación de contraste texto/fondo | ≥ 4.5:1 (texto normal) y ≥ 3:1 (texto grande/iconos) |
| Diferenciación de estados | Color + Icono + Etiqueta textual explícita |
| Navegación | 100 % operable mediante teclado con foco visible |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-025 | Las alertas de criticidad nunca deben depender exclusivamente del color (verde/amarillo/rojo); siempre deben incluir icono distintivo y etiqueta de nivel. |
| RT-026 | Todos los controles interactivos, formularios y gráficos deben contar con etiquetas semánticas ARIA descriptivas. |

<!--
  ¿Qué? Requisito no funcional que define los estándares de arquitectura, 
  desacoplamiento y mantenibilidad del código fuente.
  ¿Para qué? Facilitar la evolución de TriDa, el intercambio de modelos de IA 
  y el despliegue consistente en cualquier entorno.
  ¿Impacto? Reduce la deuda técnica y permite actualizar componentes de IA 
  o finanzas sin reescribir el núcleo del sistema.
-->

# RNF-012 — Arquitectura Modular, Desacoplamiento y Mantenibilidad

**Requisitos funcionales relacionados:** RF-003, RF-024

## Descripción

El sistema debe estructurarse bajo una arquitectura modular desacoplada 
con tipado estricto (TypeScript en backend/frontend y Python en servicios de 
ML), aplicando el patrón Adapter para las integraciones con proveedores de 
IA (Gemini API) y fuentes financieras. Todo el ecosistema debe estar 
empaquetado mediante contenedores Docker para garantizar despliegues 
reproducibles.

---

## Métricas y Criterios de Aceptación

| Aspecto de Calidad | Estándar |
|--------------------|----------|
| Desacoplamiento de IA | Uso obligatorio de interfaz/Adapter para cambio de proveedor |
| Empaquetado y despliegue | Contenedores Docker con configuración declarativa (`docker-compose`) |
| Calidad y pruebas | Cobertura de pruebas unitarias e integración ≥ 75 % en módulos críticos |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-027 | El núcleo de negocio de TriDa no debe depender directamente del SDK de un único proveedor de IA; toda llamada debe pasar por una interfaz Adapter. |
| RT-028 | El esquema de base de datos debe gestionarse mediante migraciones versionadas con Prisma ORM. |

<!--
  ¿Qué? Requisito no funcional que define la capacidad de crecimiento del 
  sistema ante el aumento de usuarios y eventos simultáneos.
  ¿Para qué? Asegurar que TriDa mantenga su latencia (< 500 ms) cuando 
  múltiples usuarios reciban notificaciones o consulten planes a la vez.
  ¿Impacto? Permite que la plataforma crezca de un entorno de pruebas a 
  miles de usuarios activos sin cuellos de botella.
-->

# RNF-013 — Escalabilidad Horizontal y Procesamiento Concurrente

**Requisitos funcionales relacionados:** RF-001, RF-003, RF-007

## Descripción

Los servicios del backend y el motor de análisis deben diseñarse sin estado 
(stateless) para permitir escalabilidad horizontal mediante réplicas de 
contenedores. El sistema debe soportar al menos 500 eventos concurrentes por 
segundo manteniendo el tiempo de respuesta de análisis por debajo de 500 ms.

---

## Métricas y Criterios de Aceptación

| Parámetro de Carga | Capacidad Objetivo |
|--------------------|--------------------|
| Concurrencia de eventos | ≥ 500 eventos/segundo sin degradación > 10 % |
| Arquitectura de servicios | Stateless (estado de sesión en JWT / caché distribuida) |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-029 | Los servicios API del backend deben ser stateless para permitir el balanceo de carga entre múltiples instancias. |
| RT-030 | Las tareas intensivas como la generación de reportes mensuales masivos o reentrenamiento de IA deben ejecutarse en workers asíncronos separados de la API principal. |

<!--
  ¿Qué? Requisito no funcional que define los estándares de comunicación 
  externa y portabilidad de datos del usuario.
  ¿Para qué? Facilitar la integración con fuentes de notificaciones/cuentas 
  y permitir que el usuario exporte su información en formatos abiertos.
  ¿Impacto? Evita el encierro de datos (vendor lock-in) y asegura compatibilidad 
  con herramientas externas y dispositivos móviles o web.
-->

# RNF-014 — Interoperabilidad por APIs REST y Portabilidad de Datos

**Requisitos funcionales relacionados:** RF-001, RF-018, RF-020

## Descripción

Toda comunicación entre el frontend, aplicaciones clientes y servicios 
externos debe realizarse mediante APIs RESTful estandarizadas con intercambio 
de datos en formato JSON (UTF-8) y documentación OpenAPI/Swagger. Asimismo, 
la exportación de reportes e historiales del usuario debe generarse en 
formatos abiertos estándar (PDF, XLSX y CSV).

---

## Métricas y Criterios de Aceptación

| Estándar | Especificación |
|----------|----------------|
| Protocolo e intercambio | RESTful API sobre HTTPS con payloads JSON UTF-8 |
| Documentación de contratos | Especificación OpenAPI 3.0 actualizada |
| Formatos de exportación | PDF (ISO 32000), XLSX y CSV (RFC 4180) |

---

## Reglas Técnicas

| ID | Regla |
|----|-------|
| RT-031 | Todos los endpoints REST deben versionarse explícitamente en su ruta (ej: `/api/v1/...`) para garantizar retrocompatibilidad. |
| RT-032 | Los archivos CSV y XLSX exportados deben utilizar codificación UTF-8 con BOM para preservar tildes y caracteres del español al abrirse en hojas de cálculo. |

