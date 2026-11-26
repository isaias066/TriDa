# MER TriDa

## Modelo entidad-relación conceptual

El MER expresa conceptos y cardinalidades; no sustituye las restricciones físicas de PostgreSQL. Las categorías globales pueden no tener usuario propietario; las categorías personalizadas sí. Una transacción puede no estar asociada a cuenta, categoría, dispositivo o ubicación.

```mermaid
erDiagram
  USUARIO {
    int id_usuario PK
    string email
    string nombre_completo
  }
  PERFIL_FINANCIERO {
    int id_perfil PK
    int id_usuario FK
    string moneda_preferida
  }
  CUENTA {
    int id_cuenta PK
    int id_usuario FK
    string tipo
    decimal saldo_actual
  }
  CATEGORIA {
    int id_categoria PK
    int id_usuario FK
    string nombre
    string tipo
  }
  DISPOSITIVO {
    int id_dispositivo PK
    int id_usuario FK
    string identificador_unico
  }
  UBICACION {
    int id_ubicacion PK
    int id_dispositivo FK
    decimal latitud
    decimal longitud
  }
  TRANSACCION {
    int id_transaccion PK
    int id_usuario FK
    decimal monto
    string tipo_movimiento
    string estado
  }
  PATRON_COMPORTAMIENTO {
    int id_patron PK
    int id_usuario FK
    decimal gasto_diario_promedio
  }
  PRESUPUESTO {
    int id_presupuesto PK
    int id_usuario FK
    int id_categoria FK
    decimal limite_mensual
  }
  META_AHORRO {
    int id_meta PK
    int id_usuario FK
    int id_categoria FK
    decimal monto_objetivo
  }
  APORTE_META {
    int id_aporte PK
    int id_meta FK
    decimal monto
  }
  CONSEJO_FINANCIERO {
    int id_consejo PK
    int id_usuario FK
    string titulo
    boolean leido
  }
  ALERTA_FRAUDE {
    int id_alerta PK
    int id_usuario FK
    int id_transaccion FK
    string severidad
    string estado
  }
  ANALISIS_GASTOS {
    int id_analisis PK
    int id_usuario FK
    string periodo
    date fecha_inicio
  }
  REPORTE_MENSUAL {
    int id_reporte PK
    int id_usuario FK
    int anio
    int mes
  }
  LOG_AUDITORIA {
    int id_log PK
    int id_usuario FK
    string tipo_accion
    datetime fecha_accion
  }
  EXPORTACION_TRANSACCIONES {
    int id_exportacion PK
    int id_usuario FK
    datetime fecha_corte
    datetime fecha_expiracion
  }
  EVENTO_TRANSACCION_ARCHIVADO {
    int id_evento_archivado PK
    int id_usuario FK
    string id_evento_externo
    datetime fecha_archivado
  }
  USUARIO ||--o| PERFIL_FINANCIERO : posee
  USUARIO ||--o{ CUENTA : administra
  USUARIO o|--o{ CATEGORIA : define
  USUARIO ||--o{ DISPOSITIVO : registra
  DISPOSITIVO o|--o{ UBICACION : origina
  USUARIO ||--o{ TRANSACCION : registra
  CUENTA o|--o{ TRANSACCION : cuenta_origen
  CUENTA o|--o{ TRANSACCION : cuenta_destino
  CATEGORIA o|--o{ TRANSACCION : clasifica
  DISPOSITIVO o|--o{ TRANSACCION : identifica
  UBICACION o|--o{ TRANSACCION : ubica
  USUARIO ||--o| PATRON_COMPORTAMIENTO : caracteriza
  USUARIO ||--o{ PRESUPUESTO : define
  CATEGORIA o|--o{ PRESUPUESTO : limita
  USUARIO ||--o{ META_AHORRO : define
  CATEGORIA o|--o{ META_AHORRO : clasifica
  META_AHORRO ||--o{ APORTE_META : recibe
  USUARIO ||--o{ CONSEJO_FINANCIERO : recibe
  CUENTA o|--o{ CONSEJO_FINANCIERO : contextualiza
  USUARIO ||--o{ ALERTA_FRAUDE : recibe
  TRANSACCION ||--o{ ALERTA_FRAUDE : genera
  USUARIO ||--o{ ANALISIS_GASTOS : obtiene
  USUARIO ||--o{ REPORTE_MENSUAL : obtiene
  USUARIO o|--o{ LOG_AUDITORIA : audita
  USUARIO ||--o{ EXPORTACION_TRANSACCIONES : prepara
  USUARIO ||--o{ EVENTO_TRANSACCION_ARCHIVADO : conserva
```

## Consideraciones

- Se muestran claves y atributos representativos para hacer visible el contenido de las entidades; el detalle completo de columnas y tipos está en el [MR TriDa](./MR-TriDa.md).
- `EVENTO_TRANSACCION_ARCHIVADO` también almacena `id_cuenta` y datos del evento original; Prisma no declara una relación ORM con `CUENTA` para esa columna.
- `EXPORTACION_TRANSACCIONES.ids_transacciones` es una lista de identificadores, no una relación FK a cada transacción.
- Las entidades reflejan los modelos actuales de `backend/prisma/schema.prisma` y el esquema canónico `database/schema.sql`.
- `PATRON_COMPORTAMIENTO` es una entidad activa a nivel de base de datos: un trigger crea o actualiza su marca temporal y existe una función SQL para leerla. Sin embargo, el endpoint de HU-11 calcula las métricas directamente desde transacciones y no consulta esa entidad. `ANALISIS_GASTOS` y `REPORTE_MENSUAL` tienen funciones SQL de lectura y datos de ejemplo en el seed, pero las rutas actuales de HU-28 y HU-29 calculan respuestas bajo demanda y no leen ni escriben esos modelos. Se documentan como persistencia/consultas SQL sin integración en esos flujos de producto.
