-- TriDa — semilla de datos para Bogotá
-- 4 usuarios: estudiante del SENA, oficinista, tendero de abarrotes y usuario general.
-- Ejecutar sobre una base con el esquema trida ya creado.
-- Los saldos actuales se calculan a partir de los movimientos confirmados/aprobados.
-- Las metas se llenan con sus aportes; el trigger suma monto_actual.
-- Las ubicaciones se enlazan por dirección IP, única dentro de cada usuario.
-- Ejecutar una sola vez: no es idempotente (crea usuarios y registros nuevos).

BEGIN;
SET search_path TO trida, public;

-- 1. Usuarios
INSERT INTO trida.usuarios (
    nombre_completo, email, password_hash, telefono, pais, ciudad, rol, estado,
    email_verificado_en, fecha_registro, ultimo_acceso
) VALUES
    ('Valentina Camila Ortiz', 'valentina.cortiz@gmail.com', '$2b$12$HHOKWTTHAj6oa5b563zJe.3yFqSn0SeZ9eKtyGbvSXboYtCNObKM6', '+57 310 456 7890', 'Colombia', 'Bogotá', 'USER', TRUE,
     CURRENT_TIMESTAMP - INTERVAL '410 days', CURRENT_TIMESTAMP - INTERVAL '412 days', CURRENT_TIMESTAMP - INTERVAL '7 hours'),
    ('Andrés Felipe Gutiérrez', 'andresfelipe.gutierrez@outlook.com', '$2b$12$1WbV9u8XMqSQepw/rqGdVOTdNUuuzFJKSHSqnW4pD/BA1GXnjALV2', '+57 320 789 4561', 'Colombia', 'Bogotá', 'USER', TRUE,
     CURRENT_TIMESTAMP - INTERVAL '638 days', CURRENT_TIMESTAMP - INTERVAL '640 days', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
    ('Jorge Eliécer Peña', 'jorgeeliecerramirez@hotmail.com', '$2b$12$81tPSs1msRbpsx6FSvau/etvX5Vdqck8vOgSJQBL08Z94D2RhVMiC', '+57 315 234 8765', 'Colombia', 'Bogotá', 'USER', TRUE,
     CURRENT_TIMESTAMP - INTERVAL '978 days', CURRENT_TIMESTAMP - INTERVAL '980 days', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
    ('Mariana Lucía Fernández', 'marianafernandez@gmail.com', '$2b$12$cERp0htFcfvPiOp1dlbbkeu.FPvrSAgyT5/KljWpOQBVr08a7ghFu', '+57 301 876 5432', 'Colombia', 'Bogotá', 'USER', TRUE,
     CURRENT_TIMESTAMP - INTERVAL '518 days', CURRENT_TIMESTAMP - INTERVAL '520 days', CURRENT_TIMESTAMP - INTERVAL '9 hours');

-- 2. Perfil financiero (1:1 con el usuario)
INSERT INTO trida.perfil_financiero (id_usuario, ingreso_mensual, moneda_preferida, tolerancia_riesgo, meta_ahorro_mensual)
VALUES
    ((SELECT id_usuario FROM trida.usuarios WHERE email = 'valentina.cortiz@gmail.com'), 1150000, 'COP', 'BAJA', 180000),
    ((SELECT id_usuario FROM trida.usuarios WHERE email = 'andresfelipe.gutierrez@outlook.com'), 5200000, 'COP', 'MEDIA', 700000),
    ((SELECT id_usuario FROM trida.usuarios WHERE email = 'jorgeeliecerramirez@hotmail.com'), 6800000, 'COP', 'MEDIA', 900000),
    ((SELECT id_usuario FROM trida.usuarios WHERE email = 'marianafernandez@gmail.com'), 3400000, 'COP', 'MEDIA', 400000);

-- 3. Cuentas por usuario
-- Valentina Camila Ortiz
INSERT INTO trida.cuentas (id_usuario, nombre, entidad, tipo, numero_enmascarado, color, saldo_inicial, saldo_actual)
SELECT usuario.id_usuario, datos.nombre, datos.entidad, datos.tipo,
       datos.numero_enmascarado, datos.color, datos.saldo_inicial, datos.saldo_actual
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Nequi principal', 'Nequi', 'BILLETERA', '****4821', '#7C3AED', 900000::NUMERIC, 980300::NUMERIC),
    ('Daviplata', 'Daviplata', 'BILLETERA', '****7314', '#6D28D9', 450000::NUMERIC, 252800::NUMERIC),
    ('Tarjeta débito Bancolombia', 'Bancolombia', 'TARJETA', '****1937', '#4F46E5', 1200000::NUMERIC, 1303300::NUMERIC),
    ('Efectivo', NULL, 'EFECTIVO', NULL, '#0F766E', 300000::NUMERIC, 231000::NUMERIC)
) AS datos(nombre, entidad, tipo, numero_enmascarado, color, saldo_inicial, saldo_actual)
WHERE lower(usuario.email) = lower('valentina.cortiz@gmail.com');

-- Andrés Felipe Gutiérrez
INSERT INTO trida.cuentas (id_usuario, nombre, entidad, tipo, numero_enmascarado, color, saldo_inicial, saldo_actual)
SELECT usuario.id_usuario, datos.nombre, datos.entidad, datos.tipo,
       datos.numero_enmascarado, datos.color, datos.saldo_inicial, datos.saldo_actual
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Cuenta nómina Bancolombia', 'Bancolombia', 'BANCO', '****9024', '#7C3AED', 6500000::NUMERIC, 9102300::NUMERIC),
    ('Tarjeta crédito Davivienda', 'Davivienda', 'TARJETA', '****3318', '#6D28D9', 2800000::NUMERIC, 1933200::NUMERIC),
    ('Nequi', 'Nequi', 'BILLETERA', '****6642', '#4F46E5', 850000::NUMERIC, 1116500::NUMERIC),
    ('Efectivo', NULL, 'EFECTIVO', NULL, '#0F766E', 400000::NUMERIC, 323000::NUMERIC)
) AS datos(nombre, entidad, tipo, numero_enmascarado, color, saldo_inicial, saldo_actual)
WHERE lower(usuario.email) = lower('andresfelipe.gutierrez@outlook.com');

-- Jorge Eliécer Peña
INSERT INTO trida.cuentas (id_usuario, nombre, entidad, tipo, numero_enmascarado, color, saldo_inicial, saldo_actual)
SELECT usuario.id_usuario, datos.nombre, datos.entidad, datos.tipo,
       datos.numero_enmascarado, datos.color, datos.saldo_inicial, datos.saldo_actual
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Cuenta Banco de Bogotá', 'Banco de Bogotá', 'BANCO', '****1187', '#7C3AED', 9000000::NUMERIC, 3505000::NUMERIC),
    ('Cuenta Bancolombia negocio', 'Bancolombia', 'BANCO', '****5543', '#6D28D9', 7500000::NUMERIC, 4952000::NUMERIC),
    ('Tarjeta débito Banco Popular', 'Banco Popular', 'TARJETA', '****8820', '#4F46E5', 3200000::NUMERIC, 1681000::NUMERIC),
    ('Efectivo caja', NULL, 'EFECTIVO', NULL, '#0F766E', 2500000::NUMERIC, 3047000::NUMERIC),
    ('Nequi negocio', 'Nequi', 'BILLETERA', '****2291', '#DB2777', 600000::NUMERIC, 1020000::NUMERIC)
) AS datos(nombre, entidad, tipo, numero_enmascarado, color, saldo_inicial, saldo_actual)
WHERE lower(usuario.email) = lower('jorgeeliecerramirez@hotmail.com');

-- Mariana Lucía Fernández
INSERT INTO trida.cuentas (id_usuario, nombre, entidad, tipo, numero_enmascarado, color, saldo_inicial, saldo_actual)
SELECT usuario.id_usuario, datos.nombre, datos.entidad, datos.tipo,
       datos.numero_enmascarado, datos.color, datos.saldo_inicial, datos.saldo_actual
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Cuenta BBVA', 'BBVA Colombia', 'BANCO', '****7741', '#7C3AED', 4800000::NUMERIC, 6166100::NUMERIC),
    ('Tarjeta Scotiabank', 'Scotiabank Colpatria', 'TARJETA', '****4459', '#6D28D9', 2200000::NUMERIC, 1389600::NUMERIC),
    ('Nequi', 'Nequi', 'BILLETERA', '****9036', '#4F46E5', 700000::NUMERIC, 875500::NUMERIC),
    ('Efectivo', NULL, 'EFECTIVO', NULL, '#0F766E', 350000::NUMERIC, 287000::NUMERIC)
) AS datos(nombre, entidad, tipo, numero_enmascarado, color, saldo_inicial, saldo_actual)
WHERE lower(usuario.email) = lower('marianafernandez@gmail.com');

-- 4. Categorías propias por usuario
-- Valentina Camila Ortiz
INSERT INTO trida.categorias (id_usuario, nombre, tipo, color, es_default, estado)
SELECT usuario.id_usuario, datos.nombre, datos.tipo, datos.color, FALSE, TRUE
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Mercado y despensa', 'GASTO', '#F97316'),
    ('Transporte diario', 'GASTO', '#0EA5E9'),
    ('Alimentación fuera de casa', 'GASTO', '#FB923C'),
    ('Útiles y fotocopias', 'GASTO', '#EAB308'),
    ('Cursos y formación', 'GASTO', '#A855F7'),
    ('Datos y recargas', 'GASTO', '#38BDF8'),
    ('Arriendo compartido', 'GASTO', '#8B5CF6'),
    ('Servicios del apartamento', 'GASTO', '#6366F1'),
    ('Salud y farmacia', 'GASTO', '#EF4444'),
    ('Entretenimiento', 'GASTO', '#EC4899'),
    ('Compras en línea', 'GASTO', '#F59E0B'),
    ('Apoyo y trabajos ocasionales', 'INGRESO', '#22C55E'),
    ('Venta de productos', 'INGRESO', '#16A34A'),
    ('Fondo de emergencia', 'AHORRO', '#14B8A6'),
    ('Meta de estudio', 'AHORRO', '#0D9488')
) AS datos(nombre, tipo, color)
WHERE lower(usuario.email) = lower('valentina.cortiz@gmail.com');

-- Andrés Felipe Gutiérrez
INSERT INTO trida.categorias (id_usuario, nombre, tipo, color, es_default, estado)
SELECT usuario.id_usuario, datos.nombre, datos.tipo, datos.color, FALSE, TRUE
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Almuerzo laboral', 'GASTO', '#F97316'),
    ('Transporte y gasolina', 'GASTO', '#0EA5E9'),
    ('Parqueadero', 'GASTO', '#64748B'),
    ('Mercado', 'GASTO', '#22C55E'),
    ('Vivienda', 'GASTO', '#A855F7'),
    ('Servicios públicos', 'GASTO', '#6366F1'),
    ('Salud', 'GASTO', '#EF4444'),
    ('Suscripciones', 'GASTO', '#EC4899'),
    ('Entretenimiento', 'GASTO', '#F59E0B'),
    ('Compras en línea', 'GASTO', '#F59E0B'),
    ('Compras y ropa', 'GASTO', '#EC4899'),
    ('Pagos de tarjeta', 'GASTO', '#64748B'),
    ('Salario', 'INGRESO', '#16A34A'),
    ('Ingresos adicionales', 'INGRESO', '#15803D'),
    ('Fondo de vacaciones', 'AHORRO', '#14B8A6'),
    ('Fondo de emergencia', 'AHORRO', '#0D9488')
) AS datos(nombre, tipo, color)
WHERE lower(usuario.email) = lower('andresfelipe.gutierrez@outlook.com');

-- Jorge Eliécer Peña
INSERT INTO trida.categorias (id_usuario, nombre, tipo, color, es_default, estado)
SELECT usuario.id_usuario, datos.nombre, datos.tipo, datos.color, FALSE, TRUE
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Compra mayorista', 'GASTO', '#F97316'),
    ('Arriendo local', 'GASTO', '#A855F7'),
    ('Servicios del local', 'GASTO', '#6366F1'),
    ('Transporte de mercancía', 'GASTO', '#0EA5E9'),
    ('Mantenimiento del local', 'GASTO', '#64748B'),
    ('Nómina del local', 'GASTO', '#EF4444'),
    ('Mercado del hogar', 'GASTO', '#22C55E'),
    ('Salud', 'GASTO', '#EC4899'),
    ('Ventas del mostrador', 'INGRESO', '#16A34A'),
    ('Ventas por encargo', 'INGRESO', '#15803D'),
    ('Capital de trabajo', 'AHORRO', '#14B8A6')
) AS datos(nombre, tipo, color)
WHERE lower(usuario.email) = lower('jorgeeliecerramirez@hotmail.com');

-- Mariana Lucía Fernández
INSERT INTO trida.categorias (id_usuario, nombre, tipo, color, es_default, estado)
SELECT usuario.id_usuario, datos.nombre, datos.tipo, datos.color, FALSE, TRUE
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Mercado', 'GASTO', '#F97316'),
    ('Vivienda', 'GASTO', '#A855F7'),
    ('Transporte', 'GASTO', '#0EA5E9'),
    ('Salud', 'GASTO', '#EF4444'),
    ('Mascota', 'GASTO', '#EAB308'),
    ('Compras y ropa', 'GASTO', '#EC4899'),
    ('Entretenimiento', 'GASTO', '#F59E0B'),
    ('Alimentación fuera de casa', 'GASTO', '#FB923C'),
    ('Servicios', 'GASTO', '#6366F1'),
    ('Suscripciones', 'GASTO', '#8B5CF6'),
    ('Compras en línea', 'GASTO', '#F59E0B'),
    ('Pagos de tarjeta', 'GASTO', '#64748B'),
    ('Salario', 'INGRESO', '#16A34A'),
    ('Ingresos adicionales', 'INGRESO', '#15803D'),
    ('Fondo personal', 'AHORRO', '#14B8A6')
) AS datos(nombre, tipo, color)
WHERE lower(usuario.email) = lower('marianafernandez@gmail.com');

