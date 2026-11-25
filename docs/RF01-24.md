<!--
  ¿Qué? Requisito funcional que describe la vinculación de cuentas y la 
  ingesta multicanal de notificaciones y movimientos del usuario.
  ¿Para qué? Definir cómo TriDa captura transacciones recibidas o enviadas, 
  notificaciones financieras (SMS, push, correo) y consultas de enlaces para 
  analizarlos en tiempo real.
  ¿Impacto? Es la puerta de entrada del Guardián: sin ingesta continua de 
  notificaciones y movimientos, la IA no tiene contexto para proteger al usuario.
-->

# RF-001 — Vinculación de Cuentas e Ingesta Multifuente en Tiempo Real

**Historias de usuario relacionadas:** HU-US-01, HU-PR-01

## Descripción

El sistema debe permitir al usuario vincular sus cuentas financieras y 
habilitar la lectura autorizada de notificaciones (push de apps bancarias, 
SMS financieros y correos de alerta), así como el envío manual o automático 
de enlaces sospechosos. Cada evento capturado será normalizado en un formato 
estándar unificado y enviado al módulo de enriquecimiento para su análisis 
inmediato por la IA.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario vincula sus cuentas o autoriza la lectura de notificaciones financieras en su dispositivo. |
| 2 | El módulo de ingesta captura en tiempo real cada movimiento (enviado o recibido), notificación SMS/push o enlace consultado. |
| 3 | Se valida la integridad y estructura del evento recibido; si falla, se registra el error y se reintenta la captura. |
| 4 | Se extraen los campos clave: tipo de evento (transacción, notificación, URL), monto, remitente/comercio, canal, fecha y hora. |
| 5 | Los datos extraídos se normalizan al esquema unificado de TriDa. |
| 6 | El evento normalizado se envía al módulo de enriquecimiento contextual (RF-002). |
| 7 | El evento queda registrado de forma cifrada en la bitácora del usuario (RF-022). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-001 | La captura de cuentas y notificaciones requiere consentimiento explícito y revocable del usuario (Ley 1581 de 2012). |
| RN-002 | El sistema debe soportar notificaciones de transacciones enviadas, recibidas, cobros programados, alertas SMS y enlaces externos. |
| RN-003 | Los campos mínimos obligatorios son: tipo de evento, origen/remitente, canal, fecha y hora (y monto/destino cuando aplique). |
| RN-004 | Todo evento debe normalizarse al formato estándar antes de pasar al motor de IA. |
| RN-005 | Las comunicaciones entre la app y el backend deben viajar cifradas bajo HTTPS/TLS 1.3. |
| RN-006 | El tiempo máximo de ingesta y normalización por evento no debe superar los 500 ms. |

<!--
  ¿Qué? Requisito funcional que describe el enriquecimiento automático 
  de cada evento financiero o de seguridad con el contexto personal del usuario.
  ¿Para qué? Agregar historial de gastos, hábitos crediticios, dispositivos 
  habituales e inteligencia de amenazas antes de consultar el modelo de IA.
  ¿Impacto? Sin contexto personalizado la IA evaluaría eventos aislados, 
  reduciendo su capacidad para detectar estafas dirigidas o fugas de dinero.
-->

# RF-002 — Enriquecimiento Contextual de Eventos y Perfil del Usuario

**Historias de usuario relacionadas:** HU-PR-02

## Descripción

El sistema debe enriquecer automáticamente cada transacción, notificación 
o enlace recibido consultando el historial financiero del usuario (gastos 
habituales, comercios frecuentes, obligaciones crediticias, horarios y 
dispositivos de confianza) junto con fuentes externas de reputación de 
dominios y reportes de estafas conocidas. Este contexto alimenta al modelo 
de IA para evaluar tanto el riesgo de fraude como el impacto financiero.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo recibe el evento normalizado desde RF-001. |
| 2 | Se consulta el historial de ingresos, gastos y categorías habituales del usuario. |
| 3 | Se consulta el estado crediticio actual y las obligaciones vigentes del usuario. |
| 4 | Se verifican los dispositivos registrados, ubicaciones habituales y frecuencia de movimientos. |
| 5 | Si el evento incluye remitentes, números o URLs, se consultan listas externas de reputación y phishing. |
| 6 | Se consolidan todos los atributos contextuales junto con el evento original. |
| 7 | El paquete enriquecido se envía al módulo de análisis con IA (RF-003). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-007 | Todo evento debe ser enriquecido con el contexto del usuario antes de ser evaluado por la IA. |
| RN-008 | El contexto interno incluye: historial transaccional, estado crediticio, dispositivos habituales y frecuencia de operaciones. |
| RN-009 | Las fuentes externas de reputación deben consultarse cuando el evento contenga enlaces, remitentes SMS o comercios nuevos. |
| RN-010 | Si una fuente externa no responde, el flujo continúa marcando el atributo como «reputación externa no verificada». |
| RN-011 | El enriquecimiento debe ejecutarse manteniendo la latencia total de procesamiento por debajo de 500 ms. |

<!--
  ¿Qué? Requisito funcional que describe el análisis inteligente con IA y 
  el cálculo del puntaje de riesgo o amenaza para cada evento del usuario.
  ¿Para qué? Evaluar transacciones, notificaciones y sitios web mediante 
  Machine Learning / IA generativa para determinar el nivel de peligro o anomalía.
  ¿Impacto? Es el cerebro analítico del Guardián: sin el score no se pueden 
  disparar alertas preventivas ni alimentar los planes personalizados.
-->

# RF-003 — Análisis Inteligente con IA y Cálculo de Score de Riesgo

**Historias de usuario relacionadas:** HU-PR-03

## Descripción

El sistema implementará un motor de IA que analizará cada evento enriquecido 
(transacción enviada/recibida, notificación bancaria/SMS o sitio web) y 
calculará un puntaje de riesgo del 0 % al 100 %, donde 0 % representa una 
operación o sitio completamente seguro y 100 % indica alta probabilidad de 
estafa, phishing o anomalía financiera crítica. El score se generará en 
menos de 500 milisegundos con precisión de un decimal (ej: 87,4 %).

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo de IA recibe el evento enriquecido desde RF-002. |
| 2 | El Adapter Pattern transforma los datos al formato requerido por el proveedor de IA (Gemini API / modelo ML). |
| 3 | El modelo contrasta el evento contra los hábitos del usuario y patrones conocidos de estafa o desbalance financiero. |
| 4 | Se calcula el score de riesgo entre 0 % y 100 % con un decimal. |
| 5 | El resultado se envía al módulo de explicabilidad en lenguaje natural (RF-006). |
| 6 | El score se envía al motor de alertas preventivas (RF-007) y al historial del Guardián. |
| 7 | El score queda almacenado en la base de datos vinculado al evento del usuario. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-012 | El score de riesgo debe expresarse como porcentaje con un decimal (ej: 87,4 %). |
| RN-013 | El rango del score va de 0 % (seguro/legítimo) a 100 % (amenaza crítica o estafa confirmada). |
| RN-014 | El cálculo del score debe completarse en menos de 500 milisegundos por evento. |
| RN-015 | La integración con el motor de IA se implementa mediante el Adapter Pattern para permitir cambiar de proveedor sin alterar el núcleo del sistema. |
| RN-016 | Si el servicio de IA presenta indisponibilidad temporal, el evento se encola como «pendiente de análisis» y se reintenta automáticamente. |
| RN-017 | El modelo debe mantener una tasa de detección de amenazas y anomalías superior al 90 %. |

