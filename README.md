# TriDa

TriDa es una aplicación web para organizar finanzas personales, registrar movimientos, consultar alertas de riesgo y recibir orientación basada en IA.

## Estado y alcance

La implementación actual está formada por una aplicación React/TypeScript, una API Express/TypeScript bajo `/api/v2`, PostgreSQL con Prisma y SQL complementario, y un servicio de IA local basado en Flask. El backend también puede enviar correos mediante SMTP configurado y recibir movimientos externos mediante un webhook autenticado.

Entre los flujos disponibles en el código se encuentran:

- Registro, verificación de correo, inicio/cierre de sesión y recuperación de contraseña.
- Gestión de perfil, cuentas, categorías, transacciones y dispositivos.
- Evaluación de riesgo y gestión de alertas.
- Presupuestos, metas de ahorro, dashboard, recomendaciones e informes.
- Consulta de movimientos y estadísticas geográficas para el mapa.
- Historial de auditoría y flujos de archivo de movimientos.

La evaluación de riesgo y algunos consejos pueden usar respaldo heurístico/local. El análisis de enlaces y mensajes depende del servicio IA. El entrenamiento del modelo es un proceso separado; el backend no lo ejecuta automáticamente.

Para una vista detallada de componentes e integraciones, consulta [Arquitectura TriDa](docs/Arquitectura-TriDa.md). Los documentos [RF](docs/RF01-24.md), [RNF](docs/RNF01-14.md) y [Restricciones](docs/Restricciones.md) describen requisitos de producto y no implican por sí solos que cada capacidad esté implementada. La documentación basada en el código está en el [índice de modelado](docs/Indice-modelado-TriDa.md) y en los [informes Scrum](docs/scrum/README.md).

## Tecnologías

- **Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS y MapLibre GL.
- **Backend:** Node.js 22.13 o superior, Express, TypeScript y Prisma.
- **Persistencia:** PostgreSQL. Prisma define los modelos; `database/schema.sql` contiene restricciones y objetos SQL complementarios.
- **IA:** Python, Flask y scikit-learn.
- **Paquetes JavaScript:** pnpm en un workspace con `frontend` y `backend`.

## Requisitos para ejecutar localmente

- Node.js 22.13 o superior y pnpm.
- PostgreSQL.
- Python y las dependencias de `modulo-ia/requirements.txt` si se quiere ejecutar el servicio IA.

### Configuración

1. Instala las dependencias desde la raíz:

   ```sh
   pnpm install
   ```

2. Copia `.env.example` a `.env` en la raíz y configura `DATABASE_URL` y un `JWT_SECRET` de al menos 32 caracteres. Configura SMTP si necesitas probar el envío de correo.
3. Crea la base de datos PostgreSQL y aplica `database/schema.sql`.
4. Genera el cliente Prisma:

   ```sh
   pnpm --filter trida-backend prisma:generate
   ```

5. Inicia el backend y el frontend en terminales separadas:

   ```sh
   pnpm --filter trida-backend dev
   pnpm --filter trida-frontend dev
   ```

   El backend escucha por defecto en `http://localhost:3000`; Swagger está disponible en `http://localhost:3000/api/docs` fuera de producción. Vite muestra la URL del frontend al iniciar.

6. Para ejecutar la IA local, instala sus dependencias y arranca el servicio desde la carpeta `modulo-ia`:

   ```sh
   python -m pip install -r requirements.txt
   python api.py
   ```

   Flask escucha por defecto en `http://127.0.0.1:5000`. El backend puede apuntar a otra URL mediante `IA_SERVICE_URL`.

## Validación

Desde la raíz, los scripts del workspace permiten ejecutar las pruebas y validaciones:

```sh
pnpm --filter trida-backend test
pnpm --filter trida-backend typecheck
pnpm --filter trida-frontend test
pnpm --filter trida-frontend type-check
```

## Documentación

- [Arquitectura actual](docs/Arquitectura-TriDa.md)
- [Índice de modelado](docs/Indice-modelado-TriDa.md)
- [Historias de usuario](docs/Historias-de-usuario-TriDa.md)
- [Diagramas de casos de uso](docs/Diagramas-de-casos-de-uso-TriDa.md)
- [MER](docs/MER-TriDa.md) · [MR](docs/MR-TriDa.md) · [UML](docs/UML-TriDa.md)
- [Documentación Scrum](docs/scrum/README.md)
- [Reporte de ejecución y defectos](docs/Reporte-ejecucion-y-defectos.md)