-- 5. Dispositivos por usuario
-- Valentina Camila Ortiz
INSERT INTO trida.dispositivos (id_usuario, tipo_dispositivo, identificador_unico, sistema_operativo, navegador, confiable, fecha_primer_uso, fecha_ultimo_uso)
SELECT usuario.id_usuario, datos.tipo_dispositivo, datos.identificador_unico,
       datos.sistema_operativo, datos.navegador, datos.confiable,
       CURRENT_TIMESTAMP - INTERVAL '402 days', CURRENT_TIMESTAMP - INTERVAL '7 hours'
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('MOVIL', 'c3e2a4373483d01b1a90d138b022f779', 'Android 14', 'App móvil', TRUE),
    ('PORTATIL', '6d42c296c98de1983c5f15c386489deb', 'Windows 11', 'Chrome 131', FALSE)
) AS datos(tipo_dispositivo, identificador_unico, sistema_operativo, navegador, confiable)
WHERE lower(usuario.email) = lower('valentina.cortiz@gmail.com');

-- Andrés Felipe Gutiérrez
INSERT INTO trida.dispositivos (id_usuario, tipo_dispositivo, identificador_unico, sistema_operativo, navegador, confiable, fecha_primer_uso, fecha_ultimo_uso)
SELECT usuario.id_usuario, datos.tipo_dispositivo, datos.identificador_unico,
       datos.sistema_operativo, datos.navegador, datos.confiable,
       CURRENT_TIMESTAMP - INTERVAL '630 days', CURRENT_TIMESTAMP - INTERVAL '3 hours'
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('MOVIL', 'ef762d15dd19238aa71f44ef738cd215', 'iOS 17', 'App móvil', TRUE),
    ('PORTATIL', '933ef1af413657747967094f52840210', 'Windows 11', 'Chrome 131', TRUE)
) AS datos(tipo_dispositivo, identificador_unico, sistema_operativo, navegador, confiable)
WHERE lower(usuario.email) = lower('andresfelipe.gutierrez@outlook.com');

-- Jorge Eliécer Peña
INSERT INTO trida.dispositivos (id_usuario, tipo_dispositivo, identificador_unico, sistema_operativo, navegador, confiable, fecha_primer_uso, fecha_ultimo_uso)
SELECT usuario.id_usuario, datos.tipo_dispositivo, datos.identificador_unico,
       datos.sistema_operativo, datos.navegador, datos.confiable,
       CURRENT_TIMESTAMP - INTERVAL '970 days', CURRENT_TIMESTAMP - INTERVAL '5 hours'
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('MOVIL', '0b8d2acdf9894975e4f6655b4b980214', 'Android 13', 'App móvil', TRUE),
    ('ESCRITORIO', 'c4e322d7dff1c62d9addd0e5080f5ecd', 'Windows 10', 'Chrome 131', TRUE)
) AS datos(tipo_dispositivo, identificador_unico, sistema_operativo, navegador, confiable)
WHERE lower(usuario.email) = lower('jorgeeliecerramirez@hotmail.com');

-- Mariana Lucía Fernández
INSERT INTO trida.dispositivos (id_usuario, tipo_dispositivo, identificador_unico, sistema_operativo, navegador, confiable, fecha_primer_uso, fecha_ultimo_uso)
SELECT usuario.id_usuario, datos.tipo_dispositivo, datos.identificador_unico,
       datos.sistema_operativo, datos.navegador, datos.confiable,
       CURRENT_TIMESTAMP - INTERVAL '510 days', CURRENT_TIMESTAMP - INTERVAL '9 hours'
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('MOVIL', '69cd62e422cbdaa71f05e47a38baccd0', 'Android 14', 'App móvil', TRUE),
    ('PORTATIL', '37a5fb0c12556820e69ee0f2276db796', 'macOS 14', 'Safari 17', FALSE)
) AS datos(tipo_dispositivo, identificador_unico, sistema_operativo, navegador, confiable)
WHERE lower(usuario.email) = lower('marianafernandez@gmail.com');

-- 6. Ubicaciones, transacciones y alertas por usuario
-- Valentina Camila Ortiz (29 transacciones)
WITH datos AS (
    SELECT * FROM (VALUES
        (1, 2, NULL, 'Apoyo y trabajos ocasionales', 650000, 'Apoyo económico mensual', 'SENA', 'transferencia', 'CONFIRMADA', 'INGRESO', 28, 9, TRUE, 5, 4.758, -74.085, '190.85.14.10'::INET, 0, NULL, NULL, NULL, NULL),
        (2, 2, NULL, 'Arriendo compartido', 380000, 'Pago de arriendo compartido', 'Arrendador', 'transferencia', 'CONFIRMADA', 'GASTO', 27, 8, TRUE, 6, 4.758, -74.085, '190.85.14.11'::INET, 0, NULL, NULL, NULL, NULL),
        (3, 0, NULL, 'Mercado y despensa', 96500, 'Compra de mercado semanal', 'Éxito', 'pos', 'CONFIRMADA', 'GASTO', 24, 18, FALSE, 9, 4.758, -74.085, '190.85.14.12'::INET, 0, NULL, NULL, NULL, NULL),
        (4, 0, NULL, 'Transporte diario', 20000, 'Recarga de tarjeta TransMilenio', 'TransMilenio', 'mobile', 'CONFIRMADA', 'GASTO', 23, 7, TRUE, 4, 4.711, -74.072, '190.85.14.13'::INET, 0, NULL, NULL, NULL, NULL),
        (5, 3, NULL, 'Alimentación fuera de casa', 13500, 'Almuerzo cerca del centro de formación', 'Restaurante La 14', 'efectivo', 'CONFIRMADA', 'GASTO', 22, 13, FALSE, 7, 4.711, -74.072, '190.85.14.14'::INET, 0, NULL, NULL, NULL, NULL),
        (6, 1, NULL, 'Mercado y despensa', 54300, 'Compra de mercado y productos de aseo', 'D1', 'pos', 'CONFIRMADA', 'GASTO', 21, 17, FALSE, 8, 4.758, -74.085, '190.85.14.15'::INET, 0, NULL, NULL, NULL, NULL),
        (7, 0, 2, NULL, 120000, 'Transferencia a cuenta principal', NULL, 'transferencia', 'CONFIRMADA', 'TRANSFERENCIA', 20, 10, FALSE, 3, 4.758, -74.085, '190.85.14.16'::INET, 0, NULL, NULL, NULL, NULL),
        (8, 2, NULL, 'Fondo de emergencia', 80000, 'Aporte mensual al fondo de emergencia', NULL, 'transferencia', 'CONFIRMADA', 'AHORRO', 19, 10, FALSE, 4, 4.758, -74.085, '190.85.14.17'::INET, 0, NULL, NULL, NULL, NULL),
        (9, 0, NULL, 'Apoyo y trabajos ocasionales', 280000, 'Pago por trabajo ocasional de fin de semana', 'Cliente particular', 'mobile', 'CONFIRMADA', 'INGRESO', 19, 20, FALSE, 11, 4.758, -74.085, '190.85.14.18'::INET, 0, NULL, NULL, NULL, NULL),
        (10, 1, NULL, 'Datos y recargas', 30000, 'Recarga de datos y plan móvil', 'Claro', 'mobile', 'CONFIRMADA', 'GASTO', 18, 9, TRUE, 5, 4.758, -74.085, '190.85.14.19'::INET, 0, NULL, NULL, NULL, NULL),
        (11, 2, NULL, 'Útiles y fotocopias', 87500, 'Útiles, cuadernos y material de estudio', 'Panamericana', 'pos', 'CONFIRMADA', 'GASTO', 17, 15, FALSE, 10, 4.711, -74.072, '190.85.14.20'::INET, 0, NULL, NULL, NULL, NULL),
        (12, 0, NULL, 'Transporte diario', 20000, 'Recarga de tarjeta TransMilenio', 'TransMilenio', 'mobile', 'CONFIRMADA', 'GASTO', 16, 7, TRUE, 4, 4.711, -74.072, '190.85.14.21'::INET, 0, NULL, NULL, NULL, NULL),
        (13, 3, NULL, 'Alimentación fuera de casa', 14200, 'Almuerzo cerca del centro de formación', 'Restaurante La 14', 'efectivo', 'CONFIRMADA', 'GASTO', 15, 13, FALSE, 7, 4.711, -74.072, '190.85.14.22'::INET, 0, NULL, NULL, NULL, NULL),
        (14, 0, NULL, 'Útiles y fotocopias', 8200, 'Fotocopias e impresiones de apuntes', 'Papelería Central', 'pos', 'CONFIRMADA', 'GASTO', 14, 11, FALSE, 6, 4.711, -74.072, '190.85.14.23'::INET, 0, NULL, NULL, NULL, NULL),
        (15, 2, NULL, 'Servicios del apartamento', 46200, 'Pago de energía y agua del apartamento', 'Enel Codensa', 'web', 'CONFIRMADA', 'GASTO', 13, 9, TRUE, 6, 4.758, -74.085, '190.85.14.24'::INET, 0, NULL, NULL, NULL, NULL),
        (16, 1, NULL, 'Salud y farmacia', 28900, 'Farmacia y medicamentos', 'Cruz Verde', 'pos', 'CONFIRMADA', 'GASTO', 11, 16, FALSE, 8, 4.758, -74.085, '190.85.14.25'::INET, 0, NULL, NULL, NULL, NULL),
        (17, 0, NULL, 'Entretenimiento', 35000, 'Cine con amigos', 'Cine Colombia', 'pos', 'CONFIRMADA', 'GASTO', 10, 19, FALSE, 9, 4.667, -74.056, '190.85.14.26'::INET, 0, NULL, NULL, NULL, NULL),
        (18, 1, NULL, 'Cursos y formación', 110000, 'Matrícula de curso complementario', 'SENA', 'web', 'CONFIRMADA', 'GASTO', 9, 10, FALSE, 12, 4.711, -74.072, '190.85.14.27'::INET, 0, NULL, NULL, NULL, NULL),
        (19, 3, NULL, 'Alimentación fuera de casa', 13800, 'Almuerzo cerca del centro de formación', 'Restaurante La 14', 'efectivo', 'CONFIRMADA', 'GASTO', 8, 13, FALSE, 7, 4.711, -74.072, '190.85.14.28'::INET, 0, NULL, NULL, NULL, NULL),
        (20, 3, NULL, 'Transporte diario', 18000, 'Transporte en buseta y taxi corto', 'Taxi', 'efectivo', 'CONFIRMADA', 'GASTO', 7, 18, FALSE, 9, 4.758, -74.085, '190.85.14.29'::INET, 0, NULL, NULL, NULL, NULL),
        (21, 0, NULL, 'Compras en línea', 210000, 'Compra en almacén fuera de la ruta habitual', 'Alkosto', 'pos', 'SOSPECHOSA', 'GASTO', 6, 21, FALSE, 88, 4.667, -74.056, '190.85.14.30'::INET, 0, 'ALTA', 'Compra en un comercio poco frecuente y fuera de la zona habitual.', 'PENDIENTE', NULL),
        (22, 1, NULL, 'Compras en línea', 64000, 'Ropa y calzado básico', 'Falabella', 'pos', 'CONFIRMADA', 'GASTO', 5, 17, FALSE, 10, 4.667, -74.056, '190.85.14.31'::INET, 0, NULL, NULL, NULL, NULL),
        (23, 0, NULL, 'Venta de productos', 150000, 'Venta de apuntes y trabajos a compañeros', 'Compañeros de estudio', 'mobile', 'CONFIRMADA', 'INGRESO', 4, 15, FALSE, 8, 4.711, -74.072, '190.85.14.32'::INET, 0, NULL, NULL, NULL, NULL),
        (24, 0, NULL, 'Meta de estudio', 50000, 'Ahorro para transporte del próximo mes', NULL, 'transferencia', 'CONFIRMADA', 'AHORRO', 3, 10, FALSE, 4, 4.758, -74.085, '190.85.14.33'::INET, 0, NULL, NULL, NULL, NULL),
        (25, 2, NULL, 'Servicios del apartamento', 52000, 'Pago pendiente de internet del apartamento', 'ETB', 'web', 'PENDIENTE', 'GASTO', 3, 9, FALSE, 22, 4.758, -74.085, '190.85.14.34'::INET, 0, NULL, NULL, NULL, NULL),
        (26, 0, NULL, 'Compras en línea', 47500, 'Intento de pago en línea no autorizado', 'Plataforma en línea', 'web', 'RECHAZADA', 'GASTO', 2, 23, FALSE, 94, 4.758, -74.085, '190.85.14.35'::INET, 0, 'MEDIA', 'Intento de pago rechazado por el banco por datos no coincidentes.', 'CONFIRMADA', 'NO_FUI_YO'),
        (27, 2, NULL, 'Mercado y despensa', 73000, 'Compra de mercado para la semana', 'Carulla', 'pos', 'CONFIRMADA', 'GASTO', 2, 18, FALSE, 8, 4.758, -74.085, '190.85.14.36'::INET, 0, NULL, NULL, NULL, NULL),
        (28, 3, NULL, 'Alimentación fuera de casa', 9500, 'Refrigerio y jugo en la jornada de estudio', 'Cafetería', 'efectivo', 'CONFIRMADA', 'GASTO', 1, 10, FALSE, 5, 4.711, -74.072, '190.85.14.37'::INET, 0, NULL, NULL, NULL, NULL),
        (29, 1, NULL, 'Apoyo y trabajos ocasionales', 90000, 'Pago por cuidado de niños un fin de semana', 'Familia conocida', 'mobile', 'CONFIRMADA', 'INGRESO', 1, 19, FALSE, 7, 4.758, -74.085, '190.85.14.38'::INET, 0, NULL, NULL, NULL, NULL)
    ) AS d(indice, cuenta_indice, destino_indice, categoria_nombre, monto, descripcion, comercio, canal, estado, tipo_movimiento, dias_ago, hora, es_recurrente, score_anomalia, latitud, longitud, direccion_ip, dispositivo_indice, alerta_severidad, alerta_motivo, alerta_estado, alerta_accion)
),
cuentas_ordenadas AS (
    SELECT c.id_cuenta, ROW_NUMBER() OVER (ORDER BY c.id_cuenta) - 1 AS idx
    FROM trida.cuentas AS c
    JOIN trida.usuarios AS u ON u.id_usuario = c.id_usuario
    WHERE lower(u.email) = lower('valentina.cortiz@gmail.com')
),
dispositivos_ordenados AS (
    SELECT d.id_dispositivo, ROW_NUMBER() OVER (ORDER BY d.id_dispositivo) - 1 AS idx
    FROM trida.dispositivos AS d
    JOIN trida.usuarios AS u ON u.id_usuario = d.id_usuario
    WHERE lower(u.email) = lower('valentina.cortiz@gmail.com')
),
ubicaciones_insertadas AS (
    INSERT INTO trida.ubicaciones (id_dispositivo, direccion_ip, pais, ciudad, latitud, longitud, fecha_registro)
    SELECT disp.id_dispositivo, d.direccion_ip, 'Colombia', 'Bogotá', d.latitud, d.longitud,
           DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora)
    FROM datos AS d
    JOIN dispositivos_ordenados AS disp ON disp.idx = d.dispositivo_indice
    RETURNING id_ubicacion, direccion_ip
),
transacciones_insertadas AS (
    INSERT INTO trida.transacciones (
        id_usuario, id_cuenta, id_cuenta_destino, id_categoria, id_dispositivo, id_ubicacion,
        tipo_movimiento, monto, moneda, descripcion, comercio, canal,
        es_recurrente, score_anomalia, estado, fecha_transaccion
    )
    SELECT u.id_usuario, cu.id_cuenta, cud.id_cuenta, cat.id_categoria, disp.id_dispositivo, ub.id_ubicacion,
           d.tipo_movimiento, d.monto::NUMERIC(15, 2), 'COP', d.descripcion, d.comercio, d.canal,
           d.es_recurrente, d.score_anomalia::NUMERIC(5, 2), d.estado,
           DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora)
    FROM datos AS d
    JOIN trida.usuarios AS u ON lower(u.email) = lower('valentina.cortiz@gmail.com')
    JOIN cuentas_ordenadas AS cu ON cu.idx = d.cuenta_indice
    LEFT JOIN cuentas_ordenadas AS cud ON cud.idx = d.destino_indice
    LEFT JOIN trida.categorias AS cat ON cat.id_usuario = u.id_usuario AND cat.nombre = d.categoria_nombre
    JOIN dispositivos_ordenados AS disp ON disp.idx = d.dispositivo_indice
    JOIN ubicaciones_insertadas AS ub ON ub.direccion_ip = d.direccion_ip
    RETURNING id_transaccion, id_usuario, descripcion
)
INSERT INTO trida.alertas_fraude (id_usuario, id_transaccion, severidad, motivo, estado, fecha_detectada, fecha_resuelta, accion_usuario)
SELECT t.id_usuario, t.id_transaccion, d.alerta_severidad, d.alerta_motivo, d.alerta_estado,
       DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora),
       CASE WHEN d.alerta_estado = 'PENDIENTE' THEN NULL
            ELSE DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora) + INTERVAL '2 days' END,
       d.alerta_accion
