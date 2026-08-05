# Arquitectura de TriDa

## Introducción

La arquitectura de TriDa está diseñada bajo un enfoque modular, escalable y desacoplado, permitiendo integrarse con diferentes sistemas financieros sin depender de tecnologías específicas del cliente.

El sistema funciona como un motor inteligente de evaluación de riesgo que opera en segundo plano durante el procesamiento de una transacción. Su propósito es analizar múltiples factores de riesgo mediante un modelo de Inteligencia Artificial local basado en Machine Learning para estimar la probabilidad de fraude en tiempo real.

La arquitectura prioriza:

- Baja latencia.
- Independencia de servicios externos.
- Escalabilidad.
- Explicabilidad de las decisiones.
- Facilidad de integración con entidades financieras.

---

# Principios de diseño

La arquitectura de TriDa fue diseñada siguiendo los siguientes principios:

- Arquitectura modular.
- Componentes desacoplados.
- Procesamiento en tiempo real.
- Escalabilidad horizontal.
- Explicabilidad de las predicciones.
- Capacidad de reentrenamiento del modelo.
- Integración sencilla mediante APIs y Workers.

---

# Arquitectura general

```
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
                (Feature Engineering)
                            │
                            ▼
             Modelo IA Local (Machine Learning)
                            │
                            ▼
        Probabilidad de fraude + nivel de confianza
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

El Worker actúa como intermediario entre el sistema bancario y TriDa.

Sus responsabilidades incluyen:

- Recibir la información de la transacción.
- Validar la comunicación.
- Enviar la información a TriDa.
- Recibir la respuesta del sistema.
- Retornar el resultado al sistema bancario.

Gracias a este componente, TriDa permanece desacoplado de la infraestructura tecnológica del cliente.

---

## 2. Módulo de validación y normalización

Antes de procesar una transacción, el sistema verifica que toda la información requerida esté presente y sea consistente.

Entre sus funciones se encuentran:

- Validación de campos obligatorios.
- Verificación de formatos.
- Normalización de datos.
- Preparación de la información para el modelo de IA.

---

## 3. Módulo de extracción de características (Feature Engineering)

Este componente transforma la información de una transacción en variables numéricas que representan el comportamiento de la operación.

TriDa utiliza siete factores principales de riesgo:

- Factor de desviación del monto.
- Factor de reconocimiento del dispositivo.
- Factor de ubicación geográfica.
- Factor de velocidad transaccional.
- Factor de horario.
- Factor de comportamiento histórico.
- Factor de riesgo por país.

Estos factores constituyen las variables de entrada del modelo de Machine Learning.

Este módulo no toma decisiones sobre el fraude; únicamente genera información estructurada para que el modelo pueda analizar patrones complejos.

---

## 4. Modelo de Inteligencia Artificial Local

TriDa emplea un modelo de Machine Learning ejecutado localmente para analizar los factores de riesgo generados durante la etapa de Feature Engineering.

El modelo aprende patrones históricos de fraude utilizando datos previamente etiquetados durante su entrenamiento.

A partir de la combinación de los siete factores de riesgo, el modelo estima la probabilidad de que una transacción sea fraudulenta.

Al ejecutarse localmente, el sistema ofrece:

- Baja latencia.
- Independencia de servicios externos.
- Mayor privacidad de los datos.
- Menores costos operativos.
- Posibilidad de reentrenamiento.

---

## 5. Motor de decisiones

El motor de decisiones interpreta la probabilidad generada por el modelo de IA y determina la acción correspondiente.

Las acciones posibles son:

- Aprobar la transacción.
- Solicitar verificación adicional.
- Bloquear la transacción.

Los umbrales de decisión son configurables y pueden ajustarse según las políticas de la entidad financiera.

---

## 6. Dashboard y auditoría

Toda decisión tomada por TriDa es registrada para permitir su consulta posterior.

Este módulo permite:

- Visualizar transacciones procesadas.
- Consultar el nivel de riesgo.
- Revisar la probabilidad estimada.
- Auditar decisiones del sistema.
- Analizar tendencias de fraude.

Asimismo, facilita el análisis de desempeño del modelo y la identificación de patrones emergentes.

---

# Flujo de procesamiento

1. El sistema bancario genera una nueva transacción.

2. El Worker recibe la información y la envía a TriDa.

3. TriDa valida y normaliza los datos.

4. El módulo de Feature Engineering calcula los siete factores de riesgo.

5. El modelo de Machine Learning analiza dichos factores.

6. Se estima la probabilidad de fraude.

7. El motor de decisiones determina la acción correspondiente.

8. El resultado es enviado nuevamente al Worker.

9. El sistema bancario ejecuta la acción indicada.

10. La información queda registrada para auditoría y futuras tareas de entrenamiento.

---

# Entrenamiento del modelo

El modelo de Inteligencia Artificial se entrena utilizando un conjunto histórico de transacciones previamente clasificadas como legítimas o fraudulentas.

Durante este proceso el algoritmo aprende patrones de comportamiento asociados al fraude financiero, permitiendo posteriormente realizar inferencias sobre nuevas transacciones.

El entrenamiento se realiza de manera independiente al procesamiento de las transacciones, evitando afectar el rendimiento del sistema en producción.

---

# Explicabilidad

TriDa incorpora un enfoque de Inteligencia Artificial explicable (Explainable AI).

Además de generar una probabilidad de fraude, el sistema conserva información sobre los factores que más influyeron en la predicción.

Esto permite:

- Facilitar auditorías.
- Justificar decisiones.
- Apoyar a analistas financieros.
- Incrementar la confianza en el modelo.

---

# Escalabilidad

La arquitectura modular permite incorporar nuevos componentes sin afectar el funcionamiento general del sistema.

Entre las posibles ampliaciones se encuentran:

- Nuevos factores de riesgo.
- Modelos de IA más avanzados.
- Detección de anomalías.
- Reentrenamiento automático.
- Integración con múltiples entidades financieras.

---

# Futuras mejoras

La arquitectura fue diseñada para evolucionar conforme aumente el volumen de información disponible.

Entre las mejoras previstas se encuentran:

- Incorporación de aprendizaje continuo.
- Optimización del modelo de Machine Learning.
- Integración de técnicas avanzadas de detección de anomalías.
- Incorporación de nuevos indicadores de riesgo.
- Mejoras en la interpretabilidad del modelo.
