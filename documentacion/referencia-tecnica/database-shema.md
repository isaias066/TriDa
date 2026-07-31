# Esquema de Base de Datos — TriDa (Sistema de Monitoreo de Transacciones con IA)

<!--
  ¿Qué? Documentación del esquema de base de datos: tablas, columnas, relaciones,
  índices y consultas de diagnóstico.
  ¿Para qué? Servir como referencia para migraciones, revisiones de código y
  diseño del sistema.
  ¿Impacto? Cualquier cambio en el esquema debe reflejarse aquí antes de ejecutarse
  en la base de datos.
-->

## Tecnologías

| Item | Detalle |
|------|---------|
| Motor | PostgreSQL |
| Schema | `trida` |
| Extensión | `pgcrypto` |
| Driver | `pg` (node-postgres) |
| IDs | `SERIAL` (enteros autoincrementales) |

---

## Diagrama Entidad-Relación

```
┌──────────────────────────────────┐
│             bancos               │
├──────────────────────────────────┤
│ PK id_banco        SERIAL        │
│    codigo          VARCHAR(50) UQ│
│    nombre          VARCHAR(120)  │
│    color           VARCHAR(20)   │
│    estado          BOOLEAN       │
│    fecha_creacion  TIMESTAMPTZ   │
└──────┬───────────────────────────┘
       │ 1
       │ N
┌──────▼───────────────────────────┐
│            clientes              │
├──────────────────────────────────┤
│ PK id_cliente        SERIAL      │
│ FK id_banco          → bancos    │
│    nombre_completo   VARCHAR(150)│
│    email             VARCHAR(254) UQ│
│    telefono          VARCHAR(20) │
│    fecha_registro    TIMESTAMPTZ │
│    estado            BOOLEAN     │
│    pais              VARCHAR(100)│
│    ciudad            VARCHAR(100)│
└──────┬───────────────────────────┘
       │ 1
       │ N
┌──────▼────────────────────────────┐
│          dispositivos             │
├───────────────────────────────────┤
│ PK id_dispositivo    SERIAL       │
│ FK id_cliente        → clientes   │
│    tipo_dispositivo  VARCHAR(50)  │
│    identificador_unico VARCHAR(255) UQ│
│    sistema_operativo VARCHAR(100) │
│    navegador         VARCHAR(100) │
│    fecha_primer_uso  TIMESTAMPTZ  │
│    fecha_ultimo_uso  TIMESTAMPTZ  │
└──────┬────────────────────────────┘
       │ 1
       │ N
┌──────▼──────────────────────────────┐
│       historico_de_ubicacion        │
├─────────────────────────────────────┤
│ PK id_ubicacion    SERIAL           │
│ FK id_dispositivo  → dispositivos   │
│    direccion_ip    INET             │
│    pais            VARCHAR(100)     │
│    ciudad          VARCHAR(100)     │
│    latitud         NUMERIC(9,6)     │
│    longitud        NUMERIC(9,6)     │
│    fecha_registro  TIMESTAMPTZ      │
└──────┬──────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│           transacciones              │
├──────────────────────────────────────┤
│ PK id_transaccion      SERIAL        │
│ FK id_cliente          → clientes    │
│ FK id_dispositivo      → dispositivos│
│ FK id_ubicacion        → hist_ubic.  │
│ FK id_banco            → bancos      │
│    tipo_transaccion    VARCHAR(50)   │
│    monto               NUMERIC(15,2) │
│    cuenta_origen       VARCHAR(30)   │
│    cuenta_destino      VARCHAR(30)   │
│    fecha_transaccion   TIMESTAMPTZ   │
│    score_riesgo        NUMERIC(5,1)  │
│    estado_transaccion  VARCHAR(20)   │
│    es_fraude_real      BOOLEAN       │
│    tiempo_procesamiento INTEGER      │
│    moneda              CHAR(3)       │
│    canal               VARCHAR(20)   │
└──────┬───────────────────────────────┘
       │ 1
       │ N
┌──────▼───────────────────────────────┐
│              alertas                 │
├──────────────────────────────────────┤
│ PK id_alerta            SERIAL       │
│ FK id_transaccion       → transacc.  │
│    nivel_criticidad     VARCHAR(10)  │
│    fecha_generacion     TIMESTAMPTZ  │
│    factores_sospechosos TEXT         │
│    estado_alerta        VARCHAR(20)  │
│    prioridad            SMALLINT     │
└──────┬───────────────────────────────┘
       │ 1
       │ N
┌──────▼───────────────────────────────┐
│           validaciones               │
├──────────────────────────────────────┤
│ PK id_validacion     SERIAL          │
│ FK id_alerta         → alertas       │
│ FK id_usuario        → usuarios_sist.│
│    clasificacion     VARCHAR(35)     │
│    comentarios       TEXT            │
│    fecha_validacion  TIMESTAMPTZ     │
│    accion_tomada     VARCHAR(50)     │
└──────────────────────────────────────┘

┌──────────────────────────────────┐
│       usuarios_sistemas          │
├──────────────────────────────────┤
│ PK id_usuario            SERIAL  │
│    nombre_completo   VARCHAR(150)│
│    email             VARCHAR(254) UQ│
│    password_hash     TEXT        │
│    rol               VARCHAR(30) │
│    fecha_creacion    TIMESTAMPTZ │
│    ultimo_acceso     TIMESTAMPTZ │
│    estado            BOOLEAN     │
│ FK id_usuario_generador → self   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│            reportes              │
├──────────────────────────────────┤
│ PK id_reporte             SERIAL │
│ FK id_usuario_generador   → usuarios_sistemas│
│    tipo_reporte       VARCHAR(30)│
│    fecha_inicio       TIMESTAMPTZ│
│    fecha_fin          TIMESTAMPTZ│
│    total_transacciones    INTEGER│
│    total_alertas_generadas INTEGER│
│    fraudes_detectados     INTEGER│
│    falsos_positivos       INTEGER│
│    tasa_deteccion     NUMERIC(5,2)│
│    tiempo_promedio_respuesta NUMERIC(8,2)│
│    monto_protegido    NUMERIC(20,2)│
│    fecha_generacion   TIMESTAMPTZ│
│    ruta_archivo       TEXT       │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│         logs_auditoria           │
├──────────────────────────────────┤
│ PK id_log             SERIAL     │
│ FK id_usuario         → usuarios_sistemas│
│    tipo_accion        VARCHAR(50)│
│    entidad_afectada   VARCHAR(50)│
│    descripcion        TEXT       │
│    fecha_accion       TIMESTAMPTZ│
│    id_identidad       INTEGER    │
│    direccion_ip       INET       │
└──────────────────────────────────┘
  ⛔ UPDATE y DELETE bloqueados por RULE
```