FROM transacciones_insertadas AS t
JOIN datos AS d ON d.descripcion = t.descripcion
WHERE d.alerta_severidad IS NOT NULL;

-- Andrés Felipe Gutiérrez (30 transacciones)
WITH datos AS (
    SELECT * FROM (VALUES
        (1, 0, NULL, 'Salario', 5200000, 'Pago de nómina mensual', 'Empresa', 'transferencia', 'CONFIRMADA', 'INGRESO', 26, 8, TRUE, 4, 4.667, -74.056, '186.102.22.10'::INET, 0, NULL, NULL, NULL, NULL),
        (2, 0, NULL, 'Vivienda', 1450000, 'Pago de arriendo mensual', 'Arrendador', 'transferencia', 'CONFIRMADA', 'GASTO', 25, 9, TRUE, 5, 4.667, -74.056, '186.102.22.11'::INET, 0, NULL, NULL, NULL, NULL),
        (3, 0, NULL, 'Servicios públicos', 185400, 'Pago de energía eléctrica', 'Enel Codensa', 'web', 'CONFIRMADA', 'GASTO', 24, 10, TRUE, 6, 4.667, -74.056, '186.102.22.12'::INET, 0, NULL, NULL, NULL, NULL),
        (4, 0, NULL, 'Servicios públicos', 96400, 'Pago de gas natural', 'Vanti', 'web', 'CONFIRMADA', 'GASTO', 24, 11, FALSE, 6, 4.667, -74.056, '186.102.22.13'::INET, 0, NULL, NULL, NULL, NULL),
        (5, 0, NULL, 'Servicios públicos', 119900, 'Pago de internet y telefonía', 'ETB', 'web', 'CONFIRMADA', 'GASTO', 23, 10, TRUE, 6, 4.667, -74.056, '186.102.22.14'::INET, 0, NULL, NULL, NULL, NULL),
        (6, 1, NULL, 'Mercado', 423000, 'Compra de mercado semanal', 'Carulla', 'pos', 'CONFIRMADA', 'GASTO', 22, 18, FALSE, 9, 4.667, -74.056, '186.102.22.15'::INET, 0, NULL, NULL, NULL, NULL),
        (7, 1, NULL, 'Almuerzo laboral', 21500, 'Almuerzo de trabajo', 'Restaurante Chapinero', 'pos', 'CONFIRMADA', 'GASTO', 21, 13, FALSE, 7, 4.667, -74.056, '186.102.22.16'::INET, 0, NULL, NULL, NULL, NULL),
        (8, 1, NULL, 'Parqueadero', 26000, 'Parqueadero diario', 'Parqueadero Chapinero', 'pos', 'CONFIRMADA', 'GASTO', 21, 8, TRUE, 8, 4.667, -74.056, '186.102.22.17'::INET, 0, NULL, NULL, NULL, NULL),
        (9, 2, NULL, 'Transporte y gasolina', 152000, 'Recarga de gasolina', 'Terpel', 'pos', 'CONFIRMADA', 'GASTO', 20, 17, FALSE, 9, 4.685, -74.1, '186.102.22.18'::INET, 0, NULL, NULL, NULL, NULL),
        (10, 1, NULL, 'Almuerzo laboral', 23400, 'Almuerzo de trabajo', 'Restaurante Chapinero', 'pos', 'CONFIRMADA', 'GASTO', 19, 13, FALSE, 7, 4.667, -74.056, '186.102.22.19'::INET, 0, NULL, NULL, NULL, NULL),
        (11, 0, 2, NULL, 300000, 'Transferencia a billetera', NULL, 'transferencia', 'CONFIRMADA', 'TRANSFERENCIA', 18, 9, FALSE, 3, 4.667, -74.056, '186.102.22.20'::INET, 0, NULL, NULL, NULL, NULL),
        (12, 0, NULL, 'Fondo de vacaciones', 350000, 'Aporte mensual al fondo de vacaciones', NULL, 'transferencia', 'CONFIRMADA', 'AHORRO', 18, 10, FALSE, 4, 4.667, -74.056, '186.102.22.21'::INET, 0, NULL, NULL, NULL, NULL),
        (13, 1, NULL, 'Almuerzo laboral', 22100, 'Almuerzo de trabajo', 'Restaurante Chapinero', 'pos', 'CONFIRMADA', 'GASTO', 18, 13, FALSE, 7, 4.667, -74.056, '186.102.22.22'::INET, 0, NULL, NULL, NULL, NULL),
        (14, 2, NULL, 'Transporte y gasolina', 22800, 'Viaje en aplicación de transporte', 'Uber', 'mobile', 'CONFIRMADA', 'GASTO', 16, 19, FALSE, 10, 4.711, -74.072, '186.102.22.23'::INET, 0, NULL, NULL, NULL, NULL),
        (15, 1, NULL, 'Suscripciones', 46900, 'Suscripción de streaming', 'Netflix', 'web', 'CONFIRMADA', 'GASTO', 15, 20, TRUE, 5, 4.667, -74.056, '186.102.22.24'::INET, 0, NULL, NULL, NULL, NULL),
        (16, 1, NULL, 'Suscripciones', 17900, 'Suscripción de música', 'Spotify', 'web', 'CONFIRMADA', 'GASTO', 15, 20, TRUE, 5, 4.667, -74.056, '186.102.22.25'::INET, 0, NULL, NULL, NULL, NULL),
        (17, 0, NULL, 'Entretenimiento', 120000, 'Mensualidad de gimnasio', 'Smart Fit', 'web', 'CONFIRMADA', 'GASTO', 14, 7, TRUE, 6, 4.667, -74.056, '186.102.22.26'::INET, 0, NULL, NULL, NULL, NULL),
        (18, 2, NULL, 'Salud', 58700, 'Farmacia y consulta médica', 'Cruz Verde', 'pos', 'CONFIRMADA', 'GASTO', 12, 16, FALSE, 9, 4.667, -74.056, '186.102.22.27'::INET, 0, NULL, NULL, NULL, NULL),
        (19, 2, NULL, 'Ingresos adicionales', 320000, 'Pago por consultoría adicional', 'Cliente particular', 'mobile', 'CONFIRMADA', 'INGRESO', 11, 18, FALSE, 8, 4.667, -74.056, '186.102.22.28'::INET, 0, NULL, NULL, NULL, NULL),
        (20, 1, NULL, 'Compras en línea', 890000, 'Compra de electrodoméstico en línea', 'Alkosto', 'pos', 'SOSPECHOSA', 'GASTO', 9, 22, FALSE, 91, 4.695, -74.032, '186.102.22.29'::INET, 0, 'ALTA', 'Monto superior al promedio habitual y comercio poco frecuente.', 'PENDIENTE', NULL),
        (21, 3, NULL, 'Mercado', 45000, 'Mercado pequeño y panadería', 'Panadería', 'efectivo', 'CONFIRMADA', 'GASTO', 8, 8, FALSE, 7, 4.667, -74.056, '186.102.22.30'::INET, 0, NULL, NULL, NULL, NULL),
        (22, 0, NULL, 'Ingresos adicionales', 180000, 'Reembolso de gastos de viaje', 'Empresa', 'transferencia', 'CONFIRMADA', 'INGRESO', 7, 9, FALSE, 6, 4.667, -74.056, '186.102.22.31'::INET, 0, NULL, NULL, NULL, NULL),
        (23, 1, NULL, 'Entretenimiento', 134000, 'Cena con familia el fin de semana', 'Restaurante Usaquén', 'pos', 'CONFIRMADA', 'GASTO', 6, 20, FALSE, 10, 4.695, -74.032, '186.102.22.32'::INET, 0, NULL, NULL, NULL, NULL),
        (24, 1, NULL, 'Compras y ropa', 98000, 'Compra de ropa de trabajo', 'Falabella', 'pos', 'CONFIRMADA', 'GASTO', 5, 17, FALSE, 10, 4.667, -74.056, '186.102.22.33'::INET, 0, NULL, NULL, NULL, NULL),
        (25, 0, NULL, 'Pagos de tarjeta', 210000, 'Pago de tarjeta de crédito', 'Davivienda', 'web', 'PENDIENTE', 'GASTO', 4, 10, FALSE, 18, 4.667, -74.056, '186.102.22.34'::INET, 0, NULL, NULL, NULL, NULL),
        (26, 2, NULL, NULL, 76000, 'Intento de pago en cajero automático', 'Cajero Bancolombia', 'atm', 'RECHAZADA', 'GASTO', 3, 2, FALSE, 89, 4.711, -74.072, '186.102.22.35'::INET, 0, 'MEDIA', 'Actividad inusual en cajero fuera del horario habitual.', 'DESCARTADA', 'FUI_YO'),
        (27, 1, NULL, 'Entretenimiento', 54000, 'Entradas a concierto', 'Tu Boleta', 'pos', 'CONFIRMADA', 'GASTO', 3, 19, FALSE, 11, 4.667, -74.056, '186.102.22.36'::INET, 0, NULL, NULL, NULL, NULL),
        (28, 2, NULL, 'Fondo de emergencia', 120000, 'Ahorro para fondo de emergencia', NULL, 'transferencia', 'CONFIRMADA', 'AHORRO', 2, 10, FALSE, 4, 4.667, -74.056, '186.102.22.37'::INET, 0, NULL, NULL, NULL, NULL),
        (29, 3, NULL, 'Transporte y gasolina', 32000, 'Transporte público y taxi', 'Taxi', 'efectivo', 'CONFIRMADA', 'GASTO', 1, 18, FALSE, 8, 4.667, -74.056, '186.102.22.38'::INET, 0, NULL, NULL, NULL, NULL),
        (30, 0, NULL, 'Mercado', 156000, 'Mercado de la semana', 'Éxito', 'pos', 'CONFIRMADA', 'GASTO', 1, 18, FALSE, 9, 4.667, -74.056, '186.102.22.39'::INET, 0, NULL, NULL, NULL, NULL)
    ) AS d(indice, cuenta_indice, destino_indice, categoria_nombre, monto, descripcion, comercio, canal, estado, tipo_movimiento, dias_ago, hora, es_recurrente, score_anomalia, latitud, longitud, direccion_ip, dispositivo_indice, alerta_severidad, alerta_motivo, alerta_estado, alerta_accion)
),
cuentas_ordenadas AS (
    SELECT c.id_cuenta, ROW_NUMBER() OVER (ORDER BY c.id_cuenta) - 1 AS idx
    FROM trida.cuentas AS c
    JOIN trida.usuarios AS u ON u.id_usuario = c.id_usuario
    WHERE lower(u.email) = lower('andresfelipe.gutierrez@outlook.com')
),
dispositivos_ordenados AS (
    SELECT d.id_dispositivo, ROW_NUMBER() OVER (ORDER BY d.id_dispositivo) - 1 AS idx
    FROM trida.dispositivos AS d
    JOIN trida.usuarios AS u ON u.id_usuario = d.id_usuario
    WHERE lower(u.email) = lower('andresfelipe.gutierrez@outlook.com')
),
ubicaciones_insertadas AS (
    INSERT INTO trida.ubicaciones (id_dispositivo, direccion_ip, pais, ciudad, latitud, longitud, fecha_registro)
    SELECT disp.id_dispositivo, d.direccion_ip, 'Colombia', 'Bogotá', d.latitud, d.longitud,
           DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora)
    FROM datos AS d
    JOIN dispositivos_ordenados AS disp ON disp.idx = d.dispositivo_indice
    RETURNING id_ubicacion, direccion_ip
),
transacciones_insertadas AS (
    INSERT INTO trida.transacciones (
        id_usuario, id_cuenta, id_cuenta_destino, id_categoria, id_dispositivo, id_ubicacion,
        tipo_movimiento, monto, moneda, descripcion, comercio, canal,
        es_recurrente, score_anomalia, estado, fecha_transaccion
    )
    SELECT u.id_usuario, cu.id_cuenta, cud.id_cuenta, cat.id_categoria, disp.id_dispositivo, ub.id_ubicacion,
           d.tipo_movimiento, d.monto::NUMERIC(15, 2), 'COP', d.descripcion, d.comercio, d.canal,
           d.es_recurrente, d.score_anomalia::NUMERIC(5, 2), d.estado,
           DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora)
    FROM datos AS d
    JOIN trida.usuarios AS u ON lower(u.email) = lower('andresfelipe.gutierrez@outlook.com')
    JOIN cuentas_ordenadas AS cu ON cu.idx = d.cuenta_indice
    LEFT JOIN cuentas_ordenadas AS cud ON cud.idx = d.destino_indice
    LEFT JOIN trida.categorias AS cat ON cat.id_usuario = u.id_usuario AND cat.nombre = d.categoria_nombre
    JOIN dispositivos_ordenados AS disp ON disp.idx = d.dispositivo_indice
    JOIN ubicaciones_insertadas AS ub ON ub.direccion_ip = d.direccion_ip
    RETURNING id_transaccion, id_usuario, descripcion
)
INSERT INTO trida.alertas_fraude (id_usuario, id_transaccion, severidad, motivo, estado, fecha_detectada, fecha_resuelta, accion_usuario)
SELECT t.id_usuario, t.id_transaccion, d.alerta_severidad, d.alerta_motivo, d.alerta_estado,
       DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora),
       CASE WHEN d.alerta_estado = 'PENDIENTE' THEN NULL
            ELSE DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora) + INTERVAL '2 days' END,
       d.alerta_accion
