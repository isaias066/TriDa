|     |
|-----|

> **Especificación de requisitos de software**
>
> **Proyecto: Sistema de Monitoreo de Transacciones con IA para Detección de Fraude (TriDa, mvp)**
>
> Revisión
>
> <img src="media/image2.png" style="width:1.6457in;height:1.36776in" />

|     |     |     |
|-----|-----|-----|

**Ficha del documento**

| **Fecha**  | **Revisión** | **Autor**   | **Verificado dep. calidad.** |
|------------|--------------|-------------|------------------------------|
| 14/11/2025 | 1.0          | Angie Bueno |                              |

Documento validado por las partes en fecha:

| Por el cliente | Por la empresa suministradora |
|----------------|-------------------------------|
|                |                               |
| Fdo. D./ Dña:  | Fdo. D./Dña                   |

**Contenido**

[<u>1 Introducción</u>](#introducción)

> [<u>1.1 Propósito</u>](#propósito)
>
> [<u>1.2 Alcance</u>](#_heading=h.zblntivstnbi)
>
> [<u>1.3 Personal involucrado</u>](#personal-involucrado)
>
> [<u>1.4 Definiciones, acrónimos y abreviaturas</u>](#definiciones-acrónimos-y-abreviaturas)
>
> [<u>1.5 Referencias</u>](#referencias)
>
> [<u>1.6 Resumen</u>](#resumen)

[<u>2 Descripción general</u>](#descripción-general)

> [<u>2.1 Perspectiva del producto</u>](#perspectiva-del-producto)
>
> [<u>2.2 Funcionalidad del producto</u>](#funcionalidad-del-producto)
>
> [<u>2.3 Características de los usuarios</u>](#_heading=h.b1qyx8zh4s3s)
>
> [<u>2.4 Restricciones</u>](#section-2)
>
> [<u>2.5 Suposiciones y dependencias</u>](#_heading=h.4uy6gvkcvr0j)
>
> [<u>2.6 Evolución previsible del sistema</u>](#evolución-previsible-del-sistema)

[<u>3 Requisitos específicos</u>](#requisitos-específicos)

> [<u>3.1 Requisitos comunes de los interfaces</u>](#requisitos-comunes-de-los-interfaces)
>
> [<u>3.1.1 Interfaces de usuario</u>](#interfaces-de-usuario)
>
> [<u>3.1.2 Interfaces de hardware</u>](#interfaces-de-hardware)
>
> [<u>3.1.3 Interfaces de software</u>](#interfaces-de-software)
>
> [<u>3.1.4 Interfaces de comunicación</u>](#interfaces-de-comunicación)
>
> [<u>3.2 Requisitos funcionales</u>](#requisitos-funcionales)
>
> [<u>3.2.1 Requisito funcional 1</u>](#requisito-funcional-1)
>
> [<u>3.2.2 Requisito funcional 2</u>](#_heading=h.rsnvtjh98y6v)
>
> [<u>3.2.3 Requisito funcional 3</u>](#requisito-funcional-4)
>
> [<u>3.2.4 Requisito funcional n</u>](#_heading=h.lcb8p4nb787u)
>
> [<u>3.3 Requisitos no funcionales</u>](#requisitos-no-funcionales)
>
> [<u>3.3.1 Requisitos de rendimiento</u>](#requisitos-de-rendimiento)
>
> [<u>3.3.2 Seguridad</u>](#seguridad)
>
> [<u>3.3.3 Fiabilidad</u>](#_heading=h.m1m3ynqm3k0y)
>
> [<u>3.3.4 Disponibilidad</u>](#disponibilidad)
>
> [<u>3.3.5 Mantenibilidad</u>](#_heading=h.hu6gz5bdf087)
>
> [<u>3.3.6 Portabilidad</u>](#mantenibilidad)
>
> [<u>3.4 Otros requisitos</u>](#_heading=h.23tvalny46qs)

[<u>4 Apéndices</u>](#apéndices)

#  Introducción

## Propósito

El propósito de este Documento de Especificación de Requisitos de Software (ERS) es definir de manera completa, precisa y verificable los requisitos del Sistema de Monitoreo de Transacciones con IA para Detección de Fraude (TriDa).

Este documento describe las funcionalidades, características técnicas y restricciones del sistema, cuyo objetivo principal es proteger los activos financieros de la institución y sus clientes mediante la detección y prevención proactiva de actividades fraudulentas en tiempo real, garantizando la integridad de las operaciones bancarias antes de que se efectúen.

Asimismo, se establece la integración de un módulo de Inteligencia Artificial (IA) que permitirá:

- Analizar patrones de comportamiento transaccional a gran escala y velocidad
- Generar un score de riesgo para cada operación financiera.
- Identificar anomalías y ataques sofisticados (como botnets y fraudes de secuencia) que los sistemas basados en reglas no pueden detectar.
- Minimizar las pérdidas económicas por fraude y mejorar la eficiencia operativa del equipo de seguridad mediante alertas inteligentes y la automatización de la toma de decisiones.

## Alcance

### Funcionalidades Incluidas (In Scope)

El sistema TriDa abarcará las siguientes funcionalidades esenciales para la detección de fraude en tiempo real:

Módulo de Ingesta y Preprocesamiento de Datos:

- Recepción de datos transaccionales del sistema bancario central (Core banking system) en un formato de streaming (Flujo continuo).

- Normalización y enriquecimiento de los datos (Ejemplo: Geolocalización, velocidad, frecuencia, actualización).

Módulo de Inteligencia Artificial (IA) para Detección de Fraude:

- Implementación de un modelo de Machine Learning entrenado para clasificar la probabilidad de fraude en cada transacción, arrojando un Score de Riesgo que tendrá: (0 - 100%).

- Capacidad de autoaprendizaje y reentrenamiento periódico del modelo basado en la retroalimentación de los analistas al añadir periódicamente datos, o la posibilidad de reentrenar manualmente al modelo de IA.

Motor de Reglas y Alertas:

- Definición de umbrales de riesgo para la activación de acciones automatizadas (Ejemplo: Si el Score \> 95%, bloquear la transacción y enviar una alerta inmediata al analista y el usuario).

- Generación de alertas categorizadas por nivel de criticidad (Alta, media, baja) y envío al Dashboard del Analista y el usuario (Solo en caso de que el score supere el 95% de riesgo).

Dashboard del Analista (Front-End):

- Interfaz web para la visualización en tiempo real de las métricas clave de riesgo y el volumen de transacciones.

- Panel interactivo que permita al analista revisar, marcar (Como fraude o legítima) y gestionar las alertas de alto riesgo.

Módulo de Registro (Logging):

- Registro inmutable de todas las transacciones procesadas, el Score de Riesgo asignado y las acciones tomadas por el sistema o el analista.

### Funcionalidades Excluidas (Out of Scope)

Para mantener el enfoque del proyecto y asegurar su viabilidad dentro del plazo establecido, las siguientes funcionalidades no serán incluidas en el alcance de TriDa en esta fase inicial:

- Interacción Directa con el Cliente: El sistema no incluirá ninguna interfaz (Web, móvil o API) para la interacción directa con el usuario final (ejemplo: Notificaciones push al cliente sobre alertas de fraude o módulos de autogestión de seguridad).

- Módulos de Cumplimiento Normativo (AML/KYC): El sistema no implementará módulos completos para la lucha contra el lavado de dinero (AML) o la verificación de identidad del cliente (KYC); se centrará exclusivamente en el fraude transaccional usando un enfoque proactivo.

- Sistema de Gestión Bancaria (Core Banking): El proyecto TriDa no incluirá modificaciones, desarrollo o reemplazo del sistema central de gestión bancaria existente; solo se integrará a través de la API de ingesta de datos.

- Análisis de Crédito/Scoring de Préstamos: No se incluirá el análisis de datos de comportamiento para la toma de decisiones de otorgamiento de préstamos, sólo para la detección de fraudes transaccionales.

## Personal involucrado

<table>
<colgroup>
<col style="width: 30%" />
<col style="width: 69%" />
</colgroup>
<thead>
<tr class="header">
<th>Nombre</th>
<th>Angie Bueno</th>
</tr>
<tr class="odd">
<th>Rol</th>
<th>Desarrollador</th>
</tr>
<tr class="header">
<th>Categoría profesional</th>
<th>Líder de proyecto, Frontend, Especialista en IA /Data Scientist, Backend, Tester QA (Control de calidad).</th>
</tr>
<tr class="odd">
<th>Responsabilidades</th>
<th><p>- Planificar y supervisar tareas.</p>
<p>- Analizar requerimientos.</p>
<p>- Coordinar con el cliente.</p>
<p>- Asegurar cumplimiento de objetivos y plazos.</p>
<p>- Crear las vistas y componentes del usuario.</p>
<p>- Asegurar la usabilidad y el diseño responsivo.</p>
<p>- Conectarse con el backend mediante APIs.</p>
<p>- Analizar datos de transacciones bancarias.</p>
<p>- Entrenar modelos predictivos.</p>
<p>- Integrar la IA en la plataforma.</p>
<p>- Diseñar y ejecutar pruebas.</p>
<p>- Reportar errores.</p>
<p>- Verificar requisitos cumplidos antes de la entrega.</p>
<p>- Diseñar y mantener la estructura del servidor.</p>
<p>- Gestionar bases de datos.</p>
<p>- Asegurar la integridad de la aplicación y mantener la seguridad del sistema e integrar servicios externos.</p></th>
</tr>
<tr class="header">
<th>Información de contacto</th>
<th>317 2748086</th>
</tr>
<tr class="odd">
<th>Aprobación</th>
<th></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Definiciones, acrónimos y abreviaturas

<table>
<colgroup>
<col style="width: 45%" />
<col style="width: 54%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Término / Acrónimo</strong></p>
</blockquote></th>
<th><blockquote>
<p><strong>Definición</strong></p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 32%" />
<col style="width: 67%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>IA (Inteligencia Artificial)</strong></p>
</blockquote></th>
<th><blockquote>
<p>Tecnología que permite al sistema analizar datos y generar recomendaciones automáticas basadas en patrones de comportamiento.</p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 31%" />
<col style="width: 68%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Botnets</strong></p>
</blockquote></th>
<th><blockquote>
<p>Se trata de una red de ordenadores y dispositivos (Como móviles, cámaras o electrodomésticos) infectados con malware (Programa maligno) y controlados remotamente por un atacante.</p>
</blockquote></th>
</tr>
<tr class="odd">
<th><blockquote>
<p><strong>Scope</strong></p>
</blockquote></th>
<th><blockquote>
<p>Se refiere al área o contexto donde algo es válido o tiene acceso. </p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 32%" />
<col style="width: 67%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Dashboard</strong></p>
</blockquote></th>
<th><blockquote>
<p>Se trata de un panel de control o interfaz visual que organiza y muestra información clave de manera fácil de entender, generalmente en tiempo real.</p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 32%" />
<col style="width: 67%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Front-End</strong></p>
</blockquote></th>
<th><blockquote>
<p>Es la parte de una aplicación web o sitio web con la que interactúa directamente el usuario, incluyendo todo lo que se ve en la pantalla. Se encarga de la interfaz visual, el diseño y la experiencia de usuario.</p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 32%" />
<col style="width: 67%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Back-End</strong></p>
</blockquote></th>
<th><blockquote>
<p>Es la parte de una aplicación web o móvil que se ejecuta en segundo plano y que los usuarios no ven, es decir, el "Lado del servidor". Se encarga de la lógica, el procesamiento y el almacenamiento de datos, gestionando la comunicación entre el usuario (A través del front-end) y la base de datos.</p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 32%" />
<col style="width: 67%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Logging</strong></p>
</blockquote></th>
<th><blockquote>
<p>Es el proceso de registrar eventos que ocurren en un software o sistema para poder entender su comportamiento, diagnosticar problemas y monitorear su rendimiento y seguridad</p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 32%" />
<col style="width: 67%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>API</strong></p>
</blockquote></th>
<th><blockquote>
<p>Se trata de la interfaz de programación de aplicaciones que funciona como un intermediario de software, permitiendo que diferentes aplicaciones se comuniquen entre sí mediante un conjunto de reglas y protocolos definidos. </p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 32%" />
<col style="width: 67%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>Notificaciones Push</strong></p>
</blockquote></th>
<th><blockquote>
<p>Son mensajes cortos y emergentes que una aplicación o sitio web envía a un usuario a través de su dispositivo (Móvil, tablet u ordenador), incluso cuando la aplicación no está abierta.</p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 32%" />
<col style="width: 67%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>AML</strong></p>
</blockquote></th>
<th><blockquote>
<p>Por sus siglas significa: Anti-Money Laundering (Anti-Lavado de Dinero), que es un conjunto de regulaciones para prevenir el lavado de capitales y la financiación del terrorismo.</p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 32%" />
<col style="width: 67%" />
</colgroup>
<thead>
<tr class="header">
<th><blockquote>
<p><strong>KYC</strong></p>
</blockquote></th>
<th><blockquote>
<p>Por sus siglas significa: Know Your Customer (Conozca a su cliente), es un proceso para identificar y verificar la identidad de los clientes con el fin de prevenir actividades ilegales como el lavado de dinero, el fraude y la financiación del terrorismo.</p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Referencias

| **Referencia** | **Título** | **Ruta** | **Fecha** | **Autor** |
|----------------|------------|----------|-----------|-----------|
|                |            |          |           |           |
|                |            |          |           |           |

## Resumen

El documento comienza con la Introducción (Sección 1), donde se establece el propósito principal: definir de forma completa los requisitos del sistema TriDa, cuyo objetivo es proteger activos financieros y clientes mediante la detección y prevención proactiva de fraudes en tiempo real, utilizando un módulo de Inteligencia Artificial. El alcance funcional se centra en la ingesta de datos, el análisis con IA, el motor de reglas/alertas, un dashboard para analistas y un módulo de registro/auditoría. Se excluyen explícitamente funcionalidades como la interacción directa con el cliente, el cumplimiento normativo completo (AML/KYC) y cualquier modificación al sistema bancario central.

La Descripción General (Sección 2) detalla la perspectiva del producto, explicando que TriDa es una capa de seguridad inteligente e independiente que se integra con el software bancario existente, recibiendo datos transaccionales para analizarlos en menos de medio segundo. El sistema calcula un puntaje de riesgo (0% a 100%) y toma decisiones automáticas: A

probación (si \< 50%), alerta (si 50% - 95%) o bloqueo inmediato (si \> 95%). Se definen las características de los usuarios clave (Administrador del Sistema, Analista de Seguridad y Operador de Monitoreo) con sus formaciones y responsabilidades específicas. Las restricciones y suposiciones subrayan la dependencia del sistema central bancario, la latencia máxima de 500ms y el cumplimiento obligatorio de normativas.

Finalmente, los Requisitos Específicos (Sección 3) formalizan las capacidades del sistema. Los requisitos funcionales (RF001 a RF009) cubren el ciclo completo de vida del fraude, desde la ingesta de datos en tiempo real y el análisis inteligente con IA, hasta el bloqueo automático de transacciones de muy alto riesgo (RF004) y el reentrenamiento continuo del modelo de Machine Learning (RF009) usando la retroalimentación de los analistas. Los requisitos no funcionales se enfocan en la calidad y el entorno, exigiendo rendimiento, seguridad y mantenibilidad adecuados.

# Descripción general

## Perspectiva del producto

> TriDa es un software independiente creado con el propósito de proteger a los clientes y a las entidades bancarias del fraude financiero. Este sistema no sustituye el software bancario que ya existe en las entidades financieras; más bien, opera junto con él como una capa extra de seguridad inteligente. Su función primordial es recibir los datos de cada transacción que se lleva a cabo, examinarlos en tiempo real y determinar si son seguros o sospechosos antes de su finalización.
>
> El sistema, a través de una conexión automatizada, obtiene datos de las operaciones bancarias directamente del sistema bancario central. Cada vez que un cliente intenta realizar una transferencia, un pago u otra acción financiera, el sistema registra datos relevantes como la cantidad de dinero, el lugar desde donde se realiza la operación, el dispositivo utilizado, la hora y el historial del cliente. Con todos estos datos, el sistema elabora un perfil integral de la transacción para poder evaluarla de manera adecuada.
>
> Cuando el sistema recibe los datos de una transacción, emplea un modelo de Inteligencia Artificial que ha sido entrenado con miles de casos históricos de fraude para su análisis. Este modelo de aprendizaje automático busca comportamientos sospechosos al comparar la transacción actual con el comportamiento habitual del cliente. Por ejemplo, detecta si un cliente que usualmente realiza compras en Bogotá intenta hacer una transacción en otro país de pronto, o si alguien que regularmente gasta \$50.000 intenta enviar \$10.000.000 sin previo aviso. El sistema mejora su habilidad para identificar fraudes cada vez más elaborados porque está en continuo aprendizaje de los nuevos casos que son validados por los analistas.
>
> Tras examinar la transacción, el sistema determina un puntaje de riesgo entre 0% y 100%. Un puntaje de 0% indica que la transacción es totalmente segura, mientras que uno de 100% señala que casi con certeza se trata de un fraude. Para no hacer esperar al cliente, esta puntuación se produce en menos de medio segundo.
>
> El sistema toma decisiones automáticas en función de este puntaje:
>
> Si el puntaje es bajo (\< 50%): Aprueba la transacción de inmediato sin intervención.
>
> Si el puntaje es medio (50% - 95%): Emite una alerta para que un analista humano la examine.
>
> Si el puntaje es muy alto (\> 95%): Bloquea automáticamente la transacción y envía una advertencia urgente al equipo de seguridad y al cliente.
>
> El sistema cuenta con un panel de control web que permite a los analistas de seguridad observar en vivo todas las transacciones que tienen lugar y las advertencias producidas por el sistema. Esta interfaz presenta las transacciones sospechosas clasificadas según el nivel de riesgo, lo cual posibilita que los analistas revisen todos los detalles de cada caso: quién realizó la transacción, desde dónde se hizo, cuál es el monto involucrado, por qué el sistema la ha señalado como sospechosa y cuál es el historial del cliente. Los analistas tienen la posibilidad de confirmar si se trata efectivamente de un fraude o de una alerta falsa, y esta información es utilizada para que el modelo de inteligencia artificial aprenda y aumente su precisión.
>
> Todas las decisiones que el sistema toma, así como todas las transacciones y acciones de los analistas, se almacenan de manera permanente en un módulo de auditoría para que puedan ser revisadas más adelante si es necesario. Dado que este registro es inalterable, nadie tiene la posibilidad de modificarlo o eliminarlo, lo que asegura que siempre haya prueba de lo que sucedió. Estos registros son esenciales para realizar investigaciones sobre fraude, cumplir con las regulaciones financieras y elaborar informes que evidencien la eficacia del sistema.
>
> El sistema además produce informes automatizados que contienen métricas importantes para evaluar su rendimiento. Estos informes contabilizan cuántos fraudes fueron descubiertos, cuántas alarmas falsas se produjeron, qué tan rápida es la respuesta del sistema y cuánto dinero se protegió. Esta información permite a la entidad bancaria determinar si el sistema está funcionando de manera adecuada y tomar decisiones para optimizarlo.
>
> El sistema TriDa está concebido para acoplarse de manera sencilla al software bancario ya existente, sin que sea necesario realizar modificaciones significativas en la infraestructura. Utiliza interfaces de programación estandarizadas (APIs) para conectarse, lo que posibilita el envío de respuestas y la recepción de datos de manera segura. Simplemente actúa como un filtro de seguridad que examina cada transacción antes de su ejecución; no altera la operación del sistema bancario central. Se enfoca exclusivamente en detectar y prevenir fraudes transaccionales, y no incluye funcionalidades para interactuar directamente con los clientes (por ejemplo, aplicaciones móviles) ni módulos completos de cumplimiento normativo.
>
> La arquitectura del sistema es modular, lo que significa que está constituida por componentes independientes que colaboran entre sí, pero pueden ser actualizados o alterados sin perjudicar al resto. Esto permite que el sistema evolucione para gestionar más operaciones si el banco lo requiere, posibilita la incorporación de nuevas funcionalidades en el futuro y simplifica el mantenimiento. Asimismo, está concebido para operar en servidores bancarios o en la nube, lo que permite a la entidad decidir dónde alojarlo de acuerdo con su presupuesto y sus requerimientos de seguridad.
>
> El sistema TriDa es inteligente y adaptable, a diferencia de los sistemas de detección de fraude tradicionales que operan con reglas inamovibles (por ejemplo, "bloquear si el monto supera la cifra X"). Es capaz de detectar fraudes complejos y recientes que los sistemas basados en reglas no logran identificar, como el robo de identidad con patrones avanzados, ataques coordinados de varias transacciones pequeñas o fraudes que simulan a la perfección la conducta habitual de un cliente. Asimismo, disminuye de manera importante las alarmas falsas que incomodan a los clientes legítimos, lo cual mejora la experiencia del usuario sin sacrificar la seguridad.
>
> El valor principal que ofrece el sistema es la protección del dinero de los clientes y de la reputación del banco mediante detección proactiva, es decir, previniendo que los fraudes se realicen en vez de simplemente investigarlos una vez que ya han causado perjuicio. Esto significa menos pérdidas financieras, más confianza de los clientes en la protección del banco y un equipo de seguridad más eficaz que puede enfocarse en los casos verdaderamente relevantes en vez de examinar miles de alertas falsas.

| **Sistema de Monitoreo de Transacciones con IA para Detección de Fraude (TriDa)** |                                                   |                                                                                                                                                                                                      |
|-----------------------------------------------------------------------------------|---------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Sustantivos**                                                                   | **Adjetivos**                                     | **Verbos**                                                                                                                                                                                           |
| Administrador del Sistema                                                         | Autorizado, Técnico, Configurable, Estratégico.   | **Configurar** umbrales y reglas; **Gestionar** usuarios y roles; **Monitorear** la salud del sistema; **Programar** el reentrenamiento de la IA; **Mantener** la infraestructura.                   |
| Analista de Seguridad / Equipo de Riesgos                                         | Experto, Humano, Validable, Informado, Decisorio. | **Revisar** alertas sospechosas; **Validar** si son fraude o falsas alarmas; **Clasificar** los casos; **Utilizar** el dashboard; **Retroalimentar** el modelo de IA; **Desbloquear** transacciones. |
| Operador de Monitoreo                                                             | Observador, Primario, Receptor, Inmediato.        | **Ver** el flujo de transacciones; **Recibir** alertas urgentes (Ejemplos, Bloqueos; **Consultar** registros de auditoría; **Reportar** fallos del sistema; **Escalar** casos complejos al Analista. |

## Funcionalidad del producto

> El sistema TRIDA actúa como un escudo inteligente para las transacciones bancarias. Su funcionalidad principal se inicia con la Ingesta y Procesamiento en Tiempo Real de Datos Transaccionales (RF001). El sistema debe de recibir y extraer la información necesaria (Monto, lugar, dispositivo, tipo, fecha y hora) de cada transacción y enriquecerla consultando el historial y los patrones de comportamiento regulares de cada cliente, sus dispositivos reconocidos y ubicaciones frecuentes. Toda esta información enriquecida debe de normalizarse en un formato estándar para su posterior análisis.
>
> El corazón del producto es el Análisis Inteligente con IA (RF002), sin embargo, es un sistema modular (No necesita estar interconectado todompara que funcione, cada modulo es independiente).
>
> El sistema debe desarrollar un modelo de Machine Learning para estimar un riesgo (0%-100%) de fraude. Este modelo inteligente reconocerá patrones sospechosos, como transacciones fuera de lo normal, importes inusuales para el usuario, dispositivos desconocidos, velocidad sospechosa (Varias transacciones en segundos) y patrones que coincidan con técnicas fraudulentas conocidas. Además, debe de dar una explicación legible de los factores que influyeron en cada calificación, para que los analistas sepan por qué se marcó una transacción.
>
> El sistema asegura la prevención proactiva a través de dos mecanismos: Generación Automática de Alertas (RF003) y Bloqueo Automático (RF004). Las alertas se gradúan en tres niveles de criticidad (Baja 30-49%, media 50-79%, alta 80-100%) y se envían en tiempo real al Dashboard con todos los detalles: Datos completos de la transacción, score calculado, factores sospechosos, historial reciente del cliente y marca de tiempo precisa. Según la criticidad, el sistema avisa a los analistas por distintos canales (Visual en dashboard, notificaciones push, correo electrónico para casos críticos). Para los casos extremos (Score \> 95%), el sistema debe realizar un bloqueo automático e inmediato antes de que la transacción se complete en el sistema bancario, evitando pérdidas financieras.
>
> El tablero para analistas de seguridad (RF005), una interfaz web intuitiva y responsiva, contiene el control total; allí los usuarios pueden observar, administrar y tomar acción respecto a las alertas. El tablero de control debe presentar en vivo las métricas claves de rendimiento, el flujo de transacciones procesadas y las alertas vigentes, clasificadas según su criticidad. Debe incorporar filtros sofisticados para buscar alertas según el estado, el monto, la fecha, el cliente y el tipo. El sistema presenta una vista detallada con datos del cliente, detalles de la transacción, el puntaje de riesgo, explicación de factores sospechosos, historial de transacciones y los dispositivos que se usaron cuando se elige una alerta específica.
>
> Los analistas deben tener la capacidad de examinar, autenticar y categorizar cada alerta manualmente como "Fraude Confirmado", "Falso Positivo", "Pendiente de Investigación" o "Requiere Contacto con Cliente" (RF006). Se debe registrar cada validación con el nombre del analista, la fecha y la hora, así como comentarios adicionales que expliquen el razonamiento detrás de la decisión para evitar acciones negligentes por parte del personal. Para el reentrenamiento constante del Modelo de IA (RF009), esta retroalimentación es esencial, ya que garantiza que la inteligencia artificial se vuelva más precisa ante las nuevas amenazas y aprenda de sus fallos (Falsos positivos y falsos negativos).
>
> El sistema tiene que conservar un Registro y Auditoría inalterable de todas las actividades (RF007), guardando registros detallados con marcas temporales exactas, identificadores exclusivos para cada transacción, información integral implicada y trazabilidad total del flujo de procesamiento. Estos registros inalterables son esenciales para auditorías regulatorias, investigaciones de fraude y cumplimiento normativo (PCI-DSS, ISO 27001). Por último, el sistema tiene que crear informes automáticos y personalizables (RF008) para evaluar la eficacia: cantidad de operaciones realizadas, alertas por nivel, porcentaje de fraudes detectados, tasa de falsos positivos, tiempo medio de respuesta, operaciones bloqueadas y total protegido (dinero salvado de intentos fraudulentos). Los informes deben poder generarse periódicamente y exportarse en formatos estándar como PDF, Excel, CSV y entre otros.

## Características de los usuarios

| Tipo de usuario | Administrador del Sistema                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Formación       | Conocimientos en administración de sistemas de información, seguridad informática, gestión de bases de datos y arquitectura de software. Formación técnica o profesional en ingeniería de sistemas, ciencias de la computación o carreras afines.                                                                                                                                                                                                                                                                                                                                                                 |
| Habilidades     | Capacidad para configurar y mantener el sistema, gestionar usuarios y permisos por roles, configurar umbrales de riesgo y reglas de alertas, supervisar el rendimiento del sistema, analizar logs técnicos, realizar actualizaciones y mantenimiento, gestionar copias de seguridad y recuperación ante fallos.                                                                                                                                                                                                                                                                                                   |
| Actividades     | Crear y gestionar cuentas de usuarios (analistas, auditores, operadores) asignando roles y permisos específicos, configurar los umbrales de score de riesgo para activación de alertas y bloqueos automáticos, supervisar el rendimiento del sistema y disponibilidad, revisar logs técnicos para identificar problemas o anomalías, programar y ejecutar el reentrenamiento del modelo de IA, gestionar las integraciones con el sistema bancario central, generar reportes de uso del sistema y métricas de efectividad, mantener la documentación técnica actualizada y coordinar actualizaciones de software. |

| Tipo de usuario | Analista de Seguridad / Equipo de Riesgos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Formación       | Conocimientos en seguridad financiera, detección de fraude, análisis de riesgos y comportamiento de clientes bancarios. Formación en finanzas, administración, criminología o áreas relacionadas con seguridad bancaria. Capacitación en uso de herramientas de análisis de datos y sistemas de detección de fraude.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Habilidades     | Capacidad para analizar alertas de fraude y tomar decisiones rápidas, interpretar scores de riesgo y factores sospechosos, identificar patrones de comportamiento fraudulento, validar transacciones sospechosas contactando clientes cuando sea necesario, gestionar múltiples casos simultáneamente bajo presión, documentar decisiones y hallazgos de forma clara.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Actividades     | Revisar en tiempo real las alertas generadas por el sistema clasificadas por nivel de criticidad (alta, media, baja), analizar los detalles completos de cada transacción sospechosa incluyendo datos del cliente, historial, dispositivos y ubicaciones, validar y clasificar manualmente cada alerta como "Fraude Confirmado", "Falso Positivo", "Pendiente de Investigación" o "Requiere Contacto con Cliente", desbloquear manualmente transacciones legítimas que fueron bloqueadas incorrectamente, proporcionar retroalimentación al sistema para mejorar la precisión del modelo de IA, consultar reportes históricos de transacciones y casos de fraude, coordinar con otras áreas del banco (atención al cliente, legal) cuando sea necesario para investigaciones complejas. |

| Tipo de usuario | Operador de Monitoreo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Formación       | Conocimientos básicos en operación de sistemas de información y atención al cliente. Capacitación técnica en el uso del dashboard del sistema TriDa. No requiere formación avanzada en seguridad o detección de fraude.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Habilidades     | Capacidad para monitorear el dashboard en tiempo real, identificar alertas que requieren atención inmediata, escalar casos complejos a analistas senior, realizar consultas básicas en el sistema, comunicarse efectivamente con otros miembros del equipo.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Actividades     | Monitorear el flujo de transacciones y alertas en tiempo real desde el dashboard, identificar alertas de alta criticidad y notificar inmediatamente a los analistas de seguridad, realizar consultas básicas de transacciones y clientes según instrucciones de analistas senior, registrar observaciones preliminares sobre alertas antes de escalarlas, escalar casos complejos o que excedan su nivel de autorización a analistas con mayor experiencia, mantener comunicación constante con el equipo de seguridad sobre el estado de las alertas activas. Tiene acceso limitado: puede visualizar alertas y datos básicos, pero NO puede validar, clasificar ni desbloquear transacciones. |

## Restricciones

El sistema está sujeto a diversas restricciones técnicas, operativas y normativas que delimitan su alcance y funcionamiento.

La arquitectura modular establece restricciones de comunicación entre componentes específicos. El módulo de ingesta solo puede recibir datos del sistema bancario mediante APIs autorizadas, y el modelo de IA opera de forma aislada durante el análisis. Todas las transferencias entre módulos deben implementar validación de integridad para prevenir pérdidas o corrupción de datos al momento del análisis.

El sistema depende completamente del sistema bancario central para su operación. No puede funcionar de manera autónoma ni procesar transacciones si el core banking no las proporciona. Los bloqueos automáticos requieren cooperación del sistema central para ejecutarse efectivamente.

Existen restricciones de compatibilidad tecnológica.

El dashboard del analista funcionará solo en navegadores modernos como: Chrome, Firefox, Edge y Safari con versiones recientes. Requiere conectividad a internet estable sin modo offline disponible. Los dispositivos deben cumplir requisitos mínimos de hardware para un rendimiento adecuado.

El sistema está limitado exclusivamente a detección de fraude transaccional, excluyendo funcionalidades de cumplimiento normativo completo (AML/KYC), análisis crediticio, scoring de préstamos o interfaces de interacción directa con clientes finales.

Las tareas de mantenimiento, actualización y reentrenamiento solo pueden ser realizadas por personal técnico autorizado. Estas operaciones deben programarse en ventanas de mantenimiento para minimizar impacto operativo, evitando modificaciones durante horarios de alto tráfico.

El sistema debe cumplir obligatoriamente con regulaciones financieras vigentes: PCI-DSS, ISO 27001, y Ley 1581 de 2012. Cualquier cambio normativo requerirá ajustes correspondientes en el sistema.

El modelo de Machine Learning tiene restricciones probabilísticas inherentes. No puede garantizar 100% de detección ni 0% de falsos positivos. Su efectividad depende de la calidad de datos históricos y requiere reentrenamiento periódico con datos.

## Suposiciones y dependencias

- Se asume que el banco cuenta con un sistema bancario central funcional que puede proporcionar datos de transacciones en tiempo real mediante APIs estandarizadas. Se presupone la existencia de datos históricos suficientes de transacciones legítimas y fraudulentas para el entrenamiento inicial del modelo de Machine Learning.

- Se asume que la institución bancaria dispondrá de personal capacitado (Analistas de seguridad) para revisar alertas y proporcionar retroalimentación al sistema. Se presupone que los usuarios del sistema tendrán acceso a dispositivos compatibles con navegadores modernos y conexión a internet estable

- El sistema depende completamente de la disponibilidad y funcionamiento del sistema bancario central para recibir el flujo de datos transaccionales. Sin esta integración, el sistema no puede operar.

- La solución requiere infraestructura de servidores (Local o en la nube) con capacidad de procesamiento suficiente para manejar el volumen de transacciones esperado. Depende de conectividad a internet estable para la operación del dashboard y las comunicaciones entre componentes.

- El modelo de Machine Learning depende de librerías y frameworks especializados (Python, TensorFlow u otros) que deben estar disponibles y actualizados. La efectividad del sistema depende de la calidad y cantidad de datos históricos proporcionados por el banco para el aprendizaje de la IA.

- El funcionamiento óptimo depende de la disponibilidad continua del equipo de analistas de seguridad para validar alertas y proporcionar retroalimentación que mejore el modelo.

## Evolución previsible del sistema

> La arquitectura modular del sistema TriDa permite su desarrollo y crecimiento en el futuro. Se estima que el sistema aumentará su capacidad y funcionalidad a medida que la institución bancaria detecte nuevas necesidades y peligros emergentes.
>
> Se prevé que, en un periodo breve (de 6 a 12 meses), el modelo de Machine Learning sea optimizado por medio de continuos reentrenamientos que mejoren la exactitud de detección y disminuyan los falsos positivos. Los analistas han detectado nuevos patrones de fraude que se añadirán, y los límites de riesgo se modificarán en función del comportamiento efectivo del sistema en producción.
>
> Se prevé que en un plazo medio (de uno a dos años), el sistema se expanda para incorporar la evaluación del comportamiento biométrico (patrones de escritura, uso del dispositivo, velocidad de navegación) con el fin de mejorar la detección de usuarios legítimos. Se tiene previsto llevar a cabo la detección de fraude, que consiste en examinar de manera completa las transacciones por medio de todos los canales bancarios (cajeros, web, móvil y sucursales) con el objetivo de detectar patrones coordinados de ataque.
>
> Para la validación de operaciones de alto riesgo, se prevé que para el largo plazo (de dos a cinco años) se incorporen sistemas avanzados de autenticación biométrica (como la huella dactilar, el reconocimiento facial o de voz). Se espera que las capacidades se amplíen para realizar análisis predictivos del riesgo de los clientes, lo cual permitirá el scoring preventivo, que detecta cuentas con una alta posibilidad de ser comprometidas antes de la ocurrencia del fraude.

# Requisitos específicos

## Requisitos comunes de los interfaces

### Interfaces de usuario

- El sistema estará disponible a través de navegadores modernos (Chrome, Firefox, Edge y Safari) mediante una interfaz web. La interfaz que verá cada usuario variará según su rol: Los operadores tendrán acceso básico de monitoreo, los auditores solo podrán consultar reportes e historial, los analistas visualizarán el tablero con alertas y transacciones para examinar y los administradores tendrán la capacidad de gestionar usuarios y configurar el sistema.

- Las alertas se organizarán por colores en el panel principal: amarillo para riesgo medio, rojo para alto y verde para bajo. Los analistas tendrán la posibilidad de pulsar cada alerta para examinar todos los datos de la transacción sospechosa y validarla como un fraude o un falso positivo. La interfaz será fácil de usar e intuitiva, sin requerir un entrenamiento prolongado.

### Interfaces de hardware

- Los servidores donde se instalará el sistema necesitan como mínimo 4 núcleos de CPU, 16GB de RAM y disco duro SSD para buen rendimiento. La conexión de red debe ser estable mediante WiFi o cable ethernet.

- Las computadoras de los analistas necesitan ser modernas con al menos 8GB de RAM y pantalla de resolución 1920x1080 para ver bien el dashboard. El sistema también funcionará en tablets y celulares, aunque con funciones limitadas para monitoreo básico.

### Interfaces de software

- El sistema se conectará con el sistema bancario del banco mediante APIs para recibir los datos de las transacciones en tiempo real. Usará bases de datos como PostgreSQL o MongoDB para guardar toda la información de transacciones, alertas y configuraciones.

- Para la detección y el análisis de fraudes, el modelo de inteligencia artificial empleará bibliotecas como TensorFlow o Scikit-learn. Para determinar el lugar desde donde las transacciones se realizan, el sistema también se conectará con servicios de geolocalización (por ejemplo Google Maps). Las librerías de visualización, como Chart.js, se emplearán para los gráficos y las estadísticas del tablero.

> ​

### Interfaces de comunicación

- Las comunicaciones entre el sistema y el banco serán seguras mediante la utilización de protocolos HTTPS encriptados. Para salvaguardar la información delicada, no se admitirán conexiones sin cifrado.

## Requisitos funcionales

### Requisito funcional 1

| Número de requisito     | RF001                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |                 |                  |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|------------------|
| Nombre de requisito     | Ingesta y Procesamiento de Datos Transaccionales                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                 |                  |
| Tipo                    | X ☐ Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ☐ Restricción   |                  |
| Fuente del requisito    | Sistema bancario central                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                 |                  |
| Prioridad del requisito | X ☐ Alta/Esencial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | ☐ Media/Deseado | ☐ Baja/ Opcional |
| Descripción             | El sistema debe recibir y procesar datos transaccionales del sistema bancario central en tiempo real. Cada transacción ejecutada en cualquier canal bancario (App móvil, web, cajero, punto de venta) será capturada automáticamente. El sistema extraerá información relevante como monto, origen, destino, tipo de transacción, dispositivo, ubicación geográfica, hora y fecha. Además, enriquecerá estos datos consultando el historial transaccional del cliente, patrones de comportamiento habituales, dispositivos conocidos y ubicaciones frecuentes. La información enriquecida se normalizará en un formato estándar para su análisis posterior por el modelo de IA. |                 |                  |

### Requisito funcional 2

| Número de requisito     | RF002                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                 |                  |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|------------------|
| Nombre de requisito     | Análisis Inteligente con IA y Cálculo de Score de Riesgo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |                 |                  |
| Tipo                    | X ☐ Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ☐ Restricción   |                  |
| Fuente del requisito    | Módulo de Machine Learning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |                 |                  |
| Prioridad del requisito | X ☐ Alta/Esencial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ☐ Media/Deseado | ☐ Baja/ Opcional |
| Descripción             | El sistema implementará un modelo de Machine Learning que analizará cada transacción procesada y calculará un puntaje de riesgo del 0% al 100%, donde 0% es completamente legítima y 100% altamente sospechosa. El modelo identificará patrones anómalos comparando la transacción actual con el comportamiento histórico del cliente y patrones conocidos de fraude. Detectará situaciones como transacciones inusuales en ubicaciones diferentes, montos atípicos, dispositivos desconocidos, velocidad transaccional sospechosa y secuencias que coincidan con técnicas fraudulentas. El score se generará automáticamente con una explicación comprensible de los factores que influyeron en la calificación asignada. |                 |                  |

### Requisito funcional 3

| Número de requisito     | RF003                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                 |                  |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|------------------|
| Nombre de requisito     | Generación Automática de Alertas por Nivel de Riesgo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                 |                  |
| Tipo                    | X ☐ Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | ☐ Restricción   |                  |
| Fuente del requisito    | Motor de reglas y alertas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                 |                  |
| Prioridad del requisito | X ☐ Alta/Esencial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ☐ Media/Deseado | ☐ Baja/ Opcional |
| Descripción             | El sistema generará alertas automáticas cuando una transacción supere los umbrales configurados. Las alertas se categorizarán en tres niveles: baja (30-49%), media (50-79%) y alta (80-100%). Cada alerta contendrá información detallada: datos completos de la transacción, score de riesgo calculado, factores que contribuyeron a la sospecha, historial reciente del cliente y marca temporal precisa. Las alertas se enviarán en tiempo real al dashboard del equipo de seguridad y se almacenarán para consulta posterior. Dependiendo del nivel de criticidad, el sistema notificará a los analistas mediante diferentes canales (visual, push, email). |                 |                  |

### Requisito funcional 4

| Número de requisito     | RF004                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                   |                  |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|------------------|
| Nombre de requisito     | Bloqueo Automático de Transacciones Sospechosas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                   |                  |
| Tipo                    | X ☐ Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | ☐ Restricción     |                  |
| Fuente del requisito    | Motor de prevención                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                   |                  |
| Prioridad del requisito | ☐ Alta/Esencial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | X ☐ Media/Deseado | ☐ Baja/ Opcional |
| Descripción             | El sistema bloqueará automáticamente transacciones con score de riesgo superior al 95% antes de que se completen en el sistema bancario, previniendo pérdidas económicas. Al activarse un bloqueo, el sistema enviará notificación inmediata al equipo de seguridad mediante el dashboard, registrará el evento en auditoría y comunicará al cliente mediante canales oficiales (app, SMS, email) que su transacción fue detenida por seguridad. El sistema permitirá que un analista autorizado pueda desbloquear manualmente la transacción si se determina que fue un falso positivo. |                   |                  |

### Requisito funcional 5

| Número de requisito     | RF005                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                 |                  |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|------------------|
| Nombre de requisito     | Dashboard para Analistas de Seguridad                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                 |                  |
| Tipo                    | X ☐ Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | ☐ Restricción   |                  |
| Fuente del requisito    | Interfaz web del sistema                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                 |                  |
| Prioridad del requisito | x ☐ Alta/Esencial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | ☐ Media/Deseado | ☐ Baja/ Opcional |
| Descripción             | El sistema proporcionará una interfaz web intuitiva y responsiva donde los analistas podrán visualizar, gestionar y actuar sobre las alertas generadas. El dashboard mostrará en tiempo real el flujo de transacciones procesadas, alertas activas organizadas por criticidad y métricas clave de rendimiento. Incluirá filtros avanzados para buscar alertas por fecha, cliente, monto, score, tipo y estado. Al seleccionar una alerta, desplegará una vista detallada con datos del cliente, detalles de transacción, score, explicación de factores, historial y dispositivos. Los analistas podrán marcar cada alerta como "Fraude Confirmado" o "Falso Positivo", proporcionando retroalimentación para reentrenar el modelo de IA. También incluirá gráficos de estadísticas. |                 |                  |

### Requisito funcional 6

| Número de requisito     | RF006                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |                   |                  |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|------------------|
| Nombre de requisito     | Gestión y Validación Manual de Alertas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                   |                  |
| Tipo                    | X ☐ Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | ☐ Restricción     |                  |
| Fuente del requisito    | Módulo de gestión de casos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                   |                  |
| Prioridad del requisito | ☐ Alta/Esencial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | X ☐ Media/Deseado | ☐ Baja/ Opcional |
| Descripción             | El sistema permitirá que los analistas revisen, validen y gestionen manualmente las alertas generadas. Los usuarios autorizados podrán acceder a cada alerta, revisar el contexto completo, consultar información adicional y tomar decisiones informadas. Los analistas podrán clasificar cada alerta en: "Fraude Confirmado", "Falso Positivo", "Pendiente de Investigación" o "Requiere Contacto con Cliente". Cada validación se registrará con nombre del analista, fecha, hora y comentarios opcionales. Esta retroalimentación es fundamental para que el sistema aprenda y mejore su precisión con el tiempo. |                   |                  |

### Requisito funcional 7

| Número de requisito     | RF007                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |                 |                  |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|------------------|
| Nombre de requisito     | Registro y Auditoría de Transacciones                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |                 |                  |
| Tipo                    | X ☐ Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ☐ Restricción   |                  |
| Fuente del requisito    | Módulo de auditoría                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                 |                  |
| Prioridad del requisito | X ☐ Alta/Esencial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | ☐ Media/Deseado | ☐ Baja/ Opcional |
| Descripción             | El sistema registrará de forma inmutable y permanente todas las transacciones procesadas, scores asignados, decisiones automatizadas (aprobaciones, alertas, bloqueos) y acciones de analistas. Este módulo almacenará logs detallados con marcas temporales precisas, identificadores únicos, datos completos y trazabilidad del flujo. Los registros serán inalterables para garantizar evidencia en investigaciones de fraude, cumplimiento normativo (PCI-DSS, ISO 27001) y auditorías regulatorias. El sistema permitirá consultas en registros históricos para análisis forense y generación de reportes. |                 |                  |

### 3.2.8 Requisito funcional 8

| Número de requisito     | RF008                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                 |                  |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|------------------|
| Nombre de requisito     | Generación de Reportes y Métricas de Desempeño                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |                 |                  |
| Tipo                    | X ☐ Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | ☐ Restricción   |                  |
| Fuente del requisito    | Módulo de reportes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                 |                  |
| Prioridad del requisito | X ☐ Alta/Esencial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ☐ Media/Deseado | ☐ Baja/ Opcional |
| Descripción             | El sistema generará reportes automáticos y personalizables con métricas clave sobre rendimiento y efectividad. Los reportes incluirán: número de transacciones procesadas, alertas generadas por nivel, tasa de detección de fraudes, tasa de falsos positivos, tiempo promedio de respuesta, transacciones bloqueadas, monto protegido y tendencias temporales. Los reportes se generarán automáticamente en intervalos configurables (diarios, semanales, mensuales) y podrán exportarse en formatos PDF, Excel y CSV. El sistema visualizará estas métricas en el dashboard mediante gráficos interactivos. |                 |                  |

### 3.2.9 Requisito funcional 9

| Número de requisito     | RF009                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |                 |                  |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|------------------|
| Nombre de requisito     | Reentrenamiento del Modelo de IA                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                 |                  |
| Tipo                    | X ☐ Requisito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | ☐ Restricción   |                  |
| Fuente del requisito    | Módulo de Machine Learning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                 |                  |
| Prioridad del requisito | X ☐ Alta/Esencial                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | ☐ Media/Deseado | ☐ Baja/ Opcional |
| Descripción             | El sistema permitirá el reentrenamiento periódico del modelo de Machine Learning utilizando nuevos datos de transacciones validadas por los analistas. Esta funcionalidad recopilará automáticamente las validaciones realizadas (fraudes confirmados y falsos positivos), las incorporará al conjunto de entrenamiento y ejecutará un proceso de reentrenamiento para mejorar precisión y capacidad de detección. El reentrenamiento podrá programarse periódicamente o ejecutarse manualmente. El sistema evaluará el nuevo modelo mediante métricas de validación antes de implementarlo en producción. Mantendrá un historial de versiones para poder revertir si es necesario. |                 |                  |

## Requisitos no funcionales

### Requisitos de rendimiento

RNF01

> El sistema tiene que procesar y examinar cada transacción con una latencia máxima de 500 milisegundos, desde el momento en que recibe la información hasta que produce el puntaje de riesgo y toma una resolución. Para que la experiencia del cliente legítimo no se vea afectada, es crucial este tiempo de respuesta; el cliente no debe notar retrasos relevantes al llevar a cabo sus operaciones bancarias habituales. El procesamiento debe ser lo suficientemente rápido para que una operación común en un punto de venta, aplicación móvil o cajero automático se lleve a cabo sin demoras notables. Durante las horas de mayor actividad bancaria, el sistema tiene que sostener este rendimiento, aun con una carga elevada (miles de transacciones al mismo tiempo). Para asegurar este requisito, es necesario aplicar métodos de optimización como los algoritmos eficientes, el procesado en paralelo y la caché de datos que se utilizan con frecuencia.

|     |     |     |     |
|-----|-----|-----|-----|
|     |     |     |     |
|     |     |     |     |
|     |     |     |     |
|     |     |     |     |
|     |     |     |     |

| Número de requisito     | RNF01                                                                          |                 |                  |
|-------------------------|--------------------------------------------------------------------------------|-----------------|------------------|
| Nombre de requisito     | Los tiempos de respuesta no deberán superar 2 segundos en operaciones comunes. |                 |                  |
| Tipo                    | Requisito                                                                      | ☐ Restricción   |                  |
| Fuente del requisito    | N/A                                                                            |                 |                  |
| Prioridad del requisito | ☐ Alta/Esencial                                                                | ☐ Media/Deseado | ☐ Baja/ Opcional |
|                         | Baja/opcional                                                                  |                 |                  |

RNF02

> El modelo de Inteligencia Artificial del sistema debe alcanzar y mantener una tasa de detección de fraudes reales superior al 90%. Esto significa que de cada 100 transacciones fraudulentas que ocurran, el sistema debe detectar y marcar correctamente al menos 90 de ellas. Esta métrica debe medirse y validarse mediante pruebas con conjuntos de datos históricos de fraudes conocidos y mediante monitoreo continuo del desempeño en producción. El sistema debe priorizar la detección efectiva de fraudes sobre la reducción de falsos positivos, aunque debe buscar un balance óptimo entre ambas métricas. La tasa de detección debe reportarse regularmente en los informes de desempeño y mejorarse continuamente mediante el reentrenamiento del modelo.

| Número de requisito     | RNF01                                                                          |                 |                  |
|-------------------------|--------------------------------------------------------------------------------|-----------------|------------------|
| Nombre de requisito     | Los tiempos de respuesta no deberán superar 2 segundos en operaciones comunes. |                 |                  |
| Tipo                    | ☐ Requisito                                                                    | ☐ Restricción   |                  |
| Fuente del requisito    | N/A                                                                            |                 |                  |
| Prioridad del requisito | ☐ Alta/Esencial                                                                | ☐ Media/Deseado | ☐ Baja/ Opcional |
|                         | Baja/opcional                                                                  |                 |                  |

RNF03

> El sistema debe soportar el procesamiento de al menos 1,000 transacciones por segundo de manera simultánea sin degradar su rendimiento, manteniendo la latencia máxima establecida incluso bajo carga alta en horas pico. La arquitectura debe diseñarse con capacidad de escalamiento para manejar incrementos futuros en el volumen transaccional.

### Seguridad

RNF04

> El sistema tiene que asegurar la confidencialidad y la seguridad de toda la información delicada que procesa y guarda. La información financiera, los registros de las transacciones, las credenciales de acceso y los datos personales de los clientes tienen que ser salvaguardados a través de una encriptación sólida, tanto cuando están en reposo (almacenados en bases de datos) como durante el tránsito (en la comunicación entre sistemas). Para la información almacenada, se debe aplicar encriptación AES-256 o de mayor nivel, y para las comunicaciones, TLS 1.3. El sistema tiene que ajustarse a normas de seguridad como ISO 27001 y PCI-DSS (Payment Card Industry Data Security Standard). Es necesario que todas las interacciones entre el sistema bancario y el sistema TriDa estén protegidas y verificadas a través de certificados digitales.

RNF05

> El sistema tiene que establecer un procedimiento sólido de autorización y autenticación basado en los roles de usuario. Todo individuo que ingrese al sistema debe identificarse a través de credenciales seguras, ya sea una contraseña y un nombre de usuario con requerimientos mínimos de complejidad o, idealmente, mediante autenticación multifactor. El sistema debe establecer varios roles: "Analista de Seguridad" (quien tiene la capacidad de revisar y validar alertas), "Administrador del Sistema" (que puede administrar usuarios, configurar umbrales y acceder a informes completos), "Auditor" (con acceso solo a los registros y reportes) y "Operador" (con acceso restringido a funciones básicas). Cada rol debe contar con permisos particulares que limiten el acceso a datos confidenciales y a funciones delicadas. El sistema tiene que documentar todos los accesos y actividades de los usuarios para fines de auditoría. Con el fin de evitar accesos no autorizados, las sesiones deben cerrarse automáticamente tras lapsos de tiempo sin actividad.

RNF06

> Todas las conexiones entre el sistema TriDa y el sistema bancario deben ser seguras y autenticadas mediante certificados digitales, implementando validación mutua (mutual TLS) para garantizar que ambos extremos de la comunicación sean legítimos. No se permitirán conexiones no encriptadas en ninguna circunstancia.

### Disponibilidad

RNF07

El sistema tiene que asegurar que, durante un funcionamiento 24/7, la disponibilidad mínima sea del 99.5%. Esto se traduce en un tiempo de inactividad mensual de alrededor de 3.6 horas. El sistema debe ser diseñado con una arquitectura resiliente que contemple la redundancia de elementos críticos, el balanceo de carga, los respaldos automáticos y los procedimientos para recuperarse en caso de fallar, a fin de alcanzar este nivel de disponibilidad. Es necesario establecer un monitoreo constante que identifique inconvenientes de disponibilidad o rendimiento y notifique al equipo técnico de inmediato. Si algún componente falla, el sistema tiene que reponerse de forma automática o degradarse en un modo controlado sin que se pierdan los datos. Es necesario planear las actualizaciones y el mantenimiento en ventanas horarias de bajo impacto, además de informarle a los usuarios con antelación.

RNF08

El sistema tiene que asegurar que, durante un funcionamiento 24/7, la disponibilidad mínima sea del 99.5%. Esto se traduce en un tiempo de inactividad mensual de alrededor de 3.6 horas. El sistema debe ser diseñado con una arquitectura resiliente que contemple la redundancia de elementos críticos, el balanceo de carga, los respaldos automáticos y los procedimientos para recuperarse en caso de fallar, a fin de alcanzar este nivel de disponibilidad. Es necesario establecer un monitoreo constante que identifique inconvenientes de disponibilidad o rendimiento y notifique al equipo técnico de inmediato. Si algún componente falla, el sistema tiene que reponerse de forma automática o degradarse en un modo controlado sin que se pierdan los datos. Es necesario planear las actualizaciones y el mantenimiento en ventanas horarias de bajo impacto, además de informarle a los usuarios con antelación.

RNF09

En caso de fallo crítico del sistema, el tiempo de recuperación para restablecer operaciones no debe exceder las 4 horas. El punto de recuperación (RPO - Recovery Point Objective) no debe exceder 1 hora de datos, garantizando que en el peor escenario se pierda información de máximo una hora de transacciones. Estos objetivos deben respaldarse con infraestructura redundante y procedimientos automatizados de recuperación.

### Mantenibilidad

RNF10

El conjunto de desarrolladores debe poder mantener, actualizar y modificar el sistema con facilidad. El código fuente debe redactarse de acuerdo con las mejores prácticas de programación y los estándares de codificación, además de estar correctamente anotado. La arquitectura tiene que ser modular, lo que hace posible cambiar o sustituir partes individuales sin perjudicar al sistema en su totalidad. Es necesario tener documentación técnica integral que contenga: manuales de usuario, diagramas arquitectónicos, guías para la instalación y configuración, descripciones de los elementos constitutivos y procedimientos para el mantenimiento. Las actualizaciones del modelo de inteligencia artificial, las correcciones de errores y las mejoras en la funcionalidad deben ser capaces de llevarse a cabo con la menor interrupción posible del servicio.

RNF11

La arquitectura modular debe posibilitar que se cambien o modifiquen componentes individuales sin que eso afecte al sistema en su totalidad. Para permitir el mantenimiento autónomo, los módulos deben poseer interfaces claramente definidas y bajo acoplamiento. El diseño tiene que ceñirse a patrones arquitectónicos reconocidos (MVC, microservicios, capas) y a los principios SOLID cuando sea necesario.

### Portabilidad

RNF12

Es necesario que el sistema esté diseñado para ser portátil y compatible con varios entornos tecnológicos. Sin la necesidad de realizar modificaciones importantes, debe ser capaz de ejecutarse en plataformas de nube (Google Cloud Platform, AWS, Azure), así como en servidores locales físicos (on-premise). El panel web debe ser compatible con los navegadores más comunes y modernos: Google Chrome (versiones actuales), Mozilla Firefox, Microsoft Edge y Safari, disponibles en sistemas operativos de escritorio (Linux, Windows, macOS) y en dispositivos móviles (Android, iOS). La dependencia de tecnologías propietarias debe reducirse para que en el futuro la migración entre plataformas sea más sencilla.

## Otros requisitos

Or-01: Formato de score.

Descripción: Los scores de riesgo deben expresarse como porcentajes con un decimal: 85,5%.

Justificación: Garantizar claridad y evitar confusiones en el análisis de transacciones financieras.

Or-02: Cumplimiento normativo de la Superintendencia Financiera de Colombia.

Descripción: El sistema debe cumplir con las regulaciones de la Superintendencia Financiera de Colombia en materia de seguridad bancaria, gestión de riesgos operacionales y reporte de fraudes. Debe permitir generar reportes en los formatos exigidos por esta entidad para auditorías y supervisión.

Justificación: Cumplimiento obligatorio con el marco regulatorio colombiano para instituciones financieras.

Or-03: Protección de datos personales - Ley 1581 de 2012.

Descripción: El sistema debe cumplir con la Ley 1581 de 2012 de protección de datos personales en Colombia. Debe solicitar de manera explícita el consentimiento para recolectar y procesar datos de clientes, mostrar la política de tratamiento de datos accesible desde el sistema. Debe permitir que los usuarios ejerzan sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) Consultar qué datos se tienen almacenados, corregir información incorrecta, solicitar eliminación de sus datos cuando aplique, y oponerse a ciertos usos de su información.

Justificación: Cumplimiento legal obligatorio con las leyes de privacidad colombianas y respeto a los derechos fundamentales de los clientes.

Or-04: Sensibilidad cultural en comunicaciones.

Descripción: Las notificaciones automáticas a clientes cuando se bloquean transacciones deben redactarse con tono respetuoso, empático y sin generar alarma innecesaria. Deben evitar términos acusatorios como "Actividad sospechosa de su parte" y usar en su lugar "Transacción inusual detectada por nuestro sistema de seguridad para proteger sus fondos".

Justificación: Mantener la confianza y buena relación con clientes legítimos que puedan experimentar bloqueos por falsos positivos. 

Or-05: Política de responsabilidad ante falsos positivos.

Descripción: El sistema debe incluir mecanismos que permitan al banco compensar rápidamente a clientes afectados por bloqueos incorrectos. Debe mantener estadísticas de falsos positivos por cliente para evitar bloquear repetidamente a usuarios legítimos, ajustando automáticamente sus perfiles de riesgo tras múltiples validaciones como "Falso Positivo".

Justificación: Proteger la reputación del banco y la satisfacción del cliente, balanceando la seguridad con una experiencia de usuario positiva. 

# Apéndices

> *Pueden contener todo tipo de información relevante para la SRS pero que, propiamente, no forme parte de la SRS.*
