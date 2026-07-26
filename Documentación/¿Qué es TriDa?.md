# Sistema de Monitoreo de Transacciones con IA para Detección de Fraude

## Introducción

El sector de Finanzas y Bancos experimenta una transformación digital bastante acelerada a comparación de años posteriores, lo que ha facilitado la adopción masiva de transacciones electrónicas, pagos móviles y banca en línea. Pero estos avances vienen acompañados de un aumento significativo en la sofisticación y aumento en el fraude financiero y de ciberataques. Los softwares de detección de fraude son ambiguos, basados en reglas fijas y revisión manual, resultando insuficientes y lentos para el enorme flujo de clientes y los activos de los mismos, de igual forma la integridad del sistema bancario en tiempo real.

El software a desarrollar tiene como objetivo un Sistema de Monitoreo de Transacciones basado en inteligencia Artificial (IA), más concretamente haciendo uso de Machine Learning. Su función principal será analizar patrones de comportamiento transaccional de cada cliente en tiempo real. El sistema va a utilizar como base algoritmos para aprender los hábitos normales de cada cliente/usuario, a partir de esto, calculará un índice de riesgo para cada transacción y posteriormente, generar una alerta. En casos extremos el sistema bloqueará automáticamente la transacción para prevenir pérdidas financieras, protegiendo la integridad y activos de cada usuario.

El alcance de este proyecto se centra en:

- **Desarrollo del Módulo Central de Detección**: Implementación de un modelo de Machine Learning para la clasificación de transacciones (legítima vs. fraudulenta).
- **Integración de Datos**: Capacidad de ingestar, extraer y procesar flujos de datos transaccionales en tiempo casi real.
- **Interfaz de Alertas (Dashboard)**: Creación de un panel de control para que el equipo de seguridad pueda visualizar, gestionar y actuar sobre las alertas de fraude generadas por el sistema.
- **Reportes Básicos**: Generación de métricas sobre la efectividad del modelo (Tasa de detección, falsos positivos).

## Planteamiento del problema

El sector de finanzas y bancos ha experimentado una transformación digital acelerada en los últimos años, lo que ha facilitado la adopción masiva de transacciones electrónicas, pagos móviles y banca en línea. Sin embargo, estos avances han traído consigo un aumento significativo en la sofisticación de los fraudes financieros y ciberataques. Los sistemas actuales de detección de fraude, basados en reglas estáticas y revisión manual, resultan insuficientes para hacer frente al enorme volumen y velocidad de las transacciones diarias, poniendo en riesgo tanto los activos de los clientes como la integridad del sistema bancario.

El problema central que se busca resolver es la limitada capacidad de los sistemas de detección de fraude actuales para identificar patrones de fraude emergentes y complejos en entornos de alto volumen y velocidad transaccional.

Estos sistemas operan bajo un enfoque reactivo: Identifican y reportan el fraude una vez que ya se ha consumado y la pérdida ya se ha materializado. La necesidad es migrar hacia un enfoque proactivo y predictivo, capaz de detectar y detener el fraude antes de que se complete, evitando que el daño sea irreversible.

### ¿A quién afecta?

**Instituciones financieras:**

- Experimentan pérdidas económicas directas por fraudes consumados, que en muchos casos deben absorber por políticas internas o para enmendar el daño al cliente.
- Enfrentan multas regulatorias por no cumplir estándares de seguridad exigidos por entidades como la Superintendencia Financiera de Colombia.
- Sufren daño reputacional que se traduce en pérdida de credibilidad y clientes.

**Clientes bancarios:**

- Son las principales víctimas de los ciberfraudes, experimentando pérdidas económicas directas.
- Incurren en estrés y tiempo invertido en disputas con la institución financiera para recuperar sus fondos.
- Experimentan una disminución de confianza hacia la institución que debía proteger sus activos.

### Consecuencias

Si no se presenta una solución se pueden presentar los siguientes problemas:

- Aumento exponencial en las pérdidas de clientes, activos y credibilidad.
- Los sistemas de detección quedarán obsoletos de manera tecnológica rápidamente ante las tácticas cada vez mejor desarrolladas y cambiantes de los defraudadores, volviéndose ineficaz.
- Ante los fraudes al cliente, las instituciones para compensar la inseguridad, se verán obligados a imponer medidas de seguridad manuales e incómodas, degradando la experiencia del usuario.

Este proyecto es fundamental porque aborda la seguridad financiera mediante la aplicación de tecnología. El uso de Machine Learning permite una adaptación continua a las nuevas amenazas, algo imposible para los sistemas tradicionales basados en reglas. *La implementación de este sistema representa una inversión estratégica en la confianza del cliente y en la protección del capital de las instituciones y los usuarios.*

Sí no se implementa una solución adecuada, se pueden esperar las siguientes consecuencias a corto y largo plazo:

- **Aumento exponencial de pérdidas**: Los fraudes crecerán en cantidad y sofisticación, incrementando las pérdidas económicas tanto de instituciones como de clientes.
- **Obsolescencia tecnológica**: Los sistemas basados en reglas estáticas perderán eficacia rápidamente frente a las tácticas cada vez más elaboradas de los defraudadores.
- **Degradación de la experiencia del usuario**: Las instituciones, al intentar compensar la inseguridad, se verán obligadas a implementar medidas de seguridad manuales e incómodas que afecten negativamente la experiencia del cliente legítimo.

### Solución propuesta

Se propone el desarrollo de TriDa (Sistema de Monitoreo de Transacciones con IA para Detección de Fraude), una solución basada en Machine Learning que analice patrones de comportamiento transaccional en tiempo real. El sistema será capaz de:

- Aprender los hábitos normales de cada cliente mediante el análisis de sus transacciones históricas.
- Calcular un score de riesgo (0%-100%) para cada transacción en menos de 500 milisegundos.
- Generar alertas automáticas clasificadas por nivel de criticidad.
- Bloquear automáticamente transacciones con alto riesgo de fraude antes de que se completen.

## Objetivos

**General:** Desarrollar un MVP (Minimum Viable Product) de un Sistema de Monitoreo de Transacciones basado en Inteligencia Artificial (Machine Learning) para la detección proactiva de fraude financiero en tiempo real, alcanzando una tasa de detección superior al 90% y minimizando pérdidas económicas mediante el bloqueo automático de transacciones sospechosas.

**Específicos:**

- **Modelo y entrenamiento**: Diseñar, entrenar y validar un modelo de Machine Learning capaz de clasificar transacciones bancarias como legítimas o fraudulentas con una taza de detección de fraudes de >90%.
- **Integración y alertas en tiempo real**: Crear un sistema de ingesta y procesamiento de datos transaccionales que permita el análisis y la asignación de score de riesgo con latencia mínima (Latencia máxima de procesamiento: 500 milisegundos por transacción).
- **Interfaz y Usabilidad**: Implementar un sistema automatizado de generación de alertas clasificadas por nivel de criticidad y bloqueo condicional de transacciones de alto riesgo.