---

## Tabla `bancos`

Catálogo de bancos del sistema. Incluye 12 registros iniciales.

```sql
CREATE TABLE trida.bancos (
    id_banco        SERIAL PRIMARY KEY,
    codigo          VARCHAR(50) UNIQUE NOT NULL,
    nombre          VARCHAR(120) NOT NULL,
    color           VARCHAR(20) NOT NULL,
    estado          BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bancos_codigo ON trida.bancos (codigo);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_banco` | SERIAL | PK | Identificador único del banco |
| `codigo` | VARCHAR(50) | NOT NULL, UNIQUE, INDEXED | Código del banco (ej: `bancolombia`) |
| `nombre` | VARCHAR(120) | NOT NULL | Nombre completo del banco |
| `color` | VARCHAR(20) | NOT NULL | Color institucional en HEX (ej: `#FFD700`) |
| `estado` | BOOLEAN | DEFAULT TRUE | Permite desactivar bancos sin eliminarlos |
| `fecha_creacion` | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación del registro |

### Datos iniciales

| Código | Nombre | Color |
|--------|--------|-------|
| `sin_asignar` | Sin banco asignado | `#6366F1` |
| `bancolombia` | Bancolombia | `#FFD700` |
| `davivienda` | Davivienda | `#E31837` |
| `bogota` | Banco de Bogotá | `#003DA5` |
| `bbva` | BBVA Colombia | `#004481` |
| `avvillas` | AV Villas | `#00A651` |
| `nequi` | Nequi | `#7B2D8E` |
| `daviplata` | Daviplata | `#FF6B00` |
| `scotiabank` | Scotiabank Colpatria | `#EC111A` |
| `occidente` | Banco de Occidente | `#006341` |
| `popular` | Banco Popular | `#0072CE` |
| `falabella` | Banco Falabella | `#00A650` |

---

## Tabla `clientes`

Almacena los clientes bancarios vinculados a un banco.

```sql
CREATE TABLE trida.clientes (
    id_cliente          SERIAL PRIMARY KEY,
    id_banco            INTEGER NOT NULL DEFAULT 1
                            REFERENCES trida.bancos (id_banco)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    nombre_completo     VARCHAR(150) NOT NULL,
    email               VARCHAR(254) NOT NULL UNIQUE,
    telefono            VARCHAR(20) NOT NULL,
    fecha_registro      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estado              BOOLEAN NOT NULL DEFAULT TRUE,
    pais                VARCHAR(100) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    CONSTRAINT chk_clientes_email_formato CHECK (
        email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    )
);

CREATE INDEX idx_clientes_id_banco ON trida.clientes (id_banco);
CREATE INDEX idx_clientes_estado   ON trida.clientes (estado);
CREATE INDEX idx_clientes_ciudad   ON trida.clientes (ciudad);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_cliente` | SERIAL | PK | Identificador único del cliente |
| `id_banco` | INTEGER | FK → bancos, DEFAULT 1 | Banco al que pertenece el cliente |
| `nombre_completo` | VARCHAR(150) | NOT NULL | Nombre completo del cliente |
| `email` | VARCHAR(254) | NOT NULL, UNIQUE | Email del cliente — validado por constraint |
| `telefono` | VARCHAR(20) | NOT NULL | Teléfono de contacto |
| `fecha_registro` | TIMESTAMPTZ | DEFAULT NOW() | Fecha de registro en el sistema |
| `estado` | BOOLEAN | DEFAULT TRUE | Permite desactivar clientes sin eliminarlos |
| `pais` | VARCHAR(100) | NOT NULL | País del cliente |
| `ciudad` | VARCHAR(100) | NOT NULL | Ciudad del cliente |