<!--
  ¿Qué? Requisito funcional que describe la detección de intentos de estafa, 
  ingeniería social y anomalías en las cuentas del usuario.
  ¿Para qué? Identificar amenazas cotidianas como smishing, falsas notificaciones 
  bancarias, cobros no autorizados y gastos fuera de patrón.
  ¿Impacto? Protege directamente el patrimonio del usuario frente a fraudes 
  digitales y cargos silenciosos antes de que afecten su estabilidad financiera.
-->

# RF-004 — Detección de Intentos de Estafa, Phishing y Anomalías Financieras

**Historias de usuario relacionadas:** HU-US-02, HU-PR-04

## Descripción

El motor de IA debe identificar patrones de riesgo dirigidos al usuario, 
incluyendo: notificaciones falsas de entidades bancarias o mensajería (smishing), 
solicitudes urgentes de transferencia o validación de claves, cobros recurrentes 
ocultos, transacciones en horarios o ubicaciones inusuales, montos atípicos 
respecto al promedio mensual del usuario y múltiples intentos de cargo 
en intervalos cortos.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El modelo de IA analiza el contenido textual y metadatos del evento enriquecido. |
| 2 | Para notificaciones y mensajes, evalúa indicadores de ingeniería social, urgencia artificial y suplantación de identidad. |
| 3 | Para transacciones enviadas o recibidas, compara monto, comercio, horario y ubicación contra el patrón habitual del usuario. |
| 4 | Se detectan ráfagas de microcargos o débitos automáticos no reconocidos. |
| 5 | Cada hallazgo ponderado alimenta el cálculo del score de riesgo (RF-003) y el contador mensual de situaciones sospechosas (RF-015). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-018 | El modelo debe detectar suplantación de identidad bancaria y mensajes fraudulentos (phishing/smishing). |
| RN-019 | El modelo debe identificar movimientos con montos atípicos, horarios inusuales o comercios no habituales para el usuario. |
| RN-020 | El modelo debe detectar ráfagas de cobros seguidos y suscripciones o débitos recurrentes sospechosos. Para la regla de ráfaga, el tercer gasto del usuario en una ventana de 10 minutos suma 30 puntos de riesgo; se cuentan gastos pendientes, confirmados y aprobados, no rechazados. |
| RN-021 | Toda situación sospechosa detectada debe contabilizarse en el historial mensual de exposición al riesgo del usuario. |
| RN-022 | Cada patrón detectado debe traducirse a una explicación clara para el usuario (RF-006). |

<!--
  ¿Qué? Requisito funcional nuevo para analizar qué tan seguro es un sitio web 
  o enlace antes de que el usuario ingrese datos sensibles o realice pagos.
  ¿Para qué? Permitir que el usuario consulte cualquier URL o que TriDa analice 
  automáticamente enlaces contenidos en notificaciones sospechosas.
  ¿Impacto? Previene el robo de credenciales bancarias y estafas en comercios 
  electrónicos falsos mediante verificación proactiva.
-->

# RF-005 — Verificación de Seguridad de Sitios Web y Enlaces

**Historias de usuario relacionadas:** HU-US-03, HU-PR-05

## Descripción

El sistema debe permitir al usuario verificar qué tan seguro es un sitio web 
o enlace (ya sea pegando la URL manualmente en TriDa o extrayéndola 
automáticamente de una notificación/SMS). La IA evaluará el certificado SSL, 
antigüedad y reputación del dominio, similitud con sitios oficiales 
(typosquatting), redirecciones ocultas y señales de phishing, entregando un 
veredicto claro (Seguro, Precaución o Peligroso) con recomendaciones de acción.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario ingresa una URL en el verificador de TriDa o el sistema extrae un enlace desde una notificación capturada (RF-001). |
| 2 | El sistema normaliza la URL y resuelve posibles acortadores o redirecciones. |
| 3 | Se consultan metadatos técnicos: validez de certificado TLS/SSL, antigüedad del dominio y listas negras de phishing. |
| 4 | La IA analiza similitud visual/léxica con marcas o bancos conocidos (typosquatting) y estructura del dominio. |
| 5 | Se calcula el índice de seguridad del sitio (0 % a 100 %) y se clasifica como Seguro, Precaución o Peligroso. |
| 6 | Se muestra al usuario el diagnóstico detallado y se registra el análisis en su historial de protección. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-023 | El usuario debe poder consultar cualquier URL o dominio de forma ilimitada desde la interfaz de TriDa. |
| RN-024 | Todo enlace detectado dentro de una notificación financiera o SMS sospechoso debe analizarse automáticamente. |
| RN-025 | El análisis debe verificar certificado SSL, antigüedad del dominio, redirecciones y patrones de suplantación (typosquatting). |
| RN-026 | El resultado debe clasificarse en tres estados claros: Seguro (score < 30 %), Precaución (30–79 %) y Peligroso (≥ 80 %). |
| RN-027 | Si el sitio es clasificado como Peligroso, el sistema debe advertir explícitamente al usuario no ingresar contraseñas ni datos de tarjeta. |

<!--
  ¿Qué? Requisito funcional que describe la generación de explicaciones 
  cercanas y comprensibles para el usuario final.
  ¿Para qué? Traducir los resultados del score de riesgo, alertas de estafa 
  y diagnósticos financieros a lenguaje cotidiano sin tecnicismos complejos.
  ¿Impacto? Empodera al usuario para entender por qué algo es peligroso o 
  afecta sus finanzas, aumentando la confianza y adopción de las recomendaciones.
-->

# RF-006 — Explicabilidad en Lenguaje Natural para el Usuario

**Historias de usuario relacionadas:** HU-US-04, HU-PR-06

## Descripción

Por cada evaluación de riesgo, alerta de estafa, análisis de sitio web o 
hallazgo financiero, el sistema debe generar automáticamente una explicación 
clara, empática y en español cotidiano que detalle los motivos del resultado 
(ej: «Este enlace imita la dirección de tu banco pero fue creado hace 2 días» 
o «Este gasto supera en 300 % tu consumo habitual en entretenimiento»).

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo de explicabilidad recibe el score y las variables determinantes desde RF-003 o RF-005. |
| 2 | Se identifican los factores con mayor peso en la evaluación. |
| 3 | La IA redacta una explicación breve, directa y libre de jerga técnica en español. |
| 4 | Se adjunta una recomendación práctica inmediata (ej: «No hagas clic», «Verifica en tu app oficial»). |
| 5 | La explicación se almacena junto al evento y se presenta en la alerta y en el dashboard del usuario. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-028 | Todo score superior al 30 % o análisis de URL debe incluir una explicación legible generada automáticamente. |
| RN-029 | La explicación debe redactarse en español natural, evitando términos técnicos de Machine Learning. |
| RN-030 | Toda explicación de riesgo debe incluir al menos una acción preventiva concreta para el usuario. |
| RN-031 | El tono debe ser informativo, protector y nunca culpabilizar al usuario. |

