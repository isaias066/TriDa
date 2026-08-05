# TriDa

> Sistema inteligente de evaluación de riesgo para la detección de fraude financiero en tiempo real.

---

## Descripción

TriDa es un sistema diseñado para asistir a entidades financieras en la detección temprana de posibles transacciones fraudulentas mediante el análisis inteligente de múltiples factores de riesgo.

A diferencia de soluciones basadas exclusivamente en reglas estáticas, TriDa incorpora un modelo de Inteligencia Artificial local que aprende patrones históricos de fraude para estimar la probabilidad de riesgo de cada transacción.

Su arquitectura modular permite integrarse con sistemas bancarios existentes sin afectar su funcionamiento, actuando como una capa adicional de análisis durante el procesamiento de operaciones.

---

## Características

- Arquitectura modular y desacoplada.
- Procesamiento en tiempo real.
- Modelo de Inteligencia Artificial local.
- Evaluación basada en siete factores de riesgo.
- Integración mediante Worker y API REST.
- Explicabilidad de las predicciones.
- Registro y auditoría de decisiones.
- Preparado para reentrenamiento del modelo.

---

## ¿Cómo funciona?

```text
Sistema Bancario
        │
        ▼
      Worker
        │
        ▼
Validación de datos
        │
        ▼
Extracción de características
 (7 factores de riesgo)
        │
        ▼
 Modelo IA Local
        │
        ▼
Probabilidad de fraude
        │
        ▼
Motor de decisiones
        │
        ▼
Dashboard y Auditoría
```

---

## Factores de riesgo evaluados

TriDa analiza siete dimensiones principales para representar el comportamiento de una transacción:

- Desviación del monto.
- Reconocimiento del dispositivo.
- Ubicación geográfica.
- Velocidad transaccional.
- Horario de la operación.
- Comportamiento histórico.
- Riesgo asociado al país.

Estos factores constituyen las variables de entrada del modelo de Inteligencia Artificial.

---

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Java | Backend principal |
| Spring Boot | API REST |
| Python | Modelo de Inteligencia Artificial |
| Scikit-learn | Implementación del modelo de Machine Learning |
| PostgreSQL | Base de datos |
| Docker | Contenedorización (opcional) |
| Git | Control de versiones |
| GitHub | Gestión del proyecto |

---

## Documentación

La documentación completa del proyecto se encuentra en la carpeta `docs`.

- Arquitectura
- Modelo de IA
- API
- Worker
- Entrenamiento
- Dashboard
- Feature Engineering

---

## Estado del proyecto

🚧 MVP en desarrollo.

Actualmente TriDa implementa una arquitectura basada en Inteligencia Artificial local y se encuentra en proceso de entrenamiento y validación utilizando conjuntos históricos de transacciones simuladas.