---

## Tabla `usuarios_sistemas`

Almacena los usuarios internos del sistema (administradores, analistas,
operadores y auditores).

```sql
CREATE TABLE trida.usuarios_sistemas (
    id_usuario              SERIAL PRIMARY KEY,
    nombre_completo         VARCHAR(150) NOT NULL,
    email                   VARCHAR(254) NOT NULL UNIQUE,
    password_hash           TEXT NOT NULL,
    rol                     VARCHAR(30) NOT NULL,
    fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultimo_acceso           TIMESTAMPTZ,
    estado                  BOOLEAN NOT NULL DEFAULT TRUE,
    id_usuario_generador    INTEGER REFERENCES trida.usuarios_sistemas (id_usuario),
    CONSTRAINT chk_usuarios_email_formato CHECK (
        email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    ),
    CONSTRAINT chk_rol CHECK (
        rol IN ('ADMINISTRADOR', 'ANALISTA', 'OPERADOR', 'AUDITOR')
    )
);

CREATE INDEX idx_usuarios_rol    ON trida.usuarios_sistemas (rol);
CREATE INDEX idx_usuarios_estado ON trida.usuarios_sistemas (estado);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_usuario` | SERIAL | PK | Identificador único del usuario |
| `nombre_completo` | VARCHAR(150) | NOT NULL | Nombre completo del usuario del sistema |
| `email` | VARCHAR(254) | NOT NULL, UNIQUE | Email de login — validado por constraint |
| `password_hash` | TEXT | NOT NULL | Hash bcrypt de la contraseña — NUNCA texto plano |
| `rol` | VARCHAR(30) | NOT NULL | Rol del usuario: ADMINISTRADOR, ANALISTA, OPERADOR o AUDITOR |
| `fecha_creacion` | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación de la cuenta |
| `ultimo_acceso` | TIMESTAMPTZ | nullable | Fecha del último login exitoso |
| `estado` | BOOLEAN | DEFAULT TRUE | Permite desactivar usuarios sin eliminarlos |
| `id_usuario_generador` | INTEGER | FK → self, nullable | Usuario administrador que creó esta cuenta |

### Notas de seguridad

- `password_hash` almacena el hash bcrypt con factor de costo 12
- `estado = FALSE` permite desactivar usuarios sin perder trazabilidad
- La autoreferencia `id_usuario_generador` permite auditar quién creó a quién
- El rol es validado directamente en la base de datos mediante constraint

### Roles del sistema

| Rol | Permisos |
|-----|----------|
| `ADMINISTRADOR` | Acceso total — configuración y gestión |
| `ANALISTA` | Revisar, validar y gestionar alertas |
| `OPERADOR` | Solo visualización y escalado |
| `AUDITOR` | Solo lectura de registros e informes |

---

## Tabla `dispositivos`

Almacena los dispositivos registrados por cliente.

```sql
CREATE TABLE trida.dispositivos (
    id_dispositivo      SERIAL PRIMARY KEY,
    id_cliente          INTEGER NOT NULL
                            REFERENCES trida.clientes (id_cliente)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo_dispositivo    VARCHAR(50) NOT NULL,
    identificador_unico VARCHAR(255) NOT NULL UNIQUE,
    sistema_operativo   VARCHAR(100) NOT NULL,
    navegador           VARCHAR(100) NOT NULL,
    fecha_primer_uso    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_ultimo_uso    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_fechas_dispositivo CHECK (
        fecha_ultimo_uso >= fecha_primer_uso
    )
);

CREATE INDEX idx_dispositivos_id_cliente ON trida.dispositivos (id_cliente);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_dispositivo` | SERIAL | PK | Identificador único del dispositivo |
| `id_cliente` | INTEGER | FK → clientes | Cliente propietario del dispositivo |
| `tipo_dispositivo` | VARCHAR(50) | NOT NULL | Tipo: móvil, computadora, tablet, etc. |
| `identificador_unico` | VARCHAR(255) | NOT NULL, UNIQUE | Fingerprint único del dispositivo |
| `sistema_operativo` | VARCHAR(100) | NOT NULL | Sistema operativo del dispositivo |
| `navegador` | VARCHAR(100) | NOT NULL | Navegador utilizado |
| `fecha_primer_uso` | TIMESTAMPTZ | DEFAULT NOW() | Primera vez que se vio el dispositivo |
| `fecha_ultimo_uso` | TIMESTAMPTZ | DEFAULT NOW() | Última vez que se usó el dispositivo |

