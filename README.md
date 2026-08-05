# Arquitectura de TriDa

## Introducción

La arquitectura de TriDa fue diseñada bajo un enfoque modular, escalable y desacoplado, permitiendo su integración con distintos sistemas financieros sin depender de tecnologías específicas del cliente.

TriDa opera como un sistema inteligente de evaluación de riesgo que trabaja en segundo plano durante el procesamiento de las transacciones. Su función consiste en analizar múltiples factores de riesgo mediante un modelo de Inteligencia Artificial ejecutado localmente, estimando la probabilidad de fraude antes de que la transacción continúe su flujo normal.

Este enfoque permite combinar un análisis basado en características previamente definidas con la capacidad del modelo para identificar patrones complejos presentes en los datos históricos.

La arquitectura prioriza los siguientes principios:

- Baja latencia.
- Escalabilidad.
- Independencia de servicios externos.
- Integración sencilla con sistemas existentes.
- Explicabilidad de las decisiones.
- Capacidad de evolución del modelo.

---

# Principios de diseño

La arquitectura de TriDa fue diseñada siguiendo los siguientes principios:

- Arquitectura modular.
- Componentes desacoplados.
- Procesamiento en tiempo real.
- Separación entre lógica de negocio e Inteligencia Artificial.
- Escalabilidad horizontal.
- Reentrenamiento del modelo.
- Explicabilidad de las predicciones.
- Facilidad de mantenimiento e integración.

---

# Arquitectura general

```text
                     SISTEMA BANCARIO
                            │
                            ▼
                         Worker
                            │
                            ▼
              Validación y normalización
                            │
                            ▼
        Módulo de extracción de características
                (7 Factores de Riesgo)
                            │
                            ▼
            Modelo de Inteligencia Artificial
                    (Random Forest)
                            │
                            ▼
        Probabilidad de fraude + Confianza
                            │
                            ▼
                 Motor de decisiones
                            │
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
       Aprobar         Verificación      Bloquear
                            │
                            ▼
          Dashboard • Auditoría • Registro
```

---

# Componentes de la arquitectura

## 1. Worker

El Worker constituye el punto de integración entre TriDa y el sistema financiero.

Su función es recibir la información de cada transacción, comunicarla con TriDa y devolver el resultado obtenido al sistema de origen.

### Responsabilidades

- Recibir la transacción.
- Gestionar la comunicación con TriDa.
- Enviar la información para su análisis.
- Recibir la respuesta del sistema.
- Retornar el resultado al sistema bancario.

Este componente permite desacoplar completamente TriDa de la infraestructura tecnológica de cada entidad financiera.

---

## 2. Validación y normalización

Antes de iniciar cualquier análisis, TriDa verifica que la información recibida sea consistente y contenga todos los datos necesarios.

Durante esta etapa se realizan procesos como:

- Validación de campos obligatorios.
- Verificación de formatos.
- Normalización de datos.
- Preparación de la información para el análisis.

Este módulo garantiza que el modelo de Inteligencia Artificial reciba información uniforme y confiable.

---

## 3. Módulo de extracción de características

Este componente transforma la información de una transacción en variables que representan distintos aspectos del riesgo.

TriDa utiliza siete factores principales:

- Desviación del monto.
- Reconocimiento del dispositivo.
- Ubicación geográfica.
- Velocidad transaccional.
- Horario de la operación.
- Comportamiento histórico.
- Riesgo asociado al país.

Estos factores constituyen las variables de entrada del modelo de Inteligencia Artificial.

Es importante destacar que este módulo **no determina si una transacción es fraudulenta**. Su única responsabilidad consiste en transformar la información original en características estructuradas que posteriormente serán analizadas por el modelo.

---

## 4. Modelo de Inteligencia Artificial

El núcleo analítico de TriDa está conformado por un modelo de Inteligencia Artificial ejecutado localmente.

Para la versión MVP del proyecto se implementa un modelo basado en **Random Forest**, seleccionado por ofrecer un equilibrio entre precisión, robustez e interpretabilidad, características especialmente relevantes para sistemas de detección de fraude.

El modelo recibe como entrada los siete factores de riesgo generados durante la etapa de extracción de características y estima la probabilidad de que una transacción corresponda a un comportamiento fraudulento.

Al ejecutarse localmente, el modelo ofrece diversas ventajas:

- Baja latencia.
- Independencia de servicios externos.
- Mayor privacidad de la información.
- Menores costos operativos.
- Posibilidad de reentrenamiento.
- Facilidad para evolucionar hacia modelos más avanzados.

La arquitectura fue diseñada para permitir reemplazar el modelo de Inteligencia Artificial sin afectar el resto de los componentes del sistema.