<!--
  ¿Qué? Requisito funcional que describe la generación automática de alertas 
  preventivas categorizadas por nivel de riesgo para el usuario.
  ¿Para qué? Clasificar las amenazas y anomalías detectadas según su urgencia 
  para priorizar la atención del usuario.
  ¿Impacto? Evita la fatiga de notificaciones diferenciando entre avisos 
  informativos y peligros inminentes de estafa o pérdida de dinero.
-->

# RF-007 — Generación Automática de Alertas Preventivas por Nivel de Riesgo

**Historias de usuario relacionadas:** HU-US-05, HU-PR-07

## Descripción

El sistema generará alertas preventivas automáticas cuando un movimiento, 
notificación o enlace supere los umbrales de riesgo configurados. Las alertas 
se categorizarán en tres niveles: Bajo (30–49 %, aviso informativo), Medio 
(50–79 %, precaución recomendada) y Alto (80–95 %, riesgo elevado de estafa 
o cargo indebido). Cada alerta incluirá el detalle del evento, el score, la 
explicación en lenguaje natural y acciones rápidas para el usuario.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El motor de alertas recibe el score calculado desde RF-003 o RF-005. |
| 2 | Se compara el score con los umbrales del perfil del usuario (RF-021). |
| 3 | Si el score es inferior al 30 %, el evento se registra como seguro sin generar alerta. |
| 4 | Si el score está entre 30 % y 49 %, se genera una alerta de nivel Bajo. |
| 5 | Si el score está entre 50 % y 79 %, se genera una alerta de nivel Medio. |
| 6 | Si el score está entre 80 % y 95 %, se genera una alerta de nivel Alto. |
| 7 | La alerta se almacena en el historial de seguridad del usuario y dispara el canal de notificación correspondiente (RF-008). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-032 | Los umbrales base de alerta son: Bajo (30–49 %), Medio (50–79 %) y Alto (80–95 %). |
| RN-033 | Eventos con score inferior al 30 % no disparan alertas intrusivas. |
| RN-034 | Eventos con score superior al 95 % activan el protocolo de Escudo Crítico (RF-009). |
| RN-035 | Toda alerta generada debe almacenarse para alimentar el resumen mensual del Guardián (RF-015). |

<!--
  ¿Qué? Requisito funcional que describe el envío de alertas al usuario 
  a través de distintos canales según la gravedad de la amenaza.
  ¿Para qué? Garantizar que el usuario reciba advertencias oportunas sin 
  saturarlo con notificaciones innecesarias en eventos de bajo riesgo.
  ¿Impacto? Una alerta oportuna por el canal adecuado detiene al usuario 
  justo antes de caer en un enlace fraudulento o confirmar un pago sospechoso.
-->

# RF-008 — Notificaciones Multicanal al Usuario según Criticidad

**Historias de usuario relacionadas:** HU-US-06, HU-PR-08

## Descripción

El sistema debe notificar al usuario a través de distintos canales según 
el nivel de riesgo detectado: para nivel Bajo (30–49 %), notificación silenciosa 
en el centro de actividad de la app; para nivel Medio (50–79 %), notificación 
en app más notificación push inmediata; para nivel Alto (80–95 %), notificación 
push prioritaria más correo electrónico de advertencia. Para amenazas críticas 
(> 95 %), se activan todos los canales configurados de forma simultánea.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo de notificaciones recibe la alerta generada por RF-007. |
| 2 | Consulta las preferencias de contacto del usuario y la criticidad de la alerta. |
| 3 | Nivel Bajo (30–49 %): publica la alerta únicamente en el panel de TriDa. |
| 4 | Nivel Medio (50–79 %): publica en panel y envía notificación push al dispositivo. |
| 5 | Nivel Alto (80–95 %): envía notificación push prioritaria y correo electrónico. |
| 6 | Nivel Crítico (> 95 %): dispara push, correo electrónico y SMS de emergencia simultáneamente. |
| 7 | Registra el envío con canal, estado de entrega y marca temporal. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-036 | Nivel Bajo (30–49 %): registro visual en el dashboard de TriDa sin interrupción push. |
| RN-037 | Nivel Medio (50–79 %): dashboard + notificación push. |
| RN-038 | Nivel Alto (80–95 %): dashboard + notificación push + correo electrónico. |
| RN-039 | Amenaza Crítica (> 95 %): activación simultánea de todos los canales disponibles en menos de 30 segundos. |
| RN-040 | Al pulsar la notificación, el usuario debe aterrizar directamente en la vista detallada del incidente (RF-017). |

<!--
  ¿Qué? Requisito funcional que describe el protocolo de Escudo Crítico ante 
  amenazas severas con score superior al 95 %.
  ¿Para qué? Activar una intervención inmediata que advierta al usuario en 
  tiempo real y le brinde acciones rápidas de contención antes de que sufra 
  una pérdida económica o robo de credenciales.
  ¿Impacto? Transforma a TriDa de un monitor pasivo a un guardián preventivo 
  capaz de detener al usuario justo antes de confirmar una estafa crítica.
-->

# RF-009 — Protocolo de Escudo Crítico ante Amenazas Severas (> 95 %)

**Historias de usuario relacionadas:** HU-US-07, HU-PR-09

## Descripción

Cuando el motor de IA detecte un evento con score de riesgo superior al 
95 % (enlace de phishing activo, suplantación bancaria confirmada o intento 
de cargo altamente anómalo), el sistema activará automáticamente el protocolo 
de Escudo Crítico. Este desplegará una alerta prioritaria en pantalla, 
notificará por todos los canales disponibles en menos de 30 segundos y 
presentará una guía inmediata de contención (ej: bloquear tarjeta en su app 
bancaria, no ingresar claves, cambiar contraseña).

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El motor de alertas identifica un evento con score superior al 95 % (RF-007). |
| 2 | Se activa el modo Escudo Crítico en la cuenta del usuario. |
| 3 | Se disparan notificaciones simultáneas por push, correo electrónico y SMS (RF-008). |
| 4 | En la aplicación se muestra un aviso de alta prioridad con la explicación del peligro (RF-006). |
| 5 | Se despliega una lista de verificación de acciones inmediatas de contención para el usuario. |
| 6 | El evento queda marcado como amenaza crítica en el reporte mensual del Guardián (RF-015). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-041 | Todo evento con score superior al 95 % debe activar automáticamente el protocolo de Escudo Crítico. |
| RN-042 | La notificación crítica debe entregarse al usuario en un máximo de 30 segundos. |
| RN-043 | El aviso debe incluir pasos concretos e inmediatos de protección según el tipo de amenaza. |
| RN-044 | El mensaje debe mantener un tono protector, claro y no alarmista ni acusatorio. |
| RN-045 | El usuario debe poder marcar si evitó la amenaza o si autorizó la operación legítimamente (RF-017). |
| RN-046 | El umbral de Escudo Crítico (95 %) es ajustable desde la configuración del perfil o administración. |