---

## Tabla `historico_de_ubicacion`

Almacena el historial de ubicaciones geográficas por dispositivo.

```sql
CREATE TABLE trida.historico_de_ubicacion (
    id_ubicacion        SERIAL PRIMARY KEY,
    id_dispositivo      INTEGER NOT NULL
                            REFERENCES trida.dispositivos (id_dispositivo)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    direccion_ip        INET NOT NULL,
    pais                VARCHAR(100) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    latitud             NUMERIC(9, 6),
    longitud            NUMERIC(9, 6),
    fecha_registro      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_latitud  CHECK (latitud  BETWEEN -90  AND 90),
    CONSTRAINT chk_longitud CHECK (longitud BETWEEN -180 AND 180)
);

CREATE INDEX idx_ubicacion_id_dispositivo ON trida.historico_de_ubicacion (id_dispositivo);
CREATE INDEX idx_ubicacion_ciudad         ON trida.historico_de_ubicacion (ciudad);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_ubicacion` | SERIAL | PK | Identificador único de la ubicación |
| `id_dispositivo` | INTEGER | FK → dispositivos | Dispositivo que originó la ubicación |
| `direccion_ip` | INET | NOT NULL | Dirección IP de origen |
| `pais` | VARCHAR(100) | NOT NULL | País de la transacción |
| `ciudad` | VARCHAR(100) | NOT NULL | Ciudad de la transacción |
| `latitud` | NUMERIC(9,6) | nullable, entre -90 y 90 | Latitud geográfica |
| `longitud` | NUMERIC(9,6) | nullable, entre -180 y 180 | Longitud geográfica |
| `fecha_registro` | TIMESTAMPTZ | DEFAULT NOW() | Fecha del registro de ubicación |

---

## Tabla `transacciones`

Almacena todas las transacciones procesadas por el sistema con su
score de riesgo asignado.

```sql
CREATE TABLE trida.transacciones (
    id_transaccion          SERIAL PRIMARY KEY,
    id_cliente              INTEGER NOT NULL
                                REFERENCES trida.clientes (id_cliente)
                                ON UPDATE CASCADE ON DELETE RESTRICT,
    id_dispositivo          INTEGER NOT NULL
                                REFERENCES trida.dispositivos (id_dispositivo)
                                ON UPDATE CASCADE ON DELETE RESTRICT,
    id_ubicacion            INTEGER NOT NULL
                                REFERENCES trida.historico_de_ubicacion (id_ubicacion)
                                ON UPDATE CASCADE ON DELETE RESTRICT,
    id_banco                INTEGER NOT NULL DEFAULT 1
                                REFERENCES trida.bancos (id_banco)
                                ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo_transaccion        VARCHAR(50) NOT NULL,
    monto                   NUMERIC(15, 2) NOT NULL,
    cuenta_origen           VARCHAR(30) NOT NULL,
    cuenta_destino          VARCHAR(30) NOT NULL,
    fecha_transaccion       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    score_riesgo            NUMERIC(5, 1),
    estado_transaccion      VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    es_fraude_real          BOOLEAN,
    tiempo_de_procesamiento INTEGER NOT NULL DEFAULT 0,
    moneda                  CHAR(3) NOT NULL DEFAULT 'COP',
    canal                   VARCHAR(20) NOT NULL DEFAULT 'web',
    CONSTRAINT chk_monto_positivo      CHECK (monto > 0),
    CONSTRAINT chk_score_riesgo        CHECK (score_riesgo BETWEEN 0 AND 100),
    CONSTRAINT chk_estado_transaccion  CHECK (
        estado_transaccion IN ('PENDIENTE', 'APROBADA', 'ALERTADA', 'BLOQUEADA')
    ),
    CONSTRAINT chk_tiempo_procesamiento CHECK (tiempo_de_procesamiento >= 0),
    CONSTRAINT chk_moneda               CHECK (moneda ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_canal_transaccion    CHECK (
        canal IN ('mobile', 'web', 'pos', 'atm', 'branch')
    )
);

CREATE INDEX idx_transacciones_id_cliente    ON trida.transacciones (id_cliente);
CREATE INDEX idx_transacciones_id_banco      ON trida.transacciones (id_banco);
CREATE INDEX idx_transacciones_score_riesgo  ON trida.transacciones (score_riesgo DESC)
    WHERE score_riesgo IS NOT NULL;
CREATE INDEX idx_transacciones_fecha         ON trida.transacciones (fecha_transaccion DESC);
CREATE INDEX idx_transacciones_estado        ON trida.transacciones (estado_transaccion);
CREATE INDEX idx_transacciones_canal         ON trida.transacciones (canal);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_transaccion` | SERIAL | PK | Identificador único de la transacción |
| `id_cliente` | INTEGER | FK → clientes | Cliente que realizó la transacción |
| `id_dispositivo` | INTEGER | FK → dispositivos | Dispositivo usado en la transacción |
| `id_ubicacion` | INTEGER | FK → historico_de_ubicacion | Ubicación desde donde se realizó |
| `id_banco` | INTEGER | FK → bancos, DEFAULT 1 | Banco de la transacción |
| `tipo_transaccion` | VARCHAR(50) | NOT NULL | Tipo de operación |
| `monto` | NUMERIC(15,2) | NOT NULL, > 0 | Monto de la transacción |
| `cuenta_origen` | VARCHAR(30) | NOT NULL | Cuenta de origen |
| `cuenta_destino` | VARCHAR(30) | NOT NULL | Cuenta de destino |
| `fecha_transaccion` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de la transacción |
| `score_riesgo` | NUMERIC(5,1) | nullable, entre 0 y 100 | Score calculado por el modelo de IA (ej: 85,5) |
| `estado_transaccion` | VARCHAR(20) | DEFAULT 'PENDIENTE' | Estado: PENDIENTE, APROBADA, ALERTADA o BLOQUEADA |
| `es_fraude_real` | BOOLEAN | nullable | Confirmación manual de fraude real |
| `tiempo_de_procesamiento` | INTEGER | DEFAULT 0, ≥ 0 | Tiempo de procesamiento en milisegundos |
| `moneda` | CHAR(3) | DEFAULT 'COP' | Código ISO de moneda (3 letras mayúsculas) |
| `canal` | VARCHAR(20) | DEFAULT 'web' | Canal: mobile, web, pos, atm o branch |