FROM transacciones_insertadas AS t
JOIN datos AS d ON d.descripcion = t.descripcion
WHERE d.alerta_severidad IS NOT NULL;

-- Jorge Eliécer Peña (29 transacciones)
WITH datos AS (
    SELECT * FROM (VALUES
        (1, 1, NULL, 'Ventas del mostrador', 620000, 'Ventas del mostrador de la semana', 'Tienda', 'transferencia', 'CONFIRMADA', 'INGRESO', 25, 19, FALSE, 6, 4.628, -74.154, '181.49.77.10'::INET, 0, NULL, NULL, NULL, NULL),
        (2, 3, NULL, 'Ventas del mostrador', 480000, 'Ventas en efectivo del fin de semana', 'Tienda', 'efectivo', 'CONFIRMADA', 'INGRESO', 24, 18, FALSE, 6, 4.628, -74.154, '181.49.77.11'::INET, 0, NULL, NULL, NULL, NULL),
        (3, 0, NULL, 'Compra mayorista', 1850000, 'Compra mayorista en plaza de mercado', 'Corabastos', 'transferencia', 'CONFIRMADA', 'GASTO', 23, 6, FALSE, 10, 4.625, -74.135, '181.49.77.12'::INET, 0, NULL, NULL, NULL, NULL),
        (4, 1, NULL, 'Compra mayorista', 1240000, 'Compra de productos de canasta familiar', 'Codabas', 'transferencia', 'CONFIRMADA', 'GASTO', 22, 7, FALSE, 10, 4.625, -74.135, '181.49.77.13'::INET, 0, NULL, NULL, NULL, NULL),
        (5, 0, NULL, 'Compra mayorista', 980000, 'Pedido de bebidas para el local', 'Bavaria', 'transferencia', 'CONFIRMADA', 'GASTO', 21, 8, FALSE, 9, 4.628, -74.154, '181.49.77.14'::INET, 0, NULL, NULL, NULL, NULL),
        (6, 1, NULL, 'Compra mayorista', 760000, 'Compra de gaseosas y jugos', 'Postobón', 'transferencia', 'CONFIRMADA', 'GASTO', 20, 8, FALSE, 9, 4.628, -74.154, '181.49.77.15'::INET, 0, NULL, NULL, NULL, NULL),
        (7, 0, NULL, 'Arriendo local', 1600000, 'Pago de arriendo del local', 'Arrendador', 'transferencia', 'CONFIRMADA', 'GASTO', 19, 9, TRUE, 5, 4.628, -74.154, '181.49.77.16'::INET, 0, NULL, NULL, NULL, NULL),
        (8, 1, NULL, 'Nómina del local', 1320000, 'Pago de nómina de empleado', 'Empleado', 'transferencia', 'CONFIRMADA', 'GASTO', 18, 9, TRUE, 5, 4.628, -74.154, '181.49.77.17'::INET, 0, NULL, NULL, NULL, NULL),
        (9, 0, NULL, 'Servicios del local', 214000, 'Pago de energía del local', 'Enel Codensa', 'web', 'CONFIRMADA', 'GASTO', 17, 10, FALSE, 6, 4.628, -74.154, '181.49.77.18'::INET, 0, NULL, NULL, NULL, NULL),
        (10, 1, NULL, 'Servicios del local', 118000, 'Pago de agua y gas del local', 'Acueducto de Bogotá', 'web', 'CONFIRMADA', 'GASTO', 17, 11, FALSE, 6, 4.628, -74.154, '181.49.77.19'::INET, 0, NULL, NULL, NULL, NULL),
        (11, 3, NULL, 'Transporte de mercancía', 145000, 'Transporte de mercancía', 'Transporte local', 'efectivo', 'CONFIRMADA', 'GASTO', 16, 7, FALSE, 8, 4.625, -74.135, '181.49.77.20'::INET, 0, NULL, NULL, NULL, NULL),
        (12, 2, NULL, 'Compra mayorista', 1450000, 'Compra mayorista de granos y aceites', 'Olímpica', 'transferencia', 'CONFIRMADA', 'GASTO', 15, 8, FALSE, 10, 4.628, -74.154, '181.49.77.21'::INET, 0, NULL, NULL, NULL, NULL),
        (13, 1, NULL, 'Ventas del mostrador', 540000, 'Ventas del mostrador de la semana', 'Tienda', 'transferencia', 'CONFIRMADA', 'INGRESO', 14, 19, FALSE, 6, 4.628, -74.154, '181.49.77.22'::INET, 0, NULL, NULL, NULL, NULL),
        (14, 4, NULL, 'Ventas por encargo', 310000, 'Ventas por encargo a vecinos', 'Clientes del barrio', 'mobile', 'CONFIRMADA', 'INGRESO', 13, 17, FALSE, 7, 4.628, -74.154, '181.49.77.23'::INET, 0, NULL, NULL, NULL, NULL),
        (15, 0, NULL, 'Mantenimiento del local', 86000, 'Reparación de nevera del local', 'Servicio técnico', 'transferencia', 'CONFIRMADA', 'GASTO', 12, 10, FALSE, 8, 4.628, -74.154, '181.49.77.24'::INET, 0, NULL, NULL, NULL, NULL),
        (16, 3, NULL, 'Mercado del hogar', 210000, 'Mercado del hogar', 'Éxito', 'pos', 'CONFIRMADA', 'GASTO', 11, 18, FALSE, 8, 4.628, -74.154, '181.49.77.25'::INET, 0, NULL, NULL, NULL, NULL),
        (17, 2, NULL, 'Salud', 69000, 'Farmacia', 'Cruz Verde', 'pos', 'CONFIRMADA', 'GASTO', 10, 16, FALSE, 8, 4.628, -74.154, '181.49.77.26'::INET, 0, NULL, NULL, NULL, NULL),
        (18, 0, 1, NULL, 500000, 'Transferencia entre cuentas del negocio', NULL, 'transferencia', 'CONFIRMADA', 'TRANSFERENCIA', 9, 9, FALSE, 4, 4.628, -74.154, '181.49.77.27'::INET, 0, NULL, NULL, NULL, NULL),
        (19, 1, NULL, 'Capital de trabajo', 400000, 'Aporte al capital de trabajo', NULL, 'transferencia', 'CONFIRMADA', 'AHORRO', 9, 10, FALSE, 5, 4.628, -74.154, '181.49.77.28'::INET, 0, NULL, NULL, NULL, NULL),
        (20, 1, NULL, 'Compra mayorista', 2400000, 'Compra mayorista inusual de madrugada', 'Corabastos', 'transferencia', 'SOSPECHOSA', 'GASTO', 8, 3, FALSE, 86, 4.625, -74.135, '181.49.77.29'::INET, 0, 'ALTA', 'Monto muy superior a las compras habituales del local.', 'PENDIENTE', NULL),
        (21, 3, NULL, 'Ventas del mostrador', 520000, 'Ventas en efectivo del fin de semana', 'Tienda', 'efectivo', 'CONFIRMADA', 'INGRESO', 7, 18, FALSE, 6, 4.628, -74.154, '181.49.77.30'::INET, 0, NULL, NULL, NULL, NULL),
        (22, 0, NULL, 'Compra mayorista', 1180000, 'Pedido pendiente a proveedor', 'Codabas', 'transferencia', 'PENDIENTE', 'GASTO', 6, 8, FALSE, 20, 4.625, -74.135, '181.49.77.31'::INET, 0, NULL, NULL, NULL, NULL),
        (23, 2, NULL, NULL, 340000, 'Intento de pago con tarjeta en datáfono', 'Datáfono', 'pos', 'RECHAZADA', 'GASTO', 5, 21, FALSE, 92, 4.628, -74.154, '181.49.77.32'::INET, 0, 'CRITICA', 'Múltiples intentos fallidos en poco tiempo desde el mismo datáfono.', 'CONFIRMADA', 'NO_FUI_YO'),
        (24, 1, NULL, 'Compra mayorista', 950000, 'Compra de productos de limpieza y empaque', 'Éxito', 'transferencia', 'CONFIRMADA', 'GASTO', 4, 9, FALSE, 10, 4.628, -74.154, '181.49.77.33'::INET, 0, NULL, NULL, NULL, NULL),
        (25, 1, NULL, 'Ventas del mostrador', 580000, 'Ventas del mostrador de la semana', 'Tienda', 'transferencia', 'CONFIRMADA', 'INGRESO', 3, 19, FALSE, 6, 4.628, -74.154, '181.49.77.34'::INET, 0, NULL, NULL, NULL, NULL),
        (26, 3, NULL, 'Transporte de mercancía', 98000, 'Combustible para reparto', 'Terpel', 'pos', 'CONFIRMADA', 'GASTO', 2, 7, FALSE, 8, 4.628, -74.154, '181.49.77.35'::INET, 0, NULL, NULL, NULL, NULL),
        (27, 0, NULL, 'Servicios del local', 265000, 'Pago de internet del local', 'ETB', 'web', 'CONFIRMADA', 'GASTO', 2, 10, FALSE, 6, 4.628, -74.154, '181.49.77.36'::INET, 0, NULL, NULL, NULL, NULL),
        (28, 4, NULL, 'Capital de trabajo', 150000, 'Ahorro para imprevistos del negocio', NULL, 'transferencia', 'CONFIRMADA', 'AHORRO', 1, 10, FALSE, 5, 4.628, -74.154, '181.49.77.37'::INET, 0, NULL, NULL, NULL, NULL),
        (29, 4, NULL, 'Ventas por encargo', 260000, 'Ventas por encargo', 'Clientes del barrio', 'mobile', 'CONFIRMADA', 'INGRESO', 1, 17, FALSE, 7, 4.628, -74.154, '181.49.77.38'::INET, 0, NULL, NULL, NULL, NULL)
    ) AS d(indice, cuenta_indice, destino_indice, categoria_nombre, monto, descripcion, comercio, canal, estado, tipo_movimiento, dias_ago, hora, es_recurrente, score_anomalia, latitud, longitud, direccion_ip, dispositivo_indice, alerta_severidad, alerta_motivo, alerta_estado, alerta_accion)
),
cuentas_ordenadas AS (
    SELECT c.id_cuenta, ROW_NUMBER() OVER (ORDER BY c.id_cuenta) - 1 AS idx
    FROM trida.cuentas AS c
    JOIN trida.usuarios AS u ON u.id_usuario = c.id_usuario
    WHERE lower(u.email) = lower('jorgeeliecerramirez@hotmail.com')
),
dispositivos_ordenados AS (
    SELECT d.id_dispositivo, ROW_NUMBER() OVER (ORDER BY d.id_dispositivo) - 1 AS idx
    FROM trida.dispositivos AS d
    JOIN trida.usuarios AS u ON u.id_usuario = d.id_usuario
    WHERE lower(u.email) = lower('jorgeeliecerramirez@hotmail.com')
),
ubicaciones_insertadas AS (
    INSERT INTO trida.ubicaciones (id_dispositivo, direccion_ip, pais, ciudad, latitud, longitud, fecha_registro)
    SELECT disp.id_dispositivo, d.direccion_ip, 'Colombia', 'Bogotá', d.latitud, d.longitud,
           DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora)
    FROM datos AS d
    JOIN dispositivos_ordenados AS disp ON disp.idx = d.dispositivo_indice
    RETURNING id_ubicacion, direccion_ip
),
transacciones_insertadas AS (
    INSERT INTO trida.transacciones (
        id_usuario, id_cuenta, id_cuenta_destino, id_categoria, id_dispositivo, id_ubicacion,
        tipo_movimiento, monto, moneda, descripcion, comercio, canal,
        es_recurrente, score_anomalia, estado, fecha_transaccion
    )
    SELECT u.id_usuario, cu.id_cuenta, cud.id_cuenta, cat.id_categoria, disp.id_dispositivo, ub.id_ubicacion,
           d.tipo_movimiento, d.monto::NUMERIC(15, 2), 'COP', d.descripcion, d.comercio, d.canal,
           d.es_recurrente, d.score_anomalia::NUMERIC(5, 2), d.estado,
           DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora)
    FROM datos AS d
    JOIN trida.usuarios AS u ON lower(u.email) = lower('jorgeeliecerramirez@hotmail.com')
    JOIN cuentas_ordenadas AS cu ON cu.idx = d.cuenta_indice
    LEFT JOIN cuentas_ordenadas AS cud ON cud.idx = d.destino_indice
    LEFT JOIN trida.categorias AS cat ON cat.id_usuario = u.id_usuario AND cat.nombre = d.categoria_nombre
    JOIN dispositivos_ordenados AS disp ON disp.idx = d.dispositivo_indice
    JOIN ubicaciones_insertadas AS ub ON ub.direccion_ip = d.direccion_ip
    RETURNING id_transaccion, id_usuario, descripcion
)
INSERT INTO trida.alertas_fraude (id_usuario, id_transaccion, severidad, motivo, estado, fecha_detectada, fecha_resuelta, accion_usuario)
SELECT t.id_usuario, t.id_transaccion, d.alerta_severidad, d.alerta_motivo, d.alerta_estado,
       DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora),
       CASE WHEN d.alerta_estado = 'PENDIENTE' THEN NULL
            ELSE DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora) + INTERVAL '2 days' END,
       d.alerta_accion