<!--
  ¿Qué? Requisito funcional que describe el análisis inteligente de ingresos, 
  egresos y fugas de dinero del usuario.
  ¿Para qué? Clasificar automáticamente en qué se está yendo el dinero del 
  usuario a partir de sus cuentas vinculadas y notificaciones transaccionales.
  ¿Impacto? Proporciona visibilidad real sobre hábitos de consumo, gastos 
  hormiga y suscripciones silenciosas para fundamentar los planes de ahorro.
-->

# RF-010 — Análisis Inteligente de Gastos y Flujo de Dinero

**Historias de usuario relacionadas:** HU-US-08, HU-PR-10

## Descripción

El sistema debe analizar de forma continua todas las transacciones recibidas 
y enviadas capturadas en RF-001 para categorizar automáticamente en qué se 
está yendo el dinero del usuario (vivienda, alimentación, transporte, 
entretenimiento, suscripciones, compras impulsivas, transferencias). La IA 
identificará patrones de fuga de capital, gastos hormiga recurrentes y 
variaciones porcentuales respecto a meses anteriores.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo financiero recopila los movimientos normalizados (ingresos y egresos) del usuario. |
| 2 | La IA clasifica cada movimiento en categorías de gasto e ingreso. |
| 3 | Se calculan totales, porcentajes de participación por categoría y balance neto del período. |
| 4 | El motor detecta gastos hormiga acumulados, suscripciones recurrentes y picos de consumo atípicos. |
| 5 | Se compara el comportamiento actual contra el promedio histórico de los últimos meses. |
| 6 | Los resultados alimentan el Dashboard (RF-016) y el generador de Plan de Ahorro (RF-013). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-047 | Todo movimiento financiero capturado debe clasificarse automáticamente en una categoría de ingreso o gasto. |
| RN-048 | El usuario debe poder recategorizar manualmente un gasto, haciendo que la IA aprenda dicha preferencia. |
| RN-049 | El sistema debe identificar y agrupar gastos hormiga y cobros recurrentes o suscripciones. |
| RN-050 | El análisis debe calcular la relación ingresos vs. egresos en tiempo real. |
| RN-051 | Las fugas de dinero detectadas deben enviarse como insumo al motor de Plan de Ahorro (RF-013). |
| RN-052 | El historial categorizado debe estar disponible para consulta por períodos (semanal, mensual, trimestral). |

<!--
  ¿Qué? Requisito funcional que describe el análisis y diagnóstico de la 
  vida crediticia y salud de endeudamiento del usuario.
  ¿Para qué? Evaluar el comportamiento de pagos, nivel de endeudamiento y 
  obligaciones financieras para prevenir sobreendeudamiento y mejorar el perfil crediticio.
  ¿Impacto? Convierte los datos de cuentas y notificaciones de cobro en un 
  diagnóstico crediticio accionable que protege la estabilidad financiera del usuario.
-->

# RF-011 — Evaluación y Monitoreo de Vida Crediticia

**Historias de usuario relacionadas:** HU-US-09, HU-PR-11

## Descripción

El sistema debe analizar la vida crediticia y capacidad de endeudamiento 
del usuario a partir de sus cuentas vinculadas, historial de pagos de 
obligaciones, uso de cupos de crédito y notificaciones de vencimiento. La IA 
calculará un índice interno de salud crediticia, detectará riesgos de mora 
o sobreendeudamiento y explicará qué factores están fortaleciendo o 
afectando su perfil financiero.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El módulo crediticio extrae obligaciones, pagos de cuotas, extractos y alertas de vencimiento del usuario. |
| 2 | Se calcula la relación deuda/ingreso y el porcentaje de utilización de cupos disponibles. |
| 3 | Se evalúa la puntualidad histórica de pagos y la frecuencia de solicitudes o cargos financieros. |
| 4 | La IA genera un diagnóstico del estado de vida crediticia (Saludable, En Observación, Riesgo de Sobreendeudamiento). |
| 5 | Se identifican factores positivos y puntos críticos que impactan el perfil crediticio. |
| 6 | El diagnóstico se integra en el Dashboard (RF-016) y en los planes personalizados de IA (RF-012 y RF-013). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-053 | El análisis crediticio debe evaluar puntualidad de pagos, nivel de endeudamiento y uso de cupos. |
| RN-054 | El sistema debe alertar preventivamente cuando la relación deuda/ingreso supere el 35 % recomendado. |
| RN-055 | El diagnóstico debe explicar en lenguaje sencillo qué hábitos mejoran o deterioran la vida crediticia del usuario. |
| RN-056 | El sistema debe detectar notificaciones de cobro próximo para prevenir reportes negativos por mora. |
| RN-057 | Los datos crediticios del usuario deben tratarse bajo estricta confidencialidad y cifrado en reposo. |
| RN-058 | El estado crediticio debe actualizarse automáticamente ante cada nuevo pago o deuda registrada. |

<!--
  ¿Qué? Requisito funcional que describe la generación personalizada de un 
  Plan de Protección y Ciberseguridad mediante IA.
  ¿Para qué? Convertir las alertas de estafa, sitios peligrosos visitados y 
  vulnerabilidades detectadas en acciones concretas para blindar al usuario.
  ¿Impacto? Cumple el principio central del Guardián: no solo detectar amenazas, 
  sino guiar al usuario paso a paso para reducir su superficie de ataque.
-->

# RF-012 — Generación de Plan de Protección y Seguridad con IA

**Historias de usuario relacionadas:** HU-US-10, HU-PR-12

## Descripción

Con base en el historial de alertas recibidas, intentos de estafa cercanos, 
sitios web analizados y canales más expuestos del usuario, la IA generará 
un Plan de Protección y Ciberseguridad personalizado. Este plan incluirá 
medidas accionables priorizadas por urgencia (ej: activar autenticación en 
dos pasos en cuentas críticas, bloquear remitentes SMS maliciosos, configurar 
topes transaccionales, evitar redes o enlaces de riesgo detectados).

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El motor de IA recopila el historial de amenazas, enlaces analizados y hábitos digitales del usuario. |
| 2 | Se identifican las principales vulnerabilidades y vectores de ataque a los que estuvo expuesto. |
| 3 | La IA genera un Plan de Protección estructurado con recomendaciones concretas y priorizadas. |
| 4 | Cada recomendación incluye el motivo (basado en eventos reales del usuario) y los pasos para aplicarla. |
| 5 | El plan se presenta en el módulo de planes del usuario como una lista accionable. |
| 6 | A medida que el usuario completa acciones, el sistema recalcula su nivel de blindaje. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-059 | El Plan de Protección debe generarse a partir del historial real de amenazas y hábitos del usuario. |
| RN-060 | Cada recomendación debe incluir prioridad (Alta, Media, Baja), justificación e instrucciones claras. |
| RN-061 | El plan debe actualizarse automáticamente cuando se detecte un nuevo patrón de riesgo o amenaza crítica. |
| RN-062 | El usuario debe poder marcar cada recomendación como «Completada» o «Descartada». |
| RN-063 | El sistema debe calcular un indicador visual de progreso del nivel de protección del usuario. |
| RN-064 | Todas las recomendaciones deben respetar la privacidad del usuario sin exigir contraseñas bancarias. |

