<div align="center">

# TriDa

### *Eslogan*

Sistema inteligente para la detección de fraude financiero mediante Inteligencia Artificial local.

![Status](https://img.shields.io/badge/Estado-MVP-blue)
![Version](https://img.shields.io/badge/Versión-1.0-orange)
![License](https://img.shields.io/badge/Licencia-MIT-green)

</div>

---

# Descripción

TriDa es un sistema inteligente diseñado para fortalecer la detección de fraude financiero mediante el análisis de transacciones en tiempo real.

Su arquitectura combina un proceso de evaluación basado en siete factores de riesgo con un modelo de Inteligencia Artificial ejecutado localmente, permitiendo identificar patrones de fraude y estimar la probabilidad de riesgo antes de que una transacción sea aprobada.

El sistema fue concebido como una solución modular y desacoplada que puede integrarse con diferentes plataformas financieras sin modificar su infraestructura principal.

---

# Características

- Evaluación inteligente de transacciones.
- Procesamiento en tiempo real.
- Modelo de Inteligencia Artificial local.
- Arquitectura modular y desacoplada.
- Evaluación basada en siete factores de riesgo.
- Integración mediante Worker.
- Explicabilidad de las predicciones.
- Registro y auditoría de decisiones.
- Preparado para futuras versiones del modelo de IA.

---

# Arquitectura General

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

La documentación completa de la arquitectura puede consultarse en:

```text
documentos/arquitectura.md
```

---

# Modelo de Inteligencia Artificial

TriDa implementa un modelo de Inteligencia Artificial ejecutado localmente basado en **Random Forest**.

El modelo recibe como entrada siete factores de riesgo calculados durante el proceso de análisis de cada transacción y estima la probabilidad de fraude.

La elección de Random Forest responde a su equilibrio entre:

- Precisión.
- Robustez.
- Capacidad de generalización.
- Interpretabilidad.
- Facilidad de reentrenamiento.

La arquitectura permite sustituir el modelo por otros algoritmos en futuras versiones sin modificar el resto del sistema.

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

## Base de Datos

- PostgreSQL

## Inteligencia Artificial

- Python
- Scikit-learn
- Pandas
- NumPy

## Control de versiones

- Git
- GitHub

---

# Estructura del proyecto

```text
TriDa/
│
├── client/                 # Frontend (React + Vite)
├── server/                 # Backend (Express)
├── ai/                     # Modelo de Inteligencia Artificial
├── docs/                   # Documentación técnica
├── database/               # Scripts y migraciones
├── README.md
└── LICENSE
```

---

# Flujo de procesamiento

```text
Transacción

↓

Worker

↓

Validación

↓

Extracción de características

↓

Modelo IA (Random Forest)

↓

Probabilidad de fraude

↓

Motor de decisiones

↓

Sistema Bancario
```

---

# Objetivos del proyecto

- Detectar patrones de fraude en tiempo real.
- Reducir falsos positivos.
- Facilitar la integración con entidades financieras.
- Proporcionar decisiones explicables.
- Servir como una capa adicional de análisis para los sistemas bancarios.

---

# Documentación

Toda la documentación técnica del proyecto se encuentra en la carpeta **docs/**.

- documentos/arquitectura.dm
- Modelo de Inteligencia Artificial
- API
- Worker
- documentos/db
- Feature Engineering
- Manual técnico

---

# Equipo de desarrollo

Proyecto desarrollado como parte del proceso de formación en Ingeniería de él tecnólogo Análisis y Desarrollo de Software del SENA. Equipo conformado por: Angie Catalina Bueno Melo y Juan Diego Morales Prieto. 

---

# Estado del proyecto

**MVP en DESARROLLO**

La versión actual implementa la arquitectura base del sistema y un modelo de Inteligencia Artificial local para la evaluación del riesgo de fraude financiero.
