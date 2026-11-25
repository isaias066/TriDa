-- Canonical schema for new databases.
-- Idempotent installer and updater for supported existing TriDa databases.
-- Back up an existing database before applying this file.
-- Keep Prisma-supported tables and indexes aligned with backend/prisma/schema.prisma;
-- custom checks, partial/expression indexes, rules, triggers, and functions live here.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE SCHEMA IF NOT EXISTS trida;
SET search_path TO trida, public;

CREATE TABLE IF NOT EXISTS trida.usuarios (
    id_usuario       SERIAL PRIMARY KEY,
    nombre_completo  VARCHAR(150) NOT NULL,
    email            VARCHAR(254) NOT NULL UNIQUE,
    password_hash    TEXT NOT NULL,
    telefono         VARCHAR(20),
    pais             VARCHAR(100),
    ciudad           VARCHAR(100),
    rol              VARCHAR(20) NOT NULL DEFAULT 'USER',
    estado           BOOLEAN NOT NULL DEFAULT TRUE,
    email_verificado_en TIMESTAMPTZ DEFAULT NOW(),
    token_version    INTEGER NOT NULL DEFAULT 0,
    intentos_login_fallidos INTEGER NOT NULL DEFAULT 0,
    bloqueado_hasta  TIMESTAMPTZ,
    fecha_registro   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultimo_acceso    TIMESTAMPTZ,
    CONSTRAINT chk_usuarios_email CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
    CONSTRAINT chk_usuarios_rol   CHECK (rol IN ('USER', 'ADMIN'))
);

