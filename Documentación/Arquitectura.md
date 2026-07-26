# Sistema de Monitoreo de Transacciones con IA para Detección de Fraude

## TriDa versión MVP

## ARQUITECTURA DE CAPAS

**PRESENTADO POR:**

ANGIE CATALINA BUENO MELO
JUAN DIEGO MORALES

FICHA No. 3311987

**PRESENTADO:**

SERVICIO NACIONAL DE APRENDIZAJE SENA

TECNÓLOGO EN ANÁLISIS Y DESARROLLO DE SOFTWARE

ESPECIFICACIÓN DE REQUERIMIENTOS

BOGOTÁ D.C 10 04 2026

---

## Arquitectura del Sistema

TriDa implementa una arquitectura en capas, concretamente hace uso de tres de ellas, desacopladas, siguiendo los principios de alta cohesión interna y bajo acoplamiento entre módulos. El diagrama que se presenta a continuación ilustra la organización completa del sistema, desde los componentes de interfaz de usuario hasta el esquema de persistencia, incluyendo el Núcleo TRIDA como orquestador central y la Interfaz IA como capa de integración con los agentes externos.

## Capa de presentación

El frontend está construido con React y organizado en seis módulos independientes: Autenticación con MFA, dashboard y alertas, transacciones, gestión de dispositivos, reportes. Cada módulo es un componente React autónomo que se comunica con el backend exclusivamente mediante API REST sobre HTTPS, con autenticación por tokens JWT. Esta separación garantiza que cada módulo pueda desarrollarse, probarse y desplegarse de forma independiente sin riesgo de interferencia entre funcionalidades.

## Capa de lógica de negocio

El backend implementado con Express.js contiene los servicios especializados de detección y el Núcleo TriDA como orquestador central. El Núcleo no procesa directamente ninguna señal individual: su responsabilidad es coordinar el flujo completo de análisis, agregar los resultados de cada servicio y producir la decisión final. Este diseño evita la dispersión de la lógica de decisión entre múltiples servicios un antipatrón frecuente que genera inconsistencias y dificulta el mantenimiento. La IA será implementada mediante el patrón Adapter, define el contrato de comunicación con cualquier agente externo y permite conmutar entre proveedores modificando exclusivamente una configuración en base de datos.

## Capa de persistencia

La base de datos implementa un esquema relacional normalizado en tercera forma normal con diez tablas que cubren la totalidad del dominio del sistema. Las entidades centrales son clientes, dispositivos, transacciones y alertas; las de soporte incluyen ubicaciones, validaciones, logs de auditoría, configuración de IA. La integridad referencial se garantiza mediante relaciones explícitas: Un cliente puede tener múltiples dispositivos, cada transacción está vinculada a un cliente y un dispositivo, y cada alerta está asociada a una transacción específica. PostgreSQL es la elección correcta para un sistema de esta naturaleza, ya que se trata de una base de datos robusta, capaz de soportar altos volúmenes de transacciones concurrentes, con soporte nativo para transacciones ACID, control de concurrencia (MVCC), replicación e integridad referencial avanzada, características indispensables para un sistema financiero crítico que debe escalar de forma segura y confiable a medida que crece el volumen transaccional.

## Tecnología usada:

Para el desarrollo de TriDa, se ha seleccionado un stack tecnológico moderno que permite el desacoplamiento de componentes y la escalabilidad del sistema:

### 1. Frontend: React (Framework de JavaScript).

Función: Se encarga de la interfaz de usuario (UI) y la experiencia del usuario (UX).

Justificación: Al ser un framework basado en componentes, React permite que el Dashboard de Alertas y el Módulo de Transacciones sean independientes. Esto facilita actualizaciones rápidas en la interfaz sin afectar la lógica del servidor, permitiendo una visualización de datos en tiempo real de forma ágil.

### 2. Backend: Express.js (Framework de Aplicación)

Función: Es el núcleo del sistema que gestiona la lógica de negocio y las reglas anti-fraude.

Justificación: Elegimos Express.js por su ligereza, flexibilidad y su capacidad para crear APIs REST de alto rendimiento sobre Node.js. Facilita la integración de seguridad (JWT) y la conexión con la base de datos mediante ORMs como Sequelize o Prisma, garantizando que el procesamiento de grandes volúmenes de transacciones sea estable, rápido y escalable, además de aprovechar el modelo asíncrono no bloqueante de Node.js para el manejo eficiente de múltiples solicitudes concurrentes.

### 3. Base de Datos: PostgreSQL

Función: Almacenamiento y persistencia de datos.

Justificación: Es la solución ideal para un sistema robusto como TriDa. PostgreSQL ofrece garantías ACID completas, control de concurrencia multiversión (MVCC), soporte para índices avanzados y alto rendimiento en operaciones concurrentes, lo cual es esencial para procesar transacciones financieras en tiempo real sin comprometer la integridad de los datos. Además, escala verticalmente y horizontalmente con facilidad (particionamiento, réplicas de lectura), cuenta con un ecosistema maduro de extensiones (como PostGIS para geolocalización) y es la opción estándar de la industria para sistemas financieros y de detección de fraude que requieren alta disponibilidad y consistencia de datos.

### 4. Inteligencia Artificial: Gemini API (Externa).

Función: Proporciona el análisis cognitivo para la detección de patrones sospechosos.

Justificación: El uso de una API externa de última generación permite que TriDa delegue el procesamiento complejo de lenguaje y comportamiento a un modelo de IA avanzado, permitiendo obtener un score de riesgo preciso sin necesidad de entrene o cree un modelo desde cero.

### 5. Arquitectura: Adapter Pattern (Patrón de Diseño).

Función: Actúa como un traductor entre nuestro Backend y la API de IA.

Justificación: Este patrón es vital para la modularidad. Nos permite conectar a Gemini hoy, pero deja el sistema listo para cambiar a cualquier otra IA (como GPT o Claude) simplemente cambiando el "adaptador", sin tener que modificar el código principal de las transacciones.
