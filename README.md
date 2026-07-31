#  TriDa

> **Sistema de Monitoreo de Transacciones con Inteligencia Artificial para Detección de Fraude**

---

##  ¿Qué es TriDa?

**TriDa** es un **sistema inteligente de prevención de fraude** diseñado para instituciones financieras. Utiliza **Machine Learning** para analizar transacciones en tiempo real, detectar patrones anómalos y **prevenir fraudes ANTES de que ocurran** — no después.

Bloquea automáticamente operaciones de alto riesgo mientras mantiene una experiencia fluida para clientes legítimos, reduciendo falsos positivos mediante aprendizaje continuo de validaciones manuales de analistas.

---

##  Características Principales

| Característica | Descripción |
| --- | --- |
| ** Análisis en Tiempo Real** | Procesa ≥1.000 transacciones/segundo (latencia < 500ms) |
| ** IA Adaptable** | Modelo ML que aprende de cada validación de analistas |
| ** Alertas Inteligentes** | Tres niveles: baja (30–49%), media (50–79%), alta (80–95%) |
| ** Bloqueo Automático** | Detiene transacciones con score > 95% antes de completarse |
| ** Dashboard Intuitivo** | Interfaz web para que analistas validen y clasifiquen alertas |
| ** Seguridad Bancaria** | PCI-DSS, ISO 27001, Ley 1581/2012 (Colombia) |
| ** Auditoría Inmutable** | Registro permanente de todas las operaciones y decisiones |
| ** Reportes Exportables** | PDF, Excel, CSV con KPIs de detección y rendimiento |

---

##  Arquitectura

```
Backend (Node.js + Express)
├── API REST
├── Ingesta de Transacciones
├── Enriquecimiento de Datos
├── Motor de Reglas
├── Integración con Servicio de IA/ML
├── Prisma ORM
└── Auditoría (PostgreSQL + MongoDB)

Servicio IA/ML (Python)
├── TensorFlow
├── Scikit-learn
└── Predicción de fraude

Frontend (React + TypeScript)

```

---

## Tecnologías Utilizadas

### Backend

- **Runtime**: Node.js 22 LTS
- **Framework**: Express.js + TypeScript 5
- **Gestor de paquetes**: pnpm
- **ORM**: Prisma ORM
- **Base de datos principal**: PostgreSQL 17
- **Base de datos de auditoría**: MongoDB 8 (append-only)
- **Machine Learning**: Python 3.12 (TensorFlow 2.18 y Scikit-learn 1.6) como servicio independiente
- **Caché**: Redis
- **Autenticación**: JWT + bcrypt
- **Validación**: Zod

### Frontend

- **Framework**: React 19 + TypeScript 5
- **Bundler**: Vite 7
- **Estilos**: Tailwind CSS 4
- **Componentes UI**: shadcn/ui
- **Iconos**: lucide-react
- **Mapas**: Google Maps JavaScript API

### DevOps

- **Contenedores**: Docker + Docker Compose
- **Orquestación**: Kubernetes
- **Monitoreo**: Prometheus + Grafana
- **Logs**: Loki + Grafana
- **CI/CD**: GitHub Actions
- **Control de versiones**: Git + GitHub---

##  Requisitos Mínimos

- **Backend**: Node.js 22 LTS, PostgreSQL 17, Redis 7+
- **Servicio IA**: Python 3.12 (TensorFlow y Scikit-learn)
- **Frontend**: Node.js 22 LTS, pnpm 10+
  
---

##  Instalación Rápida

### 1. Clonar el repositorio
```
bash
git clone https://github.com/isaias066/TriDa.git
cd TriDa

```

### 2. Backend 
```
cd backend

# Instalar dependencias
pnpm install

# Levantar servicios
docker compose up -d

# Ejecutar servidor
pnpm dev

# API disponible en http://localhost:3000

```

### 3. Frontend (React)
```bash
cd frontend

# Instalar dependencias
pnpm install

# Ejecutar servidor de desarrollo
pnpm dev
# Dashboard disponible en http://localhost:5173
```

---

##  Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── prisma/
│   ├── validators/
│   ├── config/
│   ├── utils/
│   └── server.ts
├── prisma/
├── tests/
├── package.json
├── tsconfig.json
└── pnpm-lock.yaml

frontend/
├── src/
│   ├── components/       # Componentes React
│   ├── pages/           # Páginas del dashboard
│   ├── hooks/           # Custom hooks
│   ├── services/        # API client
│   ├── styles/          # Configuración Tailwind
│   └── App.tsx
├── public/
├── vite.config.ts
└── package.json

documentacion/
├── ESPECIFICACION_REQUISITOS.md
├── RESTRICCIONES.md
├── ARQUITECTURA.md
└── GUIA_CONTRIBUCIONES.md
```

---

##  Testing

```
cd backend

pnpm test
pnpm test:coverage

cd frontend

pnpm test
pnpm test:e2e

```

**Cobertura requerida**: ≥ 85% (lógica de negocio), ≥ 70% (frontend)

---

##  Seguridad

- ✅ **PCI-DSS 4.0**: Cumplimiento de estándar de seguridad de tarjetas
- ✅ **ISO 27001:2022**: Gestión de seguridad de la información
- ✅ **Ley 1581/2012**: Protección de datos personales (Colombia)
- ✅ **AES-256**: Cifrado de datos sensibles en reposo
- ✅ **TLS 1.3**: Comunicaciones encriptadas en tránsito
- ✅ mTLS: Autenticación mutua entre TriDa y Core Banking
- ✅ **Auditoría inmutable**: Logs no modificables en MongoDB

**Antes de producción**: escaneo OWASP ZAP + penetration test

---

##  Rendimiento

| Métrica | Target | Status |
| --- | --- | --- |
| **Throughput** | ≥1.000 tx/seg | ✅ Testeado |
| **Latencia p95** | < 500ms | ✅ Logrado |
| **Uptime** | 99.5% | ✅ Objetivo del proyecto |
| **Detección de fraudes** | > 90% | ✅ Validado |
| **Falsos positivos** | < 5% | 🎯 Optimizando |

---

##  Licencia

Este proyecto está bajo licencia **MIT**. Ver archivo [LICENSE](./LICENSE) para más detalles.

---

##  Contacto

- **Email**: 
- **Documentación**: [Ver en `/documentacion`](./documentacion/)
- **Issues**: [GitHub Issues](https://github.com/isaias066/TriDa/issues)

---

##  Aprendizaje y Propósito

TriDa nace como proyecto educativo de **especificación y desarrollo de sistemas críticos** en la banca. Cada decisión técnica está documentada con el formato **"¿Qué? ¿Para qué? ¿Impacto?"** para máxima claridad pedagógica.

---

<div align="center">

**Protegiendo el futuro financiero con Inteligencia Artificial** 

*MVP 2026 · Revisión 0.6

</div>