FROM transacciones_insertadas AS t
JOIN datos AS d ON d.descripcion = t.descripcion
WHERE d.alerta_severidad IS NOT NULL;

-- Mariana Lucía Fernández (27 transacciones)
WITH datos AS (
    SELECT * FROM (VALUES
        (1, 0, NULL, 'Salario', 3400000, 'Pago de nómina mensual', 'Empresa', 'transferencia', 'CONFIRMADA', 'INGRESO', 27, 8, TRUE, 4, 4.65, -74.08, '190.24.61.10'::INET, 0, NULL, NULL, NULL, NULL),
        (2, 0, NULL, 'Vivienda', 1180000, 'Pago de arriendo mensual', 'Arrendador', 'transferencia', 'CONFIRMADA', 'GASTO', 26, 9, TRUE, 5, 4.65, -74.08, '190.24.61.11'::INET, 0, NULL, NULL, NULL, NULL),
        (3, 0, NULL, 'Servicios', 142000, 'Pago de energía eléctrica', 'Enel Codensa', 'web', 'CONFIRMADA', 'GASTO', 25, 10, TRUE, 6, 4.65, -74.08, '190.24.61.12'::INET, 0, NULL, NULL, NULL, NULL),
        (4, 0, NULL, 'Servicios', 88000, 'Pago de gas natural', 'Vanti', 'web', 'CONFIRMADA', 'GASTO', 25, 11, FALSE, 6, 4.65, -74.08, '190.24.61.13'::INET, 0, NULL, NULL, NULL, NULL),
        (5, 0, NULL, 'Servicios', 105000, 'Pago de internet y telefonía', 'ETB', 'web', 'CONFIRMADA', 'GASTO', 24, 10, TRUE, 6, 4.65, -74.08, '190.24.61.14'::INET, 0, NULL, NULL, NULL, NULL),
        (6, 1, NULL, 'Mercado', 386000, 'Compra de mercado semanal', 'Éxito', 'pos', 'CONFIRMADA', 'GASTO', 23, 18, FALSE, 9, 4.65, -74.08, '190.24.61.15'::INET, 0, NULL, NULL, NULL, NULL),
        (7, 2, NULL, 'Alimentación fuera de casa', 48500, 'Pedido a domicilio', 'Rappi', 'mobile', 'CONFIRMADA', 'GASTO', 22, 20, FALSE, 10, 4.65, -74.08, '190.24.61.16'::INET, 0, NULL, NULL, NULL, NULL),
        (8, 1, NULL, 'Transporte', 26400, 'Viaje en aplicación de transporte', 'Uber', 'mobile', 'CONFIRMADA', 'GASTO', 21, 19, FALSE, 9, 4.615, -74.07, '190.24.61.17'::INET, 0, NULL, NULL, NULL, NULL),
        (9, 2, NULL, 'Salud', 72000, 'Farmacia', 'Farmatodo', 'pos', 'CONFIRMADA', 'GASTO', 20, 16, FALSE, 8, 4.65, -74.08, '190.24.61.18'::INET, 0, NULL, NULL, NULL, NULL),
        (10, 1, NULL, 'Mascota', 145000, 'Veterinaria y alimento para mascota', 'Veterinaria', 'pos', 'CONFIRMADA', 'GASTO', 19, 11, FALSE, 9, 4.65, -74.08, '190.24.61.19'::INET, 0, NULL, NULL, NULL, NULL),
        (11, 1, NULL, 'Compras y ropa', 189000, 'Compra de ropa', 'Falabella', 'pos', 'CONFIRMADA', 'GASTO', 18, 17, FALSE, 10, 4.667, -74.056, '190.24.61.20'::INET, 0, NULL, NULL, NULL, NULL),
        (12, 2, NULL, 'Entretenimiento', 52000, 'Cine con amigos', 'Cine Colombia', 'pos', 'CONFIRMADA', 'GASTO', 17, 19, FALSE, 9, 4.667, -74.056, '190.24.61.21'::INET, 0, NULL, NULL, NULL, NULL),
        (13, 0, NULL, 'Suscripciones', 46900, 'Suscripción de streaming', 'Netflix', 'web', 'CONFIRMADA', 'GASTO', 16, 20, TRUE, 5, 4.65, -74.08, '190.24.61.22'::INET, 0, NULL, NULL, NULL, NULL),
        (14, 0, 2, NULL, 250000, 'Transferencia a billetera', NULL, 'transferencia', 'CONFIRMADA', 'TRANSFERENCIA', 15, 9, FALSE, 3, 4.65, -74.08, '190.24.61.23'::INET, 0, NULL, NULL, NULL, NULL),
        (15, 0, NULL, 'Fondo personal', 200000, 'Aporte mensual al fondo personal', NULL, 'transferencia', 'CONFIRMADA', 'AHORRO', 15, 10, FALSE, 4, 4.65, -74.08, '190.24.61.24'::INET, 0, NULL, NULL, NULL, NULL),
        (16, 3, NULL, 'Mercado', 38000, 'Mercado pequeño', 'D1', 'pos', 'CONFIRMADA', 'GASTO', 14, 18, FALSE, 7, 4.65, -74.08, '190.24.61.25'::INET, 0, NULL, NULL, NULL, NULL),
        (17, 2, NULL, 'Ingresos adicionales', 240000, 'Venta de mueble usado', 'Cliente particular', 'mobile', 'CONFIRMADA', 'INGRESO', 13, 15, FALSE, 8, 4.65, -74.08, '190.24.61.26'::INET, 0, NULL, NULL, NULL, NULL),
        (18, 1, NULL, 'Compras en línea', 620000, 'Compra en línea de madrugada', 'Alkosto', 'pos', 'SOSPECHOSA', 'GASTO', 12, 2, FALSE, 90, 4.65, -74.08, '190.24.61.27'::INET, 0, 'ALTA', 'Compra en horario inusual y comercio poco frecuente.', 'PENDIENTE', NULL),
        (19, 2, NULL, 'Transporte', 31000, 'Recarga de tarjeta TransMilenio', 'TransMilenio', 'mobile', 'CONFIRMADA', 'GASTO', 11, 7, TRUE, 4, 4.615, -74.07, '190.24.61.28'::INET, 0, NULL, NULL, NULL, NULL),
        (20, 0, NULL, 'Pagos de tarjeta', 96000, 'Pago de tarjeta de crédito', 'Scotiabank Colpatria', 'web', 'PENDIENTE', 'GASTO', 9, 10, FALSE, 18, 4.65, -74.08, '190.24.61.29'::INET, 0, NULL, NULL, NULL, NULL),
        (21, 1, NULL, NULL, 78000, 'Intento de pago en línea', 'Plataforma en línea', 'web', 'RECHAZADA', 'GASTO', 8, 23, FALSE, 88, 4.65, -74.08, '190.24.61.30'::INET, 0, 'MEDIA', 'Intento de pago rechazado por datos no coincidentes.', 'CONFIRMADA', 'NO_FUI_YO'),
        (22, 3, NULL, 'Alimentación fuera de casa', 25000, 'Almuerzo en restaurante', 'Restaurante Santa Fe', 'efectivo', 'CONFIRMADA', 'GASTO', 7, 13, FALSE, 7, 4.615, -74.07, '190.24.61.31'::INET, 0, NULL, NULL, NULL, NULL),
        (23, 2, NULL, 'Fondo personal', 80000, 'Ahorro para fondo personal', NULL, 'transferencia', 'CONFIRMADA', 'AHORRO', 6, 10, FALSE, 4, 4.65, -74.08, '190.24.61.32'::INET, 0, NULL, NULL, NULL, NULL),
        (24, 0, NULL, 'Mercado', 172000, 'Compra de mercado semanal', 'Carulla', 'pos', 'CONFIRMADA', 'GASTO', 5, 18, FALSE, 9, 4.65, -74.08, '190.24.61.33'::INET, 0, NULL, NULL, NULL, NULL),
        (25, 0, NULL, 'Ingresos adicionales', 150000, 'Reembolso de seguro', 'Aseguradora', 'transferencia', 'CONFIRMADA', 'INGRESO', 4, 9, FALSE, 6, 4.65, -74.08, '190.24.61.34'::INET, 0, NULL, NULL, NULL, NULL),
        (26, 2, NULL, 'Transporte', 31000, 'Recarga de tarjeta TransMilenio', 'TransMilenio', 'mobile', 'CONFIRMADA', 'GASTO', 4, 7, TRUE, 4, 4.615, -74.07, '190.24.61.35'::INET, 0, NULL, NULL, NULL, NULL),
        (27, 1, NULL, 'Entretenimiento', 64000, 'Entradas a teatro', 'Teatro', 'pos', 'CONFIRMADA', 'GASTO', 2, 19, FALSE, 10, 4.615, -74.07, '190.24.61.36'::INET, 0, NULL, NULL, NULL, NULL)
    ) AS d(indice, cuenta_indice, destino_indice, categoria_nombre, monto, descripcion, comercio, canal, estado, tipo_movimiento, dias_ago, hora, es_recurrente, score_anomalia, latitud, longitud, direccion_ip, dispositivo_indice, alerta_severidad, alerta_motivo, alerta_estado, alerta_accion)
),
cuentas_ordenadas AS (
    SELECT c.id_cuenta, ROW_NUMBER() OVER (ORDER BY c.id_cuenta) - 1 AS idx
    FROM trida.cuentas AS c
    JOIN trida.usuarios AS u ON u.id_usuario = c.id_usuario
    WHERE lower(u.email) = lower('marianafernandez@gmail.com')
),
dispositivos_ordenados AS (
    SELECT d.id_dispositivo, ROW_NUMBER() OVER (ORDER BY d.id_dispositivo) - 1 AS idx
    FROM trida.dispositivos AS d
    JOIN trida.usuarios AS u ON u.id_usuario = d.id_usuario
    WHERE lower(u.email) = lower('marianafernandez@gmail.com')
),
ubicaciones_insertadas AS (
    INSERT INTO trida.ubicaciones (id_dispositivo, direccion_ip, pais, ciudad, latitud, longitud, fecha_registro)
    SELECT disp.id_dispositivo, d.direccion_ip, 'Colombia', 'Bogotá', d.latitud, d.longitud,
           DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora)
    FROM datos AS d
    JOIN dispositivos_ordenados AS disp ON disp.idx = d.dispositivo_indice
    RETURNING id_ubicacion, direccion_ip
),
transacciones_insertadas AS (
    INSERT INTO trida.transacciones (
        id_usuario, id_cuenta, id_cuenta_destino, id_categoria, id_dispositivo, id_ubicacion,
        tipo_movimiento, monto, moneda, descripcion, comercio, canal,
        es_recurrente, score_anomalia, estado, fecha_transaccion
    )
    SELECT u.id_usuario, cu.id_cuenta, cud.id_cuenta, cat.id_categoria, disp.id_dispositivo, ub.id_ubicacion,
           d.tipo_movimiento, d.monto::NUMERIC(15, 2), 'COP', d.descripcion, d.comercio, d.canal,
           d.es_recurrente, d.score_anomalia::NUMERIC(5, 2), d.estado,
           DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora)
    FROM datos AS d
    JOIN trida.usuarios AS u ON lower(u.email) = lower('marianafernandez@gmail.com')
    JOIN cuentas_ordenadas AS cu ON cu.idx = d.cuenta_indice
    LEFT JOIN cuentas_ordenadas AS cud ON cud.idx = d.destino_indice
    LEFT JOIN trida.categorias AS cat ON cat.id_usuario = u.id_usuario AND cat.nombre = d.categoria_nombre
    JOIN dispositivos_ordenados AS disp ON disp.idx = d.dispositivo_indice
    JOIN ubicaciones_insertadas AS ub ON ub.direccion_ip = d.direccion_ip
    RETURNING id_transaccion, id_usuario, descripcion
)
INSERT INTO trida.alertas_fraude (id_usuario, id_transaccion, severidad, motivo, estado, fecha_detectada, fecha_resuelta, accion_usuario)
SELECT t.id_usuario, t.id_transaccion, d.alerta_severidad, d.alerta_motivo, d.alerta_estado,
       DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora),
       CASE WHEN d.alerta_estado = 'PENDIENTE' THEN NULL
            ELSE DATE_TRUNC('day', CURRENT_TIMESTAMP) - make_interval(days => d.dias_ago) + make_interval(hours => d.hora) + INTERVAL '2 days' END,
       d.alerta_accion