-- ----------------------------------------------------------------------------
-- perfil_financiero
-- Datos financieros clave del usuario (1:1).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.perfil_financiero (
    id_perfil            SERIAL PRIMARY KEY,
    id_usuario           INTEGER NOT NULL UNIQUE
                         REFERENCES trida.usuarios (id_usuario)
                         ON UPDATE CASCADE ON DELETE CASCADE,
    ingreso_mensual      NUMERIC(15, 2) NOT NULL DEFAULT 0,
    moneda_preferida     CHAR(3) NOT NULL DEFAULT 'COP',
    tolerancia_riesgo    VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    meta_ahorro_mensual  NUMERIC(15, 2) NOT NULL DEFAULT 0,
    fecha_actualizacion  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_perfil_ingreso CHECK (ingreso_mensual >= 0),
    CONSTRAINT chk_perfil_moneda  CHECK (moneda_preferida ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_perfil_riesgo  CHECK (tolerancia_riesgo IN ('BAJA', 'MEDIA', 'ALTA')),
    CONSTRAINT chk_perfil_meta    CHECK (meta_ahorro_mensual >= 0)
);

-- ----------------------------------------------------------------------------
-- cuentas
-- Cada cuenta financiera del usuario (banco, tarjeta, billetera, efectivo).
-- NUEVA en v2 — reemplaza al antiguo concepto de "banco global".
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.cuentas (
    id_cuenta          SERIAL PRIMARY KEY,
    id_usuario         INTEGER NOT NULL
                       REFERENCES trida.usuarios (id_usuario)
                       ON UPDATE CASCADE ON DELETE CASCADE,
    nombre             VARCHAR(100) NOT NULL,
    entidad            VARCHAR(100),
    tipo               VARCHAR(20) NOT NULL,
    numero_enmascarado VARCHAR(20),
    color              VARCHAR(20) NOT NULL DEFAULT '#8B5CF6',
    saldo_inicial      NUMERIC(15, 2) NOT NULL DEFAULT 0,
    saldo_actual       NUMERIC(15, 2) NOT NULL DEFAULT 0,
    estado             BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cuenta_tipo CHECK (tipo IN ('BANCO', 'TARJETA', 'BILLETERA', 'EFECTIVO'))
);

-- ----------------------------------------------------------------------------
-- categorias
-- Catálogo de gasto/ingreso. es_default = TRUE son del sistema.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.categorias (
    id_categoria   SERIAL PRIMARY KEY,
    id_usuario     INTEGER REFERENCES trida.usuarios (id_usuario)
                   ON UPDATE CASCADE ON DELETE CASCADE,
    nombre         VARCHAR(80) NOT NULL,
    tipo           VARCHAR(10) NOT NULL,
    icono          VARCHAR(50),
    color          VARCHAR(20) NOT NULL DEFAULT '#8B5CF6',
    es_default     BOOLEAN NOT NULL DEFAULT FALSE,
    estado         BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_categoria_tipo CHECK (tipo IN ('INGRESO', 'GASTO', 'AHORRO')),
    CONSTRAINT uq_categoria_user  UNIQUE (id_usuario, nombre)
);

INSERT INTO trida.categorias (
    id_usuario, nombre, tipo, icono, color, es_default, estado
)
SELECT NULL, defaults.nombre, defaults.tipo, NULL, defaults.color, TRUE, TRUE
FROM (
    VALUES
        ('Alimentación', 'GASTO', '#8B5CF6'),
        ('Vivienda', 'GASTO', '#6D5BD0'),
        ('Transporte', 'GASTO', '#7C6FC4'),
        ('Salud', 'GASTO', '#9B8AFB'),
        ('Educación', 'GASTO', '#5B4BA8'),
        ('Servicios', 'GASTO', '#A78BFA'),
        ('Compras', 'GASTO', '#8173B8'),
        ('Entretenimiento', 'GASTO', '#B39DDB'),
        ('Otros gastos', 'GASTO', '#6B7280'),
        ('Salario', 'INGRESO', '#6D5BD0'),
        ('Ingresos adicionales', 'INGRESO', '#8B5CF6'),
        ('Otros ingresos', 'INGRESO', '#9B8AFB'),
        ('Ahorro', 'AHORRO', '#7C6FC4')
) AS defaults(nombre, tipo, color)
WHERE NOT EXISTS (
    SELECT 1
    FROM trida.categorias AS category
    WHERE category.id_usuario IS NULL
      AND category.es_default = TRUE
      AND category.tipo = defaults.tipo
      AND LOWER(category.nombre) = LOWER(defaults.nombre)
);

-- ----------------------------------------------------------------------------
-- dispositivos
-- Dispositivos del usuario para detección de accesos inusuales.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.dispositivos (
    id_dispositivo      SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL
                        REFERENCES trida.usuarios (id_usuario)
                        ON UPDATE CASCADE ON DELETE CASCADE,
    tipo_dispositivo    VARCHAR(50) NOT NULL,
    identificador_unico VARCHAR(255) NOT NULL,
    sistema_operativo   VARCHAR(100),
    navegador           VARCHAR(100),
    confiable           BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_primer_uso    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_ultimo_uso    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_fechas_disp CHECK (fecha_ultimo_uso >= fecha_primer_uso),
    CONSTRAINT uq_dispositivo_user_identifier UNIQUE (id_usuario, identificador_unico)
);

-- ----------------------------------------------------------------------------
-- ubicaciones
-- Histórico de ubicaciones asociadas a transacciones.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.ubicaciones (
    id_ubicacion   SERIAL PRIMARY KEY,
    id_dispositivo INTEGER REFERENCES trida.dispositivos (id_dispositivo)
                   ON UPDATE CASCADE ON DELETE SET NULL,
    direccion_ip   INET,
    pais           VARCHAR(100),
    ciudad         VARCHAR(100),
    latitud        NUMERIC(9, 6),
    longitud       NUMERIC(9, 6),
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_lat CHECK (latitud BETWEEN -90 AND 90),
    CONSTRAINT chk_lng CHECK (longitud BETWEEN -180 AND 180)
);

-- ----------------------------------------------------------------------------
-- transacciones
-- Núcleo del sistema. Incluye transferencias entre cuentas propias.
-- monto siempre positivo (RF-004 adaptado: el tipo indica la dirección).
-- NUEVO: id_cuenta vincula cada movimiento a una cuenta del usuario.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.transacciones (
    id_transaccion    SERIAL PRIMARY KEY,
    id_usuario        INTEGER NOT NULL
                      REFERENCES trida.usuarios (id_usuario)
                      ON UPDATE CASCADE ON DELETE CASCADE,
    id_cuenta         INTEGER REFERENCES trida.cuentas (id_cuenta)
                      ON UPDATE CASCADE ON DELETE SET NULL,
    id_cuenta_destino INTEGER REFERENCES trida.cuentas (id_cuenta)
                      ON UPDATE CASCADE ON DELETE RESTRICT,
    id_categoria      INTEGER REFERENCES trida.categorias (id_categoria)
                      ON UPDATE CASCADE ON DELETE SET NULL,
    id_dispositivo    INTEGER REFERENCES trida.dispositivos (id_dispositivo)
                      ON UPDATE CASCADE ON DELETE SET NULL,
    id_ubicacion      INTEGER REFERENCES trida.ubicaciones (id_ubicacion)
                      ON UPDATE CASCADE ON DELETE SET NULL,
    tipo_movimiento   VARCHAR(15) NOT NULL,
    monto             NUMERIC(15, 2) NOT NULL,
    moneda            CHAR(3) NOT NULL DEFAULT 'COP',
    descripcion       VARCHAR(255),
    comercio          VARCHAR(150),
    canal             VARCHAR(20) NOT NULL DEFAULT 'web',
    fuente_externa    VARCHAR(30),
    id_evento_externo VARCHAR(160),
    huella_evento_externo CHAR(64),
    confirmacion_correo_enviado_en TIMESTAMPTZ,
    es_recurrente     BOOLEAN NOT NULL DEFAULT FALSE,
    score_anomalia    NUMERIC(5, 2),
    estado            VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA',
    fecha_transaccion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_monto_positivo  CHECK (monto > 0),
    CONSTRAINT chk_moneda_tx       CHECK (moneda ~ '^[A-Z]{3}$'),
    CONSTRAINT chk_tipo_movimiento CHECK (tipo_movimiento IN ('INGRESO', 'GASTO', 'AHORRO', 'TRANSFERENCIA')),
    CONSTRAINT chk_transfer_accounts CHECK (
        (tipo_movimiento = 'TRANSFERENCIA'
            AND id_cuenta IS NOT NULL
            AND id_cuenta_destino IS NOT NULL
            AND id_cuenta <> id_cuenta_destino)
        OR (tipo_movimiento <> 'TRANSFERENCIA' AND id_cuenta_destino IS NULL)
    ),
    CONSTRAINT chk_external_event_pair CHECK (
        (canal = 'webhook'
            AND fuente_externa IS NOT NULL
            AND id_evento_externo IS NOT NULL)
        OR (canal <> 'webhook'
            AND fuente_externa IS NULL
            AND id_evento_externo IS NULL)
    ),
    CONSTRAINT chk_canal_tx        CHECK (canal IN ('mobile','web','pos','atm','transferencia','efectivo','manual','webhook')),
    CONSTRAINT chk_estado_tx       CHECK (estado IN ('PENDIENTE','CONFIRMADA','APROBADA','SOSPECHOSA','RECHAZADA')),
    CONSTRAINT chk_score_rango     CHECK (score_anomalia BETWEEN 0 AND 100)
);

ALTER TABLE trida.transacciones
    ADD COLUMN IF NOT EXISTS id_cuenta_destino INTEGER
        REFERENCES trida.cuentas (id_cuenta)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS fuente_externa VARCHAR(30),
    ADD COLUMN IF NOT EXISTS id_evento_externo VARCHAR(160),
    ADD COLUMN IF NOT EXISTS huella_evento_externo CHAR(64),
    ADD COLUMN IF NOT EXISTS confirmacion_correo_enviado_en TIMESTAMPTZ;

ALTER TABLE trida.transacciones
    ALTER COLUMN tipo_movimiento TYPE VARCHAR(15),
    DROP CONSTRAINT IF EXISTS chk_tipo_movimiento,
    ADD CONSTRAINT chk_tipo_movimiento
        CHECK (tipo_movimiento IN ('INGRESO', 'GASTO', 'AHORRO', 'TRANSFERENCIA')) NOT VALID,
    DROP CONSTRAINT IF EXISTS chk_canal_tx,
    ADD CONSTRAINT chk_canal_tx
        CHECK (canal IN ('mobile','web','pos','atm','transferencia','efectivo','manual','webhook')) NOT VALID,
    DROP CONSTRAINT IF EXISTS chk_transfer_accounts,
    ADD CONSTRAINT chk_transfer_accounts CHECK (
        (tipo_movimiento = 'TRANSFERENCIA'
            AND id_cuenta IS NOT NULL
            AND id_cuenta_destino IS NOT NULL
            AND id_cuenta <> id_cuenta_destino)
        OR (tipo_movimiento <> 'TRANSFERENCIA' AND id_cuenta_destino IS NULL)
    ) NOT VALID,
    DROP CONSTRAINT IF EXISTS chk_external_event_pair,
    ADD CONSTRAINT chk_external_event_pair CHECK (
        (canal = 'webhook'
            AND fuente_externa IS NOT NULL
            AND id_evento_externo IS NOT NULL)
        OR (canal <> 'webhook'
            AND fuente_externa IS NULL
            AND id_evento_externo IS NULL)
    ) NOT VALID;

ALTER TABLE trida.transacciones
    VALIDATE CONSTRAINT chk_tipo_movimiento,
    VALIDATE CONSTRAINT chk_canal_tx,
    VALIDATE CONSTRAINT chk_transfer_accounts,
    VALIDATE CONSTRAINT chk_external_event_pair;

CREATE TABLE IF NOT EXISTS trida.exportaciones_transacciones_archivo (
    id_exportacion    SERIAL PRIMARY KEY,
    id_usuario        INTEGER NOT NULL
                      REFERENCES trida.usuarios (id_usuario)
                      ON UPDATE CASCADE ON DELETE CASCADE,
    ids_transacciones INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    fecha_corte       TIMESTAMPTZ NOT NULL,
    fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_expiracion  TIMESTAMPTZ NOT NULL,
    fecha_descarga    TIMESTAMPTZ,
    fecha_eliminacion TIMESTAMPTZ,
    CONSTRAINT chk_tx_archive_expiry CHECK (fecha_expiracion > fecha_creacion)
);

CREATE INDEX IF NOT EXISTS idx_tx_archive_user_expiry
    ON trida.exportaciones_transacciones_archivo (id_usuario, fecha_expiracion);

CREATE TABLE IF NOT EXISTS trida.eventos_transacciones_archivados (
    id_evento_archivado     SERIAL PRIMARY KEY,
    id_usuario              INTEGER NOT NULL
                            REFERENCES trida.usuarios (id_usuario)
                            ON UPDATE CASCADE ON DELETE CASCADE,
    id_cuenta               INTEGER NOT NULL,
    fuente_externa          VARCHAR(30) NOT NULL,
    id_evento_externo       VARCHAR(160) NOT NULL,
    id_transaccion_original INTEGER NOT NULL,
    estado_original         VARCHAR(20) NOT NULL,
    huella_evento           CHAR(64) NOT NULL,
    fecha_archivado         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tx_archived_event UNIQUE (id_cuenta, fuente_externa, id_evento_externo),
    CONSTRAINT uq_tx_archived_original UNIQUE (id_transaccion_original)
);

CREATE INDEX IF NOT EXISTS idx_tx_archived_user_date
    ON trida.eventos_transacciones_archivados (id_usuario, fecha_archivado DESC);

-- ----------------------------------------------------------------------------
-- patron_comportamiento
-- Snapshot 1:1 del perfil conductual del usuario (simple).
-- El backend recalcula periódicamente; el trigger solo marca la fecha.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.patron_comportamiento (
    id_patron              SERIAL PRIMARY KEY,
    id_usuario             INTEGER NOT NULL UNIQUE
                           REFERENCES trida.usuarios (id_usuario)
                           ON UPDATE CASCADE ON DELETE CASCADE,
    gasto_diario_promedio  NUMERIC(15, 2) NOT NULL DEFAULT 0,
    gasto_diario_desv      NUMERIC(15, 2) NOT NULL DEFAULT 0,
    categorias_top         JSONB NOT NULL DEFAULT '[]'::jsonb,
    ubicaciones_frecuentes JSONB NOT NULL DEFAULT '[]'::jsonb,
    horarios_habituales    JSONB NOT NULL DEFAULT '{}'::jsonb,
    comercios_frecuentes   JSONB NOT NULL DEFAULT '[]'::jsonb,
    fecha_actualizacion    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- presupuestos
-- Límites de gasto por categoría y mes. NUEVA en v2.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.presupuestos (
    id_presupuesto SERIAL PRIMARY KEY,
    id_usuario     INTEGER NOT NULL
                   REFERENCES trida.usuarios (id_usuario)
                   ON UPDATE CASCADE ON DELETE CASCADE,
    id_categoria   INTEGER REFERENCES trida.categorias (id_categoria)
                   ON UPDATE CASCADE ON DELETE SET NULL,
    limite_mensual NUMERIC(15, 2) NOT NULL,
    mes            SMALLINT NOT NULL,
    anio           SMALLINT NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_presup_limite CHECK (limite_mensual > 0),
    CONSTRAINT chk_presup_mes    CHECK (mes BETWEEN 1 AND 12),
    CONSTRAINT chk_presup_anio   CHECK (anio BETWEEN 2020 AND 2100),
    CONSTRAINT uq_presup         UNIQUE (id_usuario, id_categoria, mes, anio)
);

-- ----------------------------------------------------------------------------
-- metas_ahorro
-- Objetivos financieros del usuario.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.metas_ahorro (
    id_meta          SERIAL PRIMARY KEY,
    id_usuario       INTEGER NOT NULL
                     REFERENCES trida.usuarios (id_usuario)
                     ON UPDATE CASCADE ON DELETE CASCADE,
    id_categoria     INTEGER,
    nombre           VARCHAR(120) NOT NULL,
    descripcion      TEXT,
    monto_objetivo   NUMERIC(15, 2) NOT NULL,
    monto_actual     NUMERIC(15, 2) NOT NULL DEFAULT 0,
    fecha_limite     DATE,
    estado           VARCHAR(15) NOT NULL DEFAULT 'ACTIVA',
    fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_completada TIMESTAMPTZ,
    CONSTRAINT metas_ahorro_id_categoria_fkey
        FOREIGN KEY (id_categoria)
        REFERENCES trida.categorias (id_categoria)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_meta_obj CHECK (monto_objetivo > 0),
    CONSTRAINT chk_meta_act CHECK (monto_actual >= 0),
    CONSTRAINT chk_meta_est CHECK (estado IN ('ACTIVA','PAUSADA','COMPLETADA','CANCELADA'))
);

-- ----------------------------------------------------------------------------
-- aportes_meta
-- Movimientos hacia una meta de ahorro. NUEVA en v2.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.aportes_meta (
    id_aporte    SERIAL PRIMARY KEY,
    id_meta      INTEGER NOT NULL
                 REFERENCES trida.metas_ahorro (id_meta)
                 ON UPDATE CASCADE ON DELETE CASCADE,
    monto        NUMERIC(15, 2) NOT NULL,
    fecha_aporte TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_aporte_monto CHECK (monto > 0)
);

-- ----------------------------------------------------------------------------
-- consejos_financieros
-- Recomendaciones de la IA basadas en hábitos del usuario.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.consejos_financieros (
    id_consejo     SERIAL PRIMARY KEY,
    id_usuario     INTEGER NOT NULL
                   REFERENCES trida.usuarios (id_usuario)
                   ON UPDATE CASCADE ON DELETE CASCADE,
    id_cuenta      INTEGER REFERENCES trida.cuentas (id_cuenta)
                   ON UPDATE CASCADE ON DELETE SET NULL,
    tipo           VARCHAR(20) NOT NULL,
    titulo         VARCHAR(150) NOT NULL,
    descripcion    TEXT NOT NULL,
    prioridad      VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    leido          BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_generado TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_leido    TIMESTAMPTZ,
    CONSTRAINT chk_consejo_tipo CHECK (tipo IN ('AHORRO','GASTO','INVERSION','ALERTA','METAS')),
    CONSTRAINT chk_consejo_prio CHECK (prioridad IN ('BAJA','MEDIA','ALTA'))
);

-- ----------------------------------------------------------------------------
-- alertas_fraude
-- Alertas que el propio usuario confirma o descarta.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.alertas_fraude (
    id_alerta       SERIAL PRIMARY KEY,
    id_usuario      INTEGER NOT NULL
                    REFERENCES trida.usuarios (id_usuario)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    id_transaccion  INTEGER NOT NULL
                    REFERENCES trida.transacciones (id_transaccion)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    severidad       VARCHAR(10) NOT NULL,
    motivo          TEXT NOT NULL,
    estado          VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE',
    fecha_detectada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_resuelta  TIMESTAMPTZ,
    accion_usuario  VARCHAR(20),
    CONSTRAINT chk_alerta_sev    CHECK (severidad IN ('BAJA','MEDIA','ALTA','CRITICA')),
    CONSTRAINT chk_alerta_estado CHECK (estado IN ('PENDIENTE','CONFIRMADA','DESCARTADA')),
    CONSTRAINT chk_alerta_accion CHECK (accion_usuario IS NULL
        OR accion_usuario IN ('FUI_YO','NO_FUI_YO','BLOQUEAR_TARJETA'))
);

-- ----------------------------------------------------------------------------
-- analisis_gastos
-- Snapshots precalculados por período.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.analisis_gastos (
    id_analisis          SERIAL PRIMARY KEY,
    id_usuario           INTEGER NOT NULL
                         REFERENCES trida.usuarios (id_usuario)
                         ON UPDATE CASCADE ON DELETE CASCADE,
    periodo              VARCHAR(10) NOT NULL,
    fecha_inicio         DATE NOT NULL,
    fecha_fin            DATE NOT NULL,
    total_ingresos       NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_gastos         NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_ahorro         NUMERIC(15, 2) NOT NULL DEFAULT 0,
    desglose_categorias  JSONB NOT NULL DEFAULT '{}'::jsonb,
    comparativa_anterior JSONB NOT NULL DEFAULT '{}'::jsonb,
    fecha_generado       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_analisis_per   CHECK (periodo IN ('SEMANAL','MENSUAL','ANUAL')),
    CONSTRAINT chk_analisis_fecha CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT uq_analisis        UNIQUE (id_usuario, periodo, fecha_inicio)
);

-- ----------------------------------------------------------------------------
-- reportes_mensuales
-- Reportes consolidados con score de salud financiera.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.reportes_mensuales (
    id_reporte     SERIAL PRIMARY KEY,
    id_usuario     INTEGER NOT NULL
                   REFERENCES trida.usuarios (id_usuario)
                   ON UPDATE CASCADE ON DELETE CASCADE,
    anio           SMALLINT NOT NULL,
    mes            SMALLINT NOT NULL,
    score_salud    NUMERIC(5, 2) NOT NULL DEFAULT 0,
    resumen        JSONB NOT NULL DEFAULT '{}'::jsonb,
    ruta_archivo   TEXT,
    fecha_generado TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rep_anio  CHECK (anio BETWEEN 2000 AND 2100),
    CONSTRAINT chk_rep_mes   CHECK (mes BETWEEN 1 AND 12),
    CONSTRAINT chk_rep_score CHECK (score_salud BETWEEN 0 AND 100),
    CONSTRAINT uq_rep_mes    UNIQUE (id_usuario, anio, mes)
);

-- ----------------------------------------------------------------------------
-- logs_auditoria
-- Bitácora inmutable (append-only).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trida.logs_auditoria (
    id_log           SERIAL PRIMARY KEY,
    id_usuario       INTEGER REFERENCES trida.usuarios (id_usuario)
                     ON UPDATE CASCADE ON DELETE SET NULL,
    tipo_accion      VARCHAR(50) NOT NULL,
    entidad_afectada VARCHAR(50) NOT NULL,
    id_entidad       INTEGER,
    descripcion      TEXT,
    direccion_ip     INET,
    fecha_accion     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade additive changes for databases created by earlier TriDa schemas.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM trida.usuarios
        WHERE rol NOT IN ('USER', 'ADMIN')
    ) THEN
        RAISE EXCEPTION
            'Hay usuarios con un rol distinto de USER o ADMIN; corrígelos antes de actualizar.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM trida.dispositivos
        GROUP BY id_usuario, identificador_unico
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Hay identificadores de dispositivo repetidos para un usuario; resuélvelos antes de actualizar.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM trida.categorias
        WHERE id_usuario IS NULL
        GROUP BY LOWER(nombre)
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Hay categorías del sistema con nombres duplicados ignorando mayúsculas; resuélvelos antes de actualizar.';
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_alerta_feedback ON trida.alertas_fraude;
DROP TRIGGER IF EXISTS trg_meta_completada ON trida.metas_ahorro;

ALTER TABLE trida.usuarios
    ADD COLUMN IF NOT EXISTS email_verificado_en TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS intentos_login_fallidos INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS dispositivo_historial_registrado BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE trida.usuarios
    ALTER COLUMN email_verificado_en SET DEFAULT NOW(),
    ALTER COLUMN token_version SET DEFAULT 0;

UPDATE trida.usuarios
SET token_version = 0
WHERE token_version IS NULL;

ALTER TABLE trida.usuarios
    ALTER COLUMN token_version SET NOT NULL;

ALTER TABLE trida.cuentas
    ADD COLUMN IF NOT EXISTS saldo_actual NUMERIC(15, 2);

UPDATE trida.cuentas
SET saldo_actual = saldo_inicial
WHERE saldo_actual IS NULL;

ALTER TABLE trida.cuentas
    ALTER COLUMN saldo_actual SET DEFAULT 0,
    ALTER COLUMN saldo_actual SET NOT NULL;

ALTER TABLE trida.consejos_financieros
    ADD COLUMN IF NOT EXISTS id_cuenta INTEGER
    REFERENCES trida.cuentas (id_cuenta)
    ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE trida.metas_ahorro
    ADD COLUMN IF NOT EXISTS id_categoria INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'trida.metas_ahorro'::regclass
          AND conname = 'metas_ahorro_id_categoria_fkey'
    ) THEN
        ALTER TABLE trida.metas_ahorro
            ADD CONSTRAINT metas_ahorro_id_categoria_fkey
            FOREIGN KEY (id_categoria)
            REFERENCES trida.categorias (id_categoria)
            ON UPDATE CASCADE
            ON DELETE SET NULL;
    END IF;
END;
$$;

ALTER TABLE trida.usuarios
    DROP CONSTRAINT IF EXISTS chk_usuarios_rol;

ALTER TABLE trida.usuarios
    ADD CONSTRAINT chk_usuarios_rol
    CHECK (rol IN ('USER', 'ADMIN')) NOT VALID;

ALTER TABLE trida.usuarios
    VALIDATE CONSTRAINT chk_usuarios_rol;

INSERT INTO trida.perfil_financiero (id_usuario)
SELECT u.id_usuario
FROM trida.usuarios AS u
WHERE NOT EXISTS (
    SELECT 1
    FROM trida.perfil_financiero AS p
    WHERE p.id_usuario = u.id_usuario
);

ALTER TABLE trida.dispositivos
    DROP CONSTRAINT IF EXISTS dispositivos_identificador_unico_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'trida.dispositivos'::regclass
          AND conname = 'uq_dispositivo_user_identifier'
    ) THEN
        ALTER TABLE trida.dispositivos
            ADD CONSTRAINT uq_dispositivo_user_identifier
            UNIQUE (id_usuario, identificador_unico);
    END IF;