<!--
  ¿Qué? Requisito funcional que describe la generación personalizada de un 
  Plan de Ahorro y Optimización Financiera mediante IA.
  ¿Para qué? Transformar el análisis de gastos y vida crediticia en metas de 
  ahorro realistas, recortes sugeridos y estrategias de control financiero.
  ¿Impacto? Ayuda al usuario a mejorar su liquidez y salud crediticia con 
  recomendaciones basadas en sus propios números reales.
-->

# RF-013 — Generación de Plan de Ahorro y Optimización Financiera con IA

**Historias de usuario relacionadas:** HU-US-11, HU-PR-13

## Descripción

A partir del análisis de gastos (RF-010) y el diagnóstico de vida crediticia 
(RF-011), el motor de IA diseñará un Plan de Ahorro personalizado para el 
usuario. El plan propondrá topes sugeridos por categoría de gasto, reducción 
de gastos hormiga identificados, cancelación de suscripciones innecesarias, 
estrategias de abono a deudas y metas de ahorro mensual alcanzables según 
su flujo de caja real.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | La IA consulta el balance de ingresos/egresos (RF-010) y el estado crediticio (RF-011) del usuario. |
| 2 | Se identifican oportunidades concretas de ahorro y optimización de deuda. |
| 3 | Se calculan metas de ahorro sugeridas (conservadora, equilibrada y ambiciosa) adaptadas al ingreso real. |
| 4 | La IA redacta recomendaciones accionables con el impacto económico estimado en pesos/moneda local. |
| 5 | El usuario selecciona o ajusta su meta preferida y activa el Plan de Ahorro. |
| 6 | El sistema monitorea los nuevos movimientos para alertar si el usuario se acerca a los topes definidos. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-065 | El Plan de Ahorro debe basarse en los ingresos, gastos reales y obligaciones crediticias del usuario. |
| RN-066 | Toda sugerencia de recorte debe mostrar el ahorro mensual y anual proyectado. |
| RN-067 | El usuario debe poder personalizar los montos meta y los topes de gasto sugeridos por la IA. |
| RN-068 | El sistema debe enviar alertas preventivas cuando el gasto en una categoría alcance el 80 % del tope fijado. |
| RN-069 | Si el usuario presenta riesgo de sobreendeudamiento, el plan debe priorizar el saneamiento crediticio antes que metas de inversión. |
| RN-070 | El plan debe recalibrarse automáticamente al cierre de cada ciclo mensual. |

<!--
  ¿Qué? Requisito funcional que describe el seguimiento continuo y la 
  adaptación dinámica de los planes de protección y ahorro sugeridos por la IA.
  ¿Para qué? Evaluar si las recomendaciones están funcionando y ajustarlas 
  automáticamente ante cambios en los ingresos, gastos o amenazas del usuario.
  ¿Impacto? Evita que los planes queden estáticos, manteniendo la asesoría del 
  Guardián siempre vigente y alineada con la realidad del usuario.
-->

# RF-014 — Seguimiento Interactivo y Adaptación de Planes de IA

**Historias de usuario relacionadas:** HU-US-12, HU-PR-14

## Descripción

El sistema debe monitorear en tiempo real el cumplimiento tanto del Plan 
de Protección (RF-012) como del Plan de Ahorro (RF-013), mostrando indicadores 
de avance, logros alcanzados y alertas de desviación. Ante eventos relevantes 
(un gasto imprevisto alto, mejora crediticia o un nuevo intento de estafa), 
la IA recalculará y adaptará las recomendaciones de forma dinámica.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El motor de seguimiento evalúa cada nuevo evento financiero o de seguridad frente a los planes activos del usuario. |
| 2 | Se actualiza el porcentaje de avance de las metas de ahorro y las tareas de ciberseguridad. |
| 3 | Si se detecta una desviación significativa (ej: superación de tope de gasto o nueva vulnerabilidad), la IA genera un ajuste sugerido. |
| 4 | El sistema notifica al usuario los hitos cumplidos y las adaptaciones recomendadas. |
| 5 | El historial de evolución de los planes queda disponible para consulta en el Dashboard. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-071 | El avance de los planes de ahorro y seguridad debe actualizarse en tiempo real con cada evento procesado. |
| RN-072 | La IA debe proponer ajustes automáticos cuando un cambio financiero o de riesgo invalide las metas vigentes. |
| RN-073 | El sistema debe registrar el historial de planes cumplidos y métricas de mejora del usuario. |
| RN-074 | El usuario puede pausar, reiniciar o solicitar una regeneración completa de sus planes en cualquier momento. |
| RN-075 | Los ajustes automáticos deben explicarse brevemente en lenguaje natural antes de aplicarse. |

<!--
  ¿Qué? Requisito funcional que describe el Reporte Mensual del Guardián 
  sobre exposición a amenazas y desempeño financiero del usuario.
  ¿Para qué? Consolidar cuántas situaciones sospechosas o intentos de estafa 
  estuvieron cerca del usuario en el mes, qué sitios riesgosos evitó y cómo 
  evolucionaron sus gastos, ahorro y vida crediticia.
  ¿Impacto? Materializa el valor integral de TriDa como Guardián personal, 
  demostrando con métricas claras la protección y el ahorro logrados cada mes.
-->

# RF-015 — Reporte Mensual del Guardián y Exposición a Amenazas

**Historias de usuario relacionadas:** HU-US-13, HU-PR-15

## Descripción

Al cierre de cada mes (y consultable en corte parcial en cualquier momento), 
TriDa generará automáticamente el Reporte del Guardián. Este informe resumirá: 
a cuántas situaciones sospechosas, intentos de estafa o enlaces maliciosos 
estuvo expuesto el usuario durante el mes; cuántas amenazas fueron neutralizadas 
a tiempo; el monto económico protegido; el resumen de en qué se fue el dinero; 
el avance del Plan de Ahorro y Protección; y la evolución de su vida crediticia.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | Al finalizar el período mensual (o bajo demanda del usuario), el motor consolida los eventos del ciclo. |
| 2 | Se contabilizan las alertas generadas por nivel, intentos de estafa detectados y URLs peligrosas bloqueadas/advertidas. |
| 3 | Se calcula el monto total protegido en operaciones sospechosas evitadas y el ahorro logrado frente al mes anterior. |
| 4 | Se resume la distribución de gastos por categoría y el estado de la vida crediticia. |
| 5 | La IA redacta un resumen ejecutivo personalizado con conclusiones y prioridades para el siguiente mes. |
| 6 | El reporte se publica en el Dashboard y queda disponible para exportación (RF-020). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-076 | El Reporte del Guardián debe generarse automáticamente al cierre de cada mes calendario. |
| RN-077 | El reporte debe indicar explícitamente el número total de situaciones sospechosas e intentos de estafa detectados en el mes. |
| RN-078 | Debe incluir el desglose financiero: ingresos, gastos por categoría, ahorro alcanzado y evolución crediticia. |
| RN-079 | Debe incluir una comparativa porcentual frente al mes inmediatamente anterior. |
| RN-080 | El usuario debe poder consultar una vista preliminar del reporte en curso en cualquier día del mes. |
| RN-081 | Los reportes mensuales deben almacenarse históricamente para consulta y exportación (RF-020). |