---

## Tabla `alertas`

Almacena las alertas generadas automáticamente por el sistema cuando
una transacción supera los umbrales configurados.

```sql
CREATE TABLE trida.alertas (
    id_alerta               SERIAL PRIMARY KEY,
    id_transaccion          INTEGER NOT NULL
                                REFERENCES trida.transacciones (id_transaccion)
                                ON UPDATE CASCADE ON DELETE RESTRICT,
    nivel_criticidad        VARCHAR(10) NOT NULL,
    fecha_generacion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    factores_sospechosos    TEXT,
    estado_alerta           VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    prioridad               SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT chk_nivel_criticidad CHECK (
        nivel_criticidad IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')
    ),
    CONSTRAINT chk_estado_alerta CHECK (
        estado_alerta IN ('ACTIVA', 'EN_REVISION', 'RESUELTA', 'DESCARTADA')
    ),
    CONSTRAINT chk_prioridad CHECK (prioridad BETWEEN 1 AND 10)
);

CREATE INDEX idx_alertas_nivel_criticidad ON trida.alertas (nivel_criticidad);
CREATE INDEX idx_alertas_estado           ON trida.alertas (estado_alerta);
CREATE INDEX idx_alertas_fecha            ON trida.alertas (fecha_generacion DESC);
CREATE INDEX idx_alertas_nivel_estado     ON trida.alertas (nivel_criticidad, estado_alerta);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_alerta` | SERIAL | PK | Identificador único de la alerta |
| `id_transaccion` | INTEGER | FK → transacciones | Transacción que originó la alerta |
| `nivel_criticidad` | VARCHAR(10) | NOT NULL | Nivel: BAJA, MEDIA, ALTA o CRITICA |
| `fecha_generacion` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de generación de la alerta |
| `factores_sospechosos` | TEXT | nullable | Descripción de los factores que dispararon la alerta |
| `estado_alerta` | VARCHAR(20) | DEFAULT 'ACTIVA' | Estado: ACTIVA, EN_REVISION, RESUELTA o DESCARTADA |
| `prioridad` | SMALLINT | DEFAULT 1, entre 1 y 10 | Prioridad de atención de la alerta |

### Niveles de criticidad y acciones

| Nivel | Score | Acción automática |
|-------|-------|-------------------|
| `BAJA` | 30–49 % | Notificación visual en dashboard |
| `MEDIA` | 50–79 % | Dashboard + notificación push |
| `ALTA` | 80–94 % | Dashboard + push + email al analista |
| `CRITICA` | > 95 % | Bloqueo + todos los canales + notificación al cliente |

---

## Tabla `validaciones`

Almacena las clasificaciones manuales que los analistas realizan sobre
las alertas generadas por el sistema.