FROM transacciones_insertadas AS t
JOIN datos AS d ON d.descripcion = t.descripcion
WHERE d.alerta_severidad IS NOT NULL;

-- 7. Presupuestos del mes en curso
-- Valentina Camila Ortiz
INSERT INTO trida.presupuestos (id_usuario, id_categoria, limite_mensual, mes, anio)
SELECT usuario.id_usuario, categoria.id_categoria, datos.limite,
       EXTRACT(MONTH FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'))::SMALLINT,
       EXTRACT(YEAR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'))::SMALLINT
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Mercado y despensa', 350000::NUMERIC),
    ('Transporte diario', 120000::NUMERIC),
    ('Alimentación fuera de casa', 150000::NUMERIC),
    ('Datos y recargas', 40000::NUMERIC),
    ('Servicios del apartamento', 120000::NUMERIC),
    ('Entretenimiento', 80000::NUMERIC)
) AS datos(nombre_categoria, limite)
JOIN trida.categorias AS categoria
  ON categoria.id_usuario = usuario.id_usuario
 AND categoria.nombre = datos.nombre_categoria
WHERE lower(usuario.email) = lower('valentina.cortiz@gmail.com');

-- Andrés Felipe Gutiérrez
INSERT INTO trida.presupuestos (id_usuario, id_categoria, limite_mensual, mes, anio)
SELECT usuario.id_usuario, categoria.id_categoria, datos.limite,
       EXTRACT(MONTH FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'))::SMALLINT,
       EXTRACT(YEAR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'))::SMALLINT
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Almuerzo laboral', 450000::NUMERIC),
    ('Transporte y gasolina', 500000::NUMERIC),
    ('Mercado', 600000::NUMERIC),
    ('Vivienda', 1500000::NUMERIC),
    ('Servicios públicos', 400000::NUMERIC),
    ('Entretenimiento', 250000::NUMERIC)
) AS datos(nombre_categoria, limite)
JOIN trida.categorias AS categoria
  ON categoria.id_usuario = usuario.id_usuario
 AND categoria.nombre = datos.nombre_categoria
WHERE lower(usuario.email) = lower('andresfelipe.gutierrez@outlook.com');

-- Jorge Eliécer Peña
INSERT INTO trida.presupuestos (id_usuario, id_categoria, limite_mensual, mes, anio)
SELECT usuario.id_usuario, categoria.id_categoria, datos.limite,
       EXTRACT(MONTH FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'))::SMALLINT,
       EXTRACT(YEAR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'))::SMALLINT
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Compra mayorista', 6000000::NUMERIC),
    ('Arriendo local', 1700000::NUMERIC),
    ('Servicios del local', 500000::NUMERIC),
    ('Transporte de mercancía', 400000::NUMERIC),
    ('Nómina del local', 1400000::NUMERIC),
    ('Mercado del hogar', 600000::NUMERIC)
) AS datos(nombre_categoria, limite)
JOIN trida.categorias AS categoria
  ON categoria.id_usuario = usuario.id_usuario
 AND categoria.nombre = datos.nombre_categoria
WHERE lower(usuario.email) = lower('jorgeeliecerramirez@hotmail.com');

-- Mariana Lucía Fernández
INSERT INTO trida.presupuestos (id_usuario, id_categoria, limite_mensual, mes, anio)
SELECT usuario.id_usuario, categoria.id_categoria, datos.limite,
       EXTRACT(MONTH FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'))::SMALLINT,
       EXTRACT(YEAR FROM (CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota'))::SMALLINT
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Mercado', 500000::NUMERIC),
    ('Vivienda', 1200000::NUMERIC),
    ('Transporte', 200000::NUMERIC),
    ('Entretenimiento', 250000::NUMERIC),
    ('Compras y ropa', 300000::NUMERIC),
    ('Servicios', 350000::NUMERIC)
) AS datos(nombre_categoria, limite)
JOIN trida.categorias AS categoria
  ON categoria.id_usuario = usuario.id_usuario
 AND categoria.nombre = datos.nombre_categoria
WHERE lower(usuario.email) = lower('marianafernandez@gmail.com');

-- 8. Metas de ahorro y aportes
-- Valentina Camila Ortiz
INSERT INTO trida.metas_ahorro (id_usuario, id_categoria, nombre, descripcion, monto_objetivo, monto_actual, fecha_limite, estado, fecha_completada)
SELECT usuario.id_usuario, categoria.id_categoria, datos.nombre, datos.descripcion,
       datos.objetivo, 0, CURRENT_DATE + datos.dias_limite, datos.estado,
       CASE WHEN datos.estado = 'COMPLETADA' THEN CURRENT_TIMESTAMP - INTERVAL '5 days' ELSE NULL END
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Fondo de emergencia', 'Colchón para imprevistos del semestre.', 1200000::NUMERIC, 90, 'Fondo de emergencia', 'ACTIVA'),
    ('Portátil para estudiar', 'Reemplazar el equipo actual para las prácticas.', 2400000::NUMERIC, 180, 'Meta de estudio', 'ACTIVA'),
    ('Curso de inglés', 'Curso virtual de nivel intermedio.', 850000::NUMERIC, 20, 'Meta de estudio', 'COMPLETADA')
) AS datos(nombre, descripcion, objetivo, dias_limite, categoria_nombre, estado)
JOIN trida.categorias AS categoria
  ON categoria.id_usuario = usuario.id_usuario
 AND categoria.nombre = datos.categoria_nombre
WHERE lower(usuario.email) = lower('valentina.cortiz@gmail.com');

INSERT INTO trida.aportes_meta (id_meta, monto, fecha_aporte)
SELECT meta.id_meta, datos.monto, CURRENT_TIMESTAMP - make_interval(days => datos.dias_ago)
FROM (VALUES
    ('Fondo de emergencia', 80000::NUMERIC, 19),
    ('Fondo de emergencia', 70000::NUMERIC, 10),
    ('Fondo de emergencia', 50000::NUMERIC, 3),
    ('Portátil para estudiar', 150000::NUMERIC, 25),
    ('Portátil para estudiar', 120000::NUMERIC, 12),
    ('Curso de inglés', 400000::NUMERIC, 40),
    ('Curso de inglés', 450000::NUMERIC, 18)
) AS datos(nombre_meta, monto, dias_ago)
JOIN trida.metas_ahorro AS meta ON meta.nombre = datos.nombre_meta
JOIN trida.usuarios AS usuario ON usuario.id_usuario = meta.id_usuario
WHERE lower(usuario.email) = lower('valentina.cortiz@gmail.com');

-- Andrés Felipe Gutiérrez
INSERT INTO trida.metas_ahorro (id_usuario, id_categoria, nombre, descripcion, monto_objetivo, monto_actual, fecha_limite, estado, fecha_completada)
SELECT usuario.id_usuario, categoria.id_categoria, datos.nombre, datos.descripcion,
       datos.objetivo, 0, CURRENT_DATE + datos.dias_limite, datos.estado,
       CASE WHEN datos.estado = 'COMPLETADA' THEN CURRENT_TIMESTAMP - INTERVAL '5 days' ELSE NULL END
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Fondo de vacaciones', 'Viaje a Cartagena a fin de año.', 3000000::NUMERIC, 120, 'Fondo de vacaciones', 'ACTIVA'),
    ('Fondo de emergencia', 'Seis meses de gastos fijos.', 6000000::NUMERIC, 365, 'Fondo de emergencia', 'ACTIVA'),
    ('Cambio de computador', 'Portátil para trabajo remoto.', 4200000::NUMERIC, 60, 'Fondo de emergencia', 'PAUSADA')
) AS datos(nombre, descripcion, objetivo, dias_limite, categoria_nombre, estado)
JOIN trida.categorias AS categoria
  ON categoria.id_usuario = usuario.id_usuario
 AND categoria.nombre = datos.categoria_nombre
WHERE lower(usuario.email) = lower('andresfelipe.gutierrez@outlook.com');

INSERT INTO trida.aportes_meta (id_meta, monto, fecha_aporte)
SELECT meta.id_meta, datos.monto, CURRENT_TIMESTAMP - make_interval(days => datos.dias_ago)
FROM (VALUES
    ('Fondo de vacaciones', 350000::NUMERIC, 18),
    ('Fondo de vacaciones', 350000::NUMERIC, 10),
    ('Fondo de emergencia', 120000::NUMERIC, 18),
    ('Fondo de emergencia', 120000::NUMERIC, 2),
    ('Cambio de computador', 600000::NUMERIC, 45)
) AS datos(nombre_meta, monto, dias_ago)
JOIN trida.metas_ahorro AS meta ON meta.nombre = datos.nombre_meta
JOIN trida.usuarios AS usuario ON usuario.id_usuario = meta.id_usuario
WHERE lower(usuario.email) = lower('andresfelipe.gutierrez@outlook.com');

-- Jorge Eliécer Peña
INSERT INTO trida.metas_ahorro (id_usuario, id_categoria, nombre, descripcion, monto_objetivo, monto_actual, fecha_limite, estado, fecha_completada)
SELECT usuario.id_usuario, categoria.id_categoria, datos.nombre, datos.descripcion,
       datos.objetivo, 0, CURRENT_DATE + datos.dias_limite, datos.estado,
       CASE WHEN datos.estado = 'COMPLETADA' THEN CURRENT_TIMESTAMP - INTERVAL '5 days' ELSE NULL END
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Capital de trabajo', 'Reserva para compras mayoristas de fin de mes.', 5000000::NUMERIC, 150, 'Capital de trabajo', 'ACTIVA'),
    ('Nevera nueva para el local', 'Reemplazo de la nevera exhibidora.', 3800000::NUMERIC, 90, 'Capital de trabajo', 'ACTIVA'),
    ('Vacaciones familiares', 'Viaje corto con la familia.', 2500000::NUMERIC, 45, 'Capital de trabajo', 'COMPLETADA')
) AS datos(nombre, descripcion, objetivo, dias_limite, categoria_nombre, estado)
JOIN trida.categorias AS categoria
  ON categoria.id_usuario = usuario.id_usuario
 AND categoria.nombre = datos.categoria_nombre
WHERE lower(usuario.email) = lower('jorgeeliecerramirez@hotmail.com');

INSERT INTO trida.aportes_meta (id_meta, monto, fecha_aporte)
SELECT meta.id_meta, datos.monto, CURRENT_TIMESTAMP - make_interval(days => datos.dias_ago)
FROM (VALUES
    ('Capital de trabajo', 400000::NUMERIC, 9),
    ('Capital de trabajo', 150000::NUMERIC, 1),
    ('Nevera nueva para el local', 500000::NUMERIC, 30),
    ('Nevera nueva para el local', 450000::NUMERIC, 15),
    ('Vacaciones familiares', 1200000::NUMERIC, 60),
    ('Vacaciones familiares', 1300000::NUMERIC, 20)
) AS datos(nombre_meta, monto, dias_ago)
JOIN trida.metas_ahorro AS meta ON meta.nombre = datos.nombre_meta
JOIN trida.usuarios AS usuario ON usuario.id_usuario = meta.id_usuario
WHERE lower(usuario.email) = lower('jorgeeliecerramirez@hotmail.com');

-- Mariana Lucía Fernández
INSERT INTO trida.metas_ahorro (id_usuario, id_categoria, nombre, descripcion, monto_objetivo, monto_actual, fecha_limite, estado, fecha_completada)
SELECT usuario.id_usuario, categoria.id_categoria, datos.nombre, datos.descripcion,
       datos.objetivo, 0, CURRENT_DATE + datos.dias_limite, datos.estado,
       CASE WHEN datos.estado = 'COMPLETADA' THEN CURRENT_TIMESTAMP - INTERVAL '5 days' ELSE NULL END
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('Fondo personal', 'Reserva para imprevistos.', 2000000::NUMERIC, 180, 'Fondo personal', 'ACTIVA'),
    ('Viaje de fin de año', 'Viaje corto con la familia.', 3500000::NUMERIC, 90, 'Fondo personal', 'ACTIVA'),
    ('Cambio de celular', 'Reemplazo del teléfono actual.', 1800000::NUMERIC, 30, 'Fondo personal', 'COMPLETADA')
) AS datos(nombre, descripcion, objetivo, dias_limite, categoria_nombre, estado)
JOIN trida.categorias AS categoria
  ON categoria.id_usuario = usuario.id_usuario
 AND categoria.nombre = datos.categoria_nombre
WHERE lower(usuario.email) = lower('marianafernandez@gmail.com');

INSERT INTO trida.aportes_meta (id_meta, monto, fecha_aporte)
SELECT meta.id_meta, datos.monto, CURRENT_TIMESTAMP - make_interval(days => datos.dias_ago)
FROM (VALUES
    ('Fondo personal', 200000::NUMERIC, 15),
    ('Fondo personal', 80000::NUMERIC, 6),
    ('Viaje de fin de año', 250000::NUMERIC, 40),
    ('Cambio de celular', 900000::NUMERIC, 50),
    ('Cambio de celular', 900000::NUMERIC, 25)
) AS datos(nombre_meta, monto, dias_ago)
JOIN trida.metas_ahorro AS meta ON meta.nombre = datos.nombre_meta
JOIN trida.usuarios AS usuario ON usuario.id_usuario = meta.id_usuario
WHERE lower(usuario.email) = lower('marianafernandez@gmail.com');

-- 9. Consejos financieros
-- Valentina Camila Ortiz
INSERT INTO trida.consejos_financieros (id_usuario, id_cuenta, tipo, titulo, descripcion, prioridad, leido, fecha_leido)
SELECT usuario.id_usuario, cuenta.id_cuenta, datos.tipo, datos.titulo, datos.descripcion,
       datos.prioridad, datos.leido,
       CASE WHEN datos.leido THEN CURRENT_TIMESTAMP - INTERVAL '1 day' ELSE NULL END
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('AHORRO', 'Tu fondo de emergencia avanza', 'Has ahorrado 200000 COP de 1200000 COP. Mantener aportes de 50000 COP cada dos semanas te acerca a la meta antes de que termine el semestre.', 'MEDIA', FALSE, 'Nequi principal'),
    ('GASTO', 'Transporte frecuente', 'Tus recargas de TransMilenio de las últimas semanas suman más de 80000 COP. Revisar si un pase semanal te conviene.', 'BAJA', TRUE, 'Nequi principal'),
    ('METAS', 'Meta de portátil', 'Con el ritmo actual de ahorro, la meta del portátil se alcanzaría en unos 8 meses. Un ingreso ocasional al mes acortaría ese plazo.', 'MEDIA', FALSE, 'Tarjeta débito Bancolombia')
) AS datos(tipo, titulo, descripcion, prioridad, leido, cuenta_nombre)
LEFT JOIN trida.cuentas AS cuenta
  ON cuenta.id_usuario = usuario.id_usuario
 AND cuenta.nombre = datos.cuenta_nombre