<!--
  ¿Qué? Requisito funcional que describe el Dashboard Principal del Guardián 
  para el usuario final.
  ¿Para qué? Centralizar en una interfaz web clara, responsiva e intuitiva 
  el estado de seguridad, el verificador de sitios, la salud crediticia, 
  el flujo de gastos y los planes activos de IA.
  ¿Impacto? Es el centro de mando personal del usuario; sin una vista unificada 
  y clara, la información de seguridad y finanzas quedaría fragmentada.
-->

# RF-016 — Dashboard Principal del Guardián (Vista Unificada del Usuario)

**Historias de usuario relacionadas:** HU-US-01, HU-US-14

## Descripción

El sistema proporcionará una interfaz web responsiva, moderna y compatible 
con navegadores actuales (Chrome, Firefox, Edge, Safari) que actuará como 
el centro de control del Guardián. El dashboard mostrará en tiempo real: 
el índice general de seguridad y exposición del mes, alertas preventivas 
activas con código de color (verde para bajo, amarillo para medio, rojo para 
alto/crítico), acceso rápido al verificador de enlaces (RF-005), resumen de 
gastos y vida crediticia, y el progreso de los planes de Protección y Ahorro.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario inicia sesión en TriDa desde su navegador o dispositivo. |
| 2 | El dashboard carga el estado actual del Guardián (nivel de riesgo activo y amenazas evitadas en el mes). |
| 3 | Se despliegan las alertas recientes organizadas por criticidad con código de color. |
| 4 | Se muestran las tarjetas resumen de flujo de dinero (gastos vs. ingresos) y estado de vida crediticia. |
| 5 | Se visualiza el porcentaje de avance de los planes activos de Protección y Ahorro. |
| 6 | El panel se actualiza automáticamente en tiempo real ante nuevas notificaciones o movimientos. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-082 | El dashboard debe ser responsivo y compatible con Chrome, Firefox, Edge y Safari en versiones recientes. |
| RN-083 | Las alertas deben diferenciarse visualmente por color: verde (Bajo), amarillo (Medio) y rojo (Alto/Crítico). |
| RN-084 | El usuario debe poder acceder al verificador de sitios web y al detalle de cualquier alerta en un solo clic. |
| RN-085 | Los indicadores de seguridad, gastos y planes deben actualizarse en tiempo real sin recargar la página. |
| RN-086 | La interfaz debe diseñarse bajo principios de claridad y baja carga cognitiva para usuarios no técnicos. |
| RN-087 | El frontend se implementa con React + Vite + Tailwind CSS. |

<!--
  ¿Qué? Requisito funcional que describe la vista detallada de cada alerta, 
  notificación sospechosa o verificación de sitio web.
  ¿Para qué? Mostrar al usuario toda la evidencia contextual de un evento y 
  permitirle confirmar si fue una amenaza real o una actividad legítima.
  ¿Impacto? Permite al usuario tomar decisiones informadas y retroalimentar 
  al modelo de IA para reducir falsas alarmas en el futuro.
-->

# RF-017 — Vista Detallada de Incidentes, Alertas y Verificaciones

**Historias de usuario relacionadas:** HU-US-05, HU-US-15

## Descripción

Al seleccionar cualquier alerta, movimiento anómalo o análisis de URL en el 
dashboard, el sistema desplegará una vista detallada que incluye: datos 
completos del evento (origen, remitente, monto, canal, URL analizada, fecha 
y hora), score de riesgo calculado, explicación en lenguaje natural (RF-006), 
recomendaciones inmediatas y botones de retroalimentación para que el usuario 
indique si reconoce la actividad como legítima o confirma el intento de estafa.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario selecciona una alerta o incidente desde el dashboard (RF-016) o desde una notificación (RF-008). |
| 2 | El sistema despliega los metadatos completos del evento (monto, comercio/remitente, canal, enlace, hora). |
| 3 | Se presenta el score de riesgo y la explicación detallada en español cotidiano. |
| 4 | Se muestran las recomendaciones preventivas asociadas al incidente. |
| 5 | El usuario puede marcar el caso como «Lo reconozco / Es seguro» o «Confirmar intento de estafa». |
| 6 | La respuesta del usuario actualiza su perfil dinámico (RF-021) y el conjunto de aprendizaje de la IA (RF-024). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-088 | La vista detallada debe mostrar en una sola pantalla todos los datos del evento, el score y su explicación. |
| RN-089 | El usuario debe poder clasificar el incidente como «Actividad legítima» o «Estafa / Sospechoso confirmado». |
| RN-090 | La retroalimentación del usuario debe ajustar inmediatamente la sensibilidad de su perfil personal (RF-021). |
| RN-091 | Si el usuario confirma una estafa o phishing, el sistema debe sugerir actualizar su Plan de Protección (RF-012). |
| RN-092 | Toda interacción del usuario sobre un incidente debe registrarse en su bitácora de actividad (RF-022). |
| RN-093 | Los patrones confirmados como estafa se anonimizan para fortalecer la detección colectiva del sistema. |

<!--
  ¿Qué? Requisito funcional que describe los filtros avanzados y búsqueda 
  en el historial de movimientos, notificaciones y alertas del usuario.
  ¿Para qué? Permitir al usuario localizar rápidamente cualquier transacción, 
  mensaje sospechoso o sitio verificado mediante criterios combinables.
  ¿Impacto? Facilita la revisión de gastos específicos y la consulta de 
  incidentes pasados sin tener que recorrer listas extensas manualmente.
-->

# RF-018 — Filtros Avanzados y Búsqueda en Actividad y Alertas

**Historias de usuario relacionadas:** HU-US-16

## Descripción

El sistema debe incluir un motor de búsqueda y filtros combinables dentro 
del historial financiero y de seguridad del usuario. Los criterios disponibles 
serán: rango de fechas, tipo de evento (transacción enviada, recibida, 
notificación SMS/push, sitio web), categoría de gasto, cuenta vinculada, 
rango de monto, nivel de riesgo (Seguro, Bajo, Medio, Alto, Crítico) y estado 
de validación del usuario.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario accede a su historial de actividad financiera o centro de alertas. |
| 2 | El usuario ingresa términos de búsqueda o selecciona uno o más filtros combinables. |
| 3 | El sistema filtra y actualiza los resultados en tiempo real. |
| 4 | Los filtros activos permanecen visibles mientras el usuario inspecciona los detalles. |
| 5 | El usuario puede restablecer todos los filtros con un solo clic o exportar los resultados (RF-020). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-094 | Los filtros disponibles son: rango de fechas, tipo de evento, categoría, cuenta, monto, nivel de riesgo y estado. |
| RN-095 | Todos los filtros deben ser combinables entre sí y operar junto con búsqueda por palabra clave. |
| RN-096 | Los resultados deben actualizarse en tiempo real a medida que se modifican los criterios. |
| RN-097 | El usuario debe poder limpiar todos los filtros mediante una única acción. |
| RN-098 | Los resultados filtrados deben poder exportarse directamente (RF-020). |

<!--
  ¿Qué? Requisito funcional que describe la visualización gráfica de métricas 
  financieras, crediticias y de seguridad del usuario.
  ¿Para qué? Presentar de forma visual e interactiva en qué se va el dinero, 
  cómo evoluciona la vida crediticia y cuántas amenazas se han evitado.
  ¿Impacto? Facilita la comprensión inmediata de tendencias personales sin 
  necesidad de interpretar tablas numéricas complejas.