END;
$$;

-- ============================================================================
-- 2. REGLAS (logs inmutables)
-- ============================================================================

-- Los registros pueden depurarse por la retención de 90 días.

-- ============================================================================
-- 3. ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_estado
    ON trida.usuarios (estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_trgm
    ON trida.usuarios USING gin (nombre_completo gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_cuentas_usuario
    ON trida.cuentas (id_usuario);

CREATE INDEX IF NOT EXISTS idx_categorias_usuario
    ON trida.categorias (id_usuario);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo
    ON trida.categorias (tipo);
CREATE INDEX IF NOT EXISTS idx_categories_owner_state
    ON trida.categorias (id_usuario, estado);
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_system_name
    ON trida.categorias (LOWER(nombre))
    WHERE id_usuario IS NULL;

CREATE INDEX IF NOT EXISTS idx_dispositivos_usuario
    ON trida.dispositivos (id_usuario);
CREATE INDEX IF NOT EXISTS idx_dispositivos_conf
    ON trida.dispositivos (confiable);

CREATE INDEX IF NOT EXISTS idx_ubicaciones_disp
    ON trida.ubicaciones (id_dispositivo);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_ciudad
    ON trida.ubicaciones (ciudad);

CREATE INDEX IF NOT EXISTS idx_tx_usuario
    ON trida.transacciones (id_usuario);
CREATE INDEX IF NOT EXISTS idx_tx_cuenta
    ON trida.transacciones (id_cuenta);
CREATE INDEX IF NOT EXISTS idx_tx_cuenta_destino
    ON trida.transacciones (id_cuenta_destino);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tx_external_event
    ON trida.transacciones (id_cuenta, fuente_externa, id_evento_externo);
CREATE INDEX IF NOT EXISTS idx_tx_categoria
    ON trida.transacciones (id_categoria);
CREATE INDEX IF NOT EXISTS idx_tx_ubicacion
    ON trida.transacciones (id_ubicacion);
CREATE INDEX IF NOT EXISTS idx_tx_dispositivo
    ON trida.transacciones (id_dispositivo);
CREATE INDEX IF NOT EXISTS idx_tx_fecha
    ON trida.transacciones (fecha_transaccion DESC);
CREATE INDEX IF NOT EXISTS idx_tx_usuario_fecha
    ON trida.transacciones (id_usuario, fecha_transaccion DESC);
CREATE INDEX IF NOT EXISTS idx_tx_user_cat_fecha
    ON trida.transacciones (id_usuario, id_categoria, fecha_transaccion);
CREATE INDEX IF NOT EXISTS idx_tx_tipo
    ON trida.transacciones (tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_tx_estado
    ON trida.transacciones (estado);
CREATE INDEX IF NOT EXISTS idx_tx_score
    ON trida.transacciones (score_anomalia DESC)
    WHERE score_anomalia IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tx_recurrente
    ON trida.transacciones (id_usuario, es_recurrente)
    WHERE es_recurrente = TRUE;

CREATE INDEX IF NOT EXISTS idx_presup_usuario
    ON trida.presupuestos (id_usuario, anio, mes);

CREATE INDEX IF NOT EXISTS idx_metas_usuario
    ON trida.metas_ahorro (id_usuario);
CREATE INDEX IF NOT EXISTS idx_metas_estado
    ON trida.metas_ahorro (estado);
CREATE INDEX IF NOT EXISTS idx_metas_categoria
    ON trida.metas_ahorro (id_categoria);

CREATE INDEX IF NOT EXISTS idx_aportes_meta
    ON trida.aportes_meta (id_meta);

CREATE INDEX IF NOT EXISTS idx_consejos_usuario
    ON trida.consejos_financieros (id_usuario);
CREATE INDEX IF NOT EXISTS idx_consejos_no_leidos
    ON trida.consejos_financieros (id_usuario, leido)
    WHERE leido = FALSE;

CREATE INDEX IF NOT EXISTS idx_alertas_usuario
    ON trida.alertas_fraude (id_usuario);
CREATE INDEX IF NOT EXISTS idx_alertas_estado
    ON trida.alertas_fraude (estado);
CREATE INDEX IF NOT EXISTS idx_alertas_severidad
    ON trida.alertas_fraude (severidad);
CREATE INDEX IF NOT EXISTS idx_alertas_tx_fecha
    ON trida.alertas_fraude (id_transaccion, fecha_detectada DESC);

CREATE INDEX IF NOT EXISTS idx_analisis_user_per
    ON trida.analisis_gastos (id_usuario, periodo, fecha_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_reportes_usuario
    ON trida.reportes_mensuales (id_usuario, anio DESC, mes DESC);

CREATE INDEX IF NOT EXISTS idx_logs_usuario
    ON trida.logs_auditoria (id_usuario);
CREATE INDEX IF NOT EXISTS idx_logs_fecha
    ON trida.logs_auditoria (fecha_accion DESC);
CREATE INDEX IF NOT EXISTS idx_logs_tipo
    ON trida.logs_auditoria (tipo_accion);

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- 4.1 Actualizar fechas del dispositivo al insertar transacción
CREATE OR REPLACE FUNCTION trida.fn_trg_actualizar_dispositivo()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.id_dispositivo IS NOT NULL THEN
        UPDATE trida.dispositivos
        SET fecha_primer_uso = LEAST(fecha_primer_uso, NOW()),
            fecha_ultimo_uso = GREATEST(fecha_ultimo_uso, NOW())
        WHERE id_dispositivo = NEW.id_dispositivo;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_actualizar_dispositivo ON trida.transacciones;
CREATE TRIGGER trg_actualizar_dispositivo
AFTER INSERT ON trida.transacciones
FOR EACH ROW EXECUTE FUNCTION trida.fn_trg_actualizar_dispositivo();

-- 4.3 Fecha de lectura del consejo
CREATE OR REPLACE FUNCTION trida.fn_trg_consejo_leido()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.leido = TRUE AND OLD.leido = FALSE THEN
        NEW.fecha_leido := NOW();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_consejo_leido ON trida.consejos_financieros;
CREATE TRIGGER trg_consejo_leido
BEFORE UPDATE OF leido ON trida.consejos_financieros
FOR EACH ROW EXECUTE FUNCTION trida.fn_trg_consejo_leido();

-- 4.4 Auditoría de cambios críticos del usuario
CREATE OR REPLACE FUNCTION trida.fn_trg_auditar_usuarios()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO trida.logs_auditoria (id_usuario, tipo_accion, entidad_afectada, id_entidad, descripcion)
        VALUES (NEW.id_usuario, 'CAMBIO_ESTADO', 'usuarios', NEW.id_usuario,
                FORMAT('Estado: %s → %s', OLD.estado, NEW.estado));
    END IF;
    IF OLD.email IS DISTINCT FROM NEW.email THEN
        INSERT INTO trida.logs_auditoria (id_usuario, tipo_accion, entidad_afectada, id_entidad, descripcion)
        VALUES (NEW.id_usuario, 'CAMBIO_EMAIL', 'usuarios', NEW.id_usuario, 'Email actualizado');
    END IF;
    IF OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
        INSERT INTO trida.logs_auditoria (id_usuario, tipo_accion, entidad_afectada, id_entidad, descripcion)
        VALUES (NEW.id_usuario, 'CAMBIO_PASSWORD', 'usuarios', NEW.id_usuario, 'Contraseña actualizada');
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auditar_usuarios ON trida.usuarios;
CREATE TRIGGER trg_auditar_usuarios
AFTER UPDATE ON trida.usuarios
FOR EACH ROW EXECUTE FUNCTION trida.fn_trg_auditar_usuarios();

-- 4.5 Marcar patrón para recálculo (el cálculo pesado lo hace el backend)
CREATE OR REPLACE FUNCTION trida.fn_trg_marcar_patron()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.estado IN ('APROBADA', 'CONFIRMADA') THEN
        INSERT INTO trida.patron_comportamiento (id_usuario)
        VALUES (NEW.id_usuario)
        ON CONFLICT (id_usuario) DO UPDATE
        SET fecha_actualizacion = NOW();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_marcar_patron ON trida.transacciones;
CREATE TRIGGER trg_marcar_patron
AFTER INSERT ON trida.transacciones
FOR EACH ROW EXECUTE FUNCTION trida.fn_trg_marcar_patron();

-- 4.6 Alerta de presupuesto al 80% / 100%
CREATE OR REPLACE FUNCTION trida.fn_trg_presupuesto_umbral()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_gastado          NUMERIC(15, 2);
    v_gastado_anterior NUMERIC(15, 2);
    v_limite           NUMERIC(15, 2);
    v_inicio_mes       TIMESTAMPTZ;
    v_nombre_categoria TEXT;
BEGIN
    IF NEW.tipo_movimiento <> 'GASTO'
       OR NEW.estado NOT IN ('CONFIRMADA', 'APROBADA') THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.estado IN ('CONFIRMADA', 'APROBADA') THEN
            RETURN NEW;
        END IF;
    END IF;

    v_inicio_mes :=
        DATE_TRUNC('month', NEW.fecha_transaccion AT TIME ZONE 'America/Bogota')
        AT TIME ZONE 'America/Bogota';

    SELECT p.limite_mensual
    INTO v_limite
    FROM trida.presupuestos AS p
    WHERE p.id_usuario = NEW.id_usuario
      AND p.id_categoria = NEW.id_categoria
      AND p.mes = EXTRACT(MONTH FROM NEW.fecha_transaccion AT TIME ZONE 'America/Bogota')::SMALLINT
      AND p.anio = EXTRACT(YEAR FROM NEW.fecha_transaccion AT TIME ZONE 'America/Bogota')::SMALLINT
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE(SUM(t.monto), 0)
    INTO v_gastado
    FROM trida.transacciones AS t
    WHERE t.id_usuario = NEW.id_usuario
      AND t.id_categoria = NEW.id_categoria
      AND t.tipo_movimiento = 'GASTO'
      AND t.estado IN ('CONFIRMADA', 'APROBADA')
      AND t.fecha_transaccion >= v_inicio_mes
      AND t.fecha_transaccion < v_inicio_mes + INTERVAL '1 month';

    v_gastado_anterior := v_gastado - NEW.monto;

    SELECT c.nombre
    INTO v_nombre_categoria
    FROM trida.categorias AS c
    WHERE c.id_categoria = NEW.id_categoria;

    IF v_gastado >= v_limite
       AND v_gastado_anterior < v_limite THEN
        INSERT INTO trida.consejos_financieros
            (id_usuario, id_cuenta, tipo, titulo, descripcion, prioridad)
        VALUES (
            NEW.id_usuario,
            NEW.id_cuenta,
            'GASTO',
            'Presupuesto excedido',
            FORMAT(
                'Has gastado %s COP de %s COP en %s durante este periodo.',
                TO_CHAR(ROUND(v_gastado, 0), 'FM999G999G999G990'),
                TO_CHAR(ROUND(v_limite, 0), 'FM999G999G999G990'),
                COALESCE(v_nombre_categoria, 'esta categoría')
            ),
            'ALTA'
        );
    ELSIF v_gastado >= v_limite * 0.8
       AND v_gastado_anterior < v_limite * 0.8 THEN
        INSERT INTO trida.consejos_financieros
            (id_usuario, id_cuenta, tipo, titulo, descripcion, prioridad)
        VALUES (
            NEW.id_usuario,
            NEW.id_cuenta,
            'GASTO',
            'Presupuesto al 80%',
            FORMAT(
                'Has gastado %s COP de %s COP en %s durante este periodo.',
                TO_CHAR(ROUND(v_gastado, 0), 'FM999G999G999G990'),
                TO_CHAR(ROUND(v_limite, 0), 'FM999G999G999G990'),
                COALESCE(v_nombre_categoria, 'esta categoría')
            ),
            'MEDIA'
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_presupuesto_umbral ON trida.transacciones;
CREATE TRIGGER trg_presupuesto_umbral
AFTER INSERT OR UPDATE OF estado ON trida.transacciones
FOR EACH ROW
EXECUTE FUNCTION trida.fn_trg_presupuesto_umbral();

-- 4.7 Actualizar monto de meta al insertar aporte
CREATE OR REPLACE FUNCTION trida.fn_trg_aporte_meta()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE trida.metas_ahorro
    SET monto_actual = monto_actual + NEW.monto
    WHERE id_meta = NEW.id_meta;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_aporte_meta ON trida.aportes_meta;
CREATE TRIGGER trg_aporte_meta
AFTER INSERT ON trida.aportes_meta
FOR EACH ROW EXECUTE FUNCTION trida.fn_trg_aporte_meta();

-- ============================================================================
-- TriDa v2 — Funciones.sql
-- Todas reciben p_id_usuario como primer parámetro (RS-001).
-- Las que soportan filtro por cuenta usan p_id_cuenta DEFAULT NULL.
-- ============================================================================

SET search_path TO trida, public;

-- ============================================================================
-- AUTENTICACIÓN
-- ============================================================================

CREATE OR REPLACE FUNCTION trida.fn_login(p_email TEXT)
RETURNS TABLE (
    id_usuario      INTEGER,
    nombre_completo VARCHAR(150),
    email           VARCHAR(254),
    password_hash   TEXT,
    rol             VARCHAR(20),
    estado          BOOLEAN,
    fecha_registro  TIMESTAMPTZ,
    ultimo_acceso   TIMESTAMPTZ
)
LANGUAGE sql STABLE AS $$
    SELECT u.id_usuario, u.nombre_completo, u.email, u.password_hash,
           u.rol, u.estado, u.fecha_registro, u.ultimo_acceso
    FROM trida.usuarios u
    WHERE LOWER(u.email) = LOWER(p_email)
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION trida.fn_register(
    p_nombre_completo TEXT,
    p_email           TEXT,
    p_password_hash   TEXT,
    p_telefono        TEXT DEFAULT NULL,
    p_pais            TEXT DEFAULT NULL,
    p_ciudad          TEXT DEFAULT NULL
)
RETURNS TABLE (
    id_usuario      INTEGER,
    nombre_completo VARCHAR(150),
    email           VARCHAR(254),
    rol             VARCHAR(20),
    estado          BOOLEAN,
    fecha_registro  TIMESTAMPTZ
)
LANGUAGE plpgsql AS $$
DECLARE
    v_id INTEGER;
BEGIN
    INSERT INTO trida.usuarios (nombre_completo, email, password_hash, telefono, pais, ciudad)
    VALUES (p_nombre_completo, LOWER(p_email), p_password_hash, p_telefono, p_pais, p_ciudad)
    RETURNING id_usuario INTO v_id;

    INSERT INTO trida.perfil_financiero (id_usuario) VALUES (v_id);

    RETURN QUERY
    SELECT u.id_usuario, u.nombre_completo, u.email, u.rol, u.estado, u.fecha_registro
    FROM trida.usuarios u WHERE u.id_usuario = v_id;
END;
$$;

CREATE OR REPLACE FUNCTION trida.fn_usuario_actual(p_id_usuario INTEGER)
RETURNS TABLE (
    id_usuario      INTEGER,
    nombre_completo VARCHAR(150),
    email           VARCHAR(254),
    telefono        VARCHAR(20),
    pais            VARCHAR(100),
    ciudad          VARCHAR(100),
    rol             VARCHAR(20),
    estado          BOOLEAN,
    fecha_registro  TIMESTAMPTZ,
    ultimo_acceso   TIMESTAMPTZ
)
LANGUAGE sql STABLE AS $$
    SELECT id_usuario, nombre_completo, email, telefono, pais, ciudad,
           rol, estado, fecha_registro, ultimo_acceso
    FROM trida.usuarios WHERE id_usuario = p_id_usuario LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION trida.fn_actualizar_ultimo_acceso(p_id_usuario INTEGER)
RETURNS VOID LANGUAGE sql AS $$
    UPDATE trida.usuarios SET ultimo_acceso = NOW() WHERE id_usuario = p_id_usuario;
$$;

-- CORREGIDO: usa p_id_usuario en vez de p_email (RS-002)
CREATE OR REPLACE FUNCTION trida.fn_cambiar_contrasena(
    p_id_usuario INTEGER,
    p_nuevo_hash TEXT
)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE trida.usuarios SET password_hash = p_nuevo_hash
    WHERE id_usuario = p_id_usuario AND estado = TRUE;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count > 0;
END;
$$;

-- ============================================================================
-- PERFIL Y CATEGORÍAS
-- ============================================================================

CREATE OR REPLACE FUNCTION trida.fn_perfil_financiero(p_id_usuario INTEGER)
RETURNS TABLE (
    id_perfil           INTEGER,
    ingreso_mensual     NUMERIC(15,2),
    moneda_preferida    CHAR(3),
    tolerancia_riesgo   VARCHAR(10),
    meta_ahorro_mensual NUMERIC(15,2),
    fecha_actualizacion TIMESTAMPTZ
)
LANGUAGE sql STABLE AS $$
    SELECT id_perfil, ingreso_mensual, moneda_preferida,
           tolerancia_riesgo, meta_ahorro_mensual, fecha_actualizacion
    FROM trida.perfil_financiero WHERE id_usuario = p_id_usuario;
$$;

CREATE OR REPLACE FUNCTION trida.fn_actualizar_perfil_financiero(
    p_id_usuario          INTEGER,
    p_ingreso_mensual     NUMERIC,
    p_moneda_preferida    CHAR(3),
    p_tolerancia_riesgo   VARCHAR,
    p_meta_ahorro_mensual NUMERIC
)
RETURNS VOID LANGUAGE sql AS $$
    UPDATE trida.perfil_financiero
    SET ingreso_mensual = p_ingreso_mensual, moneda_preferida = p_moneda_preferida,
        tolerancia_riesgo = p_tolerancia_riesgo, meta_ahorro_mensual = p_meta_ahorro_mensual,
        fecha_actualizacion = NOW()
    WHERE id_usuario = p_id_usuario;
$$;

CREATE OR REPLACE FUNCTION trida.fn_categorias(p_id_usuario INTEGER)
RETURNS TABLE (
    id_categoria INTEGER, nombre VARCHAR(80), tipo VARCHAR(10),
    icono VARCHAR(50), color VARCHAR(20), es_default BOOLEAN
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT id_categoria, nombre, tipo, icono, color, es_default
    FROM trida.categorias
    WHERE estado = TRUE AND (es_default = TRUE OR id_usuario = p_id_usuario)
    ORDER BY tipo, nombre;
$$;

-- ============================================================================
-- CUENTAS (NUEVAS)
-- ============================================================================

CREATE OR REPLACE FUNCTION trida.fn_cuentas(p_id_usuario INTEGER)
RETURNS TABLE (
    id_cuenta INTEGER, nombre VARCHAR(100), entidad VARCHAR(100),
    tipo VARCHAR(20), numero_enmascarado VARCHAR(20), color VARCHAR(20),
    saldo_inicial NUMERIC(15,2), saldo_actual NUMERIC(15,2), estado BOOLEAN
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT id_cuenta, nombre, entidad, tipo, numero_enmascarado,
           color, saldo_inicial, saldo_actual, estado
    FROM trida.cuentas
    WHERE id_usuario = p_id_usuario AND estado = TRUE
    ORDER BY nombre;
$$;

-- ============================================================================
-- TRANSACCIONES
-- ============================================================================

-- CORREGIDO: agrega p_id_cuenta opcional y paginación real
DROP FUNCTION IF EXISTS trida.fn_transacciones(
    INTEGER, INTEGER, VARCHAR, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, INTEGER
);
CREATE OR REPLACE FUNCTION trida.fn_transacciones(
    p_id_usuario      INTEGER,
    p_id_cuenta       INTEGER DEFAULT NULL,
    p_tipo_movimiento VARCHAR DEFAULT NULL,
    p_fecha_desde     TIMESTAMPTZ DEFAULT NULL,
    p_fecha_hasta     TIMESTAMPTZ DEFAULT NULL,
    p_limit           INTEGER DEFAULT 50,
    p_offset          INTEGER DEFAULT 0
)
RETURNS TABLE (
    id_transaccion INTEGER, fecha_transaccion TIMESTAMPTZ,
    tipo_movimiento VARCHAR(15), monto NUMERIC(15,2), moneda CHAR(3),
    descripcion VARCHAR(255), comercio VARCHAR(150), canal VARCHAR(20),
    es_recurrente BOOLEAN, score_anomalia NUMERIC(5,2), estado VARCHAR(20),
    categoria VARCHAR(80), categoria_color VARCHAR(20), categoria_icono VARCHAR(50),
    cuenta_nombre VARCHAR(100), ciudad VARCHAR(100), pais VARCHAR(100)
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT t.id_transaccion, t.fecha_transaccion, t.tipo_movimiento, t.monto, t.moneda,
           t.descripcion, t.comercio, t.canal, t.es_recurrente, t.score_anomalia, t.estado,
           c.nombre, c.color, c.icono,
           cu.nombre AS cuenta_nombre, u.ciudad, u.pais
    FROM trida.transacciones t
    LEFT JOIN trida.categorias c   ON c.id_categoria  = t.id_categoria
    LEFT JOIN trida.cuentas cu     ON cu.id_cuenta     = t.id_cuenta
    LEFT JOIN trida.ubicaciones u  ON u.id_ubicacion   = t.id_ubicacion
    WHERE t.id_usuario = p_id_usuario
      AND (p_id_cuenta IS NULL OR t.id_cuenta = p_id_cuenta OR t.id_cuenta_destino = p_id_cuenta)
      AND (p_tipo_movimiento IS NULL OR t.tipo_movimiento = p_tipo_movimiento)
      AND (p_fecha_desde IS NULL OR t.fecha_transaccion >= p_fecha_desde)
      AND (p_fecha_hasta IS NULL OR t.fecha_transaccion <= p_fecha_hasta)
    ORDER BY t.fecha_transaccion DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 500))
    OFFSET GREATEST(0, COALESCE(p_offset, 0));
$$;

CREATE OR REPLACE FUNCTION trida.fn_transacciones_count(
    p_id_usuario      INTEGER,
    p_id_cuenta       INTEGER DEFAULT NULL,
    p_tipo_movimiento VARCHAR DEFAULT NULL,
    p_fecha_desde     TIMESTAMPTZ DEFAULT NULL,
    p_fecha_hasta     TIMESTAMPTZ DEFAULT NULL
)
RETURNS BIGINT LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT COUNT(*)::BIGINT FROM trida.transacciones t
    WHERE t.id_usuario = p_id_usuario
      AND (p_id_cuenta IS NULL OR t.id_cuenta = p_id_cuenta OR t.id_cuenta_destino = p_id_cuenta)
      AND (p_tipo_movimiento IS NULL OR t.tipo_movimiento = p_tipo_movimiento)
      AND (p_fecha_desde IS NULL OR t.fecha_transaccion >= p_fecha_desde)
      AND (p_fecha_hasta IS NULL OR t.fecha_transaccion <= p_fecha_hasta);
$$;

DROP FUNCTION IF EXISTS trida.fn_transacciones_mapa(
    INTEGER, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER
);
CREATE OR REPLACE FUNCTION trida.fn_transacciones_mapa(
    p_id_usuario  INTEGER,
    p_id_cuenta   INTEGER DEFAULT NULL,
    p_fecha_desde TIMESTAMPTZ DEFAULT NULL,
    p_fecha_hasta TIMESTAMPTZ DEFAULT NULL,
    p_limit       INTEGER DEFAULT 500
)
RETURNS TABLE (
    id_transaccion INTEGER, latitud NUMERIC(9,6), longitud NUMERIC(9,6),
    ciudad VARCHAR(100), pais VARCHAR(100), monto NUMERIC(15,2),
    tipo_movimiento VARCHAR(15), score_anomalia NUMERIC(5,2),
    estado VARCHAR(20), comercio VARCHAR(150),
    fecha_transaccion TIMESTAMPTZ, categoria VARCHAR(80), categoria_color VARCHAR(20)
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT t.id_transaccion, u.latitud, u.longitud, u.ciudad, u.pais,
           t.monto, t.tipo_movimiento, t.score_anomalia, t.estado, t.comercio,
           t.fecha_transaccion, c.nombre, c.color
    FROM trida.transacciones t
    JOIN trida.ubicaciones u ON u.id_ubicacion = t.id_ubicacion
    LEFT JOIN trida.categorias c ON c.id_categoria = t.id_categoria
    WHERE t.id_usuario = p_id_usuario
      AND u.latitud IS NOT NULL AND u.longitud IS NOT NULL
      AND (p_id_cuenta IS NULL OR t.id_cuenta = p_id_cuenta OR t.id_cuenta_destino = p_id_cuenta)
      AND (p_fecha_desde IS NULL OR t.fecha_transaccion >= p_fecha_desde)
      AND (p_fecha_hasta IS NULL OR t.fecha_transaccion <= p_fecha_hasta)
    ORDER BY t.fecha_transaccion DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 500), 2000));
$$;

-- ============================================================================
-- DASHBOARD Y ANÁLISIS
-- ============================================================================

-- CORREGIDO: agrega p_id_cuenta y p_mes
CREATE OR REPLACE FUNCTION trida.fn_dashboard_resumen(
    p_id_usuario INTEGER,
    p_id_cuenta  INTEGER DEFAULT NULL,
    p_mes        DATE DEFAULT NULL
)
RETURNS TABLE (
    total_ingresos NUMERIC(15,2), total_gastos NUMERIC(15,2),
    total_ahorro NUMERIC(15,2), balance NUMERIC(15,2),
    num_transacciones BIGINT, num_alertas_activas BIGINT, num_consejos_nuevos BIGINT
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    WITH periodo AS (
        SELECT DATE_TRUNC(
            'month',
            COALESCE(p_mes::TIMESTAMP, NOW() AT TIME ZONE 'America/Bogota')
        )::DATE AS inicio
    )
    SELECT
        COALESCE(SUM(t.monto) FILTER (WHERE t.tipo_movimiento = 'INGRESO'), 0),
        COALESCE(SUM(t.monto) FILTER (WHERE t.tipo_movimiento = 'GASTO'), 0),
        COALESCE(SUM(t.monto) FILTER (WHERE t.tipo_movimiento = 'AHORRO'), 0),
        COALESCE(SUM(CASE WHEN t.tipo_movimiento = 'INGRESO' THEN t.monto
                          WHEN t.tipo_movimiento = 'GASTO'   THEN -t.monto
                          ELSE 0 END), 0),
        COUNT(*)::BIGINT,
        (SELECT COUNT(*)::BIGINT FROM trida.alertas_fraude
         WHERE id_usuario = p_id_usuario AND estado = 'PENDIENTE'),
        (SELECT COUNT(*)::BIGINT FROM trida.consejos_financieros
         WHERE id_usuario = p_id_usuario AND leido = FALSE)
    FROM trida.transacciones t, periodo p
    WHERE t.id_usuario = p_id_usuario
      AND (p_id_cuenta IS NULL OR t.id_cuenta = p_id_cuenta OR t.id_cuenta_destino = p_id_cuenta)
      AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'
      AND t.fecha_transaccion < (p.inicio + INTERVAL '1 month') AT TIME ZONE 'America/Bogota';
$$;

CREATE OR REPLACE FUNCTION trida.fn_gastos_por_categoria(
    p_id_usuario  INTEGER,
    p_id_cuenta   INTEGER DEFAULT NULL,
    p_fecha_desde TIMESTAMPTZ DEFAULT NULL,
    p_fecha_hasta TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    id_categoria INTEGER, categoria VARCHAR(80), color VARCHAR(20),
    icono VARCHAR(50), total NUMERIC(15,2), cantidad BIGINT
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT c.id_categoria, c.nombre, c.color, c.icono,
           SUM(t.monto) AS total, COUNT(*)::BIGINT AS cantidad
    FROM trida.transacciones t
    LEFT JOIN trida.categorias c ON c.id_categoria = t.id_categoria
    WHERE t.id_usuario = p_id_usuario
      AND t.tipo_movimiento IN ('GASTO', 'AHORRO')
      AND (p_id_cuenta IS NULL OR t.id_cuenta = p_id_cuenta OR t.id_cuenta_destino = p_id_cuenta)
      AND (p_fecha_desde IS NULL OR t.fecha_transaccion >= p_fecha_desde)
      AND (p_fecha_hasta IS NULL OR t.fecha_transaccion <= p_fecha_hasta)
    GROUP BY c.id_categoria, c.nombre, c.color, c.icono
    ORDER BY total DESC;
$$;

CREATE OR REPLACE FUNCTION trida.fn_tendencia_mensual(
    p_id_usuario INTEGER,
    p_id_cuenta  INTEGER DEFAULT NULL,
    p_meses      INTEGER DEFAULT 6
)
RETURNS TABLE (
    anio SMALLINT, mes SMALLINT,
    ingresos NUMERIC(15,2), gastos NUMERIC(15,2), ahorro NUMERIC(15,2)
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT
        EXTRACT(YEAR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota')::SMALLINT,
        EXTRACT(MONTH FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota')::SMALLINT,
        COALESCE(SUM(t.monto) FILTER (WHERE t.tipo_movimiento = 'INGRESO'), 0),
        COALESCE(SUM(t.monto) FILTER (WHERE t.tipo_movimiento = 'GASTO'), 0),
        COALESCE(SUM(t.monto) FILTER (WHERE t.tipo_movimiento = 'AHORRO'), 0)
    FROM trida.transacciones t
    WHERE t.id_usuario = p_id_usuario
      AND (p_id_cuenta IS NULL OR t.id_cuenta = p_id_cuenta OR t.id_cuenta_destino = p_id_cuenta)
      AND t.fecha_transaccion >= (
          DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Bogota')
          - (COALESCE(p_meses, 6) || ' months')::INTERVAL
      ) AT TIME ZONE 'America/Bogota'
    GROUP BY 1, 2 ORDER BY 1, 2;
$$;

CREATE OR REPLACE FUNCTION trida.fn_top_comercios(
    p_id_usuario  INTEGER,
    p_id_cuenta   INTEGER DEFAULT NULL,
    p_fecha_desde TIMESTAMPTZ DEFAULT NULL,
    p_fecha_hasta TIMESTAMPTZ DEFAULT NULL,
    p_limit       INTEGER DEFAULT 10
)
RETURNS TABLE (comercio VARCHAR(150), total NUMERIC(15,2), cantidad BIGINT)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT t.comercio, SUM(t.monto) AS total, COUNT(*)::BIGINT AS cantidad
    FROM trida.transacciones t
    WHERE t.id_usuario = p_id_usuario
      AND t.tipo_movimiento IN ('GASTO', 'AHORRO')
      AND t.comercio IS NOT NULL
      AND (p_id_cuenta IS NULL OR t.id_cuenta = p_id_cuenta OR t.id_cuenta_destino = p_id_cuenta)
      AND (p_fecha_desde IS NULL OR t.fecha_transaccion >= p_fecha_desde)
      AND (p_fecha_hasta IS NULL OR t.fecha_transaccion <= p_fecha_hasta)
    GROUP BY t.comercio 
    ORDER BY total DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 50));
$$;

CREATE OR REPLACE FUNCTION trida.fn_patron_comportamiento(p_id_usuario INTEGER)
RETURNS TABLE (
    gasto_diario_promedio NUMERIC(15,2), gasto_diario_desv NUMERIC(15,2),
    categorias_top JSONB, ubicaciones_frecuentes JSONB,
    horarios_habituales JSONB, comercios_frecuentes JSONB,
    fecha_actualizacion TIMESTAMPTZ
)
LANGUAGE sql STABLE AS $$
    SELECT gasto_diario_promedio, gasto_diario_desv, categorias_top,
           ubicaciones_frecuentes, horarios_habituales, comercios_frecuentes,
           fecha_actualizacion
    FROM trida.patron_comportamiento WHERE id_usuario = p_id_usuario;
$$;

-- ============================================================================
-- PRESUPUESTOS (NUEVOS)
-- ============================================================================

CREATE OR REPLACE FUNCTION trida.fn_presupuestos(
    p_id_usuario INTEGER,
    p_mes        INTEGER DEFAULT NULL,
    p_anio       INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id_presupuesto INTEGER,
    id_categoria INTEGER,
    categoria VARCHAR(80),
    limite_mensual NUMERIC(15, 2),
    mes SMALLINT,
    anio SMALLINT,
    gastado NUMERIC(15, 2),
    porcentaje NUMERIC(5, 2)
)
LANGUAGE sql STABLE PARALLEL SAFE
AS $$
    SELECT
        p.id_presupuesto,
        p.id_categoria,
        c.nombre,
        p.limite_mensual,
        p.mes,
        p.anio,
        COALESCE(SUM(t.monto), 0)::NUMERIC(15, 2) AS gastado,
        ROUND(COALESCE(SUM(t.monto), 0) / NULLIF(p.limite_mensual, 0) * 100, 2) AS porcentaje
    FROM trida.presupuestos AS p
    LEFT JOIN trida.categorias AS c ON c.id_categoria = p.id_categoria
    LEFT JOIN trida.transacciones AS t
      ON t.id_usuario = p.id_usuario
     AND t.id_categoria = p.id_categoria
     AND t.tipo_movimiento = 'GASTO'
     AND t.estado IN ('CONFIRMADA', 'APROBADA')
     AND EXTRACT(MONTH FROM t.fecha_transaccion) = p.mes
     AND EXTRACT(YEAR FROM t.fecha_transaccion) = p.anio
    WHERE p.id_usuario = p_id_usuario
      AND (p_mes IS NULL OR p.mes = p_mes)
      AND (p_anio IS NULL OR p.anio = p_anio)
    GROUP BY p.id_presupuesto, p.id_categoria, c.nombre,
             p.limite_mensual, p.mes, p.anio
    ORDER BY p.mes DESC, c.nombre;
$$;

-- ============================================================================
-- METAS Y APORTES
-- ============================================================================

CREATE OR REPLACE FUNCTION trida.fn_metas(p_id_usuario INTEGER, p_estado VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id_meta INTEGER, nombre VARCHAR(120), descripcion TEXT,
    monto_objetivo NUMERIC(15,2), monto_actual NUMERIC(15,2),
    porcentaje NUMERIC(5,2), fecha_limite DATE, estado VARCHAR(15),
    fecha_creacion TIMESTAMPTZ, fecha_completada TIMESTAMPTZ
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT id_meta, nombre, descripcion, monto_objetivo, monto_actual,
           ROUND((monto_actual / NULLIF(monto_objetivo, 0)) * 100, 2),
           fecha_limite, estado, fecha_creacion, fecha_completada
    FROM trida.metas_ahorro
    WHERE id_usuario = p_id_usuario
      AND (p_estado IS NULL OR estado = p_estado)
    ORDER BY fecha_creacion DESC;
$$;

-- ============================================================================
-- CONSEJOS Y ALERTAS
-- ============================================================================

CREATE OR REPLACE FUNCTION trida.fn_consejos(
    p_id_usuario INTEGER, p_solo_no_leidos BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id_consejo INTEGER, tipo VARCHAR(20), titulo VARCHAR(150),
    descripcion TEXT, prioridad VARCHAR(10), leido BOOLEAN,
    fecha_generado TIMESTAMPTZ, fecha_leido TIMESTAMPTZ
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT id_consejo, tipo, titulo, descripcion, prioridad, leido, fecha_generado, fecha_leido
    FROM trida.consejos_financieros
    WHERE id_usuario = p_id_usuario
      AND (p_solo_no_leidos = FALSE OR leido = FALSE)
    ORDER BY CASE prioridad WHEN 'ALTA' THEN 1 WHEN 'MEDIA' THEN 2 ELSE 3 END,
             fecha_generado DESC;
$$;

CREATE OR REPLACE FUNCTION trida.fn_alertas_fraude(
    p_id_usuario INTEGER, p_estado VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id_alerta INTEGER, severidad VARCHAR(10), motivo TEXT,
    estado VARCHAR(15), fecha_detectada TIMESTAMPTZ, fecha_resuelta TIMESTAMPTZ,
    accion_usuario VARCHAR(20), id_transaccion INTEGER,
    monto NUMERIC(15,2), comercio VARCHAR(150),
    fecha_transaccion TIMESTAMPTZ, ciudad VARCHAR(100)
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT a.id_alerta, a.severidad, a.motivo, a.estado, a.fecha_detectada,
           a.fecha_resuelta, a.accion_usuario, t.id_transaccion, t.monto,
           t.comercio, t.fecha_transaccion, u.ciudad
    FROM trida.alertas_fraude a
    JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
    LEFT JOIN trida.ubicaciones u ON u.id_ubicacion = t.id_ubicacion
    WHERE a.id_usuario = p_id_usuario
      AND (p_estado IS NULL OR a.estado = p_estado)
    ORDER BY a.fecha_detectada DESC;
$$;

-- CORREGIDO: agrega p_id_usuario (RS-001)
CREATE OR REPLACE FUNCTION trida.fn_resolver_alerta_fraude(
    p_id_usuario     INTEGER,
    p_id_alerta      INTEGER,
    p_nuevo_estado   VARCHAR,
    p_accion_usuario VARCHAR
)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE trida.alertas_fraude
    SET estado = p_nuevo_estado, accion_usuario = p_accion_usuario, fecha_resuelta = NOW()
    WHERE id_alerta = p_id_alerta AND id_usuario = p_id_usuario;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count > 0;
END;
$$;

-- ============================================================================
-- REPORTES
-- ============================================================================

CREATE OR REPLACE FUNCTION trida.fn_reportes_mensuales(p_id_usuario INTEGER)
RETURNS TABLE (
    id_reporte INTEGER, anio SMALLINT, mes SMALLINT,
    score_salud NUMERIC(5,2), resumen JSONB,
    ruta_archivo TEXT, fecha_generado TIMESTAMPTZ
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT id_reporte, anio, mes, score_salud, resumen, ruta_archivo, fecha_generado
    FROM trida.reportes_mensuales
    WHERE id_usuario = p_id_usuario ORDER BY anio DESC, mes DESC;
$$;

CREATE OR REPLACE FUNCTION trida.fn_analisis_gastos(
    p_id_usuario INTEGER, p_periodo VARCHAR DEFAULT 'MENSUAL', p_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
    id_analisis INTEGER, periodo VARCHAR(10), fecha_inicio DATE, fecha_fin DATE,
    total_ingresos NUMERIC(15,2), total_gastos NUMERIC(15,2), total_ahorro NUMERIC(15,2),
    desglose_categorias JSONB, comparativa_anterior JSONB, fecha_generado TIMESTAMPTZ
)
LANGUAGE sql STABLE PARALLEL SAFE AS $$
    SELECT id_analisis, periodo, fecha_inicio, fecha_fin, total_ingresos,
           total_gastos, total_ahorro, desglose_categorias, comparativa_anterior, fecha_generado
    FROM trida.analisis_gastos
    WHERE id_usuario = p_id_usuario AND periodo = COALESCE(p_periodo, 'MENSUAL')
    ORDER BY fecha_inicio DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 12), 60));
$$;

-- Backfill de seguridad: usuarios que ya tenían dispositivos no deben confiar
-- automáticamente el siguiente dispositivo registrado como el primero.
UPDATE trida.usuarios u
SET dispositivo_historial_registrado = TRUE
WHERE EXISTS (
   SELECT 1
   FROM trida.dispositivos d
   WHERE d.id_usuario = u.id_usuario
);

COMMIT;