```sql
CREATE TABLE trida.validaciones (
    id_validacion       SERIAL PRIMARY KEY,
    id_alerta           INTEGER NOT NULL
                            REFERENCES trida.alertas (id_alerta)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    id_usuario          INTEGER NOT NULL
                            REFERENCES trida.usuarios_sistemas (id_usuario)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    clasificacion       VARCHAR(35) NOT NULL,
    comentarios         TEXT,
    fecha_validacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accion_tomada       VARCHAR(50),
    CONSTRAINT chk_clasificacion CHECK (
        clasificacion IN (
            'FRAUDE_CONFIRMADO',
            'FALSO_POSITIVO',
            'PENDIENTE_INVESTIGACION',
            'REQUIERE_CONTACTO_CLIENTE'
        )
    )
);

CREATE INDEX idx_validaciones_clasificacion ON trida.validaciones (clasificacion);
CREATE INDEX idx_validaciones_id_alerta     ON trida.validaciones (id_alerta);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_validacion` | SERIAL | PK | Identificador único de la validación |
| `id_alerta` | INTEGER | FK → alertas | Alerta que fue clasificada |
| `id_usuario` | INTEGER | FK → usuarios_sistemas | Analista que realizó la clasificación |
| `clasificacion` | VARCHAR(35) | NOT NULL | Resultado de la validación manual |
| `comentarios` | TEXT | nullable | Justificación de la decisión del analista |
| `fecha_validacion` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de la validación |
| `accion_tomada` | VARCHAR(50) | nullable | Acción ejecutada sobre la alerta |

### Clasificaciones disponibles

| Clasificación | Descripción |
|--------------|-------------|
| `FRAUDE_CONFIRMADO` | La transacción es fraudulenta — se incorpora al reentrenamiento |
| `FALSO_POSITIVO` | La transacción es legítima — se incorpora al reentrenamiento |
| `PENDIENTE_INVESTIGACION` | Requiere análisis adicional |
| `REQUIERE_CONTACTO_CLIENTE` | Necesita verificación directa con el cliente |

---

## Tabla `reportes`

Almacena los reportes automáticos generados por el sistema con
métricas de desempeño.

```sql
CREATE TABLE trida.reportes (
    id_reporte                  SERIAL PRIMARY KEY,
    id_usuario_generador        INTEGER NOT NULL
                                    REFERENCES trida.usuarios_sistemas (id_usuario)
                                    ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo_reporte                VARCHAR(30) NOT NULL,
    fecha_inicio                TIMESTAMPTZ NOT NULL,
    fecha_fin                   TIMESTAMPTZ NOT NULL,
    total_transacciones         INTEGER,
    total_alertas_generadas     INTEGER,
    fraudes_detectados          INTEGER,
    falsos_positivos            INTEGER,
    tasa_deteccion              NUMERIC(5, 2),
    tiempo_promedio_respuesta   NUMERIC(8, 2),
    monto_protegido             NUMERIC(20, 2),
    fecha_generacion            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ruta_archivo                TEXT NOT NULL,
    CONSTRAINT chk_fechas_reporte    CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT chk_tipo_reporte      CHECK (
        tipo_reporte IN ('DIARIO', 'SEMANAL', 'MENSUAL', 'PERSONALIZADO')
    ),
    CONSTRAINT chk_tasa_deteccion    CHECK (tasa_deteccion BETWEEN 0 AND 100),
    CONSTRAINT chk_monto_protegido   CHECK (monto_protegido >= 0)
);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_reporte` | SERIAL | PK | Identificador único del reporte |
| `id_usuario_generador` | INTEGER | FK → usuarios_sistemas | Usuario que generó el reporte |
| `tipo_reporte` | VARCHAR(30) | NOT NULL | Tipo: DIARIO, SEMANAL, MENSUAL o PERSONALIZADO |
| `fecha_inicio` | TIMESTAMPTZ | NOT NULL | Inicio del período del reporte |
| `fecha_fin` | TIMESTAMPTZ | NOT NULL, ≥ fecha_inicio | Fin del período del reporte |
| `total_transacciones` | INTEGER | nullable | Total de transacciones en el período |
| `total_alertas_generadas` | INTEGER | nullable | Total de alertas generadas |
| `fraudes_detectados` | INTEGER | nullable | Fraudes confirmados en el período |
| `falsos_positivos` | INTEGER | nullable | Falsos positivos en el período |
| `tasa_deteccion` | NUMERIC(5,2) | nullable, entre 0 y 100 | Tasa de detección de fraudes |
| `tiempo_promedio_respuesta` | NUMERIC(8,2) | nullable | Tiempo promedio de procesamiento en ms |
| `monto_protegido` | NUMERIC(20,2) | nullable, ≥ 0 | Monto total protegido de fraudes |
| `fecha_generacion` | TIMESTAMPTZ | DEFAULT NOW() | Fecha de generación del reporte |
| `ruta_archivo` | TEXT | NOT NULL | Ruta del archivo exportado |

---

## Tabla `logs_auditoria`

Registro inmutable de todas las acciones del sistema. Los registros
no pueden modificarse ni eliminarse.