-->

# RF-019 — Visualización de Métricas Financieras y de Seguridad

**Historias de usuario relacionadas:** HU-US-17

## Descripción

El dashboard debe incorporar gráficos interactivos que permitan al usuario 
explorar su situación financiera y de protección. Las visualizaciones 
requeridas incluyen: distribución de gastos por categoría (gráfico circular/barras), 
comparativa mensual de ingresos vs. egresos, línea de tiempo de situaciones 
sospechosas e intentos de estafa detectados por mes, evolución del índice de 
salud crediticia y cumplimiento de metas de ahorro.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario ingresa a la sección de analítica personal en el dashboard. |
| 2 | El sistema renderiza los gráficos interactivos con los datos actualizados del usuario. |
| 3 | El usuario puede filtrar por rango de tiempo (semanal, mensual, semestral, anual) y hacer zoom en los datos. |
| 4 | Al seleccionar una categoría o punto temporal, se despliega el detalle correspondiente. |
| 5 | Los gráficos se actualizan automáticamente al registrarse nuevos eventos o planes. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-099 | Los gráficos obligatorios son: gastos por categoría, ingresos vs. egresos, exposición mensual a amenazas, evolución crediticia y progreso de ahorro. |
| RN-100 | Todos los gráficos deben ser interactivos con tooltips detallados y selección de período. |
| RN-101 | Las visualizaciones deben adaptarse automáticamente a dispositivos móviles y de escritorio. |
| RN-102 | Los gráficos deben actualizarse en tiempo real sin intervención manual del usuario. |
| RN-103 | El usuario debe poder incluir estas visualizaciones al exportar su reporte PDF (RF-020). |

<!--
  ¿Qué? Requisito funcional que describe la exportación de reportes 
  personales financieros y de seguridad en formatos estándar.
  ¿Para qué? Permitir que el usuario descargue su Reporte Mensual del Guardián, 
  su resumen de gastos o evidencia de intentos de estafa para control personal 
  o reclamaciones ante su entidad bancaria.
  ¿Impacto? Entrega al usuario respaldo documental portable de su actividad 
  financiera y de los incidentes de seguridad detectados.
-->

# RF-020 — Exportación de Reportes Personales y Evidencia de Incidentes

**Historias de usuario relacionadas:** HU-US-18

## Descripción

El sistema debe permitir al usuario exportar sus reportes (Reporte Mensual 
del Guardián, análisis de gastos, diagnóstico crediticio e historial de 
alertas) en formatos estándar: PDF (con resumen ejecutivo y gráficos), 
Excel/XLSX (para presupuesto personal) y CSV (para interoperabilidad). 
Antes de descargar, el usuario podrá elegir el rango de fechas y las 
secciones que desea incluir.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario accede al Reporte del Guardián (RF-015) o a una vista filtrada (RF-018). |
| 2 | Selecciona el formato de salida: PDF, XLSX o CSV. |
| 3 | Configura el rango de fechas y las secciones a incluir (seguridad, gastos, crédito, planes). |
| 4 | El sistema genera el documento manteniendo la integridad de los datos. |
| 5 | El archivo se descarga en el dispositivo del usuario y se registra la exportación en su bitácora. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-104 | Los formatos de exportación soportados son PDF, Excel (XLSX) y CSV. |
| RN-105 | El usuario debe poder seleccionar el rango de fechas y los módulos incluidos antes de exportar. |
| RN-106 | Los reportes en PDF deben incluir el resumen ejecutivo de IA y las gráficas principales. |
| RN-107 | El archivo exportado debe reflejar fielmente los datos originales sin alteraciones. |
| RN-108 | El usuario debe poder exportar el detalle individual de una alerta como soporte para reclamaciones bancarias. |

<!--
  ¿Qué? Requisito funcional que describe el perfil dinámico de comportamiento 
  y preferencias de alerta de cada usuario.
  ¿Para qué? Adaptar el motor de IA a los hábitos reales de cada persona, 
  evitando falsas alarmas por movimientos legítimos y respetando sus preferencias.
  ¿Impacto? Garantiza una experiencia personalizada donde el Guardián aprende 
  continuamente del usuario sin volverse intrusivo.
-->

# RF-021 — Gestión de Perfil Dinámico y Umbrales del Usuario

**Historias de usuario relacionadas:** HU-US-19, HU-PR-16

## Descripción

El sistema debe mantener un perfil dinámico para cada usuario que evolucione 
con sus transacciones, hábitos financieros y validaciones de alertas. Este 
perfil almacenará: patrones habituales de gasto, horarios y canales frecuentes, 
dispositivos de confianza, nivel de tolerancia crediticia y sensibilidad de 
alertas. Cuando el usuario marque una alerta como «Lo reconozco», el perfil 
ajustará automáticamente sus umbrales para evitar alertas repetitivas sobre 
operaciones legítimas similares.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El sistema procesa un nuevo movimiento o una validación del usuario (RF-017). |
| 2 | Se recalculan los patrones habituales: rangos de gasto, horarios, comercios y canales frecuentes. |
| 3 | Si el usuario marca un evento como «Legítimo / Lo reconozco», se reduce la sensibilidad para ese patrón específico. |
| 4 | Si el usuario confirma un intento de estafa, se incrementa la sensibilidad ante patrones similares. |
| 5 | El usuario puede ajustar manualmente sus preferencias de notificación y umbrales desde su perfil. |
| 6 | El perfil actualizado queda disponible inmediatamente para el módulo de enriquecimiento (RF-002). |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-109 | Cada usuario debe contar con un perfil dinámico que se actualice automáticamente con su actividad. |
| RN-110 | El perfil debe aprender horarios habituales, montos promedio, comercios frecuentes y dispositivos de confianza. |
| RN-111 | Confirmar una operación como legítima debe ajustar automáticamente los umbrales para reducir falsos positivos. |
| RN-112 | Confirmar un intento de estafa debe elevar el nivel de vigilancia sobre vectores similares. |
| RN-113 | El usuario debe poder configurar manualmente sus horarios de silencio y canales preferidos de alerta. |
| RN-114 | Los umbrales por defecto (Bajo 30–49 %, Medio 50–79 %, Alto 80–95 %, Crítico > 95 %) deben mantener coherencia lógica al modificarse. |

<!--
  ¿Qué? Requisito funcional que describe la bitácora inmutable de actividad 
  y el cumplimiento de protección de datos personales (Ley 1581 de 2012).
  ¿Para qué? Garantizar la integridad de los registros de seguridad del usuario 
  y permitirle ejercer sus derechos de privacidad (ARCO) en cualquier momento.
  ¿Impacto? Protege la información financiera y personal sensible del usuario 
  bajo estándares ISO 27001 y la legislación colombiana de Habeas Data.
-->

# RF-022 — Bitácora Inmutable de Seguridad y Protección de Datos (ARCO)

**Historias de usuario relacionadas:** HU-US-20, HU-AD-05

## Descripción

