# Arquitectura del Sistema — TriDa (Sistema de Monitoreo de Transacciones con IA)

<!--
  ¿Qué? Documento de arquitectura general del sistema TriDa.
  ¿Para qué? Proveer una visión macro de cómo se relacionan las capas 
  y decisiones técnicas del sistema de detección de fraude.
  ¿Impacto? Entender la arquitectura es prerequisito para contribuir 
  correctamente al proyecto y comprender el flujo completo desde la 
  ingesta de transacciones hasta la generación de alertas.
-->

## 1. Visión General

TriDa es un sistema de monitoreo de transacciones bancarias con IA 
construido con arquitectura en **tres capas desacopladas**, siguiendo 
los principios de alta cohesión interna y bajo acoplamiento entre módulos:

- **Frontend**: React + Vite + Tailwind CSS, se comunica con el backend 
  exclusivamente mediante API REST sobre HTTPS con autenticación JWT
- **Backend**: Express.js + Prisma, contiene los servicios especializados 
  de detección y el Núcleo TriDa como orquestador central
- **Base de datos**: PostgreSQL, implementa un esquema relacional 
  normalizado en tercera forma normal
- **IA Externa**: Gemini API, integrada mediante el patrón Adapter que 
  define el contrato de comunicación con cualquier agente externo