```sql
CREATE TABLE trida.logs_auditoria (
    id_log              SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL
                            REFERENCES trida.usuarios_sistemas (id_usuario)
                            ON UPDATE CASCADE ON DELETE RESTRICT,
    tipo_accion         VARCHAR(50) NOT NULL,
    entidad_afectada    VARCHAR(50) NOT NULL,
    descripcion         TEXT,
    fecha_accion        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    id_identidad        INTEGER NOT NULL,
    direccion_ip        INET NOT NULL
);

-- Inmutabilidad garantizada por RULES
CREATE RULE logs_no_update AS
    ON UPDATE TO trida.logs_auditoria DO INSTEAD NOTHING;

CREATE RULE logs_no_delete AS
    ON DELETE TO trida.logs_auditoria DO INSTEAD NOTHING;

CREATE INDEX idx_logs_id_usuario   ON trida.logs_auditoria (id_usuario);
CREATE INDEX idx_logs_fecha_accion ON trida.logs_auditoria (fecha_accion DESC);
CREATE INDEX idx_logs_tipo_accion  ON trida.logs_auditoria (tipo_accion);
```

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id_log` | SERIAL | PK | Identificador único del registro |
| `id_usuario` | INTEGER | FK → usuarios_sistemas | Usuario que ejecutó la acción |
| `tipo_accion` | VARCHAR(50) | NOT NULL | Tipo de evento registrado |
| `entidad_afectada` | VARCHAR(50) | NOT NULL | Tabla o entidad afectada por la acción |
| `descripcion` | TEXT | nullable | Descripción detallada del evento |
| `fecha_accion` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora exacta del evento |
| `id_identidad` | INTEGER | NOT NULL | ID del registro afectado |
| `direccion_ip` | INET | NOT NULL | Dirección IP desde donde se ejecutó la acción |

### Notas de inmutabilidad

- `logs_no_update`: cualquier intento de UPDATE no produce ningún efecto
- `logs_no_delete`: cualquier intento de DELETE no produce ningún efecto
- Los registros solo pueden insertarse — nunca modificarse ni eliminarse
- Esta garantía se aplica a nivel de base de datos, no solo de aplicación

---

## Resumen de Constraints

| Tabla | Constraint | Descripción |
|-------|-----------|-------------|
| `clientes` | `chk_clientes_email_formato` | Email debe cumplir formato RFC básico |
| `usuarios_sistemas` | `chk_usuarios_email_formato` | Email debe cumplir formato RFC básico |
| `usuarios_sistemas` | `chk_rol` | Rol: ADMINISTRADOR, ANALISTA, OPERADOR o AUDITOR |
| `dispositivos` | `chk_fechas_dispositivo` | `fecha_ultimo_uso` ≥ `fecha_primer_uso` |
| `historico_de_ubicacion` | `chk_latitud` | Latitud entre -90 y 90 |
| `historico_de_ubicacion` | `chk_longitud` | Longitud entre -180 y 180 |
| `transacciones` | `chk_monto_positivo` | Monto > 0 |
| `transacciones` | `chk_score_riesgo` | Score entre 0 y 100 |
| `transacciones` | `chk_estado_transaccion` | Estado: PENDIENTE, APROBADA, ALERTADA o BLOQUEADA |
| `transacciones` | `chk_tiempo_procesamiento` | Tiempo de procesamiento ≥ 0 |
| `transacciones` | `chk_moneda` | Código ISO de 3 letras mayúsculas |
| `transacciones` | `chk_canal_transaccion` | Canal: mobile, web, pos, atm o branch |
| `alertas` | `chk_nivel_criticidad` | Nivel: BAJA, MEDIA, ALTA o CRITICA |
| `alertas` | `chk_estado_alerta` | Estado: ACTIVA, EN_REVISION, RESUELTA o DESCARTADA |
| `alertas` | `chk_prioridad` | Prioridad entre 1 y 10 |
| `validaciones` | `chk_clasificacion` | Clasificación: FRAUDE_CONFIRMADO, FALSO_POSITIVO, PENDIENTE_INVESTIGACION o REQUIERE_CONTACTO_CLIENTE |
| `reportes` | `chk_fechas_reporte` | `fecha_fin` ≥ `fecha_inicio` |
| `reportes` | `chk_tipo_reporte` | Tipo: DIARIO, SEMANAL, MENSUAL o PERSONALIZADO |
| `reportes` | `chk_tasa_deteccion` | Tasa entre 0 y 100 |
| `reportes` | `chk_monto_protegido` | Monto protegido ≥ 0 |
| `logs_auditoria` | `logs_no_update` | RULE que bloquea UPDATE |
| `logs_auditoria` | `logs_no_delete` | RULE que bloquea DELETE |

---

## Resumen de Índices

| Tabla | Índice | Columna(s) | Tipo |
|-------|--------|-----------|------|
| `bancos` | `idx_bancos_codigo` | `codigo` | Simple |
| `clientes` | `idx_clientes_id_banco` | `id_banco` | Simple |
| `clientes` | `idx_clientes_estado` | `estado` | Simple |
| `clientes` | `idx_clientes_ciudad` | `ciudad` | Simple |
| `usuarios_sistemas` | `idx_usuarios_rol` | `rol` | Simple |
| `usuarios_sistemas` | `idx_usuarios_estado` | `estado` | Simple |
| `dispositivos` | `idx_dispositivos_id_cliente` | `id_cliente` | Simple |
| `historico_de_ubicacion` | `idx_ubicacion_id_dispositivo` | `id_dispositivo` | Simple |
| `historico_de_ubicacion` | `idx_ubicacion_ciudad` | `ciudad` | Simple |
| `transacciones` | `idx_transacciones_id_cliente` | `id_cliente` | Simple |
| `transacciones` | `idx_transacciones_id_banco` | `id_banco` | Simple |
| `transacciones` | `idx_transacciones_score_riesgo` | `score_riesgo DESC` | Parcial (WHERE NOT NULL) |
| `transacciones` | `idx_transacciones_fecha` | `fecha_transaccion DESC` | Simple |
| `transacciones` | `idx_transacciones_estado` | `estado_transaccion` | Simple |
| `transacciones` | `idx_transacciones_canal` | `canal` | Simple |
| `alertas` | `idx_alertas_nivel_criticidad` | `nivel_criticidad` | Simple |
| `alertas` | `idx_alertas_estado` | `estado_alerta` | Simple |
| `alertas` | `idx_alertas_fecha` | `fecha_generacion DESC` | Simple |
| `alertas` | `idx_alertas_nivel_estado` | `nivel_criticidad, estado_alerta` | Compuesto |
| `validaciones` | `idx_validaciones_clasificacion` | `clasificacion` | Simple |
| `validaciones` | `idx_validaciones_id_alerta` | `id_alerta` | Simple |
| `logs_auditoria` | `idx_logs_id_usuario` | `id_usuario` | Simple |
| `logs_auditoria` | `idx_logs_fecha_accion` | `fecha_accion DESC` | Simple |
| `logs_auditoria` | `idx_logs_tipo_accion` | `tipo_accion` | Simple |

---

## Funciones del Schema `trida`

Todos los endpoints invocan funciones del schema `trida` en lugar de
SQL directo sobre las tablas.

| Función | Descripción | Parámetros |
|---------|-------------|-----------|
| `fn_bancos()` | Lista todos los bancos del catálogo | — |
| `fn_login($1)` | Busca usuario por email para autenticación | `email VARCHAR` |
| `fn_actualizar_ultimo_acceso($1)` | Actualiza `ultimo_acceso` tras login exitoso | `id_usuario INTEGER` |
| `fn_register($1,$2,$3,$4,$5)` | Crea un nuevo usuario del sistema | `nombre_completo, email, password_hash, rol, id_usuario_generador` |
| `fn_listar_usuarios_sistema()` | Lista todos los usuarios del sistema | — |
| `fn_cambiar_contrasena($1,$2)` | Actualiza el `password_hash` de un usuario | `email VARCHAR, nuevo_hash TEXT` |
| `fn_clientes()` | Lista todos los clientes | — |
| `fn_usuarios($1)` | Lista clientes filtrable por banco | `banco_codigo VARCHAR` |
| `fn_transacciones($1)` | Lista transacciones filtrable por banco | `banco_codigo VARCHAR` |
| `fn_alertas($1)` | Lista alertas filtrable por banco | `banco_codigo VARCHAR` |
| `fn_dispositivos($1)` | Lista dispositivos filtrable por banco | `banco_codigo VARCHAR` |
| `fn_dashboard_stats($1)` | Estadísticas generales del dashboard | `banco_codigo VARCHAR` |
| `fn_alertas_recientes($1)` | Alertas recientes del sistema | `banco_codigo VARCHAR` |
| `fn_analytics_metricas($1)` | Métricas globales de detección | `banco_codigo VARCHAR` |
| `fn_analytics_por_tipo($1)` | Agregación por tipo de transacción | `banco_codigo VARCHAR` |
| `fn_analytics_por_ciudad($1)` | Agregación por ciudad | `banco_codigo VARCHAR` |
| `fn_analytics_por_canal($1)` | Agregación por canal | `banco_codigo VARCHAR` |
| `fn_analytics_por_banco_fraude($1)` | Agregación de fraudes por banco | `banco_codigo VARCHAR` |
| `fn_mapa_stats($1)` | Estadísticas geográficas | `banco_codigo VARCHAR` |
| `fn_mapa_ubicaciones($1)` | Ubicaciones registradas | `banco_codigo VARCHAR` |

---

## Configuración de Conexión

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    user:     'postgres',
    host:     'localhost',
    database: 'TriDa',
    password: process.env.DB_PASSWORD,
    port:     5432,
});
```

### Regla fundamental

> **Nunca alterar la base de datos directamente con SQL ad-hoc.**
> Toda modificación al esquema debe documentarse aquí y ejecutarse
> con revisión previa del equipo.