WHERE lower(usuario.email) = lower('valentina.cortiz@gmail.com');

-- Andrés Felipe Gutiérrez
INSERT INTO trida.consejos_financieros (id_usuario, id_cuenta, tipo, titulo, descripcion, prioridad, leido, fecha_leido)
SELECT usuario.id_usuario, cuenta.id_cuenta, datos.tipo, datos.titulo, datos.descripcion,
       datos.prioridad, datos.leido,
       CASE WHEN datos.leido THEN CURRENT_TIMESTAMP - INTERVAL '1 day' ELSE NULL END
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('GASTO', 'Almuerzos de trabajo', 'Tus almuerzos entre semana suman cerca de 100000 COP. Llevar almuerzo dos días por semana ahorraría unos 40000 COP al mes.', 'BAJA', FALSE, 'Tarjeta crédito Davivienda'),
    ('AHORRO', 'Fondo de vacaciones', 'Llevas 700000 COP de 3000000 COP. Con el aporte mensual actual llegarías a la meta en unos 4 meses.', 'MEDIA', FALSE, 'Cuenta nómina Bancolombia'),
    ('ALERTA', 'Revisa tu compra reciente', 'Una compra de 890000 COP en un comercio poco frecuente quedó marcada como sospechosa. Confirma si fuiste tú.', 'ALTA', FALSE, 'Tarjeta crédito Davivienda')
) AS datos(tipo, titulo, descripcion, prioridad, leido, cuenta_nombre)
LEFT JOIN trida.cuentas AS cuenta
  ON cuenta.id_usuario = usuario.id_usuario
 AND cuenta.nombre = datos.cuenta_nombre
WHERE lower(usuario.email) = lower('andresfelipe.gutierrez@outlook.com');

-- Jorge Eliécer Peña
INSERT INTO trida.consejos_financieros (id_usuario, id_cuenta, tipo, titulo, descripcion, prioridad, leido, fecha_leido)
SELECT usuario.id_usuario, cuenta.id_cuenta, datos.tipo, datos.titulo, datos.descripcion,
       datos.prioridad, datos.leido,
       CASE WHEN datos.leido THEN CURRENT_TIMESTAMP - INTERVAL '1 day' ELSE NULL END
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('GASTO', 'Compras mayoristas', 'Tus compras mayoristas de las últimas semanas superan los 6000000 COP. Comparar precios entre dos proveedores podría bajar ese gasto.', 'MEDIA', FALSE, 'Cuenta Banco de Bogotá'),
    ('METAS', 'Capital de trabajo', 'Llevas 550000 COP de 5000000 COP. Un aporte semanal de 200000 COP te acercaría a la meta en unos 6 meses.', 'MEDIA', FALSE, 'Cuenta Bancolombia negocio'),
    ('AHORRO', 'Reserva del negocio', 'Mantener al menos un mes de arriendo en la cuenta del negocio reduce el riesgo ante semanas de ventas bajas.', 'BAJA', TRUE, 'Efectivo caja')
) AS datos(tipo, titulo, descripcion, prioridad, leido, cuenta_nombre)
LEFT JOIN trida.cuentas AS cuenta
  ON cuenta.id_usuario = usuario.id_usuario
 AND cuenta.nombre = datos.cuenta_nombre
WHERE lower(usuario.email) = lower('jorgeeliecerramirez@hotmail.com');

-- Mariana Lucía Fernández
INSERT INTO trida.consejos_financieros (id_usuario, id_cuenta, tipo, titulo, descripcion, prioridad, leido, fecha_leido)
SELECT usuario.id_usuario, cuenta.id_cuenta, datos.tipo, datos.titulo, datos.descripcion,
       datos.prioridad, datos.leido,
       CASE WHEN datos.leido THEN CURRENT_TIMESTAMP - INTERVAL '1 day' ELSE NULL END
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('AHORRO', 'Fondo personal', 'Llevas 280000 COP de 2000000 COP. Con el aporte mensual actual, la meta se alcanzaría en unos 7 meses.', 'MEDIA', FALSE, 'Cuenta BBVA'),
    ('GASTO', 'Domicilios frecuentes', 'Tus pedidos a domicilio de las últimas semanas suman más de 100000 COP. Cocinar dos veces más por semana bajaría ese gasto.', 'BAJA', FALSE, 'Nequi'),
    ('METAS', 'Viaje de fin de año', 'Llevas 250000 COP de 3500000 COP. Aumentar el aporte en 100000 COP al mes acortaría el plazo en casi un mes.', 'MEDIA', TRUE, 'Tarjeta Scotiabank')
) AS datos(tipo, titulo, descripcion, prioridad, leido, cuenta_nombre)
LEFT JOIN trida.cuentas AS cuenta
  ON cuenta.id_usuario = usuario.id_usuario
 AND cuenta.nombre = datos.cuenta_nombre
WHERE lower(usuario.email) = lower('marianafernandez@gmail.com');