---

## 5. Motor de decisiones

El modelo de Inteligencia Artificial no toma decisiones directamente sobre las transacciones.

Su función consiste únicamente en estimar una probabilidad de fraude.

A partir de dicha probabilidad, el Motor de Decisiones interpreta el resultado utilizando umbrales configurables definidos por la entidad financiera.

Las acciones posibles son:

- Aprobar la transacción.
- Solicitar una verificación adicional.
- Bloquear la transacción.

Esta separación entre predicción y decisión permite adaptar TriDa a diferentes políticas de riesgo sin modificar el modelo de Inteligencia Artificial.

---

## 6. Dashboard y auditoría

Todas las transacciones procesadas son registradas para facilitar su consulta y análisis posterior.

Este componente permite:

- Consultar el historial de transacciones.
- Visualizar el nivel de riesgo estimado.
- Analizar tendencias de fraude.
- Facilitar procesos de auditoría.
- Dar seguimiento al desempeño del modelo.

Asimismo, constituye la base para futuros procesos de entrenamiento y mejora continua.

---

# Flujo de procesamiento

El procesamiento de una transacción sigue el siguiente flujo:

1. El sistema bancario genera una nueva transacción.

2. El Worker recibe la solicitud y la envía a TriDa.

3. TriDa valida y normaliza la información recibida.

4. El módulo de extracción de características calcula los siete factores de riesgo.

5. Los factores son enviados al modelo de Inteligencia Artificial.

6. El modelo estima la probabilidad de fraude.

7. El Motor de Decisiones interpreta la predicción obtenida.

8. Se determina la acción correspondiente.

9. El resultado es enviado nuevamente al Worker.

10. El sistema bancario ejecuta la acción definida.

11. La información queda registrada para auditoría y futuras tareas de entrenamiento.

---

# Stack Tecnológico

## Frontend

- React
- Vite
- Tailwind CSS
- TypeScript

## Backend

- Node.js
- Express.js
- Prisma ORM

## Base de datos

- PostgreSQL

## Inteligencia Artificial

- Python
- Scikit-learn
- Pandas
- NumPy

## Herramientas

- Git
- GitHub

---

# Decisiones de arquitectura

Durante el diseño inicial del proyecto se evaluó la integración con modelos de Inteligencia Artificial mediante APIs externas.

Sin embargo, tras analizar aspectos como costos operativos, latencia, disponibilidad del servicio y privacidad de los datos, se optó por implementar un modelo de Inteligencia Artificial ejecutado localmente.

Esta decisión proporciona beneficios importantes para un sistema de detección de fraude:

- Mayor velocidad de respuesta.
- Independencia de proveedores externos.
- Reducción de costos de operación.
- Mayor control sobre la información procesada.
- Posibilidad de reentrenamiento periódico del modelo.

---

# Entrenamiento del modelo

El modelo de Inteligencia Artificial se entrena utilizando un conjunto histórico de transacciones clasificadas previamente como legítimas o fraudulentas.

Durante este proceso el algoritmo aprende patrones presentes en los datos, permitiéndole posteriormente estimar el riesgo asociado a nuevas transacciones.

El entrenamiento se realiza de manera independiente al procesamiento en tiempo real, evitando afectar el rendimiento del sistema durante su operación.

---

# Explicabilidad

TriDa incorpora principios de Inteligencia Artificial Explicable (Explainable AI).

Además de estimar la probabilidad de fraude, el sistema conserva información sobre los factores que más influyeron en cada predicción.

Esto permite:

- Justificar las decisiones tomadas.
- Facilitar procesos de auditoría.
- Apoyar el trabajo de analistas financieros.
- Incrementar la confianza en el sistema.

---

# Escalabilidad

La arquitectura modular permite incorporar nuevos componentes sin afectar el funcionamiento del sistema.

Entre las posibles ampliaciones se encuentran:

- Nuevos factores de riesgo.
- Modelos de Inteligencia Artificial más avanzados.
- Detección de anomalías.
- Reentrenamiento automatizado.
- Integración con múltiples entidades financieras.
- Balanceo de carga y despliegues distribuidos.

---

# Futuras mejoras

La arquitectura fue diseñada para evolucionar conforme aumente el volumen de información disponible y las necesidades del sistema.

Las principales líneas de evolución contempladas son:

- Optimización del modelo de Inteligencia Artificial.
- Incorporación de nuevos indicadores de riesgo.
- Aprendizaje continuo.
- Técnicas avanzadas de detección de anomalías.
- Mejoras en la interpretabilidad del modelo.
- Optimización del rendimiento para grandes volúmenes de transacciones.