El sistema registrará de forma segura e inalterable los eventos críticos 
de la cuenta (accesos, alertas generadas, amenazas bloqueadas, cambios de 
configuración y consentimientos) con marca temporal y firma de integridad. 
Asimismo, en cumplimiento de la Ley 1581 de 2012 (Colombia) e ISO 27001, 
TriDa garantizará el cifrado de datos sensibles y habilitará un panel de 
privacidad para que el usuario ejerza sus derechos ARCO (Acceso, Rectificación, 
Cancelación y Oposición), incluyendo la revocación de vinculación de cuentas 
y el borrado definitivo de su historial.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | Cada evento de seguridad o privacidad del usuario se captura automáticamente con marca temporal. |
| 2 | Se genera un hash de integridad y se almacena en la bitácora protegida del sistema. |
| 3 | El usuario puede consultar su historial de accesos y movimientos de seguridad desde su panel. |
| 4 | Desde la sección de Privacidad, el usuario puede descargar todos sus datos, rectificarlos o revocar permisos de lectura. |
| 5 | Si el usuario solicita la eliminación de cuenta/datos (Derecho de Cancelación), el sistema ejecuta el borrado seguro tras confirmación. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-115 | Todos los datos financieros y de notificaciones deben almacenarse cifrados en reposo y viajar bajo TLS 1.3. |
| RN-116 | Los registros de auditoría de seguridad deben incluir firma criptográfica de integridad para evitar alteraciones. |
| RN-117 | El sistema debe cumplir con la Ley 1581 de 2012 (Protección de Datos Personales) y controles de ISO 27001. |
| RN-118 | El usuario debe poder ejercer directamente los derechos ARCO: Acceso, Rectificación, Cancelación y Oposición. |
| RN-119 | El usuario puede desvincular sus cuentas o revocar el acceso a notificaciones en cualquier momento con efecto inmediato. |
| RN-120 | Ningún administrador puede visualizar contraseñas ni alterar registros históricos de seguridad. |

<!--
  ¿Qué? Requisito funcional que describe la autenticación segura y el 
  control de sesiones mediante autenticación multifactor (MFA).
  ¿Para qué? Proteger el acceso a la información financiera, crediticia y 
  de seguridad del usuario contra accesos no autorizados.
  ¿Impacto? Siendo TriDa un guardián financiero y de ciberseguridad, el acceso 
  a la plataforma debe contar con estándares robustos de protección de identidad.
-->

# RF-023 — Autenticación Segura y Protección de Cuenta (MFA)

**Historias de usuario relacionadas:** HU-US-21, HU-AD-01

## Descripción

El sistema debe implementar un mecanismo de autenticación robusto para 
todos los usuarios y administradores. Se exigirán contraseñas seguras 
(mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos) y 
soporte para autenticación multifactor (MFA) mediante código temporal TOTP 
(aplicaciones autenticadoras) o código por correo/SMS. Las sesiones inactivas 
se cerrarán automáticamente tras un tiempo configurable y los tokens de 
sesión se gestionarán mediante JWT seguros.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El usuario ingresa sus credenciales en la pantalla de inicio de sesión. |
| 2 | El sistema valida las credenciales contra la base de datos usando hashing seguro. |
| 3 | Si las credenciales son incorrectas, se muestra un mensaje genérico (prevención de enumeración) y se registra el intento. |
| 4 | Si el usuario tiene MFA activo (obligatorio para administradores), se solicita el código TOTP o temporal. |
| 5 | Al validar el segundo factor, se emite el token JWT con expiración controlada e inicia la sesión. |
| 6 | Si la sesión permanece inactiva más allá del tiempo permitido, se cierra automáticamente. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-121 | Toda contraseña debe tener mínimo 8 caracteres combinando mayúsculas, minúsculas, números y símbolos. |
| RN-122 | El sistema debe soportar MFA mediante TOTP (apps autenticadoras) para usuarios y exigirlo de forma obligatoria a administradores. |
| RN-123 | Los mensajes de error en el inicio de sesión deben ser genéricos para evitar enumeración de cuentas. |
| RN-124 | Las sesiones inactivas deben cerrarse automáticamente tras un período configurable. |
| RN-125 | La gestión de sesiones debe implementarse mediante tokens JWT firmados con rotación segura. |
| RN-126 | Los intentos fallidos reiterados deben activar bloqueo temporal y notificación de seguridad al titular. |

<!--
  ¿Qué? Requisito funcional que describe las herramientas administrativas para 
  monitorear la salud de TriDa y gestionar el ciclo de vida del modelo de IA.
  ¿Para qué? Garantizar la disponibilidad del servicio, supervisar métricas 
  técnicas y reentrenar la IA con patrones anonimizados de nuevas estafas.
  ¿Impacto? Asegura que TriDa mantenga alta precisión ante nuevas modalidades 
  de fraude y opere con estabilidad continua para todos los usuarios.
-->

# RF-024 — Administración del Sistema, Salud y Reentrenamiento de IA

**Historias de usuario relacionadas:** HU-AD-02, HU-AD-03, HU-AD-04, HU-PR-17

## Descripción

El sistema proporcionará un panel administrativo exclusivo para el rol 
«Administrador del Sistema» que permita supervisar en tiempo real el estado 
de salud de los servicios (ingesta, motor de IA, verificador de URLs, 
notificaciones, base de datos), métricas de rendimiento (CPU, memoria, 
latencia < 500 ms) y gestionar el reentrenamiento periódico o manual del 
modelo de IA usando retroalimentación anonimizada de estafas confirmadas, 
con soporte para comparación de métricas (Precisión, Recall, F1-Score) y 
rollback de versiones.

---

## Flujo del proceso

| Paso | Descripción |
|------|-------------|
| 1 | El administrador autenticado (con MFA) accede al panel de operación y salud del sistema. |
| 2 | Visualiza el estado en tiempo real de cada microservicio/módulo y la latencia promedio de procesamiento. |
| 3 | Ante degradación o fallo de un componente, el sistema envía una alerta técnica automática al administrador. |
| 4 | Para actualizar la IA (de forma programada o manual), el sistema recopila casos confirmados de forma anonimizada. |
| 5 | Se entrena y evalúa la nueva versión del modelo comparando Precisión, Recall y F1-Score frente a producción. |
| 6 | Si las métricas mejoran, se despliega la nueva versión conservando la anterior en el historial para posible rollback. |

---

## Reglas de Negocio

| ID | Regla |
|----|-------|
| RN-127 | Solo usuarios con rol «Administrador del Sistema» y MFA activo pueden acceder al panel de salud y gestión de IA. |
| RN-128 | El panel de salud debe mostrar estado de módulos (activo, degradado, inactivo), CPU, memoria y latencia en tiempo real. |
| RN-129 | Los datos usados para reentrenar el modelo global deben estar completamente anonimizados sin información personal identificable. |
| RN-130 | Ninguna versión del modelo de IA puede pasar a producción sin superar las métricas (Precisión, Recall, F1-Score) de la versión vigente. |
| RN-131 | El sistema debe conservar historial de versiones del modelo y permitir rollback inmediato ante degradación. |
| RN-132 | Todo reentrenamiento, despliegue, rollback o cambio técnico debe quedar registrado en la bitácora de auditoría. |