-- 10. Patrón de comportamiento (valores calculados desde las transacciones)
-- Valentina Camila Ortiz
UPDATE trida.patron_comportamiento AS p
SET gasto_diario_promedio = (SELECT COALESCE(AVG(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA')),
    gasto_diario_desv = (SELECT COALESCE(STDDEV_POP(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA')),
    categorias_top = (SELECT COALESCE(jsonb_agg(x.categoria ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT c.nombre AS categoria, SUM(t.monto) AS total FROM trida.transacciones AS t JOIN trida.categorias AS c ON c.id_categoria = t.id_categoria WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') GROUP BY c.nombre ORDER BY total DESC LIMIT 5) AS x),
    ubicaciones_frecuentes = (SELECT COALESCE(jsonb_agg(x.ciudad ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT ub.ciudad, COUNT(*) AS total FROM trida.transacciones AS t JOIN trida.ubicaciones AS ub ON ub.id_ubicacion = t.id_ubicacion WHERE t.id_usuario = p.id_usuario GROUP BY ub.ciudad ORDER BY total DESC LIMIT 5) AS x),
    horarios_habituales = jsonb_build_object(
        'madrugada', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') < 6),
        'manana', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') BETWEEN 6 AND 12),
        'tarde', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') BETWEEN 13 AND 19),
        'noche', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') >= 20)),
    comercios_frecuentes = (SELECT COALESCE(jsonb_agg(x.comercio ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT t.comercio, SUM(t.monto) AS total FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.comercio IS NOT NULL AND t.estado IN ('CONFIRMADA', 'APROBADA') GROUP BY t.comercio ORDER BY total DESC LIMIT 5) AS x),
    fecha_actualizacion = CURRENT_TIMESTAMP
WHERE p.id_usuario = (SELECT id_usuario FROM trida.usuarios WHERE email = 'valentina.cortiz@gmail.com');

-- Andrés Felipe Gutiérrez
UPDATE trida.patron_comportamiento AS p
SET gasto_diario_promedio = (SELECT COALESCE(AVG(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA')),
    gasto_diario_desv = (SELECT COALESCE(STDDEV_POP(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA')),
    categorias_top = (SELECT COALESCE(jsonb_agg(x.categoria ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT c.nombre AS categoria, SUM(t.monto) AS total FROM trida.transacciones AS t JOIN trida.categorias AS c ON c.id_categoria = t.id_categoria WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') GROUP BY c.nombre ORDER BY total DESC LIMIT 5) AS x),
    ubicaciones_frecuentes = (SELECT COALESCE(jsonb_agg(x.ciudad ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT ub.ciudad, COUNT(*) AS total FROM trida.transacciones AS t JOIN trida.ubicaciones AS ub ON ub.id_ubicacion = t.id_ubicacion WHERE t.id_usuario = p.id_usuario GROUP BY ub.ciudad ORDER BY total DESC LIMIT 5) AS x),
    horarios_habituales = jsonb_build_object(
        'madrugada', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') < 6),
        'manana', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') BETWEEN 6 AND 12),
        'tarde', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') BETWEEN 13 AND 19),
        'noche', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') >= 20)),
    comercios_frecuentes = (SELECT COALESCE(jsonb_agg(x.comercio ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT t.comercio, SUM(t.monto) AS total FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.comercio IS NOT NULL AND t.estado IN ('CONFIRMADA', 'APROBADA') GROUP BY t.comercio ORDER BY total DESC LIMIT 5) AS x),
    fecha_actualizacion = CURRENT_TIMESTAMP
WHERE p.id_usuario = (SELECT id_usuario FROM trida.usuarios WHERE email = 'andresfelipe.gutierrez@outlook.com');

-- Jorge Eliécer Peña
UPDATE trida.patron_comportamiento AS p
SET gasto_diario_promedio = (SELECT COALESCE(AVG(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA')),
    gasto_diario_desv = (SELECT COALESCE(STDDEV_POP(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA')),
    categorias_top = (SELECT COALESCE(jsonb_agg(x.categoria ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT c.nombre AS categoria, SUM(t.monto) AS total FROM trida.transacciones AS t JOIN trida.categorias AS c ON c.id_categoria = t.id_categoria WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') GROUP BY c.nombre ORDER BY total DESC LIMIT 5) AS x),
    ubicaciones_frecuentes = (SELECT COALESCE(jsonb_agg(x.ciudad ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT ub.ciudad, COUNT(*) AS total FROM trida.transacciones AS t JOIN trida.ubicaciones AS ub ON ub.id_ubicacion = t.id_ubicacion WHERE t.id_usuario = p.id_usuario GROUP BY ub.ciudad ORDER BY total DESC LIMIT 5) AS x),
    horarios_habituales = jsonb_build_object(
        'madrugada', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') < 6),
        'manana', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') BETWEEN 6 AND 12),
        'tarde', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') BETWEEN 13 AND 19),
        'noche', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') >= 20)),
    comercios_frecuentes = (SELECT COALESCE(jsonb_agg(x.comercio ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT t.comercio, SUM(t.monto) AS total FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.comercio IS NOT NULL AND t.estado IN ('CONFIRMADA', 'APROBADA') GROUP BY t.comercio ORDER BY total DESC LIMIT 5) AS x),
    fecha_actualizacion = CURRENT_TIMESTAMP
WHERE p.id_usuario = (SELECT id_usuario FROM trida.usuarios WHERE email = 'jorgeeliecerramirez@hotmail.com');

-- Mariana Lucía Fernández
UPDATE trida.patron_comportamiento AS p
SET gasto_diario_promedio = (SELECT COALESCE(AVG(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA')),
    gasto_diario_desv = (SELECT COALESCE(STDDEV_POP(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA')),
    categorias_top = (SELECT COALESCE(jsonb_agg(x.categoria ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT c.nombre AS categoria, SUM(t.monto) AS total FROM trida.transacciones AS t JOIN trida.categorias AS c ON c.id_categoria = t.id_categoria WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') GROUP BY c.nombre ORDER BY total DESC LIMIT 5) AS x),
    ubicaciones_frecuentes = (SELECT COALESCE(jsonb_agg(x.ciudad ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT ub.ciudad, COUNT(*) AS total FROM trida.transacciones AS t JOIN trida.ubicaciones AS ub ON ub.id_ubicacion = t.id_ubicacion WHERE t.id_usuario = p.id_usuario GROUP BY ub.ciudad ORDER BY total DESC LIMIT 5) AS x),
    horarios_habituales = jsonb_build_object(
        'madrugada', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') < 6),
        'manana', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') BETWEEN 6 AND 12),
        'tarde', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') BETWEEN 13 AND 19),
        'noche', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND EXTRACT(HOUR FROM t.fecha_transaccion AT TIME ZONE 'America/Bogota') >= 20)),
    comercios_frecuentes = (SELECT COALESCE(jsonb_agg(x.comercio ORDER BY x.total DESC), '[]'::jsonb) FROM (SELECT t.comercio, SUM(t.monto) AS total FROM trida.transacciones AS t WHERE t.id_usuario = p.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.comercio IS NOT NULL AND t.estado IN ('CONFIRMADA', 'APROBADA') GROUP BY t.comercio ORDER BY total DESC LIMIT 5) AS x),
    fecha_actualizacion = CURRENT_TIMESTAMP
WHERE p.id_usuario = (SELECT id_usuario FROM trida.usuarios WHERE email = 'marianafernandez@gmail.com');

-- 11. Análisis de gastos: mes anterior completo y mes en curso
-- Valentina Camila Ortiz
INSERT INTO trida.analisis_gastos (id_usuario, periodo, fecha_inicio, fecha_fin, total_ingresos, total_gastos, total_ahorro, desglose_categorias, comparativa_anterior)
SELECT usuario.id_usuario, 'MENSUAL', p.inicio, p.fin,
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(jsonb_object_agg(s.nombre, s.total), '{}'::jsonb) FROM (SELECT c.nombre, SUM(t.monto) AS total FROM trida.transacciones AS t JOIN trida.categorias AS c ON c.id_categoria = t.id_categoria WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento IN ('GASTO', 'AHORRO') AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota' GROUP BY c.nombre) AS s),
       jsonb_build_object(
           'total_ingresos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_gastos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_ahorro', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'))
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ((DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))::DATE, ((DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::DATE),
    ((DATE_TRUNC('month', CURRENT_DATE))::DATE, CURRENT_DATE)
) AS p(inicio, fin)
WHERE lower(usuario.email) = lower('valentina.cortiz@gmail.com');

-- Andrés Felipe Gutiérrez
INSERT INTO trida.analisis_gastos (id_usuario, periodo, fecha_inicio, fecha_fin, total_ingresos, total_gastos, total_ahorro, desglose_categorias, comparativa_anterior)
SELECT usuario.id_usuario, 'MENSUAL', p.inicio, p.fin,
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(jsonb_object_agg(s.nombre, s.total), '{}'::jsonb) FROM (SELECT c.nombre, SUM(t.monto) AS total FROM trida.transacciones AS t JOIN trida.categorias AS c ON c.id_categoria = t.id_categoria WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento IN ('GASTO', 'AHORRO') AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota' GROUP BY c.nombre) AS s),
       jsonb_build_object(
           'total_ingresos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_gastos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_ahorro', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'))
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ((DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))::DATE, ((DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::DATE),
    ((DATE_TRUNC('month', CURRENT_DATE))::DATE, CURRENT_DATE)
) AS p(inicio, fin)
WHERE lower(usuario.email) = lower('andresfelipe.gutierrez@outlook.com');

-- Jorge Eliécer Peña
INSERT INTO trida.analisis_gastos (id_usuario, periodo, fecha_inicio, fecha_fin, total_ingresos, total_gastos, total_ahorro, desglose_categorias, comparativa_anterior)
SELECT usuario.id_usuario, 'MENSUAL', p.inicio, p.fin,
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(jsonb_object_agg(s.nombre, s.total), '{}'::jsonb) FROM (SELECT c.nombre, SUM(t.monto) AS total FROM trida.transacciones AS t JOIN trida.categorias AS c ON c.id_categoria = t.id_categoria WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento IN ('GASTO', 'AHORRO') AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota' GROUP BY c.nombre) AS s),
       jsonb_build_object(
           'total_ingresos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_gastos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_ahorro', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'))
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ((DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))::DATE, ((DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::DATE),
    ((DATE_TRUNC('month', CURRENT_DATE))::DATE, CURRENT_DATE)
) AS p(inicio, fin)
WHERE lower(usuario.email) = lower('jorgeeliecerramirez@hotmail.com');

-- Mariana Lucía Fernández
INSERT INTO trida.analisis_gastos (id_usuario, periodo, fecha_inicio, fecha_fin, total_ingresos, total_gastos, total_ahorro, desglose_categorias, comparativa_anterior)
SELECT usuario.id_usuario, 'MENSUAL', p.inicio, p.fin,
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
       (SELECT COALESCE(jsonb_object_agg(s.nombre, s.total), '{}'::jsonb) FROM (SELECT c.nombre, SUM(t.monto) AS total FROM trida.transacciones AS t JOIN trida.categorias AS c ON c.id_categoria = t.id_categoria WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento IN ('GASTO', 'AHORRO') AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota' GROUP BY c.nombre) AS s),
       jsonb_build_object(
           'total_ingresos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_gastos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_ahorro', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= (p.inicio - INTERVAL '1 month')::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota'))
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ((DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))::DATE, ((DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::DATE),
    ((DATE_TRUNC('month', CURRENT_DATE))::DATE, CURRENT_DATE)
) AS p(inicio, fin)
WHERE lower(usuario.email) = lower('marianafernandez@gmail.com');

-- 12. Reportes mensuales del mes anterior
-- Valentina Camila Ortiz
INSERT INTO trida.reportes_mensuales (id_usuario, anio, mes, score_salud, resumen, ruta_archivo)
SELECT usuario.id_usuario,
       EXTRACT(YEAR FROM p.inicio)::SMALLINT, EXTRACT(MONTH FROM p.inicio)::SMALLINT,
       72::NUMERIC(5, 2),
       jsonb_build_object(
           'total_ingresos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_gastos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_ahorro', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'num_transacciones', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'ciudad', 'Bogotá', 'pais', 'Colombia'),
       NULL
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES ((DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))::DATE, ((DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::DATE)) AS p(inicio, fin)
WHERE lower(usuario.email) = lower('valentina.cortiz@gmail.com');

-- Andrés Felipe Gutiérrez
INSERT INTO trida.reportes_mensuales (id_usuario, anio, mes, score_salud, resumen, ruta_archivo)
SELECT usuario.id_usuario,
       EXTRACT(YEAR FROM p.inicio)::SMALLINT, EXTRACT(MONTH FROM p.inicio)::SMALLINT,
       81::NUMERIC(5, 2),
       jsonb_build_object(
           'total_ingresos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_gastos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_ahorro', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'num_transacciones', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'ciudad', 'Bogotá', 'pais', 'Colombia'),
       NULL
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES ((DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))::DATE, ((DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::DATE)) AS p(inicio, fin)
WHERE lower(usuario.email) = lower('andresfelipe.gutierrez@outlook.com');

-- Jorge Eliécer Peña
INSERT INTO trida.reportes_mensuales (id_usuario, anio, mes, score_salud, resumen, ruta_archivo)
SELECT usuario.id_usuario,
       EXTRACT(YEAR FROM p.inicio)::SMALLINT, EXTRACT(MONTH FROM p.inicio)::SMALLINT,
       76::NUMERIC(5, 2),
       jsonb_build_object(
           'total_ingresos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_gastos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_ahorro', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'num_transacciones', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'ciudad', 'Bogotá', 'pais', 'Colombia'),
       NULL
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES ((DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))::DATE, ((DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::DATE)) AS p(inicio, fin)
WHERE lower(usuario.email) = lower('jorgeeliecerramirez@hotmail.com');

-- Mariana Lucía Fernández
INSERT INTO trida.reportes_mensuales (id_usuario, anio, mes, score_salud, resumen, ruta_archivo)
SELECT usuario.id_usuario,
       EXTRACT(YEAR FROM p.inicio)::SMALLINT, EXTRACT(MONTH FROM p.inicio)::SMALLINT,
       78::NUMERIC(5, 2),
       jsonb_build_object(
           'total_ingresos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'INGRESO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_gastos', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'GASTO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'total_ahorro', (SELECT COALESCE(SUM(t.monto), 0) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.tipo_movimiento = 'AHORRO' AND t.estado IN ('CONFIRMADA', 'APROBADA') AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'num_transacciones', (SELECT COUNT(*) FROM trida.transacciones AS t WHERE t.id_usuario = usuario.id_usuario AND t.fecha_transaccion >= p.inicio::TIMESTAMP AT TIME ZONE 'America/Bogota' AND t.fecha_transaccion < (p.fin + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE 'America/Bogota'),
           'ciudad', 'Bogotá', 'pais', 'Colombia'),
       NULL
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES ((DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))::DATE, ((DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day'))::DATE)) AS p(inicio, fin)
WHERE lower(usuario.email) = lower('marianafernandez@gmail.com');

-- 13. Registros de auditoría
-- Valentina Camila Ortiz
INSERT INTO trida.logs_auditoria (id_usuario, tipo_accion, entidad_afectada, id_entidad, descripcion, direccion_ip, fecha_accion)
SELECT usuario.id_usuario, datos.tipo_accion, datos.entidad_afectada, datos.id_entidad,
       datos.descripcion, datos.direccion_ip, CURRENT_TIMESTAMP - make_interval(days => datos.dias_ago)
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('LOGIN_EXITOSO', 'usuarios', NULL, 'Inicio de sesión desde Bogotá', '190.85.14.10'::INET, 1),
    ('CREACION_CUENTA', 'cuentas', NULL::INTEGER, 'Registro de cuenta financiera', '190.85.14.11'::INET, 20),
    ('CREACION_META', 'metas_ahorro', NULL::INTEGER, 'Creación de meta de ahorro', '190.85.14.12'::INET, 15),
    ('ACTUALIZACION_PERFIL', 'perfil_financiero', NULL::INTEGER, 'Actualización de datos del perfil', '190.85.14.13'::INET, 6)
) AS datos(tipo_accion, entidad_afectada, id_entidad, descripcion, direccion_ip, dias_ago)
WHERE lower(usuario.email) = lower('valentina.cortiz@gmail.com');

-- Andrés Felipe Gutiérrez
INSERT INTO trida.logs_auditoria (id_usuario, tipo_accion, entidad_afectada, id_entidad, descripcion, direccion_ip, fecha_accion)
SELECT usuario.id_usuario, datos.tipo_accion, datos.entidad_afectada, datos.id_entidad,
       datos.descripcion, datos.direccion_ip, CURRENT_TIMESTAMP - make_interval(days => datos.dias_ago)
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('LOGIN_EXITOSO', 'usuarios', NULL, 'Inicio de sesión desde Bogotá', '186.102.22.10'::INET, 1),
    ('CREACION_CUENTA', 'cuentas', NULL::INTEGER, 'Registro de cuenta financiera', '186.102.22.11'::INET, 20),
    ('CREACION_META', 'metas_ahorro', NULL::INTEGER, 'Creación de meta de ahorro', '186.102.22.12'::INET, 15),
    ('ACTUALIZACION_PERFIL', 'perfil_financiero', NULL::INTEGER, 'Actualización de datos del perfil', '186.102.22.13'::INET, 6)
) AS datos(tipo_accion, entidad_afectada, id_entidad, descripcion, direccion_ip, dias_ago)
WHERE lower(usuario.email) = lower('andresfelipe.gutierrez@outlook.com');

-- Jorge Eliécer Peña
INSERT INTO trida.logs_auditoria (id_usuario, tipo_accion, entidad_afectada, id_entidad, descripcion, direccion_ip, fecha_accion)
SELECT usuario.id_usuario, datos.tipo_accion, datos.entidad_afectada, datos.id_entidad,
       datos.descripcion, datos.direccion_ip, CURRENT_TIMESTAMP - make_interval(days => datos.dias_ago)
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('LOGIN_EXITOSO', 'usuarios', NULL, 'Inicio de sesión desde Bogotá', '181.49.77.10'::INET, 1),
    ('CREACION_CUENTA', 'cuentas', NULL::INTEGER, 'Registro de cuenta financiera', '181.49.77.11'::INET, 20),
    ('CREACION_META', 'metas_ahorro', NULL::INTEGER, 'Creación de meta de ahorro', '181.49.77.12'::INET, 15),
    ('ACTUALIZACION_PERFIL', 'perfil_financiero', NULL::INTEGER, 'Actualización de datos del perfil', '181.49.77.13'::INET, 6)
) AS datos(tipo_accion, entidad_afectada, id_entidad, descripcion, direccion_ip, dias_ago)
WHERE lower(usuario.email) = lower('jorgeeliecerramirez@hotmail.com');

-- Mariana Lucía Fernández
INSERT INTO trida.logs_auditoria (id_usuario, tipo_accion, entidad_afectada, id_entidad, descripcion, direccion_ip, fecha_accion)
SELECT usuario.id_usuario, datos.tipo_accion, datos.entidad_afectada, datos.id_entidad,
       datos.descripcion, datos.direccion_ip, CURRENT_TIMESTAMP - make_interval(days => datos.dias_ago)
FROM trida.usuarios AS usuario
CROSS JOIN (VALUES
    ('LOGIN_EXITOSO', 'usuarios', NULL, 'Inicio de sesión desde Bogotá', '190.24.61.10'::INET, 1),
    ('CREACION_CUENTA', 'cuentas', NULL::INTEGER, 'Registro de cuenta financiera', '190.24.61.11'::INET, 20),
    ('CREACION_META', 'metas_ahorro', NULL::INTEGER, 'Creación de meta de ahorro', '190.24.61.12'::INET, 15),
    ('ACTUALIZACION_PERFIL', 'perfil_financiero', NULL::INTEGER, 'Actualización de datos del perfil', '190.24.61.13'::INET, 6)
) AS datos(tipo_accion, entidad_afectada, id_entidad, descripcion, direccion_ip, dias_ago)
WHERE lower(usuario.email) = lower('marianafernandez@gmail.com');

COMMIT;

-- Verificación rápida de conteos por usuario
SELECT u.nombre_completo, u.email,
       COUNT(DISTINCT c.id_cuenta) AS cuentas,
       COUNT(DISTINCT cat.id_categoria) AS categorias_propias,
       COUNT(DISTINCT t.id_transaccion) AS transacciones,
       COUNT(DISTINCT a.id_alerta) AS alertas,
       COUNT(DISTINCT m.id_meta) AS metas,
       COUNT(DISTINCT p.id_presupuesto) AS presupuestos
FROM trida.usuarios AS u
LEFT JOIN trida.cuentas AS c ON c.id_usuario = u.id_usuario
LEFT JOIN trida.categorias AS cat ON cat.id_usuario = u.id_usuario
LEFT JOIN trida.transacciones AS t ON t.id_usuario = u.id_usuario
LEFT JOIN trida.alertas_fraude AS a ON a.id_usuario = u.id_usuario
LEFT JOIN trida.metas_ahorro AS m ON m.id_usuario = u.id_usuario
LEFT JOIN trida.presupuestos AS p ON p.id_usuario = u.id_usuario
WHERE lower(u.email) IN (lower('valentina.cortiz@gmail.com'), lower('andresfelipe.gutierrez@outlook.com'), lower('jorgeeliecerramirez@hotmail.com'), lower('marianafernandez@gmail.com'))
GROUP BY u.nombre_completo, u.email
ORDER BY u.nombre_completo;
